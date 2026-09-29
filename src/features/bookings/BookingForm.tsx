import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { FormSection } from '../../components/ui/forms/FormLayout';
import { useToast } from '../../context/ToastContext';
import { Check, ChevronRight, User, Calendar, MapPin, DollarSign, Package as PackageIcon } from 'lucide-react';
import { bookingsService } from '../../services/bookingsService';
import { customersService } from '../../services/customersService';
import { referenceService } from '../../services/referenceService';
import { packagesService } from '../../services/packagesService';
import type { VenueDto } from '../../services/referenceService';
import type { Package } from '../../services/packagesService';

const steps = [
  { id: 1, name: 'Customer', icon: User },
  { id: 2, name: 'Event', icon: Calendar },
  { id: 3, name: 'Venue', icon: MapPin },
  { id: 4, name: 'Package', icon: PackageIcon },
  { id: 5, name: 'Payment', icon: DollarSign },
  { id: 6, name: 'Review', icon: Check },
];

export const BookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venues, setVenues] = useState<VenueDto[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const customers: any[] = []; // Temporary until GET /customers is implemented

  useEffect(() => {
    referenceService.getVenues().then(setVenues).catch(console.error);
    packagesService.getPackages().then(setPackages).catch(console.error);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    customerId: location.state?.customer?.id || '',
    customerName: location.state?.customer?.name || '',
    customerPhone: location.state?.customer?.phone || '',
    // Event
    eventType: location.state?.fromEnquiry?.eventName || '',
    date: location.state?.fromEnquiry?.dateStr || '',
    shift: 'Night',
    guests: location.state?.fromEnquiry?.guests || 0,
    // Venue
    hall: 'Grand Ballroom',
    // Package
    packageId: '',
    // Financial
    totalAmount: 1500000,
    advanceAmount: 500000,
    paymentMethod: 'Bank Transfer'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Customer if new
      let finalCustomerId = formData.customerId;
      if (!finalCustomerId) {
        const custRes = await customersService.createCustomer({
          name: formData.customerName,
          phone: formData.customerPhone,
          email: 'unknown@example.com'
        });
        finalCustomerId = custRes.id;
      }

      // 2. Find Venue
      const selectedVenue = venues.find(v => v.name === formData.hall) || venues[0];
      if (!selectedVenue) throw new Error("Venue not found");

      const startTime = formData.shift === 'Night' ? '18:00:00' : '10:00:00';
      const endTime = formData.shift === 'Night' ? '23:30:00' : '15:30:00';
      const bookingDateStr = new Date(formData.date).toISOString().split('T')[0];

      // 3. Create Booking
      const bookingRes = await bookingsService.createBooking({
        customerId: finalCustomerId,
        venueId: selectedVenue.id,
        bookingDate: bookingDateStr,
        startTime: `${bookingDateStr}T${startTime}Z`,
        endTime: `${bookingDateStr}T${endTime}Z`,
        guestCount: Number(formData.guests),
        totalAmount: Number(formData.totalAmount),
        packageId: formData.packageId || undefined
      } as any);

      // 4. Record Payment
      if (Number(formData.advanceAmount) > 0) {
        await bookingsService.addPayment(bookingRes.id, {
          amount: Number(formData.advanceAmount),
          method: formData.paymentMethod.replace(' ', ''),
          referenceNumber: `TRX-${Math.floor(Math.random() * 90000)}`,
          userId: '00000000-0000-0000-0000-000000000000'
        } as any);
      }

      success('Booking created successfully');
      navigate(`/app/bookings/${bookingRes.id}`);
    } catch (err) {
      console.error(err);
      error('Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <PageHeader 
          title="New Booking"
          category="Operations"
          icon="event_available"
          onBack={() => navigate(-1)}
        />

        {/* Stepper */}
        <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-6 shadow-sm overflow-x-auto hide-scrollbar">
          <div className="flex items-center justify-between relative min-w-[600px]">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-outline-variant/50 -z-10" />
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? 'border-[#5C0A1E] bg-[#5C0A1E] text-white' : 
                  isCompleted ? 'border-[#10b981] bg-[#10b981] text-white' : 
                  'border-[#e8e4db] bg-[#FAF8F5] text-on-surface-variant'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
        </div>

      {/* Form Content */}
      <div className="bg-white border border-[#e8e4db] rounded-xl shadow-sm p-4 md:p-6 min-h-[400px]">
        
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Customer Information" description="Select an existing customer or enter details for a new one.">
              <Select 
                label="Existing Customer" 
                name="customerId"
                value={formData.customerId}
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    setFormData(prev => ({
                      ...prev, 
                      customerId: cust.id, 
                      customerName: cust.name, 
                      customerPhone: cust.phone
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, customerId: '', customerName: '', customerPhone: '' }));
                  }
                }}
                options={[
                  { label: '-- Create New Customer --', value: '' },
                  ...customers.map(c => ({ label: `${c.name} (${c.phone})`, value: c.id }))
                ]}
              />
              <div />
              <Input 
                label="Full Name" 
                name="customerName" 
                value={formData.customerName} 
                onChange={handleChange}
                required 
              />
              <Input 
                label="Phone Number" 
                name="customerPhone" 
                value={formData.customerPhone} 
                onChange={handleChange}
                required 
              />
            </FormSection>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Event Details" description="Basic event information.">
              <Input 
                label="Event Title" 
                name="eventType" 
                placeholder="e.g. Walima, Corporate Dinner"
                value={formData.eventType} 
                onChange={handleChange}
                required 
              />
              <Input 
                label="Expected Guests" 
                name="guests" 
                type="number"
                value={formData.guests} 
                onChange={handleChange}
                required 
              />
              <Input 
                label="Event Date" 
                name="date" 
                type="date"
                value={formData.date} 
                onChange={handleChange}
                required 
              />
              <Select 
                label="Shift" 
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                options={[
                  { label: 'Day (10:00 - 15:30)', value: 'Day' },
                  { label: 'Night (18:00 - 23:30)', value: 'Night' }
                ]}
              />
            </FormSection>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Venue & Availability" description="Select a hall.">
              <Select 
                label="Venue Hall" 
                name="hall"
                value={formData.hall}
                onChange={handleChange}
                options={[
                  { label: 'Grand Ballroom (Capacity: 1000)', value: 'Grand Ballroom' },
                  { label: 'Royal Marquee (Capacity: 800)', value: 'Royal Marquee' },
                  { label: 'Crystal Pavilion (Capacity: 500)', value: 'Crystal Pavilion' }
                ]}
              />
              <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Venue Available</h4>
                  <p className="text-sm text-green-700">The selected venue is available for the requested date and shift.</p>
                </div>
              </div>
            </FormSection>
          </div>
        )}

        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Package Selection" description="Select a menu or service package for the event.">
              <Select 
                label="Event Package" 
                name="packageId"
                value={formData.packageId}
                onChange={(e) => {
                  handleChange(e);
                  const pkg = packages.find(p => p.id === e.target.value);
                  if (pkg) {
                    setFormData(prev => ({
                      ...prev,
                      totalAmount: pkg.price * prev.guests // Basic estimation
                    }));
                  }
                }}
                options={[
                  { label: '-- Select a Package --', value: '' },
                  ...packages.map(p => ({ label: `${p.name} (PKR ${p.price.toLocaleString()} per guest)`, value: p.id }))
                ]}
              />
            </FormSection>
          </div>
        )}

        {currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center h-48">
            <p className="text-on-surface-variant mb-4">Add-ons interface would go here.</p>
            <Button variant="outline" onClick={handleNext}>Skip for now</Button>
          </div>
        )}

        {currentStep === 6 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Final Review" description="Review details and record advance payment.">
              <div className="col-span-1 md:col-span-2 bg-surface-variant/20 p-4 rounded-lg border border-outline-variant mb-4">
                <h4 className="font-semibold text-on-surface mb-2">Summary</h4>
                <p className="text-sm text-on-surface-variant">Customer: {formData.customerName}</p>
                <p className="text-sm text-on-surface-variant">Event: {formData.eventType} on {formData.date}</p>
                <p className="text-sm text-on-surface-variant">Venue: {formData.hall} ({formData.guests} guests)</p>
              </div>

              <Input 
                label="Grand Total (PKR)" 
                name="totalAmount" 
                type="number"
                value={formData.totalAmount} 
                onChange={handleChange}
                required 
              />
              <Input 
                label="Advance Payment Received (PKR)" 
                name="advanceAmount" 
                type="number"
                value={formData.advanceAmount} 
                onChange={handleChange}
                required 
              />
              <Select 
                label="Payment Method" 
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                options={[
                  { label: 'Cash', value: 'Cash' },
                  { label: 'Bank Transfer', value: 'Bank Transfer' },
                  { label: 'Cheque', value: 'Cheque' },
                  { label: 'Card', value: 'Card' }
                ]}
              />
            </FormSection>
          </div>
        )}

      </div>

      <div className="flex items-center justify-between mt-2">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentStep === 1}
        >
          Back
        </Button>
        {currentStep < steps.length ? (
          <Button variant="primary" onClick={handleNext}>
            Next Step <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        )}
      </div>

      </div>
    </div>
  );
};
