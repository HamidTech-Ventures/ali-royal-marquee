import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/forms/Input';
import { Select } from '../../../components/ui/forms/Select';
import { useToast } from '../../../context/ToastContext';
import { enquiriesService } from '../../../services/enquiriesService';
import type { EnquiryDetail, FollowUpType } from '../../../types';

interface FollowUpLogProps {
  enquiry: EnquiryDetail;
  onUpdate: () => void;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
}

export const FollowUpLog: React.FC<FollowUpLogProps> = ({ enquiry, onUpdate, autoOpen, onAutoOpenComplete }) => {
  const { success, error } = useToast();
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Call' as FollowUpType,
    dueDate: '',
    dueTime: '',
    notes: ''
  });

  React.useEffect(() => {
    if (autoOpen && !isScheduling) {
      setIsScheduling(true);
      if (onAutoOpenComplete) onAutoOpenComplete();
    }
  }, [autoOpen, isScheduling, onAutoOpenComplete]);

  const handleSchedule = async () => {
    if (!formData.dueDate) {
      error('Due date is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const payload = {
        type: formData.type,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime ? `${formData.dueTime}:00` : undefined,
        notes: formData.notes
      };
      
      await enquiriesService.createFollowUp(enquiry.id, payload as any);
      success('Follow-up scheduled successfully');
      setIsScheduling(false);
      setFormData({ type: 'Call', dueDate: '', dueTime: '', notes: '' });
      onUpdate();
    } catch (err) {
      console.error(err);
      error('Failed to schedule follow-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = async (followUpId: string) => {
    const result = window.prompt('Enter result/notes for completing this follow-up:');
    if (result === null) return; // cancelled

    try {
      await enquiriesService.completeFollowUp(enquiry.id, followUpId, result);
      success('Follow-up completed');
      onUpdate();
    } catch (err) {
      console.error(err);
      error('Failed to complete follow-up');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-title-lg">Follow-up Log</h3>
        {!isScheduling && (
          <Button variant="primary" icon="add" onClick={() => setIsScheduling(true)}>
            Schedule Follow-up
          </Button>
        )}
      </div>

      {isScheduling && (
        <div className="bg-surface border border-primary/30 p-5 rounded-xl space-y-4 shadow-sm">
          <h4 className="font-medium text-on-surface">New Follow-up</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as FollowUpType })}
              options={[
                { label: 'Call', value: 'Call' },
                { label: 'Email', value: 'Email' },
                { label: 'Meeting', value: 'Meeting' },
                { label: 'Message', value: 'Message' },
                { label: 'Other', value: 'Other' },
              ]}
            />
            <div>
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Due Time (Optional)"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-on-surface flex flex-col gap-1.5 w-full">
                Notes / Instructions
                <textarea 
                  className="w-full h-20 px-3 py-2 bg-surface border border-outline-variant rounded-lg outline-none transition-all duration-200 text-on-surface text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What needs to be discussed or done?"
                />
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsScheduling(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" onClick={handleSchedule} disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule'}
            </Button>
          </div>
        </div>
      )}

      {enquiry.followUps.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
          No follow-ups scheduled yet.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiry.followUps.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).map(f => (
            <div key={f.id} className="bg-surface border border-outline-variant/40 p-4 rounded-xl flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-semibold">{f.type} Follow-up</div>
                  <Badge variant={f.status === 'Completed' ? 'success' : f.status === 'Pending' ? 'warning' : 'neutral'}>
                    {f.status}
                  </Badge>
                </div>
                <p className="text-on-surface-variant text-sm">{f.notes || 'No notes provided.'}</p>
                {f.result && (
                  <p className="text-sm mt-2 font-medium bg-surface-variant/30 p-2 rounded">Result: {f.result}</p>
                )}
                <div className="text-xs text-primary mt-2">Assigned to: {f.assignedToName || 'Unassigned'}</div>
              </div>
              <div className="text-sm text-on-surface-variant shrink-0 text-right">
                <div className="font-medium">Due: {new Date(f.dueDate).toLocaleDateString()} {f.dueTime}</div>
                {f.completedAt && (
                  <div className="text-xs mt-1">Completed: {new Date(f.completedAt).toLocaleDateString()} by {f.completedByName}</div>
                )}
                {f.status === 'Pending' && (
                  <Button variant="outline" className="mt-2 text-xs py-1 px-3" onClick={() => handleMarkComplete(f.id)}>Mark Complete</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
