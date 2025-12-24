import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TransactionDetails {
  invoiceNo: string;
  status: string;
  amount: number;
  bankProvider: string;
  paymentMethod: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceNo = searchParams.get('invoice_no') || searchParams.get('invoiceNo');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!invoiceNo) {
      setStatus('error');
      setErrorMessage('No transaction reference found');
      return;
    }

    // Verify payment status with backend
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/check-payment-status?invoiceNo=${invoiceNo}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        if (data.success && data.transaction) {
          setTransaction(data.transaction);
          
          // Check if payment was successful
          if (data.transaction.status === 'SUCCESS') {
            setStatus('success');
          } else if (data.transaction.status === 'FAILED' || data.transaction.status === 'CANCELLED') {
            setStatus('error');
            setErrorMessage('Payment was not successful. Please try again.');
          } else {
            setStatus('error');
            setErrorMessage('Payment is still pending. Please wait or contact support.');
          }
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to verify payment status');
      }
    };

    verifyPayment();
  }, [invoiceNo]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Loader2 size={48} className="animate-spin text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Verifying Payment...</h1>
            <p className="text-gray-500">
              Please wait while we confirm your transaction.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-100">
            <XCircle size={48} strokeWidth={3} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Payment Issue</h1>
            <p className="text-gray-500">
              {errorMessage || 'There was an issue with your payment. Please try again.'}
            </p>
          </div>

          {transaction && (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600 space-y-2">
              <div>Invoice: <span className="font-mono font-bold text-black">{transaction.invoiceNo}</span></div>
              <div>Status: <span className="font-bold text-red-600">{transaction.status}</span></div>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button 
              onClick={() => navigate('/booking')} 
              className="w-full rounded-full py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/10"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')} 
              className="w-full rounded-full py-6"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
          <CheckCircle size={48} strokeWidth={3} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500">
            Thank you for your booking. We have received your payment and your slot is confirmed.
          </p>
        </div>

        {transaction && (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600 space-y-2">
            <div>Invoice: <span className="font-mono font-bold text-black">{transaction.invoiceNo}</span></div>
            <div>Amount: <span className="font-bold text-black">RM {transaction.amount.toFixed(2)}</span></div>
            <div>Payment Method: <span className="font-medium text-black">{transaction.bankProvider}</span></div>
          </div>
        )}

        <div className="pt-4">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full rounded-full py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/10"
          >
            Return to Home
          </Button>
        </div>

        <p className="text-xs text-gray-400">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
