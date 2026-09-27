import React, { useState } from 'react';
import type { EnquiryDetail } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/forms/Input';
import { Select } from '../../../components/ui/forms/Select';
import { useVenues } from '../../../hooks/useVenues';
import { enquiriesService } from '../../../services/enquiriesService';
import { useToast } from '../../../context/ToastContext';

interface Props {
  enquiry: EnquiryDetail;
  onUpdate: () => void;
}

export const EventRequirements: React.FC<Props> = ({ enquiry, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { venues } = useVenues();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    preferredDate: enquiry.preferredDate ? new Date(enquiry.preferredDate).toISOString().split('T')[0] : '',
    alternativeDate: enquiry.alternativeDate ? new Date(enquiry.alternativeDate).toISOString().split('T')[0] : '',
    preferredStartTime: enquiry.preferredStartTime || '',
    preferredEndTime: enquiry.preferredEndTime || '',
    preferredVenueId: enquiry.preferredVenueId || '',
    budget: enquiry.budget || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (formData.preferredStartTime && formData.preferredEndTime) {
        if (formData.preferredStartTime >= formData.preferredEndTime) {
          error('End time must be after start time.');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        eventName: enquiry.eventName,
        eventType: enquiry.eventType,
        preferredDate: formData.preferredDate || undefined,
        alternativeDate: formData.alternativeDate || undefined,
        preferredStartTime: formData.preferredStartTime ? (formData.preferredStartTime.length === 5 ? `${formData.preferredStartTime}:00` : formData.preferredStartTime) : undefined,
        preferredEndTime: formData.preferredEndTime ? (formData.preferredEndTime.length === 5 ? `${formData.preferredEndTime}:00` : formData.preferredEndTime) : undefined,
        guestCount: enquiry.guestCount,
        preferredVenueId: formData.preferredVenueId || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        source: enquiry.source,
        priority: enquiry.priority,
        assignedToId: enquiry.assignedToId,
        notes: enquiry.notes,
        estimatedValue: enquiry.estimatedValue
      };

      await enquiriesService.updateEnquiry(enquiry.id, payload as any);
      success('Requirements updated successfully.');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      error('Failed to update requirements.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-title-lg">Edit Requirements</h3>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input 
              label="Budget Setup" 
              name="budget" 
              type="number"
              value={formData.budget} 
              onChange={handleChange}
            />
            <Input 
              label="Preferred Date" 
              name="preferredDate" 
              type="date"
              value={formData.preferredDate} 
              onChange={handleChange}
            />
            <Input 
              label="Alternative Date" 
              name="alternativeDate" 
              type="date"
              value={formData.alternativeDate} 
              onChange={handleChange}
            />
            <Input 
              label="Start Time" 
              name="preferredStartTime" 
              type="time"
              value={formData.preferredStartTime} 
              onChange={handleChange}
            />
            <Input 
              label="End Time" 
              name="preferredEndTime" 
              type="time"
              value={formData.preferredEndTime} 
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>Save Changes</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-title-lg">Event Requirements</h3>
        <Button variant="secondary" icon="edit" onClick={() => setIsEditing(true)}>Edit</Button>
      </div>
      <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <span className="text-on-surface-variant block text-sm mb-1">Preferred Venue</span>
            <div className="font-medium">{enquiry.preferredVenueName || 'No preference'}</div>
          </div>
          <div>
            <span className="text-on-surface-variant block text-sm mb-1">Budget Setup</span>
            <div className="font-medium">{enquiry.budget ? `PKR ${enquiry.budget.toLocaleString()}` : 'Not specified'}</div>
          </div>
          <div>
            <span className="text-on-surface-variant block text-sm mb-1">Preferred Date</span>
            <div className="font-medium">{enquiry.preferredDate ? new Date(enquiry.preferredDate).toLocaleDateString() : 'Not specified'}</div>
          </div>
          <div>
            <span className="text-on-surface-variant block text-sm mb-1">Alternative Date</span>
            <div className="font-medium">{enquiry.alternativeDate ? new Date(enquiry.alternativeDate).toLocaleDateString() : 'None'}</div>
          </div>
          <div>
            <span className="text-on-surface-variant block text-sm mb-1">Preferred Start Time</span>
            <div className="font-medium">{enquiry.preferredStartTime || 'Not specified'}</div>
          </div>
          <div>
            <span className="text-on-surface-variant block text-sm mb-1">Preferred End Time</span>
            <div className="font-medium">{enquiry.preferredEndTime || 'Not specified'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
