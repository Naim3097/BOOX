import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, isAfter, compareAsc } from 'date-fns';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import CustomersPage from './CustomersPage';
import { LayoutDashboard, Users, LogOut, Menu, X, MessageCircle, MapPin, CalendarClock } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import logo from '../assets/logo.png';

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM"
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'customers'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reschedule State
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTimeSlot, setNewTimeSlot] = useState<string | undefined>(undefined);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Safely handle date conversion
        let dateObj = new Date();
        if (data.date) {
            if (typeof data.date.toDate === 'function') {
                dateObj = data.date.toDate();
            } else if (data.date.seconds) {
                dateObj = new Date(data.date.seconds * 1000);
            } else {
                dateObj = new Date(data.date);
            }
        }

        return {
          id: doc.id,
          name: data.name || 'Unknown',
          phone: data.phone || '',
          address: data.address || '',
          vehicle: `${data.vehicleYear || ''} ${data.vehicleBrand || ''} ${data.vehicleModel || ''}`,
          issue: data.issues || '',
          date: dateObj,
          time: data.timeSlot || '',
          status: data.status || 'pending',
          createdAt: data.createdAt
        };
      });
      setBookings(bookingsData);
      setError(null);
    }, (err) => {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Check your internet connection or permissions.");
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/admin/login');
  };

  const bookingsForDate = bookings.filter(b => 
    selectedDate && isSameDay(b.date, selectedDate)
  );

  // Sort bookings by time (simplified for this demo, assuming time string sort works roughly or just rely on order)
  bookingsForDate.sort((a, b) => a.time.localeCompare(b.time));

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, "bookings", id);
      await updateDoc(bookingRef, {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReschedule = (booking: any) => {
    setRescheduleBooking(booking);
    setNewDate(booking.date);
    setNewTimeSlot(booking.time);
  };

  const confirmReschedule = async () => {
    if (!rescheduleBooking || !newDate || !newTimeSlot) return;
    
    try {
      const bookingRef = doc(db, "bookings", rescheduleBooking.id);
      await updateDoc(bookingRef, {
        date: newDate,
        timeSlot: newTimeSlot,
        status: 'confirmed' // Assume rescheduled means confirmed
      });
      setRescheduleBooking(null);
    } catch (error) {
      console.error("Error rescheduling:", error);
      alert("Failed to reschedule. Please try again.");
    }
  };

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  // Helper to convert time slot to 24h number for sorting
  const getStartHour = (timeSlot: string) => {
    if (!timeSlot) return 0;
    const match = timeSlot.match(/(\d+):(\d+)\s(AM|PM)/);
    if (!match) return 0;
    let hour = parseInt(match[1]);
    const period = match[3];
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  // Next Appointment Logic
  const nextAppointment = bookings
    .filter(b => {
      if (b.status !== 'confirmed' && b.status !== 'pending') return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // If date is in the future, keep it
      if (isAfter(b.date, today)) return true;
      
      // If date is today, check if time has passed
      if (isSameDay(b.date, today)) {
        const currentHour = new Date().getHours();
        const bookingHour = getStartHour(b.time);
        return bookingHour > currentHour;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Primary sort: Date
      const dateComparison = compareAsc(a.date, b.date);
      if (dateComparison !== 0) return dateComparison;
      
      // Secondary sort: Time
      return getStartHour(a.time) - getStartHour(b.time);
    })[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-50">
        <img src={logo} alt="One X" className="h-8 object-contain" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-24 px-6 space-y-6 overflow-y-auto">
          <nav className="space-y-4">
            <button 
              onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-lg font-medium",
                currentView === 'dashboard' 
                  ? "bg-black text-white shadow-lg shadow-black/20" 
                  : "text-gray-400 bg-gray-50"
              )}
            >
              <LayoutDashboard className="h-6 w-6" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => { setCurrentView('customers'); setIsMobileMenuOpen(false); }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-lg font-medium",
                currentView === 'customers' 
                  ? "bg-black text-white shadow-lg shadow-black/20" 
                  : "text-gray-400 bg-gray-50"
              )}
            >
              <Users className="h-6 w-6" />
              <span>Customers</span>
            </button>
          </nav>
          <div className="pt-6 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 bg-red-50 font-medium">
              <LogOut className="h-6 w-6" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="w-full md:w-24 lg:w-64 bg-white border-r border-gray-100 p-6 flex-shrink-0 hidden md:flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="mb-12 flex justify-center lg:justify-start">
            <img src={logo} alt="One X" className="h-10 object-contain" />
          </div>
          <nav className="space-y-4">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group",
                currentView === 'dashboard' 
                  ? "bg-black text-white shadow-lg shadow-black/20" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <LayoutDashboard className="h-6 w-6" />
              <span className="hidden lg:block font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => setCurrentView('customers')}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group",
                currentView === 'customers' 
                  ? "bg-black text-white shadow-lg shadow-black/20" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Users className="h-6 w-6" />
              <span className="hidden lg:block font-medium">Customers</span>
            </button>
          </nav>
        </div>
        
        <div className="space-y-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-200">
            <LogOut className="h-6 w-6" />
            <span className="hidden lg:block font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto bg-[#F8FAFC]">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}
        {currentView === 'dashboard' ? (
          <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                <p className="text-gray-500 mt-2 text-lg">Welcome back, Admin</p>
              </div>
              <div className="text-sm font-medium bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm text-gray-600 hidden md:block">
                {format(new Date(), 'PPP')}
              </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
                <p className="text-gray-500 font-medium mb-2">Total Bookings</p>
                <p className="text-4xl md:text-5xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
                <p className="text-gray-500 font-medium mb-2">Pending</p>
                <p className="text-4xl md:text-5xl font-bold text-yellow-600">{pendingBookings}</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow duration-300">
                <p className="text-gray-500 font-medium mb-2">Completed</p>
                <p className="text-4xl md:text-5xl font-bold text-green-600">{completedBookings}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Calendar & Next Appointment */}
              <div className="space-y-8 lg:col-span-1">
                {/* Calendar */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100/50">
                  <h3 className="font-bold text-xl mb-6">Calendar</h3>
                  <div className="flex justify-center">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="mx-auto !font-sans"
                      modifiers={{
                        booked: bookings
                          .filter(b => !selectedDate || !isSameDay(b.date, selectedDate)) // Don't mark selected date as 'booked' to avoid style conflict
                          .map(b => b.date)
                      }}
                      modifiersStyles={{
                        booked: { 
                          fontWeight: 'bold', 
                          color: 'black',
                          textDecoration: 'none',
                          borderBottom: '2px solid black'
                        },
                        selected: {
                          backgroundColor: 'black',
                          color: 'white',
                          borderRadius: '100%',
                          borderBottom: 'none'
                        }
                      }}
                      styles={{
                        head_cell: { color: '#9CA3AF', fontWeight: 500, fontSize: '0.875rem' },
                        cell: { fontSize: '0.9rem', padding: '0.5rem' },
                        day: { borderRadius: '100%', width: '2.5rem', height: '2.5rem' },
                        nav_button: { color: 'black' },
                        caption: { color: 'black', fontWeight: 'bold' }
                      }}
                    />
                  </div>
                </div>

                {/* Next Appointment Card */}
                {nextAppointment && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                      Next Up
                    </h3>
                    <div className="mb-6 relative z-10">
                      <div className="text-4xl font-bold mb-1 text-gray-900">{nextAppointment.time}</div>
                      <div className="text-gray-500 font-medium">{format(nextAppointment.date, 'PPP')}</div>
                    </div>
                    <div className="space-y-3 text-gray-600 mb-8 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-black"></div>
                        <span className="font-medium text-gray-900">{nextAppointment.name}</span>
                      </div>
                      <div className="flex items-center gap-3 pl-5 text-sm">
                        {nextAppointment.vehicle}
                      </div>
                      <div className="flex items-center gap-3 pl-5 text-sm text-gray-400">
                        {nextAppointment.address}
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-black text-white hover:bg-gray-800 rounded-full h-12 font-medium shadow-lg shadow-black/10 relative z-10"
                      onClick={() => {
                        setSelectedDate(nextAppointment.date);
                        // Scroll to schedule section on mobile
                        const scheduleElement = document.getElementById('daily-schedule');
                        if (scheduleElement) {
                          scheduleElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: Daily Schedule */}
              <div id="daily-schedule" className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100/50 lg:col-span-2 h-fit">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h3 className="font-bold text-xl">
                    Schedule for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}
                  </h3>
                  <Button size="sm" variant="outline" className="rounded-full px-6 w-full sm:w-auto">Export</Button>
                </div>
                
                {bookingsForDate.length === 0 ? (
                  <div className="text-center py-24 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p>No bookings scheduled for this date.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingsForDate.map(booking => (
                      <div key={booking.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 border border-gray-100 rounded-2xl hover:border-black/5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 bg-white">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="font-mono font-bold text-xl text-gray-900">{booking.time}</span>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium capitalize tracking-wide",
                              booking.status === 'confirmed' && "bg-green-50 text-green-700 border border-green-100",
                              booking.status === 'pending' && "bg-yellow-50 text-yellow-700 border border-yellow-100",
                              booking.status === 'completed' && "bg-gray-50 text-gray-700 border border-gray-100",
                              booking.status === 'cancelled' && "bg-red-50 text-red-700 border border-red-100",
                            )}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                            <div className="font-medium text-gray-900">{booking.name}</div>
                            <div>{booking.vehicle}</div>
                            <div>{booking.phone}</div>
                            <div>{booking.issue}</div>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                            {booking.address}
                          </div>
                          
                          {/* Action Buttons Row */}
                          <div className="flex gap-2 mt-4">
                            <a 
                              href={`https://wa.me/${booking.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle size={18} />
                            </a>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Open in Maps"
                            >
                              <MapPin size={18} />
                            </a>
                            <button 
                              onClick={() => handleReschedule(booking)}
                              className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Reschedule Booking"
                            >
                              <CalendarClock size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-6 md:mt-0 md:ml-8 flex flex-wrap items-center gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 md:transform md:translate-x-4 md:group-hover:translate-x-0">
                          {booking.status === 'pending' && (
                            <Button size="sm" onClick={() => updateStatus(booking.id, 'confirmed')} className="bg-black hover:bg-gray-800 text-white rounded-full px-6 flex-1 md:flex-none">
                              Confirm
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button size="sm" onClick={() => updateStatus(booking.id, 'completed')} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 rounded-full px-6 flex-1 md:flex-none">
                              Complete
                            </Button>
                          )}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                             <Button size="sm" variant="ghost" onClick={() => updateStatus(booking.id, 'cancelled')} className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full px-6 flex-1 md:flex-none">
                               Cancel
                             </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <CustomersPage bookings={bookings} />
        )}
      </main>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Reschedule Booking</h3>
              <button onClick={() => setRescheduleBooking(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6 flex justify-center bg-gray-50 rounded-2xl p-4">
              <DayPicker
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={[
                  { before: new Date() },
                  { dayOfWeek: [0] } // 0 is Sunday
                ]}
                className="!font-sans"
                modifiersStyles={{
                  selected: { 
                    backgroundColor: 'black', 
                    color: 'white', 
                    borderRadius: '100%' 
                  }
                }}
              />
            </div>

            {newDate && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setNewTimeSlot(slot)}
                    className={cn(
                      "p-3 rounded-xl text-xs font-medium transition-all border",
                      newTimeSlot === slot 
                        ? "bg-black text-white border-black" 
                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRescheduleBooking(null)} className="flex-1 rounded-full">Cancel</Button>
              <Button onClick={confirmReschedule} disabled={!newDate || !newTimeSlot} className="flex-1 rounded-full bg-black text-white hover:bg-gray-800">
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
