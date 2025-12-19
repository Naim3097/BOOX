import BookingForm from '../components/booking/BookingForm';
import logo from '../assets/logo.png';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg mb-12 text-center flex flex-col items-center">
        <img src={logo} alt="One X Transmission" className="h-20 mb-6 object-contain" />
        <p className="text-gray-500 text-lg font-light tracking-wide">Premium Home Inspection Service</p>
      </div>
      
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 md:p-10">
        <BookingForm />
      </div>
      
      <footer className="mt-12 text-center text-sm text-gray-400">
        &copy; 2025 One X Transmission. All rights reserved.
        <div className="mt-4">
          <a href="/admin" className="text-xs text-gray-300 hover:text-black transition-colors">Admin Login</a>
        </div>
      </footer>
    </div>
  );
}
