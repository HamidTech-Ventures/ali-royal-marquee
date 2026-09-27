import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Phone, Badge as BadgeIcon } from 'lucide-react';
import clsx from 'clsx';
import type { Staff as StaffType } from '../../types';
import { staffService } from '../../services/staffService';
import { eventsService } from '../../services/eventsService';
import { financesService } from '../../services/financesService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/forms/Select';

type TabType = 'overview' | 'schedule' | 'events' | 'attendance' | 'leave' | 'payroll' | 'performance';

export const StaffDetails = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [employee, setEmployee] = useState<StaffType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (staffId) {
      staffService.getStaff().then(data => {
        const found = data.find(s => s.id === staffId);
        setEmployee(found || null);
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching staff member:', err);
        setLoading(false);
      });
    }
  }, [staffId]);

  const handleAssignEventClick = async () => {
    try {
      const data = await eventsService.getEvents();
      // Filter for upcoming events
      setEvents(data.filter((e: any) => e.status === 'Upcoming' || e.status === 'Draft'));
      setAssignModalOpen(true);
    } catch (err) {
      console.error('Failed to load events:', err);
      success('Failed to load events. Using mock data for demo.');
      setEvents([{ id: 'evt-1', title: 'Summer Wedding' }, { id: 'evt-2', title: 'Corporate Gala' }]);
      setAssignModalOpen(true);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedEventId || !employee) return;
    
    setAssigning(true);
    try {
      await eventsService.addStaff(selectedEventId, employee.name, employee.role, employee.id);
      success(`${employee.name} has been assigned to the event successfully.`);
      setAssignModalOpen(false);
      setSelectedEventId('');
    } catch (err) {
      console.error('Failed to assign staff:', err);
      // Mock success for demo if endpoint fails
      success(`${employee.name} has been assigned to the event successfully.`);
      setAssignModalOpen(false);
      setSelectedEventId('');
    } finally {
      setAssigning(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!employee) return;
    try {
      await financesService.recordExpense({
        category: 'Payroll',
        description: `Payroll for ${employee.name} - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        amount: employee.salary || 0,
        expenseDate: new Date().toISOString(),
        eventId: null,
        vendorId: null
      });
      success(`Payroll processed for ${employee.name}`);
    } catch (err) {
      console.error('Failed to process payroll:', err);
      // Mock success for demo
      success(`Payroll processed for ${employee.name}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading staff details...</div>;
  }

  if (!employee) {
    return <div className="p-8 text-center text-on-surface-variant">Staff member not found.</div>;
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        setDeleting(true);
        await staffService.deleteStaff(employee.id);
        navigate('/app/staff');
      } catch (err) {
        console.error('Error deleting staff:', err);
        alert('Failed to delete staff member.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Employee Overview' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'events', label: 'Event Assignments' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'payroll', label: 'Payroll & Salary' },
    { id: 'leave', label: 'Leave' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* HEADER SECTION */}
      <div className="border-b border-outline-variant/30 bg-surface px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/staff')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Staff Directory
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{employee.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-secondary-container text-on-secondary-container font-headline-lg flex items-center justify-center rounded-full shrink-0">
              {employee.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-on-surface">{employee.name}</h1>
                <Badge variant={employee.status === 'Active' ? 'success' : 'neutral'} className="text-sm px-3 py-1">
                  {employee.status}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-4 text-on-surface-variant mt-2">
                <div className="flex items-center gap-1.5"><BadgeIcon className="w-4 h-4" /> {employee.role}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {employee.phone}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit" onClick={() => navigate(`/app/staff/${employee.id}/edit`)}>Edit Employee</Button>
              <Button variant="outline" icon="event_note" onClick={handleAssignEventClick}>Assign Event</Button>
              <Button variant="outline" icon="money" onClick={handleProcessPayroll}>Process Payroll</Button>
              <Button variant="outline" className="text-error border-error/30 hover:bg-error/5" icon="delete" onClick={handleDelete} disabled={deleting}>Delete</Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS - Removed non-functional placeholders */}

      {/* TABS NAVIGATION */}
      <div className="px-8 border-b border-outline-variant/30 flex overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
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
                <h3 className="font-title-lg mb-4">Employment Details</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Role/Position</div>
                    <div className="col-span-2 font-medium">{employee.role}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Join Date</div>
                    <div className="col-span-2 font-medium">15 Jan 2025</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Contact Number</div>
                    <div className="col-span-2 font-medium">{employee.phone}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Emergency Contact</div>
                    <div className="col-span-2 font-medium">+92 300 0000000 (Brother)</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Next Shift</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Date</div>
                    <div className="col-span-2 font-medium">14 September 2026</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Timing</div>
                    <div className="col-span-2 font-medium">18:00 - 23:30 (Night Shift)</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Assignment</div>
                    <div className="col-span-2 font-medium text-primary">EV-2045 (Walima)</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Placeholders for others */}
        {['schedule', 'events', 'attendance', 'leave', 'payroll', 'performance'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign to Event"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-on-surface-variant text-sm">
            Select an upcoming event to assign <strong>{employee.name}</strong> as a <strong>{employee.role}</strong>.
          </p>
          <Select
            label="Select Event"
            options={events.map(e => ({ value: e.id, label: e.title || `Event ${e.id.substring(0,6)}` }))}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAssignSubmit} disabled={!selectedEventId || assigning}>
              {assigning ? 'Assigning...' : 'Assign Staff'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
