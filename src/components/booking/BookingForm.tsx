import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type BookingData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  transmissionType: string;
  issues: string;
  date: Date | undefined;
  timeSlot: string | undefined;
};

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM"
];

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    transmissionType: 'Automatic',
    issues: '',
    date: undefined,
    timeSlot: undefined,
  });

  const updateData = (fields: Partial<BookingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!data.date || !data.timeSlot) return;
    
    setLoading(true);
    setError(null);
    try {
      // 1. Save booking to Firestore first with pending_payment status
      const docRef = await addDoc(collection(db, "bookings"), {
        ...data,
        status: 'pending_payment',
        paymentStatus: 'pending',
        createdAt: new Date(),
        date: data.date // Firestore handles Date objects correctly
      });
      
      console.log('Booking created with ID:', docRef.id);

      // 2. Call our backend API to create Lean.x payment session
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1.00, // Updated to RM1.00
          invoiceRef: `BOOKING-${docRef.id}`,
          customerName: data.name,
          customerEmail: data.email || 'guest@onexbooking.com', // Use dummy email if not provided
          customerPhone: data.phone,
        }),
      });

      // Check content type to avoid JSON parse errors
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("API Error (Non-JSON response):", text);
        throw new Error("Payment API is not available. If you are testing locally, please use 'vercel dev' instead of 'npm run dev'.");
      }

      const paymentData = await response.json();

      if (!response.ok) {
        // Construct a more detailed error message
        const detailedError = paymentData.message || paymentData.details || paymentData.error || 'Failed to initialize payment';
        console.error("Payment Gateway Detailed Error:", JSON.stringify(paymentData, null, 2));
        throw new Error(detailedError);
      }

      if (paymentData.success && paymentData.redirectUrl) {
        // 3. Redirect user to Lean.x payment page
        console.log('Redirecting to payment page...');
        window.location.href = paymentData.redirectUrl;
      } else {
        throw new Error('Invalid response from payment gateway');
      }

    } catch (error: any) {
      console.error("Error processing booking:", error);
      setError(error.message || "Failed to process your booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans">
      <div className="mb-10 flex justify-between items-center px-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center relative w-1/2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10",
              step >= i 
                ? "bg-black text-white shadow-lg shadow-black/20 scale-110" 
                : "bg-gray-100 text-gray-400"
            )}>
              {i}
            </div>
            {i < 2 && (
              <div className={cn(
                "absolute top-5 left-[50%] w-full h-0.5 -z-0 transition-colors duration-500",
                step > i ? "bg-black" : "bg-gray-100"
              )} />
            )}
            <span className={cn(
              "text-xs mt-2 font-medium transition-colors duration-300",
              step >= i ? "text-black" : "text-gray-400"
            )}>
              {i === 1 ? 'Details & Time' : 'Review & Pay'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-gray-500 text-sm mt-1">Please fill in your information</p>
            </div>
            
            <div className="space-y-4">
              <Input 
                placeholder="Full Name" 
                value={data.name} 
                onChange={e => updateData({ name: e.target.value })} 
                className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
              <Input 
                placeholder="Phone Number" 
                value={data.phone} 
                onChange={e => updateData({ phone: e.target.value })} 
                className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
              <Input 
                placeholder="Lokasi / City" 
                value={data.address} 
                onChange={e => updateData({ address: e.target.value })} 
                className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
              <Input 
                placeholder="Model Kereta" 
                value={data.vehicleModel} 
                onChange={e => updateData({ vehicleModel: e.target.value })} 
                className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
              <textarea 
                className="flex min-h-[100px] w-full rounded-3xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none"
                placeholder="Describe the problem..."
                value={data.issues}
                onChange={e => updateData({ issues: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Select Date & Time</h3>
              <div className="flex justify-center bg-gray-50 p-2 sm:p-6 rounded-3xl border border-gray-100 overflow-hidden mb-4">
                <DayPicker
                  mode="single"
                  selected={data.date}
                  onSelect={(date) => updateData({ date })}
                  disabled={[
                    { before: new Date() },
                    { dayOfWeek: [0] } // 0 is Sunday
                  ]}
                  className="!font-sans m-0 w-full"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-bold",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
                    day_selected: "bg-black text-white hover:bg-gray-800 hover:text-white focus:bg-black focus:text-white",
                    day_today: "bg-gray-100 text-accent-foreground",
                    day_outside: "text-gray-300 opacity-50",
                    day_disabled: "text-gray-300 opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </div>
              
              {data.date && (
                <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => updateData({ timeSlot: slot })}
                      className={cn(
                        "p-4 rounded-2xl border text-sm font-medium transition-all duration-200 flex justify-between items-center group",
                        data.timeSlot === slot 
                          ? "bg-black text-white border-black shadow-lg shadow-black/20" 
                          : "bg-white hover:bg-gray-50 border-gray-100 text-gray-600"
                      )}
                    >
                      <span>{slot}</span>
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 transition-colors",
                        data.timeSlot === slot ? "border-white bg-white" : "border-gray-300 group-hover:border-gray-400"
                      )} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              className="w-full mt-6 rounded-full py-6 text-lg font-medium bg-black hover:bg-gray-800 shadow-lg shadow-black/10" 
              onClick={nextStep} 
              disabled={!data.name || !data.phone || !data.address || !data.vehicleModel || !data.date || !data.timeSlot}
            >
              Review Booking
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>
              <p className="text-gray-500 text-sm mt-1">Please review your details</p>
            </div>

            <div className="bg-gray-50 p-8 rounded-3xl space-y-4 text-sm border border-gray-100">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500">Customer</span>
                <span className="font-bold text-gray-900 text-base">{data.name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500">Contact</span>
                <span className="font-medium text-gray-900">{data.phone}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500">Vehicle</span>
                <span className="font-medium text-gray-900">{data.vehicleModel}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{data.date ? format(data.date, 'PPP') : '-'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{data.timeSlot}</span>
              </div>
              <div className="pt-4 mt-2 bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold block mb-2">Service Location</span>
                <span className="font-medium text-gray-900 block">{data.address}</span>
              </div>
              {data.issues && (
                <div className="pt-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-bold block mb-1">Problem Description</span>
                  <p className="text-gray-600 italic">{data.issues}</p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
              <p className="text-yellow-800 font-medium text-sm">
                To confirm booking need to pay <span className="font-bold text-black">RM 1.00</span>
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 break-words">
                  <p className="font-bold mb-1">Payment Error:</p>
                  {error}
                  <p className="text-xs mt-2 text-gray-500">Check console for full details.</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="w-1/3 rounded-full py-6 border-gray-200 hover:bg-gray-50" disabled={loading}>Back</Button>
                <Button className="w-2/3 rounded-full py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/10" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay RM 1.00'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}


        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">We'll see you on {data.date ? format(data.date, 'PPP') : ''} at {data.timeSlot}.</p>
            <Button onClick={() => window.location.reload()} className="rounded-full px-8 py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/20">Book Another</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
