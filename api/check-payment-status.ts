import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LeanXTransactionResponse {
  response_code: number;
  description: string;
  data: {
    transaction_details: {
      invoice_no: string;
      fpx_invoice_no: string;
      amount: string;
      invoice_status: string;
      providerTypeReference: string;
      bank_provider: string;
      category_code: string;
      amount_with_fee: number;
      fee: number;
      fee_by_customer: boolean;
    };
    customer_details: {
      name: string;
      phone_number: string;
      email: string;
    };
  };
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Handle CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { invoiceNo } = request.query;

    // Validate required parameter
    if (!invoiceNo || typeof invoiceNo !== 'string') {
      return response.status(400).json({
        error: 'Missing or invalid invoiceNo query parameter'
      });
    }

    // Get Lean.x credentials from environment variables
    const authToken = process.env.LEANX_AUTH_TOKEN;

    if (!authToken) {
      console.error('Missing Lean.x auth token in environment variables');
      return response.status(500).json({
        error: 'Payment gateway not configured'
      });
    }

    console.log('Checking transaction status for:', invoiceNo);

    // Call Lean.x API to check transaction status
    const apiResponse = await fetch(
      `https://api.leanx.dev/api/v1/merchant/manual-checking-transaction?invoice_no=${encodeURIComponent(invoiceNo)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
      }
    );

    const data: LeanXTransactionResponse = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Lean.x API Error:', data);
      return response.status(apiResponse.status).json({
        error: 'Failed to check transaction status',
        details: data
      });
    }

    // Check if Lean.x returned success
    if (data.response_code !== 2000) {
      console.error('Lean.x error response:', data);
      return response.status(500).json({
        error: 'Payment gateway error',
        message: data.description
      });
    }

    console.log('Transaction status retrieved:', {
      invoice: data.data.transaction_details.invoice_no,
      status: data.data.transaction_details.invoice_status,
      amount: data.data.transaction_details.amount,
    });

    // Return formatted response
    return response.status(200).json({
      success: true,
      transaction: {
        invoiceNo: data.data.transaction_details.invoice_no,
        status: data.data.transaction_details.invoice_status,
        amount: parseFloat(data.data.transaction_details.amount),
        amountWithFee: data.data.transaction_details.amount_with_fee,
        fee: data.data.transaction_details.fee,
        paymentMethod: data.data.transaction_details.providerTypeReference,
        bankProvider: data.data.transaction_details.bank_provider,
        transactionId: data.data.transaction_details.fpx_invoice_no,
      },
      customer: data.data.customer_details,
    });

  } catch (error) {
    console.error('Transaction status check error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
