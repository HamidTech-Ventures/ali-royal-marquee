// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Clock, Users, Calendar as CalendarIcon, MapPin, AlertCircle, FileText, DollarSign, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { eventsService } from '../../services/eventsService';
import { financesService } from '../../services/financesService';
import { DataGrid } from '../../components/ui/DataGrid';
import { bookingsService } from '../../services/bookingsService';
import { staffService } from '../../services/staffService';
import { packagesService } from '../../services/packagesService';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import clsx from 'clsx';

type TabType = 'overview' | 'operations' | 'menu' | 'staff' | 'tasks' | 'expenses' | 'payments' | 'activity';


const EventStatusModal = ({ isOpen, onClose, currentStatus, onSave }: any) => {
  const [status, setStatus] = useState(currentStatus);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Event Status" >
      <div className="space-y-4">
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border border-outline rounded-md bg-surface-container-lowest">
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing (Live)</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(status)}>Update Status</Button>
        </div>
      </div>
    </Modal>
  );
};
export const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [event, setEvent] = useState<any>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', dueDate: '', dueTime: '' });
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [guestCount, setGuestCount] = useState(0);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', role: 'Waiter', staffMemberId: '' });
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Vendor', notes: '' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash' });

  const [loading, setLoading] = useState(true);
  
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingFinances, setLoadingFinances] = useState(false);
  const [globalStaff, setGlobalStaff] = useState<any[]>([]);
  const [globalPackages, setGlobalPackages] = useState<any[]>([]);

  useEffect(() => {
    staffService.getStaff().then(res => setGlobalStaff(res)).catch(console.error);
    packagesService.getPackages().then(res => setGlobalPackages(res)).catch(console.error);
  }, []);


  useEffect(() => {
    if (event) setGuestCount(event.guests);
  }, [event]);

  const handleCreateTask = async () => {
    try {
      const dateTime = `${taskForm.dueDate} ${taskForm.dueTime}`.trim();
      if (editingTaskId) {
         await eventsService.editTask(event.id, editingTaskId, taskForm.title, taskForm.assignee, dateTime);
         success('Task updated');
      } else {
         await eventsService.addTask(event.id, taskForm.title, taskForm.assignee, dateTime);
         success('Task created');
      }
      setTaskModalOpen(false);
      setEditingTaskId(null);
      loadEvent(event.id);
    } catch { error('Failed to save task'); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
       await eventsService.deleteTask(event.id, taskId);
       success('Task deleted');
       loadEvent(event.id);
    } catch { error('Failed to delete task'); }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
       const progress = status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0;
       await eventsService.updateTaskStatus(event.id, taskId, status, progress);
       success('Task status updated');
       loadEvent(event.id);
    } catch { error('Failed to update status'); }
  };
  const handleUpdateMenu = async (overrideId?: string | null) => {
    try {
      const pkgIdToUse = overrideId !== undefined ? overrideId : (selectedPackageId || null);
      await bookingsService.updateBookingPackage(event.bookingId, pkgIdToUse);
      success('Package updated successfully');
      setMenuModalOpen(false);
      loadEvent(event.id);
    } catch { error('Failed to update package'); }
  };
  const handleRecordExpense = async () => {
    try {
      await financesService.recordExpense({
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.notes,
        dateStr: new Date().toISOString().split('T')[0],
        eventId: event.id
      } as any);
      success('Expense recorded');
      setExpenseModalOpen(false);
      const expRes = await financesService.getExpenses();
      setExpenses(expRes.filter((e: any) => e.eventId === event.id));
    } catch { error('Failed to record expense'); }
  };

  const handleRecordPayment = async () => {
    try {
      await bookingsService.addPayment(event.bookingId, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        dateStr: new Date().toISOString().split('T')[0]
      });
      success('Payment recorded');
      setPaymentModalOpen(false);
      const payRes = await financesService.getPayments();
      setPayments(payRes.filter((p: any) => p.bookingId === event.bookingId));
    } catch { error('Failed to record payment'); }
  };

  const handlePrintInvoice = async () => {
    try {
      success('Generating Invoice...');
      const res = await bookingsService.generateInvoice(event.bookingId);
      window.open(res.url, '_blank');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleAssignStaff = async () => {
    try {
      await eventsService.addStaff(event.id, staffForm.name, staffForm.role, staffForm.staffMemberId);
      success('Staff Assigned');
      setStaffModalOpen(false);
      loadEvent(event.id);
    } catch { error('Failed to assign staff'); }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member from the event?')) return;
    try {
      await eventsService.removeStaff(event.id, staffId);
      success('Staff removed successfully');
      loadEvent(event.id);
    } catch { error('Failed to remove staff'); }
  };

  
  const [newStatus, setNewStatus] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    try {
      // Mocking update in UI
      setEvent({...event, status});
      setIsStatusModalOpen(false);
      success("Event status updated to " + status);
    } catch(err){}
  };

  const [checklist, setChecklist] = useState({
    hall: false,
    ac: false,
    kitchen: false
  });

  useEffect(() => {
    if (eventId) {
      const saved = localStorage.getItem(`evt_checklist_${eventId}`);
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
      loadEvent(eventId);
    }
  }, [eventId]);

  const handleChecklistChange = (key: keyof typeof checklist) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem(`evt_checklist_${eventId}`, JSON.stringify(next));
  };

  const loadEvent = async (id: string) => {
    try {
      setLoading(true);
      const data = await eventsService.getEventById(id);
      setEvent(data);
      
      if (data && data.bookingId) {
         setLoadingFinances(true);
         try {
             const [payRes, expRes] = await Promise.all([
                 financesService.getPayments(),
                 financesService.getExpenses()
             ]);
             setPayments(payRes.filter((p: any) => p.bookingId === data.bookingId));
             setExpenses(expRes.filter((e: any) => e.eventId === data.id));
         } catch (err) {
             console.error('Failed to load finances', err);
         } finally {
             setLoadingFinances(false);
         }
      }
    } catch (error) {
      console.error('Failed to load event', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><span className="animate-spin material-symbols-outlined text-4xl text-primary">autorenew</span></div>;
  }

  if (!event) {
    return <div className="p-8 text-center text-on-surface-variant">Event not found.</div>;
  }

  // Derived KPIs (mocking payments/expenses since they aren't part of event payload yet)
  


  const totalPaid = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.filter(e => e.status !== 'Rejected').reduce((sum, e) => sum + e.amount, 0);
  const outstanding = Math.max(0, event.totalAmount - totalPaid);
  const estProfit = event.totalAmount - totalExpense;
  const readiness = event.readinessScore || 0;
  const staffAssigned = event.staff?.length || 0;
  const staffRequired = event.staffRequired || 0;

  const paymentColumns: ColumnDef<any>[] = [
    { key: 'dateStr', header: 'Date', render: (i) => <span className="font-semibold">{i.dateStr}</span> },
    { key: 'id', header: 'Receipt', render: (i) => <span className="font-mono text-xs">{i.id.substring(0, 8).toUpperCase()}</span> },
    { key: 'method', header: 'Method' },
    { key: 'amount', header: 'Amount', align: 'right', render: (i) => <span className="font-currency-num font-bold text-[#10b981]">PKR {i.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (i) => <Badge variant={i.status === 'Completed' ? 'success' : 'warning'}>{i.status}</Badge> },
    { key: 'actions', header: '', align: 'right', render: (i) => (
       <button onClick={(e) => { e.stopPropagation(); bookingsService.generateInvoice(event.bookingId).then(res => window.open(res.url, '_blank')); }} className="text-[#4a1420] hover:bg-[#4a1420]/10 p-1.5 rounded-full transition-colors" title="Download Invoice">
         <span className="material-symbols-outlined text-[18px]">download</span>
       </button>
    )}
  ];

  const expenseColumns: ColumnDef<any>[] = [
    { key: 'dateStr', header: 'Date', render: (i) => <span className="font-semibold">{i.dateStr}</span> },
    { key: 'category', header: 'Category' },
    { key: 'description', header: 'Description', render: (i) => <span className="text-sm">{i.description}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (i) => <span className="font-currency-num font-bold text-[#e02424]">PKR {i.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (i) => <Badge variant={i.status === 'Paid' || i.status === 'Approved' ? 'success' : 'warning'}>{i.status === 'Approved' ? 'Paid' : i.status}</Badge> }
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'operations', label: 'Operations' },
    { id: 'menu', label: 'Menu & Catering' },
    { id: 'staff', label: 'Staff' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'payments', label: 'Payments' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
      <EventStatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} currentStatus={event.status} onSave={handleStatusUpdate} />
      {/* HEADER SECTION */}
      <div className="border border-[#e8e4db] rounded-xl shadow-sm bg-white p-4 md:p-8">
        <div className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/events')} className="hover:text-[#4a1420] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Events
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">EVT-{event.id.substring(0,6).toUpperCase()}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#4a1420]">{event.title} — {event.customerName}</h1>
              <Badge variant={event.status === 'Ongoing' ? 'success' : event.status === 'Upcoming' ? 'primary' : 'neutral'} className="text-[10px] md:text-sm px-2 py-0.5 md:px-3 md:py-1">
                {event.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-on-surface-variant mt-2 md:mt-3">
              <div className="flex items-center gap-1 md:gap-1.5"><CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {event.dateStr}</div>
              <div className="flex items-center gap-1 md:gap-1.5"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {event.hall}</div>
              <div className="flex items-center gap-1 md:gap-1.5"><Users className="w-3.5 h-3.5 md:w-4 md:h-4" /> {event.guests} Guests</div>
              <div className="flex items-center gap-1 md:gap-1.5"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> {event.startTime} - {event.endTime}</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="primary" icon="edit" className="!bg-[#5C0A1E]" onClick={() => navigate('/app/bookings/' + event.bookingId)}>Edit Booking</Button>
              <Button variant="secondary" icon="update" className="!bg-[#b0891d] !text-white" onClick={() => setIsStatusModalOpen(true)}>Update Status</Button>
              <Button variant="outline" icon="person_add" className="!text-[#4a1420] !border-surface-variant" onClick={() => { setActiveTab('staff'); setStaffModalOpen(true); }}>Assign Staff</Button>
              <Button variant="outline" icon="add_task" onClick={() => { setTaskForm({ title: '', assignee: '', dueDate: '', dueTime: '' }); setEditingTaskId(null); setTaskModalOpen(true); }} className="!text-[#4a1420] !border-surface-variant">Add Task</Button>
            </div>
            <div className="flex items-center flex-wrap justify-start lg:justify-end gap-2 md:gap-3 text-xs md:text-sm">
              <button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={() => setExpenseModalOpen(true)}><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4"/> Add Expense</button>
              <span className="text-outline-variant hidden md:inline">•</span>
              <button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={() => setPaymentModalOpen(true)}><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4"/> Record Payment</button>
              <span className="text-outline-variant hidden md:inline">•</span>
              <button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={handlePrintInvoice}><FileText className="w-3.5 h-3.5 md:w-4 md:h-4"/> Print Invoice</button>
                <span className="text-outline-variant hidden md:inline">·</span>
                <button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={() => window.print()}><FileText className="w-3.5 h-3.5 md:w-4 md:h-4"/> Print Summary</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm col-span-2 md:col-span-3 lg:col-span-2">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-3">Setup Checklist</div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm font-medium text-on-surface">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="w-4 h-4 accent-[#5C0A1E] rounded-sm cursor-pointer" checked={checklist.hall} onChange={() => handleChecklistChange('hall')} /> 
                 Hall Setup Complete
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="w-4 h-4 accent-[#5C0A1E] rounded-sm cursor-pointer" checked={checklist.ac} onChange={() => handleChecklistChange('ac')} /> 
                 AC/Chillers On
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="w-4 h-4 accent-[#5C0A1E] rounded-sm cursor-pointer" checked={checklist.kitchen} onChange={() => handleChecklistChange('kitchen')} /> 
                 Kitchen Ready
               </label>
            </div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e02424]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Outstanding</div>
            <div className="font-serif text-lg md:text-2xl font-bold text-[#e02424] flex items-baseline gap-1"><span className="text-[10px] md:text-xs font-sans text-on-surface-variant">PKR</span> {outstanding.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Event Cost</div>
            <div className="font-serif text-lg md:text-2xl font-bold text-[#b0891d] flex items-baseline gap-1"><span className="text-[10px] md:text-xs font-sans text-on-surface-variant">PKR</span> {totalExpense.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Est. Profit</div>
            <div className="font-serif text-lg md:text-2xl font-bold text-[#10b981] flex items-baseline gap-1"><span className="text-[10px] md:text-xs font-sans text-on-surface-variant">PKR</span> {estProfit.toLocaleString()}</div>
          </div>
      </div>

      {/* ATTENTION REQUIRED */}
      <div className="bg-[#e02424]/10 border border-[#e02424]/20 rounded-xl p-4 flex gap-4">
        <AlertCircle className="w-5 h-5 text-[#e02424] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-[#e02424] mb-1.5 md:mb-2 text-sm md:text-base">Attention Required</h4>
          <ul className="text-xs md:text-sm text-[#e02424]/80 font-medium list-disc pl-4 space-y-1">
            <li>Final guest count not confirmed (Due 48hrs prior)</li>
            {outstanding > 0 && <li>PKR {outstanding.toLocaleString()} payment due immediately</li>}
          </ul>
        </div>
      </div>
      </div>

      {/* TABS NAVIGATION */}
      {/* TABS NAVIGATION */}
      <div className="bg-white border border-[#e8e4db] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 mb-6">
        <div className="px-2 md:px-8 border-b border-outline-variant/30 flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "px-4 md:px-6 py-3 md:py-4 font-medium text-xs md:text-sm transition-colors whitespace-nowrap border-b-2",
                activeTab === tab.id 
                  ? "border-[#4a1420] text-[#4a1420]" 
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
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
                <h3 className="font-title-lg mb-4">Event Details</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Customer</div>
                    <div className="col-span-2 font-medium">{event.customerName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Event Type</div>
                    <div className="col-span-2 font-medium">{event.title}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Package</div>
                    <div className="col-span-2 font-medium">{event.packageName || 'Custom Standard Package'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Coordinator</div>
                    <div className="col-span-2 font-medium">{globalStaff.find(s => s.id === event.managerId)?.name || event.managerId || 'Unassigned'}</div>
                  </div>
                </div>
              </section>
            </div>
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Special Requirements</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5">
                  <ul className="list-disc pl-4 space-y-2 text-on-surface">
                    {event.menuItems?.filter((m: any) => m.notes).length > 0 ? (
                       event.menuItems.filter((m: any) => m.notes).map((m: any, idx: number) => (
                         <li key={idx}><strong>{m.name}:</strong> {m.notes}</li>
                       ))
                    ) : (
                       <li className="text-on-surface-variant list-none -ml-4">No special requirements documented for this event.</li>
                    )}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Operational Readiness</h3>
              <Button variant="primary" icon="add" onClick={() => { setTaskForm({ title: '', assignee: '', dueDate: '', dueTime: '' }); setEditingTaskId(null); setTaskModalOpen(true); }}>Add Task</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.tasks?.length > 0 ? event.tasks.map((op: any) => (
                <div key={op.id} className="bg-surface border border-outline-variant/40 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{op.title}</h4>
                      <div className="text-xs text-on-surface-variant mt-0.5">Assignee: {op.assignee || 'Unassigned'} • Due: {op.dueTime || 'N/A'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                       <select className="text-xs p-1 border border-outline-variant rounded bg-surface-container" value={op.status} onChange={(e) => handleUpdateTaskStatus(op.id, e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                       </select>
                       <button onClick={() => { 
                           const parts = (op.dueTime || '').split(' ');
                           setTaskForm({ title: op.title, assignee: op.assignee || '', dueDate: parts[0] || '', dueTime: parts[1] || '' }); 
                           setEditingTaskId(op.id); 
                           setTaskModalOpen(true); 
                       }} className="text-primary hover:bg-primary/10 p-1 rounded flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                       <button onClick={() => handleDeleteTask(op.id)} className="text-[#e02424] hover:bg-[#e02424]/10 p-1 rounded flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                  </div>
                  <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden mt-1">
                    <div className={clsx("h-full rounded-full", op.progress === 100 ? "bg-success" : "bg-primary")} style={{ width: `${op.progress}%` }}></div>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 p-8 flex flex-col items-center text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-3 opacity-50">task</span>
                  <div className="font-medium text-lg mb-1">No tasks assigned yet</div>
                  <div className="text-sm max-w-md">The Operations section pulls directly from Event Tasks. Create tasks (like "Decorate Stage" or "Set up Sound") to track operational readiness here.</div>
                  <Button variant="outline" className="mt-4" onClick={() => { setTaskForm({ title: '', assignee: '', dueDate: '', dueTime: '' }); setEditingTaskId(null); setTaskModalOpen(true); }}>Create First Task</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Catering & Package Details</h3>
              <div className="flex gap-2">
                <Button variant="primary" icon="edit" onClick={() => { 
                   const pkg = globalPackages.find(p => p.name === event.packageName);
                   setSelectedPackageId(pkg ? pkg.id : ''); 
                   setMenuModalOpen(true); 
                }}>Change Package</Button>
              </div>
            </div>
            
            {event.packageName && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Selected Package</div>
                  <div className="text-lg font-serif font-bold text-on-surface">{event.packageName}</div>
                  <div className="text-sm text-on-surface-variant mt-1">
                    {event.packageType ? `${event.packageType} Package • ` : ''} 
                    {event.packagePrice ? `Base Price: PKR ${event.packagePrice.toLocaleString()}` : ''}
                  </div>
                </div>
                {event.packageInclusionsJson && (
                  <div className="md:w-1/2 bg-white rounded-lg p-3 border border-outline-variant/30">
                    <div className="text-xs font-semibold mb-2">Package Inclusions:</div>
                    <ul className="text-sm space-y-1 pl-4 list-disc text-on-surface-variant">
                      {(() => {
                        try {
                          const parsed = JSON.parse(event.packageInclusionsJson);
                          if (Array.isArray(parsed)) return parsed.map((inc, i) => <li key={i}>{inc}</li>);
                          return <li>{event.packageInclusionsJson}</li>;
                        } catch(e) {
                          return <li>{event.packageInclusionsJson}</li>;
                        }
                      })()}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-3 uppercase text-xs tracking-wider">Food Items</h4>
                <ul className="space-y-2 text-sm">
                  {event.menuItems?.length > 0 ? event.menuItems.filter((m: any) => m.category !== 'Dessert' && m.category !== 'Drinks').map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span>{item.name} {item.notes && <span className="text-xs text-on-surface-variant">({item.notes})</span>}</span> 
                      <span className="text-on-surface-variant">{item.quantity} servings</span>
                    </li>
                  )) : <li className="text-on-surface-variant">No explicit food items added to this event yet. Check package inclusions above.</li>}
                </ul>
              </div>
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5">
                <h4 className="font-semibold text-primary mb-3 uppercase text-xs tracking-wider">Desserts & Drinks</h4>
                <ul className="space-y-2 text-sm">
                  {event.menuItems?.length > 0 ? event.menuItems.filter((m: any) => m.category === 'Dessert' || m.category === 'Drinks').map((item: any) => (
                    <li key={item.id} className="flex justify-between border-b border-outline-variant/20 pb-2">
                      <span>{item.name} {item.notes && <span className="text-xs text-on-surface-variant">({item.notes})</span>}</span> 
                      <span className="text-on-surface-variant">{item.quantity} servings</span>
                    </li>
                  )) : <li className="text-on-surface-variant">No explicit desserts/drinks added to this event yet.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Assigned Staff</h3>
              <Button variant="primary" icon="person_add" onClick={() => setStaffModalOpen(true)}>Assign Staff</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {event.staff?.length > 0 ? event.staff.map((s: any) => (
                <div key={s.id} className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-on-surface-variant uppercase tracking-wider">{s.role}</div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveStaff(s.id)} className="text-[#e02424] opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-[#e02424]/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">person_remove</span>
                  </button>
                </div>
              )) : (
                <div className="col-span-full p-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl">
                  No staff assigned yet.
                </div>
              )}
            </div>
          </div>
        )}



        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Event Expenses</h3>
              <Button variant="primary" icon="add" onClick={() => setExpenseModalOpen(true)}>Add Expense</Button>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
               {loadingFinances ? <div className="p-8 text-center text-on-surface-variant">Loading expenses...</div> : (
                  <DataGrid 
                    data={expenses}
                    columns={expenseColumns}
                    keyExtractor={(i) => i.id}
                    currentPage={1}
                    totalPages={1}
                    totalItems={expenses.length}
                    loading={false}
                  />
               )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-lg">Event Payments</h3>
              <Button variant="primary" icon="add" onClick={() => setPaymentModalOpen(true)}>Record Payment</Button>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
               {loadingFinances ? <div className="p-8 text-center text-on-surface-variant">Loading payments...</div> : (
                  <DataGrid 
                    data={payments}
                    columns={paymentColumns}
                    keyExtractor={(i) => i.id}
                    currentPage={1}
                    totalPages={1}
                    totalItems={payments.length}
                    loading={false}
                  />
               )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6 max-w-3xl">
            <h3 className="font-title-lg mb-4">Activity Log</h3>
            <div className="space-y-6 border-l-2 border-outline-variant/30 pl-4 ml-2">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-success ring-4 ring-white"></div>
                <div className="text-sm text-on-surface-variant mb-1">Today, 09:30 AM</div>
                <div className="font-medium">Hall Setup Complete</div>
                <div className="text-sm text-on-surface-variant">Marked as complete by System Administrator</div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-white"></div>
                <div className="text-sm text-on-surface-variant mb-1">Yesterday, 14:15 PM</div>
                <div className="font-medium">Menu Updated</div>
                <div className="text-sm text-on-surface-variant">Dessert quantities increased to 400 servings</div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-secondary ring-4 ring-white"></div>
                <div className="text-sm text-on-surface-variant mb-1">Oct 1, 2026</div>
                <div className="font-medium">Event Created</div>
                <div className="text-sm text-on-surface-variant">Booking #BK-{event.bookingId?.substring(0,6).toUpperCase()} confirmed and event generated</div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      <Modal isOpen={taskModalOpen} onClose={() => { setTaskModalOpen(false); setEditingTaskId(null); }} title={editingTaskId ? "Edit Task" : "Add Task"}>
        <div className="space-y-4">
          <Input label="Task Title" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
          <Select label="Assignee" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} options={[{label: 'Unassigned', value: ''}, ...globalStaff.map((s: any) => ({ label: s.name, value: s.name }))]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
            <Input label="Due Time" type="time" value={taskForm.dueTime} onChange={e => setTaskForm({...taskForm, dueTime: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleCreateTask} variant="primary">Save Task</Button></div>
        </div>
      </Modal>

      <Modal isOpen={menuModalOpen} onClose={() => setMenuModalOpen(false)} title="Manage Event Package">
        <div className="space-y-4">
          <Select label="Package" value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)} options={[
            { label: 'No Package (Custom)', value: '' },
            ...globalPackages.map(p => ({ label: `${p.name} - PKR ${p.price.toLocaleString()}`, value: p.id }))
          ]} />
          <div className="flex justify-end gap-3 pt-4">
             <Button variant="outline" onClick={() => handleUpdateMenu(null)} className="!text-[#e02424] !border-[#e02424]/30">Remove Package</Button>
             <Button onClick={() => handleUpdateMenu()} variant="primary">Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} title="Assign Staff">
        <div className="space-y-4">
          <Select label="Staff Member" value={staffForm.staffMemberId} onChange={e => {
            const selected = globalStaff.find(s => s.id === e.target.value);
            setStaffForm({...staffForm, staffMemberId: e.target.value, name: selected?.name || '', role: selected?.role || 'Waiter'});
          }} options={[{label: 'Select Staff...', value: ''}, ...globalStaff.map((s: any) => ({ label: s.name, value: s.id }))]} />
          <Select label="Role" value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} options={[{label: 'Supervisor', value: 'Supervisor'}, {label: 'Waiter', value: 'Waiter'}, {label: 'Security', value: 'Security'}]} />
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleAssignStaff} variant="primary">Assign</Button></div>
        </div>
      </Modal>

      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Record Expense">
        <div className="space-y-4">
          <Input label="Amount (PKR)" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
          <Select label="Category" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} options={[{label:'Vendor', value:'Vendor'}, {label:'Supplies', value:'Supplies'}]} />
          <Input label="Reference / Notes" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleRecordExpense} variant="primary">Save Expense</Button></div>
        </div>
      </Modal>

      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Record Payment">
        <div className="space-y-4">
          <Input label="Amount (PKR)" type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
          <Select label="Method" value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} options={[{label:'Cash', value:'Cash'}, {label:'Bank Transfer', value:'Bank Transfer'}, {label:'Card', value:'Card'}]} />
          <div className="flex justify-end gap-3 pt-4"><Button onClick={handleRecordPayment} variant="primary">Save Payment</Button></div>
        </div>
      </Modal>

    </div>
  );
};
