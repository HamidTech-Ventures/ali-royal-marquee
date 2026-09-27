import React, { useState } from 'react';
import type { EnquiryDetail } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { enquiriesService } from '../../../services/enquiriesService';
import { useToast } from '../../../context/ToastContext';
import { Input } from '../../../components/ui/forms/Input';

interface Props {
  enquiry: EnquiryDetail;
  onUpdate: () => void;
}

export const ActivityFeed: React.FC<Props> = ({ enquiry, onUpdate }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const handleAddNote = async () => {
    if (!note) return;

    setIsSaving(true);
    try {
      await enquiriesService.createActivity(enquiry.id, {
        type: 'NoteAdded',
        description: note
      });
      success('Note added successfully.');
      setIsAddingNote(false);
      setNote('');
      onUpdate();
    } catch (err) {
      console.error(err);
      error('Failed to add note.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-title-lg">Activity Timeline</h3>
        {!isAddingNote && (
          <Button variant="secondary" icon="add" onClick={() => setIsAddingNote(true)}>
            Add Note
          </Button>
        )}
      </div>

      {isAddingNote && (
        <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4 mb-6">
          <Input 
            label="Note Details" 
            name="note" 
            value={note} 
            onChange={e => setNote(e.target.value)} 
            placeholder="Type your note here..."
            required 
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setIsAddingNote(false)} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleAddNote} disabled={!note || isSaving}>Save Note</Button>
          </div>
        </div>
      )}

      {enquiry.activities.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
          No activities recorded.
        </div>
      ) : (
        <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
          {enquiry.activities.map(a => (
            <div key={a.id} className="relative">
              <div className="absolute -left-[31px] bg-surface border-2 border-primary rounded-full w-4 h-4 mt-1"></div>
              <div className="font-semibold">{a.type}</div>
              <p className="text-on-surface-variant text-sm mt-1">{a.description}</p>
              <div className="text-xs text-on-surface-variant mt-1">
                {new Date(a.timestamp).toLocaleString()} • {a.performedByName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
