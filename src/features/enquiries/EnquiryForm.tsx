import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { FormSection } from '../../components/ui/forms/FormLayout';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { enquiriesService } from '../../services/enquiriesService';
import { useVenues } from '../../hooks/useVenues';
import { useStaff } from '../../hooks/useStaff';
import type { EventShift } from '../../types';

export const EnquiryForm = () => {
  const navigate = useNavigate();
  const { enquiryId } = useParams();
  const isEditMode = !!enquiryId;
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  const { venues } = useVenues();
  const { staff } = useStaff();

  const [formData, setFormData] = useState(() => {
    if (!isEditMode) {
      const saved = localStorage.getItem('enquiryDraft');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch(e) {}
      }
    }
    return {
      customerName: '',
      customerPhone: '',
      eventName: '',
      eventType: 'Wedding',
      dateStr: '',
      alternativeDate: '',
      shift: 'Evening' as EventShift,
      bufferCapacity: 0,
      partitionRequired: false,
      guests: 0,
      preferredVenueId: '',
      budget: '',
      assignedToId: '',
      source: 'WalkIn',
      notes: ''
    };
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
            shift: data.shift || 'Evening',
            bufferCapacity: data.bufferCapacity || 0,
            partitionRequired: data.partitionRequired || false,
            guests: data.guestCount || 0,
            preferredVenueId: data.preferredVenueId || '',
            budget: data.budget ? data.budget.toString() : '',
            assignedToId: data.assignedToId || '',
            source: data.source || 'WalkIn',
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

  const handleSaveDraft = () => {
    if (!isEditMode) {
      localStorage.setItem('enquiryDraft', JSON.stringify(formData));
      success('Draft saved successfully');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationErrors({});
    

    
    try {
      const payload = {
        id: isEditMode ? enquiryId : undefined,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        eventName: formData.eventName,
        eventType: formData.eventType,
        preferredDate: formData.dateStr || undefined,
        alternativeDate: formData.alternativeDate || undefined,
        shift: formData.shift,
        bufferCapacity: Number(formData.bufferCapacity),
        partitionRequired: formData.partitionRequired,
        guestCount: Number(formData.guests),
        preferredVenueId: formData.preferredVenueId || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        assignedToId: formData.assignedToId || undefined,
        source: formData.source,
        notes: formData.notes
      };

      if (isEditMode && enquiryId) {
        await enquiriesService.updateEnquiry(enquiryId, payload as any);
        success('Enquiry updated successfully');
        navigate(`/app/enquiries/${enquiryId}`);
      } else {
        const response = await enquiriesService.createEnquiry(payload as any);
        success('Enquiry created successfully');
        localStorage.removeItem('enquiryDraft');
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
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
        <PageHeader 
          title={isEditMode ? 'Edit Enquiry' : 'New Enquiry'}
          category="Form"
          icon={isEditMode ? 'edit_document' : 'add_circle'}
          onBack={() => navigate(-1)}
        />

        <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-8 shadow-sm flex flex-col gap-0">
        
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-1 md:col-span-2">
            <Select 
              label="Event Shift" 
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              options={[
                { label: 'Afternoon', value: 'Afternoon' },
                { label: 'Evening', value: 'Evening' }
              ]}
            />
            <div>
              <Input 
                label="Buffer Capacity" 
                name="bufferCapacity" 
                type="number"
                value={formData.bufferCapacity} 
                onChange={handleChange}
              />
            </div>
            <Select 
              label="Partition Required" 
              name="partitionRequired"
              value={formData.partitionRequired.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, partitionRequired: e.target.value === 'true' }))}
              options={[
                { label: 'No', value: 'false' },
                { label: 'Yes', value: 'true' }
              ]}
            />
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

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 mt-6 border-t border-outline-variant">
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/enquiries')}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {!isEditMode && (
            <Button 
              variant="secondary" 
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Save as Draft
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Enquiry' : 'Create Enquiry')}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;
