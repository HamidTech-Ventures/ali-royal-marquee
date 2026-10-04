import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { bookingsService } from '../../services/bookingsService';
import { eventsService } from '../../services/eventsService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { ArrowLeft, MapPin, Calendar as CalendarIcon, Users, Activity, DollarSign, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'overview' | 'package' | 'payments' | 'activity';

export const BookingDetails = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({ amount: '', reference: '', method: 'Cash' });
  
  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', shift: 'Evening' });

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingsService.getBookingById(bookingId!);
      setBooking(data);
      setRescheduleForm({
        date: data.bookingDate ? new Date(data.bookingDate).toISOString().split('T')[0] : '',
        shift: data.shift || 'Evening'
      });
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
    { id: 'payments', label: 'Payments' },
    { id: 'activity', label: 'Activity Logs' }
  ];

  const handlePrintInvoice = async () => {
    try {
      success('Generating Invoice...');
      const res = await bookingsService.generateInvoice(booking.id);
      window.open(res.url, '_blank');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      error('Please enter a valid amount');
      return;
    }
    try {
      setIsSubmitting(true);
      await bookingsService.addPayment(booking.id, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        referenceNumber: paymentForm.reference || `TRX-${Date.now()}`,
        userId: '00000000-0000-0000-0000-000000000000'
      } as any);
      success('Payment recorded successfully');
      setPaymentModalOpen(false);
      fetchBooking();
    } catch (err) {
      error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.date) {
      error('Please select a new date');
      return;
    }
    try {
      setIsSubmitting(true);
      
      const startTime = rescheduleForm.shift === 'Evening' ? '18:00:00' : '10:00:00';
      const endTime = rescheduleForm.shift === 'Evening' ? '23:30:00' : '15:30:00';
      const bookingDateStr = new Date(rescheduleForm.date).toISOString().split('T')[0];

      await bookingsService.updateBooking(booking.id, {
        ...booking,
        shift: rescheduleForm.shift,
        bookingDate: `${bookingDateStr}T00:00:00Z`,
        startTime: `${bookingDateStr}T${startTime}Z`,
        endTime: `${bookingDateStr}T${endTime}Z`,
      } as any);
      success('Booking rescheduled successfully');
      setRescheduleModalOpen(false);
      fetchBooking();
    } catch (err) {
      error('Failed to reschedule booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be fully undone.')) return;
    try {
      setIsSubmitting(true);
      await bookingsService.updateBookingStatus(booking.id, 'Cancelled');
      success('Booking cancelled successfully');
      fetchBooking();
    } catch (err) {
      error('Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToEvent = async () => {
    // Navigate to Event creation page, passing booking data via state
    const res = await eventsService.createFromBooking(booking.id);
    navigate(`/app/events/${res.eventId}`, { state: { bookingId: booking.id, customerName: booking.customerName } });
  };

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
              <Badge variant={booking.status === 'Confirmed' ? 'success' : booking.status === 'Cancelled' ? 'error' : 'neutral'} className="text-[10px] md:text-sm px-2 py-0.5 md:px-3 md:py-1">
                {booking.status}
              </Badge>
              {booking.status !== 'Cancelled' && (
                <Badge variant={balance <= 0 ? 'success' : 'warning'} className="text-[10px] md:text-sm px-2 py-0.5 md:px-3 md:py-1">
                  {balance <= 0 ? 'Fully Paid' : 'Payment Pending'}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-on-surface-variant mt-2 md:mt-3">
              <div className="flex items-center gap-1 md:gap-1.5"><CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {new Date(booking.bookingDate || Date.now()).toLocaleDateString()} ({booking.shift})</div>
              <div className="flex items-center gap-1 md:gap-1.5"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {booking.hall || 'Venue'}</div>
              <div className="flex items-center gap-1 md:gap-1.5"><Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> {booking.guestCount || booking.guests || 0} Guests</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="primary" icon="edit" onClick={() => navigate(`/app/bookings/${booking.id}/edit`)}>Edit Booking</Button>
                <Button variant="outline" icon="print" onClick={handlePrintInvoice}>Print Invoice</Button>
              <Button variant="secondary" icon="payments" onClick={() => setPaymentModalOpen(true)} disabled={booking.status === 'Cancelled'}>Record Payment</Button>
            </div>
            <div className="flex items-center justify-end gap-3 text-sm">
              <button className="text-primary hover:underline flex items-center gap-1" onClick={() => setRescheduleModalOpen(true)} disabled={booking.status === 'Cancelled'}>Reschedule</button>
              <span className="text-outline-variant">•</span>
              <button className="text-primary hover:underline flex items-center gap-1" onClick={handleConvertToEvent} disabled={booking.status === 'Cancelled'}>Convert to Event</button>
              <span className="text-outline-variant">•</span>
              <button className="text-error hover:underline flex items-center gap-1" onClick={handleCancelBooking} disabled={booking.status === 'Cancelled' || isSubmitting}>Cancel Booking</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Amount</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#4a1420]">PKR {booking.totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Paid</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#10b981]">PKR {totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e02424]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Balance Due</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#e02424]">PKR {(balance > 0 ? balance : 0).toLocaleString()}</div>
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
                    <div className="col-span-2 font-medium">{booking.customerPhone}</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Schedule & Venue</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Date</div>
                    <div className="col-span-2 font-medium">{new Date(booking.bookingDate || Date.now()).toLocaleDateString()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Shift</div>
                    <div className="col-span-2 font-medium">{booking.shift}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Event Title</div>
                    <div className="col-span-2 font-medium">{booking.eventTitle || booking.eventName}</div>
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
                    <th className="p-4 font-medium text-right">Qty</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="p-4">
                      <div className="font-medium text-on-surface">Base Event Package</div>
                      <div className="text-xs text-on-surface-variant mt-1">Includes Venue and Standard Features</div>
                    </td>
                    <td className="p-4 text-right text-on-surface-variant">{booking.guestCount || booking.guests} Guests</td>
                    <td className="p-4 text-right font-currency-num text-on-surface font-medium">PKR {booking.totalAmount.toLocaleString()}</td>
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
              <Button variant="primary" icon="add" onClick={() => setPaymentModalOpen(true)}>Record Payment</Button>
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
                    <tr key={payment.id || payment.reference} className="hover:bg-surface-variant/10">
                      <td className="p-4 text-on-surface">{new Date(payment.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="p-4 text-on-surface-variant font-mono text-sm">{payment.referenceNumber || payment.reference}</td>
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

        {activeTab === 'activity' && (
          <div className="max-w-2xl space-y-6">
            <h3 className="font-title-lg mb-4">Booking Lifecycle</h3>
            <div className="relative border-l-2 border-outline-variant/30 ml-4 space-y-8">
              
              <div className="relative pl-6">
                <div className="absolute w-4 h-4 rounded-full bg-[#10b981] -left-[9px] top-1"></div>
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-on-surface flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]"/> Booking Created</h4>
                  <span className="text-xs text-on-surface-variant">{new Date(booking.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-on-surface-variant">Booking was officially registered in the system.</p>
              </div>

              {(booking.payments || []).length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute w-4 h-4 rounded-full bg-primary -left-[9px] top-1"></div>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-on-surface flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary"/> Payment Received</h4>
                    <span className="text-xs text-on-surface-variant">{new Date(booking.payments[0].createdAt || Date.now()).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">Advance payment of PKR {booking.payments[0].amount.toLocaleString()} was recorded.</p>
                </div>
              )}

              {booking.status === 'Cancelled' && (
                <div className="relative pl-6">
                  <div className="absolute w-4 h-4 rounded-full bg-error -left-[9px] top-1"></div>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-error flex items-center gap-2"><Activity className="w-4 h-4 text-error"/> Booking Cancelled</h4>
                    <span className="text-xs text-on-surface-variant">Recent</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">This booking was cancelled by the administration.</p>
                </div>
              )}
              
              {booking.status !== 'Cancelled' && (
                <div className="relative pl-6">
                  <div className="absolute w-4 h-4 rounded-full bg-outline-variant -left-[9px] top-1"></div>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-on-surface-variant flex items-center gap-2"><Clock className="w-4 h-4 text-on-surface-variant"/> Event Pending</h4>
                    <span className="text-xs text-on-surface-variant">{new Date(booking.bookingDate || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">Awaiting execution of the operational event.</p>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
      </div>
    </div>
    
    {/* Record Payment Modal */}
    <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Record Payment">
      <div className="space-y-4">
        <Input label="Amount Received (PKR)" type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
        <Select label="Payment Method" value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} options={[
          { label: 'Cash', value: 'Cash' }, { label: 'Bank Transfer', value: 'Bank Transfer' }, { label: 'Cheque', value: 'Cheque' }
        ]} />
        <Input label="Reference / Check No (Optional)" value={paymentForm.reference} onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})} />
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-4">
          <Button variant="text" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleRecordPayment} disabled={isSubmitting}>Confirm Payment</Button>
        </div>
      </div>
    </Modal>

    {/* Reschedule Modal */}
    <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title="Reschedule Booking">
      <div className="space-y-4">
        <Input label="New Date" type="date" required value={rescheduleForm.date} onChange={e => setRescheduleForm({...rescheduleForm, date: e.target.value})} />
        <Select label="Shift" value={rescheduleForm.shift} onChange={e => setRescheduleForm({...rescheduleForm, shift: e.target.value})} options={[
          { label: 'Morning', value: 'Morning' }, { label: 'Afternoon', value: 'Afternoon' }, { label: 'Evening', value: 'Evening' }
        ]} />
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-4">
          <Button variant="text" onClick={() => setRescheduleModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleReschedule} disabled={isSubmitting}>Confirm Reschedule</Button>
        </div>
      </div>
    </Modal>

  </div>
  );
};
