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
      await addDoc(collection(db, "bookings"), {
        ...data,
        status: 'pending',
        createdAt: new Date(),
        date: data.date // Firestore handles Date objects correctly
      });
      console.log('Booking submitted:', data);
      nextStep(); // Go to success step
    } catch (error: any) {
      console.error("Error adding document: ", error);
      setError(error.message || "There was an error submitting your booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans">
      <div className="mb-10 flex justify-between items-center px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center relative">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 z-10",
              step >= i 
                ? "bg-black text-white shadow-lg shadow-black/20 scale-110" 
                : "bg-gray-100 text-gray-400"
            )}>
              {i}
            </div>
            {i < 4 && (
              <div className={cn(
                "absolute top-5 left-10 w-[calc(100%+2rem)] h-0.5 -z-0 transition-colors duration-500",
                step > i ? "bg-black" : "bg-gray-100"
              )} />
            )}
            <span className={cn(
              "text-xs mt-2 font-medium transition-colors duration-300 hidden sm:block",
              step >= i ? "text-black" : "text-gray-400"
            )}>
              {i === 1 ? 'Details' : i === 2 ? 'Vehicle' : i === 3 ? 'Time' : 'Confirm'}
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
              <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
              <p className="text-gray-500 text-sm mt-1">Let's start with your contact information</p>
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
                placeholder="Home Address" 
                value={data.address} 
                onChange={e => updateData({ address: e.target.value })} 
                className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
            </div>
            
            <Button 
              className="w-full mt-6 rounded-full py-6 text-lg font-medium bg-black hover:bg-gray-800 shadow-lg shadow-black/10" 
              onClick={nextStep} 
              disabled={!data.name || !data.phone || !data.address}
            >
              Next: Vehicle Details
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
              <h2 className="text-2xl font-bold text-gray-900">Vehicle Details</h2>
              <p className="text-gray-500 text-sm mt-1">Tell us about your car</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Brand" 
                  value={data.vehicleBrand} 
                  onChange={e => updateData({ vehicleBrand: e.target.value })} 
                  className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                />
                <Input 
                  placeholder="Model" 
                  value={data.vehicleModel} 
                  onChange={e => updateData({ vehicleModel: e.target.value })} 
                  className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
                />
              </div>
              <Input 
                placeholder="Year" 
                type="number"
                value={data.vehicleYear} 
                onChange={e => updateData({ vehicleYear: e.target.value })} 
                className="rounded-full px-6 py-6 bg-gray-50 border-gray-100 focus:bg-white transition-all"
              />
              <div className="relative">
                <select 
                  className="flex w-full rounded-full border border-gray-100 bg-gray-50 px-6 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none appearance-none transition-all"
                  value={data.transmissionType}
                  onChange={e => updateData({ transmissionType: e.target.value })}
                >
                  <option value="Automatic">Automatic Transmission</option>
                  <option value="Manual">Manual Transmission</option>
                  <option value="CVT">CVT</option>
                  <option value="DCT">DCT</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
              <textarea 
                className="flex min-h-[100px] w-full rounded-3xl border border-gray-100 bg-gray-50 px-6 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none"
                placeholder="Describe the problem..."
                value={data.issues}
                onChange={e => updateData({ issues: e.target.value })}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={prevStep} className="w-1/3 rounded-full py-6 border-gray-200 hover:bg-gray-50">Back</Button>
              <Button className="w-2/3 rounded-full py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/10" onClick={nextStep} disabled={!data.vehicleBrand || !data.vehicleModel}>
                Next: Select Time
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select a Time</h2>
              <p className="text-gray-500 text-sm mt-1">When should we come by?</p>
            </div>

            <div className="flex justify-center bg-gray-50 p-2 sm:p-6 rounded-3xl border border-gray-100 overflow-hidden">
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
              <div className="grid grid-cols-1 gap-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={prevStep} className="w-1/3 rounded-full py-6 border-gray-200 hover:bg-gray-50">Back</Button>
              <Button className="w-2/3 rounded-full py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/10" onClick={nextStep} disabled={!data.date || !data.timeSlot}>
                Review Booking
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
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
                <span className="font-medium text-gray-900">{data.vehicleYear} {data.vehicleBrand} {data.vehicleModel}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{data.date ? format(data.date, 'PPP') : '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{data.timeSlot}</span>
              </div>
              <div className="pt-4 mt-2 bg-white p-4 rounded-2xl border border-gray-100">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold block mb-2">Service Location</span>
                <span className="font-medium text-gray-900 block">{data.address}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="w-1/3 rounded-full py-6 border-gray-200 hover:bg-gray-50" disabled={loading}>Back</Button>
                <Button className="w-2/3 rounded-full py-6 bg-black hover:bg-gray-800 shadow-lg shadow-black/10" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Confirming...' : 'Confirm Booking'}
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
