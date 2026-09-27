import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersService } from '../../services/customersService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Phone, Mail, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'overview' | 'bookings' | 'enquiries' | 'payments' | 'preferences' | 'activity';

export const CustomerDetails = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      if (customerId) {
        const data = await customersService.getCustomerById(customerId);
        setCustomer(data);
      }
    } catch (err) {
      error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);
  
  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-on-surface-variant">Customer not found.</div>;
  }

  const customerBookings = customer.bookings || [];
  const totalSpent = customer.totalSpent;
  // Outstanding logic is not readily available on backend yet, set to 0 or hardcode
  const outstanding = 0; 
  const avgBookingValue = customerBookings.length > 0 ? totalSpent / customerBookings.length : 0;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Profile Overview' },
    { id: 'bookings', label: 'Booking History' },
    { id: 'enquiries', label: 'Enquiries' },
    { id: 'payments', label: 'Payments' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'activity', label: 'Timeline' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* HEADER SECTION */}
      <div className="border-b border-outline-variant/30 bg-surface px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/customers')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Customers
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{customer.id}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container font-headline-lg flex items-center justify-center rounded-full shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-on-surface">{customer.name}</h1>
                <Badge variant={customer.tier === 'VIP' ? 'secondary' : customer.tier === 'Corporate' ? 'primary' : 'neutral'} className="text-sm px-3 py-1">
                  {customer.tier}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-4 text-on-surface-variant mt-2">
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {customer.phone}</div>
                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {customer.email}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit">Edit Profile</Button>
              <Button variant="outline" icon="add" onClick={() => navigate('/app/bookings/new', { state: { customer } })}>Create Booking</Button>
            </div>
            <div className="flex items-center justify-end gap-3 text-sm">
              <button className="text-primary hover:underline flex items-center gap-1"><MessageSquare className="w-4 h-4"/> WhatsApp</button>
              <span className="text-outline-variant">•</span>
              <button className="text-primary hover:underline flex items-center gap-1"><Mail className="w-4 h-4"/> Send Email</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-8 py-6 bg-surface-container-lowest border-b border-outline-variant/20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-on-surface">{customerBookings.length}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Lifetime Value</div>
            <div className="text-3xl font-currency-num font-bold text-secondary">PKR {(totalSpent/1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Outstanding</div>
            <div className="text-3xl font-currency-num font-bold text-error">PKR {outstanding.toLocaleString()}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Completed Events</div>
            <div className="text-3xl font-bold text-on-surface">{customerBookings.filter((b: any) => b.status === 'Completed').length}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Average Booking</div>
            <div className="text-3xl font-currency-num font-bold text-on-surface">PKR {avgBookingValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-8 border-b border-outline-variant/30 flex overflow-x-auto no-scrollbar">
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Contact Information</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Primary Phone</div>
                    <div className="col-span-2 font-medium">{customer.phone}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Email Address</div>
                    <div className="col-span-2 font-medium">{customer.email}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Address</div>
                    <div className="col-span-2 font-medium">Phase 5, DHA, Lahore</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Customer Insights</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                    <span className="text-on-surface-variant text-sm">Last Event</span>
                    <span className="font-medium text-on-surface">
                      {customerBookings.length > 0 ? customerBookings[customerBookings.length-1].dateStr : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                    <span className="text-on-surface-variant text-sm">Next Event</span>
                    <span className="font-medium text-primary">
                      {customerBookings.find((b: any) => b.status === 'Confirmed')?.dateStr || 'None scheduled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-sm">Repeat Rate</span>
                    <span className="font-medium text-success text-lg">{customerBookings.length > 1 ? 'High' : 'Low'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Booking History</h3>
              <Button variant="primary" onClick={() => navigate('/app/bookings/new', { state: { customer } })}>New Booking</Button>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Date & Hall</th>
                    <th className="p-4 font-medium">Guests</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {customerBookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-surface-variant/30 cursor-pointer transition-colors" onClick={() => navigate(`/app/bookings/${booking.id}`)}>
                      <td className="p-4 font-medium text-primary">{booking.id}</td>
                      <td className="p-4">
                        <div className="text-on-surface font-medium">{booking.dateStr}</div>
                        <div className="text-on-surface-variant text-xs mt-1">{booking.hall} • {booking.shift}</div>
                      </td>
                      <td className="p-4 text-on-surface">{booking.guests}</td>
                      <td className="p-4">
                        <Badge variant={booking.status === 'Confirmed' ? 'success' : booking.status === 'Completed' ? 'neutral' : 'warning'}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-currency-num text-on-surface font-medium">
                        PKR {booking.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {customerBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">No bookings found for this customer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Enquiry History</h3>
              <Button variant="primary" onClick={() => navigate('/app/enquiries')}>New Enquiry</Button>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Preferred Date</th>
                    <th className="p-4 font-medium">Guests</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {customer.enquiries?.map((enq: any) => (
                    <tr key={enq.id} className="hover:bg-surface-variant/30 cursor-pointer transition-colors" onClick={() => navigate(`/app/enquiries/${enq.id}`)}>
                      <td className="p-4 font-medium text-primary">{enq.id}</td>
                      <td className="p-4 text-on-surface font-medium">{enq.dateStr}</td>
                      <td className="p-4 text-on-surface">{enq.guests}</td>
                      <td className="p-4">
                        <Badge variant={enq.status === 'Converted' ? 'success' : enq.status === 'Lost' ? 'error' : 'neutral'}>
                          {enq.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {(!customer.enquiries || customer.enquiries.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant">No enquiries found for this customer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Payment History</h3>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">Reference</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Booking ID</th>
                    <th className="p-4 font-medium">Method</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {customer.payments?.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-surface-variant/30 transition-colors">
                      <td className="p-4 font-medium text-primary">{payment.reference}</td>
                      <td className="p-4 text-on-surface">{payment.dateStr}</td>
                      <td className="p-4 text-on-surface-variant text-sm cursor-pointer hover:underline" onClick={() => navigate(`/app/bookings/${payment.bookingId}`)}>
                        {payment.bookingId}
                      </td>
                      <td className="p-4">
                        <Badge variant="neutral">{payment.method}</Badge>
                      </td>
                      <td className="p-4 text-right font-currency-num text-on-surface font-medium">
                        PKR {payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!customer.payments || customer.payments.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">No payments found for this customer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholders for others */}
        {['preferences', 'activity'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
