import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
vendor_details = os.path.join(frontend_src, "features", "vendors", "VendorDetails.tsx")
with open(vendor_details, "r") as f:
    code = f.read()

# 1. Update State
state_old = """  const [expenseForm, setExpenseForm] = useState({
    category: 'Vendor Payment',
    description: '',
    amount: '',
  });"""
state_new = """  const [expenseForm, setExpenseForm] = useState({
    category: 'Catering',
    description: '',
    totalBill: '',
    paidAmount: '',
  });"""
code = code.replace(state_old, state_new)

# 2. Update handleRecordExpense
handler_old = """  const handleRecordExpense = async () => {
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
  };"""

handler_new = """  const handleRecordExpense = async () => {
    if (!vendor) return;
    if (!expenseForm.description) {
      showError('Please provide a description.');
      return;
    }
    setSavingExpense(true);
    try {
      const billAmount = parseFloat(expenseForm.totalBill) || 0;
      const paidAmount = parseFloat(expenseForm.paidAmount) || 0;
      
      if (billAmount === 0 && paidAmount === 0) {
        showError('Please enter either a bill amount or a paid amount.');
        setSavingExpense(false);
        return;
      }

      // 1. Record the Purchase (Total Bill)
      if (billAmount > 0) {
        await financesService.recordExpense({
          category: expenseForm.category,
          description: expenseForm.description,
          amount: billAmount,
          expenseDate: new Date().toISOString(),
          vendorId: vendor.id,
          eventId: null,
        });
      }

      // 2. If there's a payment, record the Payment
      if (paidAmount > 0) {
        await financesService.recordExpense({
          category: 'Vendor Payment',
          description: billAmount > 0 ? `Payment for: ${expenseForm.description}` : expenseForm.description,
          amount: paidAmount,
          expenseDate: new Date().toISOString(),
          vendorId: vendor.id,
          eventId: null,
        });
      }

      success('Transaction recorded successfully');
      setExpenseModalOpen(false);
      setExpenseForm({ category: 'Catering', description: '', totalBill: '', paidAmount: '' });
      fetchExpenses(vendor);
    } catch (err) {
      console.error('Failed to record transaction:', err);
      showError('Failed to record transaction. Please try again.');
    } finally {
      setSavingExpense(false);
    }
  };"""
code = code.replace(handler_old, handler_new)

# 3. Update Modal Options
options_old = """            options={[
              { value: 'Vendor Payment', label: 'Payment Made (Credit)' },
              { value: 'Catering', label: 'Purchase: Catering (Debit)' },
              { value: 'Decoration', label: 'Purchase: Decoration (Debit)' },
              { value: 'AV/Lighting', label: 'Purchase: AV/Lighting (Debit)' },
              { value: 'Security', label: 'Purchase: Security (Debit)' },
              { value: 'Florist', label: 'Purchase: Florist (Debit)' },
              { value: 'Other', label: 'Purchase: Other (Debit)' },
            ]}"""
options_new = """            options={[
              { value: 'Catering', label: 'Catering' },
              { value: 'Decoration', label: 'Decoration' },
              { value: 'AV/Lighting', label: 'AV/Lighting' },
              { value: 'Security', label: 'Security' },
              { value: 'Florist', label: 'Florist' },
              { value: 'Other', label: 'Other' },
            ]}"""
code = code.replace(options_old, options_new)

# 4. Update Inputs
inputs_old = """          <Input
            label="Amount (PKR) *"
            name="amount"
            type="number"
            value={expenseForm.amount}
            onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="e.g. 50000"
          />"""
inputs_new = """          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Billed (PKR)"
              name="totalBill"
              type="number"
              value={expenseForm.totalBill}
              onChange={e => setExpenseForm(prev => ({ ...prev, totalBill: e.target.value }))}
              placeholder="e.g. 50000"
            />
            <Input
              label="Paid Now (PKR)"
              name="paidAmount"
              type="number"
              value={expenseForm.paidAmount}
              onChange={e => setExpenseForm(prev => ({ ...prev, paidAmount: e.target.value }))}
              placeholder="e.g. 20000"
            />
          </div>
          <p className="text-xs text-on-surface-variant opacity-80 -mt-2">
            Leave "Total Billed" as 0 if you are only recording a past payment.
          </p>"""
code = code.replace(inputs_old, inputs_new)

with open(vendor_details, "w") as f:
    f.write(code)

print("Vendor Details Modal updated.")
