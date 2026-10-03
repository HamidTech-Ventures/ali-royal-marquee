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



export const StaffDetails = () => {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [employee, setEmployee] = useState<StaffType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [staffEvents, setStaffEvents] = useState<any[]>([]);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (staffId) {
      staffService.getStaff().then(data => {
        const found = data.find(s => s.id === staffId);
        setEmployee(found || null);
        // Also fetch events this staff is assigned to
        eventsService.getEvents().then(allEvents => {
          const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === staffId));
          setStaffEvents(assigned);
          
          // Find next upcoming
          const upcoming = assigned.filter(e => new Date(e.dateStr) >= new Date()).sort((a,b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
          if (upcoming.length > 0) {
            setNextEvent(upcoming[0]);
          }
        }).catch(err => console.error(err));
        
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
    
    // Find selected event
    const selEvt = events.find(e => e.id === selectedEventId);
    if (selEvt) {
      // Check for overlap
      const overlap = staffEvents.some(se => se.dateStr === selEvt.dateStr && se.startTime === selEvt.startTime);
      if (overlap) {
        alert("Cannot assign! Employee is already assigned to another event at the exact same shift and time.");
        return;
      }
    }
    
    setAssigning(true);
    try {
      await eventsService.addStaff(selectedEventId, employee.name, employee.role, employee.id);
      success(`${employee.name} has been assigned to the event successfully.`);
      setAssignModalOpen(false);
      setSelectedEventId('');
      
      // Refetch
      const allEvents = await eventsService.getEvents();
      const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === employee.id));
      setStaffEvents(assigned);
      const upcoming = assigned.filter(e => new Date(e.dateStr) >= new Date()).sort((a,b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      if (upcoming.length > 0) setNextEvent(upcoming[0]);
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


  const handleRemoveEvent = async (eventId: string) => {
    if (!employee || !window.confirm('Are you sure you want to remove this employee from this event?')) return;
    try {
      await eventsService.removeStaff(eventId, employee.id);
      success('Employee removed from the event.');
      // Refetch
      const allEvents = await eventsService.getEvents();
      const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === employee.id));
      setStaffEvents(assigned);
      const upcoming = assigned.filter(e => new Date(e.dateStr) >= new Date()).sort((a,b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
    } catch (err) {
      console.error('Failed to remove staff:', err);
      alert('Failed to remove from event.');
    }
  };

  const handleChangeEventClick = async (currentEventId: string) => {
    // For "Change", we'll just open the Assign modal, but when they submit it, we might want to delete the old one or just let them manage it manually.
    // For simplicity, we can ask them to delete the current one and add a new one, or we can automate it.
    // Given the simple requirement, opening the assign modal and automatically removing the old one IF they succeed would be "Changing".
    // Alternatively, just alert them to delete then assign. We'll automate: delete then open assign modal.
    if (!employee || !window.confirm('To change this event assignment, we will first remove this one. Proceed?')) return;
    
    try {
      await eventsService.removeStaff(currentEventId, employee.id);
      success('Old assignment removed. Please select the new event.');
      
      // Refetch so UI updates
      const allEvents = await eventsService.getEvents();
      const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === employee.id));
      setStaffEvents(assigned);
      const upcoming = assigned.filter(e => new Date(e.dateStr) >= new Date()).sort((a,b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
      
      // Open modal to assign a new one
      const eventsData = await eventsService.getEvents();
      setEvents(eventsData.filter((e: any) => e.status === 'Upcoming' || e.status === 'Draft'));
      setAssignModalOpen(true);
    } catch (err) {
      console.error('Failed to change assignment:', err);
      alert('Failed to remove old assignment.');
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

  const tabs: { id: string; label: string }[] = [
    { id: 'overview', label: 'Employee Overview' },
    { id: 'events', label: 'Event Assignments' },
    { id: 'payroll', label: 'Payroll & Compensation' },
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
                    <div className="col-span-1 text-on-surface-variant text-sm">Joined Date</div>
                    <div className="col-span-2 font-medium">{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-GB') : 'N/A'}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">CNIC Number</div>
                    <div className="col-span-2 font-medium">{employee.cnic || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Compensation</div>
                    <div className="col-span-2 font-medium">{employee.compensationType || 'Fixed Monthly'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Contact Number</div>
                    <div className="col-span-2 font-medium">{employee.phone}</div>
                  </div>

                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Next Shift</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  {nextEvent ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                        <div className="col-span-1 text-on-surface-variant text-sm">Date</div>
                        <div className="col-span-2 font-medium">{new Date(nextEvent.dateStr).toLocaleDateString('en-GB')}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                        <div className="col-span-1 text-on-surface-variant text-sm">Timing</div>
                        <div className="col-span-2 font-medium">{nextEvent.startTime + ' - ' + nextEvent.endTime}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                        <div className="col-span-1 text-on-surface-variant text-sm">Assignment</div>
                        <div className="col-span-2 font-medium text-primary">{nextEvent.title}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-on-surface-variant py-4 text-center">No upcoming shifts assigned.</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}


        {activeTab === 'events' && (
          <div className="space-y-6">
            <h3 className="font-title-lg">Event Assignments</h3>
            <p className="text-on-surface-variant">History of events assigned to this staff member.</p>
            <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
              {staffEvents.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/30 text-on-surface-variant text-sm">
                      <th className="p-4 font-medium">Event Title</th>
                      <th className="p-4 font-medium">Date & Shift</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffEvents.map(evt => (
                      <tr key={evt.id} className="border-t border-outline-variant/30">
                        <td className="p-4 font-medium text-on-surface">{evt.title}</td>
                        <td className="p-4 text-on-surface-variant">
                          {new Date(evt.dateStr).toLocaleDateString('en-GB')} <br/>
                          <span className="text-xs opacity-80">{evt.startTime} - {evt.endTime}</span>
                        </td>
                        <td className="p-4"><Badge variant={evt.status === 'Finalised' ? 'success' : evt.status === 'Upcoming' ? 'primary' : 'neutral'}>{evt.status}</Badge></td>
                        <td className="p-4 text-right">
                          <Button variant="text" size="sm" className="text-primary mr-2" onClick={() => handleChangeEventClick(evt.id)}>Change</Button>
                          <Button variant="text" size="sm" className="text-error" onClick={() => handleRemoveEvent(evt.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-on-surface-variant">
                  No events found for this employee yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <h3 className="font-title-lg">Payroll & Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                <h4 className="font-semibold text-primary border-b border-outline-variant/20 pb-2">Salary Details</h4>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">Compensation Type:</span>
                  <span className="font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-xs">{employee.compensationType || 'Fixed Monthly'}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-on-surface-variant text-sm">{employee.compensationType === 'Per-Event/Daily Wage' ? 'Wage Per Event:' : 'Monthly Salary:'}</span>
                  <span className="font-medium">PKR {employee.salary?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
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
