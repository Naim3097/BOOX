import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    }),
  });
}

const db = getFirestore();

interface LeanXWebhookPayload {
  invoice_no: string;
  amount: string;
  invoice_status: string;
  providerTypeReference?: string;
  bank_provider?: string;
  fpx_invoice_no?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload: LeanXWebhookPayload = request.body;

    console.log('Received webhook from Lean.x:', {
      invoice: payload.invoice_no,
      status: payload.invoice_status,
      amount: payload.amount,
    });

    // Validate required fields
    if (!payload.invoice_no || !payload.invoice_status) {
      console.error('Invalid webhook payload:', payload);
      return response.status(400).json({ error: 'Invalid payload' });
    }

    // Extract the booking ID from invoice_no (format: "BOOKING-{bookingId}")
    const invoiceRef = payload.invoice_no;
    const bookingId = invoiceRef.replace('BOOKING-', '');

    // Update the booking status in Firestore based on payment status
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      console.error('Booking not found:', bookingId);
      return response.status(404).json({ error: 'Booking not found' });
    }

    // Map Lean.x status to our booking status
    let bookingStatus = 'pending';
    if (payload.invoice_status === 'SUCCESS') {
      bookingStatus = 'confirmed';
    } else if (payload.invoice_status === 'FAILED' || payload.invoice_status === 'CANCELLED') {
      bookingStatus = 'cancelled';
    }

    // Update the booking document
    await bookingRef.update({
      status: bookingStatus,
      paymentStatus: payload.invoice_status,
      paymentInvoiceNo: payload.invoice_no,
      paymentAmount: parseFloat(payload.amount),
      paymentProvider: payload.bank_provider || 'Unknown',
      paymentMethod: payload.providerTypeReference || 'FPX',
      paymentTransactionId: payload.fpx_invoice_no || null,
      paymentUpdatedAt: new Date().toISOString(),
    });

    console.log('Booking updated successfully:', {
      bookingId,
      newStatus: bookingStatus,
      paymentStatus: payload.invoice_status,
    });

    // Return success response to Lean.x
    return response.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      bookingId,
      status: bookingStatus,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
