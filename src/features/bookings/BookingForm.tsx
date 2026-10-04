// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { FormSection } from '../../components/ui/forms/FormLayout';
import { useToast } from '../../context/ToastContext';
import { Check, ChevronRight, User, Calendar, MapPin, DollarSign, Package as PackageIcon } from 'lucide-react';
import { bookingsService } from '../../services/bookingsService';
import { customersService } from '../../services/customersService';
import { packagesService } from '../../services/packagesService';
import { enquiriesService } from '../../services/enquiriesService';
import { useVenues } from '../../hooks/useVenues';
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
  const { bookingId } = useParams();
  const isEditMode = !!bookingId;
  const { error, success } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  const { venues, isLoading: isLoadingVenues } = useVenues();
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    packagesService.getPackages().then(setPackages).catch(console.error);
  }, []);

  const [formData, setFormData] = useState(() => {
    return {
      customerId: location.state?.customer?.id || location.state?.fromEnquiry?.customerId || '',
      customerName: location.state?.customer?.name || location.state?.fromEnquiry?.customerName || '',
      customerPhone: location.state?.customer?.phone || location.state?.fromEnquiry?.customerPhone || '',
      // Event Requirements (Synced with Enquiry)
      eventName: location.state?.fromEnquiry?.eventName || '',
      eventType: location.state?.fromEnquiry?.eventType || 'Wedding',
      dateStr: location.state?.fromEnquiry?.dateStr || location.state?.fromEnquiry?.preferredDate ? new Date(location.state?.fromEnquiry?.preferredDate).toISOString().split('T')[0] : '',
      shift: location.state?.fromEnquiry?.shift || 'Evening',
      guests: location.state?.fromEnquiry?.guests || location.state?.fromEnquiry?.guestCount || 0,
      bufferCapacity: location.state?.fromEnquiry?.bufferCapacity || 0,
      partitionRequired: location.state?.fromEnquiry?.partitionRequired || false,
      // Venue
      preferredVenueId: location.state?.fromEnquiry?.preferredVenueId || '',
      // Package
      packageId: '',
      // Financial
      totalAmount: location.state?.fromEnquiry?.budget || 0,
      advanceAmount: 0,
      paymentMethod: 'Cash'
    };
  });

  useEffect(() => {
    if (isEditMode && bookingId) {
      const fetchBooking = async () => {
        try {
          const data = await bookingsService.getBookingById(bookingId);
          setFormData({
            customerId: data.customerId || '',
            customerName: data.customerName || '',
            customerPhone: data.customerPhone || '',
            eventName: data.eventTitle || '',
            eventType: data.eventType || 'Wedding',
            dateStr: data.bookingDate ? new Date(data.bookingDate).toISOString().split('T')[0] : '',
            shift: data.shift || 'Evening',
            guests: data.guestCount || 0,
            bufferCapacity: data.bufferCapacity || 0,
            partitionRequired: data.partitionRequired || false,
            preferredVenueId: data.venueId || '',
            packageId: data.packageId || '',
            totalAmount: data.totalAmount || 0,
            advanceAmount: data.paidAmount || 0,
            paymentMethod: 'Cash' // Assuming default for edit, since method is payment specific
          });
        } catch (err) {
          error('Failed to load booking details');
          navigate('/app/bookings');
        } finally {
          setIsLoading(false);
        }
      };
      fetchBooking();
    }
  }, [isEditMode, bookingId, navigate, error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => {
      const next = { ...prev, [name]: val };
      
      // Auto-calculate total if these fields change
      if (['guests', 'preferredVenueId', 'packageId'].includes(name)) {
        const venue = venues.find(v => v.id === next.preferredVenueId);
        const pkg = packages.find(p => p.id === next.packageId);
        
        let calc = 0;
        if (venue?.basePrice) calc += venue.basePrice;
        if (pkg) {
          if (pkg.type && pkg.type.toLowerCase().includes('fixed')) {
            calc += pkg.price;
          } else {
            calc += (pkg.price * Number(next.guests || 0));
          }
        }
        
        if (calc > 0 || next.packageId || next.preferredVenueId) {
          next.totalAmount = calc;
        }
      }
      return next;
    });
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSaveDraft = () => {
    if (!isEditMode) {
      handleSubmit(undefined, true);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | null, isDraft = false, printInvoice = false) => {
    if (e) (e as React.FormEvent).preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      error("Customer Name and Phone are required.");
      return;
    }
    if (!formData.dateStr) {
      error("Event Date is required to create a booking.");
      return;
    }
    if (!formData.preferredVenueId) {
      error("Venue is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create or ensure Customer exists
      let finalCustomerId = formData.customerId;
      if (!finalCustomerId) {
        const custRes = await customersService.createCustomer({
          name: formData.customerName,
          phone: formData.customerPhone,
          email: 'unknown@example.com' // Mock email or optional if backend allows
        });
        finalCustomerId = typeof custRes === 'string' ? custRes : custRes.id || custRes;
      }

      // 2. Prepare Timings
      const startTime = formData.shift === 'Evening' ? '18:00:00' : '10:00:00';
      const endTime = formData.shift === 'Evening' ? '23:30:00' : '15:30:00';
      const bookingDateStr = new Date(formData.dateStr).toISOString().split('T')[0];

      const payload = {
        id: isEditMode ? bookingId : undefined,
        customerId: finalCustomerId,
        venueId: formData.preferredVenueId,
        bookingDate: `${bookingDateStr}T00:00:00Z`,
        startTime: `${bookingDateStr}T${startTime}Z`,
        endTime: `${bookingDateStr}T${endTime}Z`,
        guestCount: Number(formData.guests),
        bufferCapacity: Number(formData.bufferCapacity),
        partitionRequired: formData.partitionRequired,
        totalAmount: Number(formData.totalAmount),
        packageId: formData.packageId || undefined,
        eventTitle: formData.eventName || 'Unknown Event',
        eventType: formData.eventType,
        isDraft
      } as any;

      let finalBookingId = bookingId;

      if (isEditMode && bookingId) {
         await bookingsService.updateBooking(bookingId, payload);
      } else {
         const bookingRes = await bookingsService.createBooking(payload);
         finalBookingId = typeof bookingRes === 'string' ? bookingRes : bookingRes.id || bookingRes;
         
         // 4. Record Payment for NEW bookings only (simplification, real logic might vary)
         if (Number(formData.advanceAmount) > 0) {
           await bookingsService.addPayment(finalBookingId, {
             amount: Number(formData.advanceAmount),
             method: formData.paymentMethod.replace(' ', ''),
             referenceNumber: `TRX-${Math.floor(Math.random() * 90000)}`,
             userId: '00000000-0000-0000-0000-000000000000'
           } as any);
         }

         // 5. Update Enquiry Status if converted
         if (location.state?.fromEnquiry?.id) {
           try {
             await enquiriesService.updateStatus(location.state.fromEnquiry.id, 'TokenReceived');
           } catch (statusErr) {
             console.error("Failed to update enquiry status", statusErr);
           }
         }
      }

      if (printInvoice) {
        success('Booking created successfully. Generating Invoice...');
        try {
          const res = await bookingsService.generateInvoice(finalBookingId);
          window.open(res.url, '_blank');
        } catch (e) {
          error('Failed to generate invoice.');
        }
        navigate(`/app/bookings/${finalBookingId}`);
      } else {
        success(isEditMode ? 'Booking updated successfully' : (isDraft ? 'Draft saved successfully' : 'Booking created successfully'));
        navigate(`/app/bookings/${finalBookingId}`);
      }
    } catch (err: any) {
      console.error(err);
      const apiMsg = err.response?.data?.detail || err.response?.data?.message || err.response?.data;
      error(typeof apiMsg === 'string' ? apiMsg : 'Failed to save booking. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading booking details...</div>;
  }

  const remainingBalance = Number(formData.totalAmount) - Number(formData.advanceAmount);
  const selectedVenue = venues.find(v => v.id === formData.preferredVenueId);
  const selectedPackage = packages.find(p => p.id === formData.packageId);

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        <PageHeader 
          title={isEditMode ? "Edit Booking" : "New Booking"}
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
                <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-[#5C0A1E]' : 'text-on-surface-variant'}`}>
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
            <FormSection title="Customer Information" description="Enter details for the booking customer.">
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
            <FormSection title="Event Details & Requirements" description="Provide all necessary event specifications.">
              <Input 
                label="Event Name" 
                name="eventName" 
                placeholder="e.g. Hassan & Fatima Walima"
                value={formData.eventName} 
                onChange={handleChange}
                required 
              />
              <Select 
                label="Event Type" 
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                options={[
                  { label: 'Wedding', value: 'Wedding' },
                  { label: 'Corporate', value: 'Corporate' },
                  { label: 'Birthday', value: 'Birthday' },
                  { label: 'Other', value: 'Other' }
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                <Input 
                  label="Event Date" 
                  name="dateStr" 
                  type="date"
                  value={formData.dateStr} 
                  onChange={handleChange}
                  required 
                />
                <Select 
                  label="Shift" 
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  options={[
                    { label: 'Morning', value: 'Morning' },
                    { label: 'Afternoon', value: 'Afternoon' },
                    { label: 'Evening', value: 'Evening' }
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                <Input 
                  label="Expected Guests" 
                  name="guests" 
                  type="number"
                  value={formData.guests} 
                  onChange={handleChange}
                  required 
                />
                <Input 
                  label="Buffer Capacity" 
                  name="bufferCapacity" 
                  type="number"
                  value={formData.bufferCapacity} 
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="partitionRequired" 
                  name="partitionRequired"
                  checked={formData.partitionRequired}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded border-outline focus:ring-primary"
                />
                <label htmlFor="partitionRequired" className="text-sm text-on-surface">Gender Partition Required</label>
              </div>
            </FormSection>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Venue Selection" description="Select the preferred venue for this booking.">
              {isLoadingVenues ? (
                <div className="text-sm text-on-surface-variant">Loading venues...</div>
              ) : (
                <Select 
                  label="Preferred Venue" 
                  name="preferredVenueId"
                  value={formData.preferredVenueId}
                  onChange={handleChange}
                  required
                  options={[
                    { label: '-- Select a Venue --', value: '' },
                    ...venues.map(v => ({ 
                      label: `${v.name} (Cap: ${v.capacity || 'N/A'})${v.basePrice != null ? ` - PKR ${v.basePrice.toLocaleString()}` : ''}`, 
                      value: v.id 
                    }))
                  ]}
                />
              )}
              {formData.preferredVenueId && selectedVenue && (
                <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">{selectedVenue.name} Selected</h4>
                    {selectedVenue.basePrice != null && (
                      <p className="text-sm text-green-700">Base Price: PKR {selectedVenue.basePrice.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
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
                onChange={handleChange}
                options={[
                  { label: '-- Select a Package --', value: '' },
                  ...packages.map(p => ({ label: `${p.name} (PKR ${p.price.toLocaleString()} per guest)`, value: p.id }))
                ]}
              />
            </FormSection>
          </div>
        )}

        {currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Financial & Payment Details" description="Enter the total amount and record any advance payment.">
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

        {currentStep === 6 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <FormSection title="Final Review" description="Verify all booking details before confirmation.">
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-variant/20 p-4 rounded-lg border border-outline-variant">
                  <h4 className="font-semibold text-on-surface mb-2 flex items-center gap-2"><User className="w-4 h-4 text-primary"/> Customer</h4>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Name:</span> {formData.customerName}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Phone:</span> {formData.customerPhone}</p>
                </div>
                
                <div className="bg-surface-variant/20 p-4 rounded-lg border border-outline-variant">
                  <h4 className="font-semibold text-on-surface mb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> Event</h4>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Title:</span> {formData.eventName}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Type:</span> {formData.eventType}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Date/Shift:</span> {formData.dateStr} ({formData.shift})</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Guests:</span> {formData.guests} (+{formData.bufferCapacity} buffer)</p>
                </div>

                <div className="bg-surface-variant/20 p-4 rounded-lg border border-outline-variant">
                  <h4 className="font-semibold text-on-surface mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> Venue & Package</h4>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Venue:</span> {selectedVenue?.name || 'Not selected'}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Package:</span> {selectedPackage?.name || 'Not selected'}</p>
                </div>

                <div className="bg-surface-variant/20 p-4 rounded-lg border border-outline-variant">
                  <h4 className="font-semibold text-on-surface mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary"/> Financial</h4>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Total:</span> PKR {Number(formData.totalAmount).toLocaleString()}</p>
                  <p className="text-sm text-on-surface-variant"><span className="font-medium text-on-surface">Advance Received:</span> PKR {Number(formData.advanceAmount).toLocaleString()} ({formData.paymentMethod})</p>
                  <p className="text-sm mt-2 pt-2 border-t border-outline-variant/50"><span className="font-bold text-[#b0891d]">Remaining Due:</span> PKR {remainingBalance.toLocaleString()}</p>
                </div>
              </div>
            </FormSection>
          </div>
        )}

      </div>

      <div className="flex items-center justify-between mt-4">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentStep === 1 || isSubmitting}
        >
          Back
        </Button>
        <div className="flex gap-4">
          {!isEditMode && (
            <Button variant="outline" icon="save" onClick={handleSaveDraft} disabled={isSubmitting}>
              Save Draft
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button variant="primary" onClick={handleNext}>
              Next Step <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex gap-2">
              {!isEditMode && (
                <Button variant="outline" onClick={() => handleSubmit(null, false, true)} disabled={isSubmitting} className="border-[#5C0A1E] text-[#5C0A1E]">
                  Confirm Booking + Print Invoice
                </Button>
              )}
              <Button variant="primary" onClick={() => handleSubmit(null, false, false)} disabled={isSubmitting} className="bg-[#5C0A1E] text-white">
                {isSubmitting ? 'Confirming...' : (isEditMode ? 'Update Booking' : 'Confirm Booking')}
              </Button>
            </div>
          )}
        </div>
      </div>

      </div>
    </div>
  );
};
