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

        <div className="pt-4 space-y-3">
            <Button 
                onClick={() => window.print()}
                variant="outline"
                className="w-full rounded-full py-6"
            >
                Download Receipt
            </Button>
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

      {/* Printable Receipt Section - Only verified visible when printing */}
      {transaction && (
        <div className="hidden print:block fixed inset-0 bg-white p-8">
            <div className="max-w-2xl mx-auto border-2 border-gray-900 p-8">
                <div className="text-center mb-8 border-b-2 border-gray-900 pb-8">
                    <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">One X Home Booking</h1>
                    <p className="text-gray-500 text-sm">Official E-Receipt</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                        <p className="text-gray-500 font-bold uppercase text-xs mb-1">Billed To</p>
                        <p className="font-bold">Valued Customer</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 font-bold uppercase text-xs mb-1">Invoice Info</p>
                        <p><span className="text-gray-500">No:</span> {transaction.invoiceNo}</p>
                        <p><span className="text-gray-500">Date:</span> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-gray-900 font-bold uppercase">
                            <tr>
                                <th className="text-left py-2">Description</th>
                                <th className="text-right py-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-4">One X Service Booking Deposit</td>
                                <td className="text-right py-4">RM {transaction.amount.toFixed(2)}</td>
                            </tr>
                        </tbody>
                        <tfoot className="border-t-2 border-gray-900 font-bold text-lg">
                            <tr>
                                <td className="py-4">Total Paid</td>
                                <td className="text-right py-4">RM {transaction.amount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="text-center text-xs text-gray-400 mt-12 pt-8 border-t border-gray-100">
                    <p>Thank you for choosing One X Home Booking.</p>
                    <p>This is a computer-generated receipt. No signature required.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
