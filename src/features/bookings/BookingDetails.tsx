import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { bookingsService } from '../../services/bookingsService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, MapPin, Calendar as CalendarIcon, Users, Activity } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'overview' | 'package' | 'menu' | 'addons' | 'payments' | 'documents' | 'event' | 'activity';

export const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingsService.getBookingById(bookingId!);
      setBooking(data);
    } catch (err) {
      console.error(err);
      error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="p-8 text-center text-on-surface-variant">Booking not found.</div>;
  }

  const totalPaid = booking.paidAmount || 0;
  const balance = booking.totalAmount - totalPaid;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'package', label: 'Package & Pricing' },
    { id: 'menu', label: 'Menu' },
    { id: 'payments', label: 'Payments' },
    { id: 'event', label: 'Linked Event' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* HEADER SECTION */}
      <div className="border border-[#e8e4db] rounded-xl shadow-sm bg-white p-4 md:p-8">
        <div className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/bookings')} className="hover:text-[#4a1420] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Bookings
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{booking.referenceNumber || booking.id}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#4a1420]">{booking.customerName}</h1>
              <Badge variant={booking.status === 'Confirmed' ? 'success' : 'neutral'} className="text-[10px] md:text-sm px-2 py-0.5 md:px-3 md:py-1">
                {booking.status}
              </Badge>
              <Badge variant={balance <= 0 ? 'success' : 'warning'} className="text-[10px] md:text-sm px-2 py-0.5 md:px-3 md:py-1">
                {balance <= 0 ? 'Fully Paid' : 'Payment Pending'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-on-surface-variant mt-2 md:mt-3">
              <div className="flex items-center gap-1 md:gap-1.5"><CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {booking.dateStr} ({booking.shift})</div>
              <div className="flex items-center gap-1 md:gap-1.5"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {booking.hall}</div>
              <div className="flex items-center gap-1 md:gap-1.5"><Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> {booking.guests} Guests</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit">Edit Booking</Button>
              <Button variant="secondary" icon="payments" onClick={async () => {
                const amountStr = prompt('Enter payment amount (PKR):');
                if (!amountStr) return;
                const amount = parseFloat(amountStr);
                if (isNaN(amount) || amount <= 0) {
                  error('Invalid amount');
                  return;
                }
                const ref = prompt('Enter payment reference (e.g. Cheque No, Transaction ID):') || 'CASH-' + Date.now();
                
                try {
                  setLoading(true);
                  await bookingsService.addPayment(booking.id, {
                    amount,
                    method: 'Cash', // Defaulting to Cash for now
                    referenceNumber: ref,
                    userId: '00000000-0000-0000-0000-000000000000' // Mock user ID or real one if auth is setup
                  } as any);
                  success('Payment recorded successfully');
                  fetchBooking();
                } catch (err) {
                  console.error(err);
                  error('Failed to record payment');
                  setLoading(false);
                }
              }}>Record Payment</Button>
              <Button variant="outline" icon="receipt_long">Generate Invoice</Button>
            </div>
            <div className="flex items-center justify-end gap-3 text-sm">
              <button className="text-primary hover:underline flex items-center gap-1">Reschedule</button>
              <span className="text-outline-variant">•</span>
              <button className="text-primary hover:underline flex items-center gap-1">Convert to Event</button>
              <span className="text-outline-variant">•</span>
              <button className="text-error hover:underline flex items-center gap-1" onClick={async () => {
                if (!confirm('Are you sure you want to cancel this booking?')) return;
                try {
                  setLoading(true);
                  await bookingsService.updateBookingStatus(booking.id, 'Cancelled');
                  success('Booking cancelled');
                  fetchBooking();
                } catch (err) {
                  console.error(err);
                  error('Failed to cancel booking');
                  setLoading(false);
                }
              }}>Cancel Booking</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Amount</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#4a1420]">PKR {(booking.totalAmount / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Paid</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#10b981]">PKR {(totalPaid / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e02424]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Balance Due</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#e02424]">PKR {(balance / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Booking Date</div>
            <div className="font-serif text-base md:text-2xl font-bold text-[#4a1420]">
              {new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white border border-[#e8e4db] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 mb-6">
        <div className="px-2 md:px-8 border-b border-outline-variant/30 flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-4 md:px-6 py-3 md:py-4 font-medium text-xs md:text-sm transition-colors whitespace-nowrap border-b-2",
                activeTab === tab.id 
                  ? "border-[#4a1420] text-[#4a1420]" 
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
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
                <h3 className="font-title-lg mb-4">Customer Details</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Name</div>
                    <div className="col-span-2 font-medium">{booking.customerName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Phone</div>
                    <div className="col-span-2 font-medium flex items-center gap-2">
                      {booking.customerPhone}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Tier</div>
                    <div className="col-span-2"><Badge>Standard</Badge></div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Schedule</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Date</div>
                    <div className="col-span-2 font-medium">{booking.dateStr}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Shift</div>
                    <div className="col-span-2 font-medium">{booking.shift}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Hall</div>
                    <div className="col-span-2 font-medium">{booking.hall}</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'package' && (
          <div className="max-w-3xl space-y-6">
            <h3 className="font-title-lg">Pricing Breakdown</h3>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">Item</th>
                    <th className="p-4 font-medium text-right">Qty/Rate</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="p-4">
                      <div className="font-medium text-on-surface">Royal Gold Package</div>
                      <div className="text-xs text-on-surface-variant mt-1">Includes Venue, Basic Decor, Standard Menu</div>
                    </td>
                    <td className="p-4 text-right text-on-surface-variant">450 @ 1,200</td>
                    <td className="p-4 text-right font-currency-num text-on-surface font-medium">PKR 540,000</td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <div className="font-medium text-on-surface">Premium Floral Decor Add-on</div>
                    </td>
                    <td className="p-4 text-right text-on-surface-variant">Lumpsum</td>
                    <td className="p-4 text-right font-currency-num text-on-surface font-medium">PKR 150,000</td>
                  </tr>
                  <tr>
                    <td className="p-4">
                      <div className="font-medium text-on-surface">Sound System & DJ</div>
                    </td>
                    <td className="p-4 text-right text-on-surface-variant">Lumpsum</td>
                    <td className="p-4 text-right font-currency-num text-on-surface font-medium">PKR 90,000</td>
                  </tr>
                </tbody>
                <tfoot className="bg-surface-variant/20 font-bold border-t-2 border-outline-variant/50">
                  <tr>
                    <td className="p-4 text-right" colSpan={2}>Grand Total</td>
                    <td className="p-4 text-right font-currency-num text-primary text-lg">PKR {booking.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Payment History</h3>
              <Button variant="primary" icon="add">Record Payment</Button>
            </div>
            
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Reference</th>
                    <th className="p-4 font-medium">Method</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {(booking.payments || []).map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-surface-variant/10">
                      <td className="p-4 text-on-surface">{payment.dateStr}</td>
                      <td className="p-4 text-on-surface-variant font-mono text-sm">{payment.reference}</td>
                      <td className="p-4">
                        <Badge variant="neutral">{payment.method}</Badge>
                      </td>
                      <td className="p-4 text-right font-currency-num text-on-surface font-medium text-success">
                        + PKR {payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!booking.payments || booking.payments.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'event' && (
          <div className="max-w-2xl">
            {booking.eventId ? (
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Event is active</h3>
                <p className="text-on-surface-variant mb-6">This booking has been converted to an operational event.</p>
                <Button variant="primary" onClick={() => navigate(`/app/events/${booking.eventId}`)}>Open Event Command Center</Button>
              </div>
            ) : (
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-surface-variant text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No linked event</h3>
                <p className="text-on-surface-variant mb-6">Convert this booking into an event to manage operations, staffing, and readiness.</p>
                <Button variant="primary">Convert to Event</Button>
              </div>
            )}
          </div>
        )}

        {/* Placeholders for others */}
        {['menu', 'documents', 'activity'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  </div>
  );
};
