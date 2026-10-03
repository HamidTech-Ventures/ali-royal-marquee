import os
import json

code = """import { useState, useMemo, useEffect } from 'react';
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
    category: 'Procurement',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    eventId: '',
    vendorId: ''
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
        vendorId: newExpense.vendorId || null
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
    if (searchTermPayments) {
      const lower = searchTermPayments.toLowerCase();
      result = result.filter(p => 
        p.id.toLowerCase().includes(lower) || 
        (p.reference && p.reference.toLowerCase().includes(lower)) ||
        (p.customerName && p.customerName.toLowerCase().includes(lower)) ||
        p.bookingId.toLowerCase().includes(lower)
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
  }, [payments, searchTermPayments, sortColumnPayments, sortDirectionPayments]);

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
    { key: 'id', header: 'Voucher ID', sortable: true, render: (i) => <span className="font-semibold text-primary">{i.id}</span> },
    { key: 'customer', header: 'Client & Booking', render: (i) => (<div><div className="font-semibold">{i.customerId}</div><div className="text-[12px] text-on-surface-variant mt-0.5">{i.bookingId}</div></div>) },
    { key: 'method', header: 'Method', sortable: true, render: (i) => <div className="text-on-surface-variant font-medium">{i.method}</div> },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right', render: (i) => <span className="font-currency-num font-bold text-[#10b981]">PKR {i.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', sortable: true, align: 'right', render: (i) => <Badge variant={i.status === 'Completed' ? 'success' : i.status === 'Pending' ? 'warning' : 'error'}>{i.status}</Badge> }
  ];

  const expenseColumns: ColumnDef<any>[] = [
    { key: 'dateStr', header: 'Date', sortable: true, render: (i) => <span className="font-semibold text-on-surface-variant">{i.dateStr}</span> },
    { key: 'category', header: 'Category', sortable: true, render: (i) => <span className="text-on-surface-variant font-medium">{i.category}</span> },
    { key: 'description', header: 'Description', render: (i) => <span className="text-on-surface">{i.description}</span> },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right', render: (i) => <span className="font-currency-num font-bold text-[#ef4444]">PKR {i.amount.toLocaleString()}</span> },
    { key: 'status', header: 'Status', sortable: true, align: 'right', render: (i) => <Badge variant={i.status === 'Approved' ? 'success' : i.status === 'Pending' ? 'warning' : 'error'}>{i.status}</Badge> }
  ];

  // --- KPIs ---
  const totalCollected = payments.filter(p => p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0);
  const totalOutstanding = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
  const totalExpensesAmount = expenses.filter(e => e.status !== 'Rejected').reduce((acc, e) => acc + e.amount, 0);
  const netCashFlow = totalCollected - totalExpensesAmount;

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Financial Management"
        category="Commercial Operations"
        icon="account_balance"
        description="Comprehensive view of all revenue collections, scheduled receivables, operating expenses, and cash flow."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Revenue Collected</p>
            <div className="mt-2 text-3xl font-serif text-[#10b981] font-bold">PKR {(totalCollected / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444]"></div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Expenses</p>
            <div className="mt-2 text-3xl font-serif text-[#ef4444] font-bold">PKR {(totalExpensesAmount / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4a1420]"></div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Net Cash Flow</p>
            <div className="mt-2 text-3xl font-serif text-[#4a1420] font-bold">PKR {(netCashFlow / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Outstanding Receivables</p>
            <div className="mt-2 text-3xl font-serif text-[#b0891d] font-bold">PKR {(totalOutstanding / 1000000).toFixed(2)}M</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e8e4db]">
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
            Operating Expenses
          </button>
        </div>

        {/* Data Grid Section */}
        <div className="bg-white p-4 border border-[#e8e4db] rounded-xl shadow-sm flex items-center justify-between">
          <SearchInput 
            placeholder={activeTab === 'payments' ? "Search payments..." : "Search expenses..."} 
            value={activeTab === 'payments' ? searchTermPayments : searchTermExpenses} 
            onChange={activeTab === 'payments' ? setSearchTermPayments : setSearchTermExpenses} 
          />
          <Button variant="outline" icon="filter_list">Filter</Button>
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
      <Modal isOpen={addExpenseModalOpen} onClose={() => !submittingExpense && setAddExpenseModalOpen(false)} title="Record New Expense" size="md">
        <div className="space-y-4">
          <Select label="Category" required value={newExpense.category} onChange={(e) => setNewExpense({...newExpense, category: e.target.value})} options={[
            {value: 'Procurement', label: 'Procurement'}, {value: 'Payroll', label: 'Payroll'}, {value: 'Maintenance', label: 'Maintenance'}, {value: 'Utility', label: 'Utility'}
          ]} />
          <Input label="Description" required value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} placeholder="e.g. Tomato supplies for wedding" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (PKR)" type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" />
            <Input label="Date" type="date" required value={newExpense.expenseDate} onChange={(e) => setNewExpense({...newExpense, expenseDate: e.target.value})} />
          </div>
          <Select label="Link to Event (Optional)" value={newExpense.eventId} onChange={(e) => setNewExpense({...newExpense, eventId: e.target.value})} options={[
            {value: '', label: '-- General/No Event --'}, ...eventsList.map(e => ({ value: e.id, label: e.title }))
          ]} />
          <Select label="Vendor (Optional)" value={newExpense.vendorId} onChange={(e) => setNewExpense({...newExpense, vendorId: e.target.value})} options={[
            {value: '', label: '-- No Vendor --'}, ...vendorsList.map(v => ({ value: v.id, label: v.name }))
          ]} />
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20 mt-6">
            <Button variant="text" onClick={() => setAddExpenseModalOpen(false)} disabled={submittingExpense}>Cancel</Button>
            <Button variant="primary" onClick={handleAddExpenseSubmit} isLoading={submittingExpense} disabled={!newExpense.category || !newExpense.description || !newExpense.amount}>Save Expense</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Payments;
"""

with open('c:/My working/HamidTech_Ventures/Clients/marquee-management-system/frontend/src/features/payments/Payments.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

# Delete expenses feature
import shutil
shutil.rmtree('c:/My working/HamidTech_Ventures/Clients/marquee-management-system/frontend/src/features/expenses', ignore_errors=True)

print("Done")
