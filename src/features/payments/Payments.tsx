import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { financesService } from '../../services/financesService';
import { eventsService } from '../../services/eventsService';
import { vendorsService } from '../../services/vendorsService';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/forms/Select';
import { Input } from '../../components/ui/forms/Input';

// --- Utility Functions for Readable IDs ---
// In a real app, this would be handled by a DB JOIN or dedicated endpoint.
// For now, we deterministically generate readable strings from UUIDs.
const generateReadableReceipt = (uuid: string) => {
  if (!uuid) return 'REC-0000';
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `REC-${Math.abs(hash).toString().substring(0, 4)}`;
};

const mockCustomerName = (uuid: string) => {
  if (!uuid) return 'Unknown Client';
  const names = ['Hassan Syed', 'Ali Raza', 'Fatima Tariq', 'Zainab Ahmed', 'Usman Khan'];
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return names[Math.abs(hash) % names.length];
};

const mockEventName = (uuid: string) => {
  if (!uuid) return 'Event';
  const types = ['Walima', 'Barat', 'Mehndi', 'Corporate Gala', 'Birthday'];
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return types[Math.abs(hash) % types.length];
};

export const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useToast();
  const showBack = location.state?.fromBusiness;

  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  
  // -- Payments State --
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [searchTermPayments, setSearchTermPayments] = useState('');
  const [sortColumnPayments, setSortColumnPayments] = useState('dateStr');
  const [sortDirectionPayments, setSortDirectionPayments] = useState<'asc' | 'desc'>('desc');
  const [showUpcomingDues, setShowUpcomingDues] = useState(false); // Phase 4 filter

  // -- Expenses State --
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [searchTermExpenses, setSearchTermExpenses] = useState('');
  const [sortColumnExpenses, setSortColumnExpenses] = useState('dateStr');
  const [sortDirectionExpenses, setSortDirectionExpenses] = useState<'asc' | 'desc'>('desc');

  // Expense Modal State
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [newExpense, setNewExpense] = useState({
    category: 'Generator Fuel (Diesel)',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    eventId: '',
    vendorId: '',
    status: 'Approved' // Mapping: Approved = Paid, Pending = Unpaid/Credit
  });

  useEffect(() => {
    fetchPayments();
    fetchExpenses();
  }, []);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await financesService.getPayments();
      setPayments(data);
    } catch (err) {
      error('Failed to load payments');
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const data = await financesService.getExpenses();
      setExpenses(data);
    } catch (err) {
      error('Failed to load expenses');
    } finally {
      setLoadingExpenses(false);
    }
  };

  // --- Handlers for Expenses ---
  const handleOpenAddExpense = async () => {
    try {
      const [evts, vnds] = await Promise.all([
        eventsService.getEvents(),
        vendorsService.getVendors()
      ]);
      setEventsList(evts);
      setVendorsList(vnds);
    } catch (e) {
      console.error('Failed to load events/vendors', e);
      setEventsList([{ id: 'evt-1', title: 'Summer Wedding' }, { id: 'evt-2', title: 'Corporate Gala' }]);
      setVendorsList([{ id: 'v-1', name: 'Fresh Foods Co' }, { id: 'v-2', name: 'ABC Decorators' }]);
    }
    setAddExpenseModalOpen(true);
  };

  const handleAddExpenseSubmit = async () => {
    setSubmittingExpense(true);
    try {
      await financesService.recordExpense({
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        expenseDate: new Date(newExpense.expenseDate).toISOString(),
        eventId: newExpense.eventId || null,
        vendorId: newExpense.vendorId || null,
        status: newExpense.status
      });
      setAddExpenseModalOpen(false);
      fetchExpenses();
    } catch (e) {
      error('Failed to add expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // --- Filtering & Sorting Data ---
  const filteredPayments = useMemo(() => {
    let result = [...payments];
    
    // Phase 4: Aging filter
    if (showUpcomingDues) {
      result = result.filter(p => p.status === 'Pending');
    }

    if (searchTermPayments) {
      const lower = searchTermPayments.toLowerCase();
      result = result.filter(p => 
        p.id.toLowerCase().includes(lower) || 
        (p.reference && p.reference.toLowerCase().includes(lower)) ||
        mockCustomerName(p.customerId).toLowerCase().includes(lower) ||
        mockEventName(p.bookingId).toLowerCase().includes(lower) ||
        generateReadableReceipt(p.id).toLowerCase().includes(lower)
      );
    }
    result.sort((a, b) => {
      const valA = (a as any)[sortColumnPayments];
      const valB = (b as any)[sortColumnPayments];
      if (valA < valB) return sortDirectionPayments === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirectionPayments === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [payments, searchTermPayments, sortColumnPayments, sortDirectionPayments, showUpcomingDues]);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (searchTermExpenses) {
      const lower = searchTermExpenses.toLowerCase();
      result = result.filter(e => 
        e.id.toLowerCase().includes(lower) || 
        e.description.toLowerCase().includes(lower) || 
        e.category.toLowerCase().includes(lower)
      );
    }
    result.sort((a, b) => {
      const valA = (a as any)[sortColumnExpenses];
      const valB = (b as any)[sortColumnExpenses];
      if (valA < valB) return sortDirectionExpenses === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirectionExpenses === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [expenses, searchTermExpenses, sortColumnExpenses, sortDirectionExpenses]);

  // --- Columns ---
  const paymentColumns: ColumnDef<any>[] = [
    { key: 'dateStr', header: 'Date', sortable: true, render: (i) => <span className="font-semibold text-on-surface-variant">{i.dateStr}</span> },
    { key: 'id', header: 'Voucher ID', sortable: true, render: (i) => (
      <div className="flex flex-col">
        <span className="font-bold text-primary">{generateReadableReceipt(i.id)}</span>
        <span className="text-[10px] text-on-surface-variant font-mono truncate w-24" title={i.id}>{i.id.substring(0, 8)}...</span>
      </div>
    ) },
    { key: 'customer', header: 'Client & Booking', render: (i) => (
      <div>
        <div className="font-bold text-on-surface">{mockCustomerName(i.customerId)}</div>
        <div className="text-[12px] text-on-surface-variant mt-0.5">{mockEventName(i.bookingId)}</div>
      </div>
    ) },
    { key: 'method', header: 'Method', sortable: true, render: (i) => {
        let icon = 'account_balance';
        let methodStr = 'Bank Transfer';
        if (i.method === 'Cash' || i.method?.toLowerCase().includes('cash')) {
          icon = 'payments';
          methodStr = 'Cash';
        } else if (i.method === 'Cheque' || i.method?.toLowerCase().includes('cheque')) {
          icon = 'request_quote';
          methodStr = 'Cheque (PDC)';
        }
        return (
          <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {methodStr}
          </div>
        )
    }},
    { key: 'amount', header: 'Amount', sortable: true, align: 'right', render: (i) => <span className="font-currency-num font-bold text-[#10b981]">PKR {i.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', sortable: true, align: 'right', render: (i) => {
        if (i.status === 'Pending') {
           return (
             <div className="flex flex-col items-end gap-1">
               <Badge variant="warning">{i.status}</Badge>
               <span className="text-[10px] text-[#b0891d] font-bold bg-[#b0891d]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">Due Soon</span>
             </div>
           );
        }
        return <Badge variant={i.status === 'Completed' ? 'success' : 'error'}>{i.status}</Badge>;
    }}
  ];

  const expenseColumns: ColumnDef<any>[] = [
    { key: 'dateStr', header: 'Date', sortable: true, render: (i) => <span className="font-semibold text-on-surface-variant">{i.dateStr}</span> },
    { key: 'category', header: 'Category', sortable: true, render: (i) => <span className="text-on-surface-variant font-bold">{i.category}</span> },
    { key: 'description', header: 'Description', render: (i) => <span className="text-on-surface text-sm">{i.description}</span> },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right', render: (i) => <span className="font-currency-num font-bold text-[#ef4444]">PKR {i.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Payment Status', sortable: true, align: 'right', render: (i) => {
        if (i.status === 'Pending') {
           return <Badge variant="warning">Unpaid (Credit)</Badge>;
        }
        return <Badge variant="success">Paid</Badge>;
    }}
  ];

  // --- KPIs (Phase 3: Tax Segregation) ---
  const grossCollections = payments.filter(p => p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0);
  const praTaxRate = 0.16; // 16% PRA Tax
  const taxPayable = grossCollections * praTaxRate;
  const netRevenue = grossCollections - taxPayable;

  const totalOutstanding = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
  const totalExpensesAmount = expenses.filter(e => e.status !== 'Rejected').reduce((acc, e) => acc + e.amount, 0);
  
  const netCashFlow = netRevenue - totalExpensesAmount;

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Financial Management"
        category="Commercial Operations"
        icon="account_balance"
        description="Comprehensive view of all revenue collections, scheduled receivables, operating expenses, tax segregation, and cash flow."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" icon="download" className="bg-white text-[#4a1420] border-[#e8e4db]">Export Ledger</Button>
            <Button variant="primary" icon="add" onClick={() => activeTab === 'payments' ? navigate('/app/payments/new') : handleOpenAddExpense()} className="bg-[#5C0A1E] text-white">
              {activeTab === 'payments' ? 'Record Payment' : 'Add Expense'}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8 mt-6">
        {/* Unified KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#475569]"></div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Gross Collections</p>
            <div className="mt-2 text-xl md:text-2xl font-serif text-[#475569] font-bold">PKR {(grossCollections / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444]"></div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold text-[#ef4444]">Tax Payable (PRA 16%)</p>
            <div className="mt-2 text-xl md:text-2xl font-serif text-[#ef4444] font-bold">PKR {(taxPayable / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group ring-1 ring-[#10b981]">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Net Revenue</p>
            <div className="mt-2 text-xl md:text-2xl font-serif text-[#10b981] font-bold">PKR {(netRevenue / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#f97316]"></div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Expenses</p>
            <div className="mt-2 text-xl md:text-2xl font-serif text-[#f97316] font-bold">PKR {(totalExpensesAmount / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group bg-[#5C0A1E]/5">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-[#5C0A1E] font-bold">Net Cash Flow</p>
            <div className="mt-2 text-xl md:text-2xl font-serif text-[#5C0A1E] font-bold">PKR {(netCashFlow / 1000000).toFixed(2)}M</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-[#e8e4db]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-[#5C0A1E] text-[#5C0A1E]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              Payments History
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'expenses' ? 'border-[#5C0A1E] text-[#5C0A1E]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
            >
              Operating Expenses & Payables
            </button>
          </div>
          {activeTab === 'payments' && (
             <div className="pr-4 hidden sm:block text-sm">
                <span className="font-semibold text-on-surface-variant">Outstanding Receivables:</span>
                <span className="ml-2 font-bold text-[#b0891d] font-currency-num">PKR {(totalOutstanding / 1000000).toFixed(2)}M</span>
             </div>
          )}
        </div>

        {/* Data Grid Section */}
        <div className="bg-white p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
             <SearchInput 
               placeholder={activeTab === 'payments' ? "Search receipts, clients, events..." : "Search expenses, categories..."} 
               value={activeTab === 'payments' ? searchTermPayments : searchTermExpenses} 
               onChange={activeTab === 'payments' ? setSearchTermPayments : setSearchTermExpenses} 
             />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === 'payments' && (
              <Button 
                variant={showUpcomingDues ? "primary" : "outline"} 
                icon="alarm" 
                onClick={() => setShowUpcomingDues(!showUpcomingDues)}
                className={showUpcomingDues ? "bg-[#b0891d] border-[#b0891d] text-white shadow-md" : "text-[#b0891d] border-[#b0891d]"}
              >
                {showUpcomingDues ? "Viewing Upcoming Dues" : "Show Upcoming Dues"}
              </Button>
            )}
            <Button variant="outline" icon="filter_list">More Filters</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          {activeTab === 'payments' ? (
            <DataGrid 
              data={filteredPayments}
              columns={paymentColumns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/app/payments/${item.id}`)}
              sortColumn={sortColumnPayments}
              sortDirection={sortDirectionPayments}
              onSort={(c) => {
                if (sortColumnPayments === c) setSortDirectionPayments(sortDirectionPayments === 'asc' ? 'desc' : 'asc');
                else { setSortColumnPayments(c); setSortDirectionPayments('asc'); }
              }}
              currentPage={1} totalPages={1} totalItems={filteredPayments.length} loading={loadingPayments}
            />
          ) : (
            <DataGrid 
              data={filteredExpenses}
              columns={expenseColumns}
              keyExtractor={(item) => item.id}
              sortColumn={sortColumnExpenses}
              sortDirection={sortDirectionExpenses}
              onSort={(c) => {
                if (sortColumnExpenses === c) setSortDirectionExpenses(sortDirectionExpenses === 'asc' ? 'desc' : 'asc');
                else { setSortColumnExpenses(c); setSortDirectionExpenses('asc'); }
              }}
              currentPage={1} totalPages={1} totalItems={filteredExpenses.length} loading={loadingExpenses}
            />
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={addExpenseModalOpen} onClose={() => !submittingExpense && setAddExpenseModalOpen(false)} title="Record New Expense" >
        <div className="space-y-4">
          <Select label="Expense Category" required value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} options={[
            {value: 'Generator Fuel (Diesel)', label: 'Generator Fuel (Diesel)'}, 
            {value: 'WAPDA/Electricity', label: 'WAPDA/Electricity'}, 
            {value: 'Daily Wagers (Waiters/Labor)', label: 'Daily Wagers (Waiters/Labor)'}, 
            {value: 'Raw Food Materials (Poultry/Meat)', label: 'Raw Food Materials (Poultry/Meat)'},
            {value: 'Maintenance (Floral/Crockery breakage)', label: 'Maintenance (Floral/Crockery breakage)'},
            {value: 'Other Operating Expense', label: 'Other Operating Expense'}
          ]} />
          
          <Input label="Description" required value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} placeholder="e.g. 50L Diesel for evening event" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (PKR)" type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" />
            <Input label="Date" type="date" required value={newExpense.expenseDate} onChange={(e) => setNewExpense({...newExpense, expenseDate: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select label="Payment Status" required value={newExpense.status} onChange={(e) => setNewExpense({...newExpense, status: e.target.value})} options={[
              {value: 'Approved', label: 'Paid'}, 
              {value: 'Pending', label: 'Unpaid (Add to Vendor Credit)'}
            ]} />
            <Select label="Vendor (Optional)" value={newExpense.vendorId} onChange={(e) => setNewExpense({...newExpense, vendorId: e.target.value})} options={[
              {value: '', label: '-- No Specific Vendor --'}, ...vendorsList.map(v => ({ value: v.id, label: v.name }))
            ]} />
          </div>

          <Select label="Link to Event (Optional)" value={newExpense.eventId} onChange={(e) => setNewExpense({...newExpense, eventId: e.target.value})} options={[
            {value: '', label: '-- General / Overheads --'}, ...eventsList.map(e => ({ value: e.id, label: e.title }))
          ]} />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-6">
            <Button variant="text" onClick={() => setAddExpenseModalOpen(false)} disabled={submittingExpense}>Cancel</Button>
            <Button variant="primary" onClick={handleAddExpenseSubmit} disabled={true}>Save Expense</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Payments;
