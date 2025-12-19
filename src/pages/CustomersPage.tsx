import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Phone, Mail, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Booking {
  id: string | number;
  name: string;
  vehicle: string;
  date: Date;
  time: string;
  address: string;
  issue: string;
  status: string;
  phone: string;
  email?: string;
}

interface CustomersPageProps {
  bookings: Booking[];
}

export default function CustomersPage({ bookings }: CustomersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCustomers = bookings.filter(booking => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.email && booking.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage your customer bookings and history</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-8 py-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle & Issue</th>
                <th className="px-8 py-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-8 py-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{customer.name}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Phone className="h-3 w-3" /> {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-medium text-gray-900">{customer.vehicle}</div>
                    <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">{customer.issue}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <MapPin className="h-3 w-3" />
                      {customer.address}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" /> {format(customer.date, 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" /> {customer.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border",
                      getStatusColor(customer.status)
                    )}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100/50 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-lg text-gray-900">{customer.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Phone className="h-3 w-3" /> {customer.phone}
                </div>
              </div>
              <span className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border",
                getStatusColor(customer.status)
              )}>
                {customer.status}
              </span>
            </div>
            
            <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vehicle</div>
                <div className="font-medium text-gray-900">{customer.vehicle}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Issue</div>
                <div className="font-medium text-gray-900 truncate">{customer.issue}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</div>
                <div className="font-medium text-gray-900">{format(customer.date, 'MMM d')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Time</div>
                <div className="font-medium text-gray-900">{customer.time}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
               <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{customer.address}</span>
               </div>
               <button className="text-gray-400 hover:text-gray-600 p-2 -mr-2">
                  <MoreHorizontal className="h-5 w-5" />
               </button>
            </div>
          </div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
