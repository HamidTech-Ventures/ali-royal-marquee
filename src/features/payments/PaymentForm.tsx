import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormSection, FormActions } from '../../components/ui/forms/FormLayout';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { bookingsService } from '../../services/bookingsService';
import { financesService } from '../../services/financesService';

export const PaymentForm = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    bookingId: '',
    amount: '',
    method: 'Bank Transfer', // Need matching string representation or mapped integer
    paymentDate: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  useEffect(() => {
    bookingsService.getBookings().then((res) => {
      setBookings(res.items || []);
    }).catch(() => {
      error('Failed to load bookings');
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.bookingId) {
      error('Please select a booking');
      return;
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Map 'Bank Transfer' etc to Enum integers or strings matching the backend
      // In C#, Enums map by Name (e.g. "BankTransfer", "Cash", "Card") or Int
      const methodMap: Record<string, number> = {
        'Cash': 0,
        'Bank Transfer': 1,
        'Credit Card': 2,
        'Cheque': 3
      };

      await financesService.recordPayment({
        bookingId: formData.bookingId,
        amount: Number(formData.amount),
        method: methodMap[formData.method] ?? 1,
        paymentDate: new Date(formData.paymentDate).toISOString(),
        reference: formData.reference || null,
        type: 0 // 0 = Payment, 1 = Refund
      });
      success('Payment recorded successfully');
      navigate('/app/payments');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Record New Payment"
        category="Commercial Operations"
        onBack={() => navigate(-1)}
      />

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/60 p-8 max-w-4xl mx-auto">
        <FormSection title="Payment Details" description="Log a new transaction or installment against a booking.">
          <Select 
            label="Booking Reference"
            className="col-span-1 md:col-span-2"
            value={formData.bookingId}
            onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
            options={[
              { value: '', label: 'Select a booking' },
              ...bookings.map(b => ({ 
                value: b.id, 
                label: `${b.eventName || 'Booking'} - ${new Date(b.eventDate).toLocaleDateString()}` 
              }))
            ]}
          />
          <Input 
            label="Amount (PKR)" 
            type="number" 
            placeholder="0.00" 
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
          <Select 
            label="Payment Method"
            value={formData.method}
            onChange={(e) => setFormData({...formData, method: e.target.value})}
            options={[
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Credit Card', label: 'Credit Card' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
          />
          <Input 
            label="Payment Date" 
            type="date" 
            value={formData.paymentDate}
            onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
          />
          <Input 
            label="Reference Number (Optional)" 
            placeholder="Txn ID, Cheque No..." 
            value={formData.reference}
            onChange={(e) => setFormData({...formData, reference: e.target.value})}
          />
          <div className="col-span-1 md:col-span-2">
            <Input 
              label="Internal Notes" 
              placeholder="Add any details regarding this payment..." 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </FormSection>

        <FormActions 
          onCancel={() => navigate(-1)} 
          onSave={handleSubmit} 
          isSaving={isSubmitting} 
          saveLabel="Record Payment" 
        />
      </div>
    </div>
  );
};
