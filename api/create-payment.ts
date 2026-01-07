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
    const headers = process.env.LEANX_API_HOST || 'https://api.leanx.io'; // Default to Production .io

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
    // FIX: Explicitly append invoiceNo to the redirect URL so we don't rely on Lean.x appending it
    const redirectUrl = `${baseUrl}/payment/success?invoiceNo=${invoiceRef}`;
    const callbackUrl = `${baseUrl}/api/payment-webhook`;

    // Prepare request body for Lean.x API
    const leanxPayload = {
      collection_uuid: collectionUuid,
      amount: parseFloat(amount.toFixed(2)),
      invoice_ref: invoiceRef,
      redirect_url: redirectUrl,
      callback_url: callbackUrl,
      full_name: customerName,
      email: customerEmail,
      phone_number: customerPhone.replace(/[\s-]/g, ''), // Remove spaces and dashes
    };

    console.log('Sending payload to Lean.x:', JSON.stringify(leanxPayload, null, 2));

    const apiHost = process.env.LEANX_API_HOST || 'https://api.leanx.io';
    const apiResponse = await fetch(`${apiHost}/api/v1/merchant/create-bill-page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': authToken
      },
      body: JSON.stringify(leanxPayload)
    });

    const data: LeanXBillResponse = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Lean.x API Error:', data);
      return response.status(apiResponse.status).json({
        error: 'Payment gateway error',
        details: data
      });
    }

    // Check if Lean.x returned success
    if (data.response_code !== 2000) {
      console.error('Lean.x error response:', data);
      return response.status(500).json({
        error: 'Payment gateway error',
        message: data.description,
        details: data.breakdown_errors,
        debug: {
            sentPayload: leanxPayload,
            response: data,
            uuidIntegrity: uuidDebug
        }
      });
    }

    console.log('Payment created successfully:', {
      billNo: data.data.bill_no,
      invoiceRef: data.data.invoice_ref
    });

    // Return the redirect URL to the frontend
    return response.status(200).json({
      success: true,
      redirectUrl: data.data.redirect_url,
      billNo: data.data.bill_no,
      invoiceRef: data.data.invoice_ref,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
