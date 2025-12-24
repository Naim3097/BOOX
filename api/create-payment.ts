import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CreatePaymentRequest {
  amount: number;
  invoiceRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface LeanXBillResponse {
  response_code: number;
  description: string;
  data: {
    collection_uuid: string;
    redirect_url: string;
    bill_no: string;
    invoice_ref: string;
  };
  breakdown_errors: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      amount,
      invoiceRef,
      customerName,
      customerEmail,
      customerPhone,
    }: CreatePaymentRequest = request.body;

    // Validate required fields
    if (!amount || !invoiceRef || !customerName || !customerEmail || !customerPhone) {
      return response.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'invoiceRef', 'customerName', 'customerEmail', 'customerPhone']
      });
    }

    // Validate amount (must be positive and reasonable)
    if (amount <= 0 || amount > 10000) {
      return response.status(400).json({
        error: 'Invalid amount. Must be between 0.01 and 10,000 MYR'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return response.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate phone number (Malaysian format)
    const phoneRegex = /^(\+?6?01)[0-9]{8,9}$/;
    if (!phoneRegex.test(customerPhone.replace(/[\s-]/g, ''))) {
      return response.status(400).json({
        error: 'Invalid phone number. Must be a valid Malaysian mobile number (e.g., 0123456789)'
      });
    }

    // Get Lean.x credentials from environment variables
    const authToken = process.env.LEANX_AUTH_TOKEN?.trim();
    const collectionUuid = process.env.LEANX_COLLECTION_UUID?.trim();

    if (!authToken || !collectionUuid) {
      console.error('Missing Lean.x credentials');
      return response.status(500).json({
        error: 'Payment gateway not configured. Please contact support.'
      });
    }

    // Debug: Check for hidden characters in the UUID
    const uuidDebug = {
        value: collectionUuid,
        length: collectionUuid.length,
        charCodes: collectionUuid.split('').map(c => c.charCodeAt(0))
    };
    console.log('UUID Integrity Check:', JSON.stringify(uuidDebug));

    // Construct redirect and callback URLs dynamically

    // Construct redirect and callback URLs dynamically
    const protocol = request.headers['x-forwarded-proto'] || 'https';
    const host = request.headers.host;
    const baseUrl = `${protocol}://${host}`;
    const redirectUrl = `${baseUrl}/payment/success`;
    const callbackUrl = `${baseUrl}/api/payment-webhook`;

    // Prepare request body for Lean.x API
    // Use the UUID exactly as provided in the environment variable
    const cleanUuid = collectionUuid;
    
    const leanxPayload = {
      collection_uuid: cleanUuid,
      amount: parseFloat(amount.toFixed(2)),
      invoice_ref: invoiceRef,
      redirect_url: redirectUrl,
      callback_url: callbackUrl,
      full_name: customerName,
      email: customerEmail,
      phone_number: customerPhone.replace(/[\s-]/g, ''), // Remove spaces and dashes
    };

    // Prepare candidate UUIDs to try (Brute-force strategy to resolve INVALID_UUID)
    const parts = authToken?.split('|') || [];
    const candidates = [
        { name: 'EnvVar (Exact)', value: collectionUuid },
        { name: 'EnvVar (UpperCase)', value: collectionUuid.toUpperCase() },
        // Try the standard UUID from the auth token (middle part)
        { name: 'AuthToken (Standard UUID)', value: parts[1] },
        // Try the prefix from the auth token (first part) - unlikely but worth a shot
        { name: 'AuthToken (Prefix)', value: parts[0] }
    ].filter(c => c.value); // Remove nulls

    let lastErrorResponse = null;
    let successResponse = null;

    // Loop through candidates
    for (const candidate of candidates) {
        console.log(`Attempting payment with UUID candidate: ${candidate.name} = ${candidate.value}`);
        
        const payload = {
            ...leanxPayload,
            collection_uuid: candidate.value
        };

        try {
            const apiResponse = await fetch('https://api.leanx.dev/api/v1/merchant/create-bill-page', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(payload)
            });

            const data: LeanXBillResponse = await apiResponse.json();

            if (apiResponse.ok && data.response_code === 2000) {
                console.log(`SUCCESS! Payment created with UUID: ${candidate.name}`);
                successResponse = data;
                break; // Stop trying, we found the right one
            } else {
                console.warn(`Failed with ${candidate.name}:`, data.breakdown_errors || data.description);
                lastErrorResponse = data;
            }
        } catch (err) {
            console.error(`Network error with ${candidate.name}:`, err);
        }
    }

    if (successResponse) {
        console.log('Payment created successfully:', {
            billNo: successResponse.data.bill_no,
            invoiceRef: successResponse.data.invoice_ref
        });

        return response.status(200).json({
            success: true,
            redirectUrl: successResponse.data.redirect_url,
            billNo: successResponse.data.bill_no,
            invoiceRef: successResponse.data.invoice_ref,
        });
    }

    // If we get here, all attempts failed
    console.error('All UUID candidates failed. Last error:', lastErrorResponse);
    return response.status(500).json({
        error: 'Payment gateway error',
        message: lastErrorResponse?.description || 'Failed to create payment',
        details: lastErrorResponse?.breakdown_errors,
        debug: {
            triedCandidates: candidates.map(c => c.name),
            lastResponse: lastErrorResponse,
            uuidIntegrity: uuidDebug
        }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
