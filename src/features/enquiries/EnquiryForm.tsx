import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { FormSection, FormActions } from '../../components/ui/forms/FormLayout';
import { useToast } from '../../context/ToastContext';
import { enquiriesService } from '../../services/enquiriesService';
import { useVenues } from '../../hooks/useVenues';
import { useStaff } from '../../hooks/useStaff';
import type { EnquirySource, EnquiryPriority } from '../../types';

export const EnquiryForm = () => {
  const navigate = useNavigate();
  const { enquiryId } = useParams();
  const isEditMode = !!enquiryId;
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  const { venues } = useVenues();
  const { staff } = useStaff();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    eventName: '',
    eventType: 'Wedding',
    dateStr: '',
    alternativeDate: '',
    preferredStartTime: '',
    preferredEndTime: '',
    guests: 0,
    preferredVenueId: '',
    budget: '',
    assignedToId: '',
    source: 'WalkIn' as EnquirySource,
    priority: 'Warm' as EnquiryPriority,
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isEditMode && enquiryId) {
      const fetchEnquiry = async () => {
        try {
          const data = await enquiriesService.getEnquiryById(enquiryId);
          setFormData({
            customerName: data.customerName || '',
            customerPhone: data.customerPhone || '',
            eventName: data.eventName || '',
            eventType: data.eventType || 'Wedding',
            dateStr: data.preferredDate ? new Date(data.preferredDate).toISOString().split('T')[0] : '',
            alternativeDate: data.alternativeDate ? new Date(data.alternativeDate).toISOString().split('T')[0] : '',
            preferredStartTime: data.preferredStartTime ? data.preferredStartTime.substring(0, 5) : '',
            preferredEndTime: data.preferredEndTime ? data.preferredEndTime.substring(0, 5) : '',
            guests: data.guestCount || 0,
            preferredVenueId: data.preferredVenueId || '',
            budget: data.budget ? data.budget.toString() : '',
            assignedToId: data.assignedToId || '',
            source: data.source || 'WalkIn',
            priority: data.priority || 'Warm',
            notes: data.notes || ''
          });
        } catch (err) {
          console.error('Failed to load enquiry', err);
          showError('Failed to load enquiry details');
          navigate('/app/enquiries');
        } finally {
          setIsLoading(false);
        }
      };
      fetchEnquiry();
    }
  }, [isEditMode, enquiryId, navigate, showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationErrors({});
    
    // Custom time validation
    if (formData.preferredStartTime && formData.preferredEndTime) {
      if (formData.preferredStartTime >= formData.preferredEndTime) {
        setValidationErrors({ preferredEndTime: ['End time must be after start time.'] });
        showError('Please correct the highlighted errors.');
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      const payload = {
        id: isEditMode ? enquiryId : undefined,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        eventName: formData.eventName,
        eventType: formData.eventType,
        preferredDate: formData.dateStr || undefined,
        alternativeDate: formData.alternativeDate || undefined,
        preferredStartTime: formData.preferredStartTime ? `${formData.preferredStartTime}:00` : undefined,
        preferredEndTime: formData.preferredEndTime ? `${formData.preferredEndTime}:00` : undefined,
        guestCount: Number(formData.guests),
        preferredVenueId: formData.preferredVenueId || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        assignedToId: formData.assignedToId || undefined,
        source: formData.source,
        priority: formData.priority,
        notes: formData.notes
      };

      if (isEditMode && enquiryId) {
        await enquiriesService.updateEnquiry(enquiryId, payload as any);
        success('Enquiry updated successfully');
        navigate(`/app/enquiries/${enquiryId}`);
      } else {
        const response = await enquiriesService.createEnquiry(payload as any);
        success('Enquiry created successfully');
        navigate(`/app/enquiries/${response.id}`);
      }
    } catch (err: any) {
      console.error(err);
      
      if (err.response?.status === 400 && err.response.data) {
        const data = err.response.data;
        if (data.extensions && data.extensions.errors) {
          const mappedErrors: Record<string, string[]> = {};
          for (const [key, value] of Object.entries(data.extensions.errors)) {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            mappedErrors[camelKey] = value as string[];
          }
          setValidationErrors(mappedErrors);
          showError('Please correct the highlighted errors.');
          return;
        }
      }
      
      showError(`Failed to ${isEditMode ? 'update' : 'create'} enquiry`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading form...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-on-surface">{isEditMode ? 'Edit Enquiry' : 'New Enquiry'}</h1>

      <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col gap-0">
        
        <FormSection title="Customer Details">
          <div>
            <Input 
              label="Full Name" 
              name="customerName" 
              value={formData.customerName} 
              onChange={handleChange}
              required 
            />
            {validationErrors.customerName && <div className="text-error text-xs mt-1">{validationErrors.customerName[0]}</div>}
          </div>
          <div>
            <Input 
              label="Phone Number" 
              name="customerPhone" 
              value={formData.customerPhone} 
              onChange={handleChange}
              required 
            />
            {validationErrors.customerPhone && <div className="text-error text-xs mt-1">{validationErrors.customerPhone[0]}</div>}
          </div>
        </FormSection>

        <FormSection title="Event Requirements" className="border-t border-outline-variant">
          <div>
            <Input 
              label="Event Type / Name" 
              name="eventName" 
              placeholder="e.g. Birthday Party"
              value={formData.eventName} 
              onChange={handleChange}
              required 
            />
            {validationErrors.eventName && <div className="text-error text-xs mt-1">{validationErrors.eventName[0]}</div>}
          </div>
          <Select 
            label="Category" 
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            options={[
              { label: 'Wedding', value: 'Wedding' },
              { label: 'Corporate', value: 'Corporate' },
              { label: 'Social', value: 'Social' },
              { label: 'Other', value: 'Other' }
            ]}
          />
          <div>
            <Select 
              label="Preferred Venue" 
              name="preferredVenueId"
              value={formData.preferredVenueId}
              onChange={handleChange}
              options={[
                { label: 'No Preference / Not Decided', value: '' },
                ...venues.map(v => ({ label: v.name, value: v.id }))
              ]}
            />
            {validationErrors.preferredVenueId && <div className="text-error text-xs mt-1">{validationErrors.preferredVenueId[0]}</div>}
          </div>
          <div>
            <Input 
              label="Expected Guests" 
              name="guests" 
              type="number"
              value={formData.guests} 
              onChange={handleChange}
              required 
            />
            {validationErrors.guestCount && <div className="text-error text-xs mt-1">{validationErrors.guestCount[0]}</div>}
          </div>

          <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
            <div>
              <Input 
                label="Preferred Date" 
                name="dateStr" 
                type="date"
                value={formData.dateStr} 
                onChange={handleChange}
                required 
              />
              {validationErrors.preferredDate && <div className="text-error text-xs mt-1">{validationErrors.preferredDate[0]}</div>}
            </div>
            <div>
              <Input 
                label="Alternative Date (Optional)" 
                name="alternativeDate" 
                type="date"
                value={formData.alternativeDate} 
                onChange={handleChange}
              />
              {validationErrors.alternativeDate && <div className="text-error text-xs mt-1">{validationErrors.alternativeDate[0]}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
            <div>
              <Input 
                label="Start Time (Optional)" 
                name="preferredStartTime" 
                type="time"
                value={formData.preferredStartTime} 
                onChange={handleChange}
              />
              {validationErrors.preferredStartTime && <div className="text-error text-xs mt-1">{validationErrors.preferredStartTime[0]}</div>}
            </div>
            <div>
              <Input 
                label="End Time (Optional)" 
                name="preferredEndTime" 
                type="time"
                value={formData.preferredEndTime} 
                onChange={handleChange}
              />
              {validationErrors.preferredEndTime && <div className="text-error text-xs mt-1">{validationErrors.preferredEndTime[0]}</div>}
            </div>
          </div>
        </FormSection>

        <FormSection title="CRM Details" className="border-t border-outline-variant">
          <div>
            <Select 
              label="Assigned Staff (Optional)" 
              name="assignedToId"
              value={formData.assignedToId}
              onChange={handleChange}
              options={[
                { label: 'Unassigned', value: '' },
                ...staff.map(s => ({ label: `${s.fullName} (${s.roleName})`, value: s.id }))
              ]}
            />
          </div>
          <div>
            <Input 
              label="Estimated Budget" 
              name="budget" 
              type="number"
              placeholder="e.g. 50000"
              value={formData.budget} 
              onChange={handleChange}
            />
            {validationErrors.budget && <div className="text-error text-xs mt-1">{validationErrors.budget[0]}</div>}
          </div>
          <Select 
            label="Lead Source" 
            name="source"
            value={formData.source}
            onChange={handleChange}
            options={[
              { label: 'Walk-in', value: 'WalkIn' },
              { label: 'Phone Call', value: 'Phone' },
              { label: 'WhatsApp', value: 'WhatsApp' },
              { label: 'Website', value: 'Website' },
              { label: 'Facebook', value: 'Facebook' },
              { label: 'Instagram', value: 'Instagram' },
              { label: 'Referral', value: 'Referral' },
              { label: 'Other', value: 'Other' }
            ]}
          />
          <Select 
            label="Lead Priority" 
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { label: 'Hot', value: 'Hot' },
              { label: 'Warm', value: 'Warm' },
              { label: 'Cold', value: 'Cold' }
            ]}
          />
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-on-surface flex flex-col gap-1.5 w-full">
              Initial Notes
              <textarea 
                name="notes"
                className="w-full h-24 px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none transition-all duration-200 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Enter any specific requirements or notes..."
                value={formData.notes}
                onChange={handleChange}
              />
            </label>
          </div>
        </FormSection>

        <FormActions 
          onCancel={() => navigate('/app/enquiries')} 
          onSave={handleSubmit} 
          isSaving={isSubmitting} 
          saveLabel={isEditMode ? 'Update Enquiry' : 'Create Enquiry'} 
        />
      </div>
    </div>
  );
};

export default EnquiryForm;
