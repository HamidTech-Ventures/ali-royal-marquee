import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { financesService } from '../../services/financesService';
import { eventsService } from '../../services/eventsService';
import { vendorsService } from '../../services/vendorsService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/forms/Select';
import { Input } from '../../components/ui/forms/Input';
import type { Expense } from '../../types';

export const Expenses = () => {
  const { error } = useToast();
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('dateStr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');

  // Add Expense State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [newExpense, setNewExpense] = useState({
    category: 'Procurement',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    eventId: '',
    vendorId: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenAddModal = async () => {
    try {
      const [evts, vnds] = await Promise.all([
        eventsService.getEvents(),
        vendorsService.getVendors()
      ]);
      setEvents(evts);
      setVendors(vnds);
    } catch (e) {
      console.error('Failed to load events/vendors', e);
      // Fallback mock
      setEvents([{ id: 'evt-1', title: 'Summer Wedding' }, { id: 'evt-2', title: 'Corporate Gala' }]);
      setVendors([{ id: 'v-1', name: 'Fresh Foods Co' }, { id: 'v-2', name: 'ABC Decorators' }]);
    }
    setAddModalOpen(true);
  };

  const handleAddSubmit = async () => {
    setSubmitting(true);
    try {
      await financesService.recordExpense({
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        expenseDate: new Date(newExpense.expenseDate).toISOString(),
        eventId: newExpense.eventId || null,
        vendorId: newExpense.vendorId || null
      });
      setAddModalOpen(false);
      fetchExpenses();
    } catch (e) {
      error('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await financesService.getExpenses();
      setExpenses(data);
    } catch (err) {
      error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = [...expenses];
    
    if (statusFilter !== 'All') {
      result = result.filter(e => e.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.id.toLowerCase().includes(lowerSearch) ||
        e.category.toLowerCase().includes(lowerSearch) ||
        e.description.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      const valA = (a as any)[sortColumn];
      const valB = (b as any)[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [expenses, searchTerm, statusFilter, sortColumn, sortDirection]);

  const columns: ColumnDef<Expense>[] = [
    {
      key: 'id',
      header: 'Voucher ID',
      sortable: true,
      render: (item) => <span className="font-mono text-[12px] bg-surface-container-low px-2 py-1 rounded text-primary">{item.id}</span>
    },
    {
      key: 'dateStr',
      header: 'Date',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-on-surface-variant">{item.dateStr}</span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="text-on-surface-variant font-medium">{item.category}</span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-on-surface">{item.description}</span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-currency-num font-bold text-primary">PKR {item.amount.toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'right',
      render: (item) => {
        let variant: any = 'neutral';
        if (item.status === 'Approved') variant = 'success';
        if (item.status === 'Pending') variant = 'warning';
        if (item.status === 'Rejected') variant = 'error';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    }
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Expense Management & Cost Control"
        category="Commercial & Disbursements Ledger"
        icon="account_balance_wallet"
        description="Track estate operating expenses, event procurement costs, vendor payables, and post-event gross margins."
        actions={
          <>
            <Button variant="outline" icon="tune">Filters</Button>
            <Button variant="primary" icon="add" onClick={handleOpenAddModal}>Add Expense</Button>
          </>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Expenses</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight">PKR 1.38M</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">This Month</div>
          </div>
          
          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Procurement</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">restaurant</span>
              </div>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight">PKR 845k</div>
          </div>

          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Estate Overheads</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">domain</span>
              </div>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight">PKR 540k</div>
          </div>

          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Pending Payables</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              </div>
            </div>
            <div className="font-headline-md text-headline-md text-error tracking-tight">PKR 185k</div>
          </div>

          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Avg Event Outlay</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
              </div>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight">PKR 47.2k</div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded p-6 shadow-sm">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary-container"></div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded bg-primary-fixed/30 text-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">verified_user</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    Critical
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    Attention Required: Management Expense Approvals & Vendor Releases
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl">
                  4 procurement vouchers totaling <span className="font-semibold text-primary">PKR 185,000</span> are awaiting GM sign-off before Friday night setup.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="primary">Approve Cleared Invoices</Button>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-surface-container-lowest p-3 rounded shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button 
              variant={statusFilter === 'All' ? 'primary' : 'text'} 
              className={statusFilter === 'All' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('All')}
            >
              All Expenses
            </Button>
            <Button 
              variant={statusFilter === 'Approved' ? 'primary' : 'text'} 
              className={statusFilter === 'Approved' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Approved')}
            >
              Approved
            </Button>
            <Button 
              variant={statusFilter === 'Pending' ? 'primary' : 'text'} 
              className={statusFilter === 'Pending' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Pending')}
            >
              Pending
            </Button>
            <Button 
              variant={statusFilter === 'Rejected' ? 'primary' : 'text'} 
              className={statusFilter === 'Rejected' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-error'} 
              onClick={() => setStatusFilter('Rejected')}
            >
              Rejected
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput 
              placeholder="Search expenses..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
        <DataGrid 
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => setSelectedExpense(item)}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={1}
          totalPages={1}
          totalItems={filteredData.length}
          loading={loading}
        />
      </div>

      <Drawer
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title={selectedExpense?.id || ''}
        subtitle={selectedExpense ? `Category: ${selectedExpense.category}` : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedExpense(null)}>Close</Button>
            {selectedExpense?.status === 'Pending' && <Button variant="primary">Approve Expense</Button>}
          </div>
        }
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3 flex items-center justify-between">
                <span>Expense Details</span>
                <Badge variant={selectedExpense.status === 'Approved' ? 'success' : selectedExpense.status === 'Pending' ? 'warning' : 'error'}>{selectedExpense.status}</Badge>
              </h3>
              <div className="grid grid-cols-1 gap-y-4 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Description</span>
                  <span className="font-semibold text-on-surface">{selectedExpense.description}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <span className="text-on-surface-variant block mb-0.5">Amount</span>
                    <span className="font-semibold text-primary">PKR {selectedExpense.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block mb-0.5">Date</span>
                    <span className="font-semibold text-on-surface">{selectedExpense.dateStr}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {(selectedExpense.vendorId || selectedExpense.bookingId) && (
              <div className="bg-surface-container-low p-4 rounded-lg border border-surface-container-highest">
                <h3 className="font-title-md mb-3 text-on-surface">Related References</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                  {selectedExpense.vendorId && (
                    <div>
                      <span className="text-on-surface-variant block mb-0.5">Vendor Ref</span>
                      <span className="font-semibold text-on-surface">{selectedExpense.vendorId}</span>
                    </div>
                  )}
                  {selectedExpense.bookingId && (
                    <div>
                      <span className="text-on-surface-variant block mb-0.5">Booking Ref</span>
                      <span className="font-semibold text-on-surface bg-surface-container-high px-2 py-0.5 rounded">{selectedExpense.bookingId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Record Expense"
        maxWidth="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Description" 
            value={newExpense.description} 
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} 
            className="md:col-span-2"
          />
          <Input 
            label="Amount (PKR)" 
            type="number"
            value={newExpense.amount} 
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} 
          />
          <Input 
            label="Expense Date" 
            type="date"
            value={newExpense.expenseDate} 
            onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })} 
          />
          <Select 
            label="Category" 
            value={newExpense.category} 
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            options={[
              { value: 'Procurement', label: 'Procurement' },
              { value: 'Operations', label: 'Operations' },
              { value: 'Payroll', label: 'Payroll' },
              { value: 'Overheads', label: 'Overheads' }
            ]}
          />
          <Select 
            label="Related Event (Optional)" 
            value={newExpense.eventId} 
            onChange={(e) => setNewExpense({ ...newExpense, eventId: e.target.value })}
            options={[{ value: '', label: 'None' }, ...events.map(e => ({ value: e.id, label: e.title || e.id }))]}
          />
          <Select 
            label="Vendor (Optional)" 
            value={newExpense.vendorId} 
            onChange={(e) => setNewExpense({ ...newExpense, vendorId: e.target.value })}
            options={[{ value: '', label: 'None' }, ...vendors.map(v => ({ value: v.id, label: v.name }))]}
            className="md:col-span-2"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddSubmit} disabled={!newExpense.description || !newExpense.amount || submitting}>
            {submitting ? 'Saving...' : 'Save Expense'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
