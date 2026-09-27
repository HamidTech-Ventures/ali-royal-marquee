import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { ArrowLeft, Phone, Truck } from 'lucide-react';
import clsx from 'clsx';
import type { Vendor, Expense } from '../../types';
import { vendorsService } from '../../services/vendorsService';
import { financesService } from '../../services/financesService';
import { useToast } from '../../context/ToastContext';

type TabType = 'overview' | 'purchases';

export const VendorDetails = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [vendorExpenses, setVendorExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Vendor Payment',
    description: '',
    amount: '',
  });

  const fetchExpenses = (v: Vendor) => {
    financesService.getExpenses().then((data: Expense[]) => {
      setVendorExpenses(data.filter((e: Expense) => e.vendorId === v.id));
    }).catch((err: any) => console.error('Failed to load expenses', err));
  };

  useEffect(() => {
    if (vendorId) {
      vendorsService.getVendors().then(data => {
        const found = data.find(v => v.id === vendorId);
        setVendor(found || null);
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching vendor:', err);
        setLoading(false);
      });
    }
  }, [vendorId]);

  useEffect(() => {
    if (vendor) fetchExpenses(vendor);
  }, [vendor]);

  const handleDelete = async () => {
    if (!vendor) return;
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        setDeleting(true);
        await vendorsService.deleteVendor(vendor.id);
        success('Vendor deleted successfully');
        navigate('/app/vendors');
      } catch (err) {
        console.error('Error deleting vendor:', err);
        showError('Failed to delete vendor.');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleRecordExpense = async () => {
    if (!vendor) return;
    if (!expenseForm.description || !expenseForm.amount) {
      showError('Please fill in all required fields');
      return;
    }
    setSavingExpense(true);
    try {
      await financesService.recordExpense({
        category: expenseForm.category,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        expenseDate: new Date().toISOString(),
        vendorId: vendor.id,
        eventId: null,
      });
      success('Expense recorded successfully');
      setExpenseModalOpen(false);
      setExpenseForm({ category: 'Vendor Payment', description: '', amount: '' });
      fetchExpenses(vendor);
    } catch (err) {
      console.error('Failed to record expense:', err);
      showError('Failed to record expense. Please try again.');
    } finally {
      setSavingExpense(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-on-surface-variant">Loading vendor details...</div>;
  if (!vendor) return <div className="p-8 text-center text-on-surface-variant">Vendor not found.</div>;

  const totalPurchases = vendorExpenses.reduce((sum, e) => sum + e.amount, 0);
  const outstanding = vendorExpenses.filter(e => e.paymentStatus !== 'Paid').reduce((sum, e) => sum + e.amount, 0);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Supplier Overview' },
    { id: 'purchases', label: `Purchase History (${vendorExpenses.length})` },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">

      {/* HEADER */}
      <div className="border-b border-outline-variant/30 bg-surface px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/vendors')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Vendors
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{vendor.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surface-variant text-on-surface-variant flex items-center justify-center rounded-full shrink-0">
              <Truck className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-on-surface">{vendor.name}</h1>
                <Badge variant={vendor.status === 'Active' ? 'success' : 'neutral'} className="text-sm px-3 py-1">
                  {vendor.status}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-4 text-on-surface-variant mt-2">
                <Badge variant="neutral">{vendor.category}</Badge>
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {vendor.phone}</div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  {vendor.contactName}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" icon="receipt_long" onClick={() => setExpenseModalOpen(true)}>Record Expense</Button>
            <Button variant="outline" icon="edit" onClick={() => navigate(`/app/vendors/${vendor.id}/edit`)}>Edit</Button>
            <Button variant="outline" className="text-error border-error/30 hover:bg-error/5" icon="delete" onClick={handleDelete} disabled={deleting}>Delete</Button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-8 py-5 bg-surface-container-lowest border-b border-outline-variant/20">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Purchases</div>
            <div className="text-2xl font-bold text-on-surface">PKR {totalPurchases.toLocaleString()}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Outstanding</div>
            <div className="text-2xl font-bold text-error">PKR {outstanding.toLocaleString()}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Transactions</div>
            <div className="text-2xl font-bold text-on-surface">{vendorExpenses.length}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
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
            <section>
              <h3 className="font-title-lg mb-4">Contact Information</h3>
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                  <div className="col-span-1 text-on-surface-variant text-sm">Contact Person</div>
                  <div className="col-span-2 font-medium">{vendor.contactName}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                  <div className="col-span-1 text-on-surface-variant text-sm">Phone</div>
                  <div className="col-span-2 font-medium">{vendor.phone}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                  <div className="col-span-1 text-on-surface-variant text-sm">Category</div>
                  <div className="col-span-2"><Badge variant="neutral">{vendor.category}</Badge></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 text-on-surface-variant text-sm">Status</div>
                  <div className="col-span-2"><Badge variant={vendor.status === 'Active' ? 'success' : 'neutral'}>{vendor.status}</Badge></div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-title-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="w-full flex items-center gap-4 p-4 bg-surface border border-outline-variant/40 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">Record Expense</div>
                    <div className="text-sm text-on-surface-variant">Log a payment or purchase against this vendor</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('purchases')}
                  className="w-full flex items-center gap-4 p-4 bg-surface border border-outline-variant/40 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">View Purchase History</div>
                    <div className="text-sm text-on-surface-variant">{vendorExpenses.length} transactions recorded</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/app/vendors/${vendor.id}/edit`)}
                  className="w-full flex items-center gap-4 p-4 bg-surface border border-outline-variant/40 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-on-surface/5 text-on-surface-variant flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">Edit Vendor Details</div>
                    <div className="text-sm text-on-surface-variant">Update name, contact, category or status</div>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Purchase History</h3>
              <Button variant="primary" icon="add" onClick={() => setExpenseModalOpen(true)}>Record New Expense</Button>
            </div>
            <div className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">Payment</th>
                    <th className="p-4 font-medium text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {vendorExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-surface-variant/20">
                      <td className="p-4 text-on-surface">{expense.dateStr}</td>
                      <td className="p-4 text-on-surface">{expense.category}</td>
                      <td className="p-4 text-on-surface-variant">{expense.description}</td>
                      <td className="p-4">
                        <Badge variant={expense.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                          {expense.paymentStatus || 'Unpaid'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-semibold text-on-surface">
                        {expense.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {vendorExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[40px] block mb-2 opacity-40">receipt_long</span>
                        No purchases recorded for this vendor yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {vendorExpenses.length > 0 && (
              <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-4 border border-outline-variant/30">
                <span className="text-sm text-on-surface-variant">{vendorExpenses.length} total transaction(s)</span>
                <div className="flex gap-6 text-sm">
                  <span className="text-on-surface-variant">Total: <span className="font-bold text-on-surface">PKR {totalPurchases.toLocaleString()}</span></span>
                  <span className="text-on-surface-variant">Outstanding: <span className="font-bold text-error">PKR {outstanding.toLocaleString()}</span></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RECORD EXPENSE MODAL */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Record Expense"
        description={`Log a payment or purchase for ${vendor.name}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setExpenseModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRecordExpense} disabled={savingExpense} icon="save">
              {savingExpense ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-1">
          <Select
            label="Category *"
            name="category"
            value={expenseForm.category}
            onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
            options={[
              { value: 'Vendor Payment', label: 'Vendor Payment' },
              { value: 'Catering', label: 'Catering' },
              { value: 'Decoration', label: 'Decoration' },
              { value: 'AV/Lighting', label: 'AV/Lighting' },
              { value: 'Security', label: 'Security' },
              { value: 'Florist', label: 'Florist' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            label="Description *"
            name="description"
            value={expenseForm.description}
            onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder={`e.g. Monthly payment to ${vendor.name}`}
          />
          <Input
            label="Amount (PKR) *"
            name="amount"
            type="number"
            value={expenseForm.amount}
            onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="e.g. 50000"
          />
          <div className="bg-surface-container-low rounded-lg p-3 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
            This expense will be recorded against <strong className="text-on-surface">{vendor.name}</strong> and reflected in the Finances module.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorDetails;
