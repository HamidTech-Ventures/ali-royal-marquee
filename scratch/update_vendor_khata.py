import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
vendor_details = os.path.join(frontend_src, "features", "vendors", "VendorDetails.tsx")
with open(vendor_details, "r") as f:
    code = f.read()

# Update calculations
calc_old = """  const totalPurchases = vendorExpenses.reduce((sum, e) => sum + e.amount, 0);
  const outstanding = vendorExpenses.filter(e => e.paymentStatus !== 'Paid').reduce((sum, e) => sum + e.amount, 0);"""
calc_new = """  const purchases = vendorExpenses.filter(e => e.category !== 'Vendor Payment');
  const payments = vendorExpenses.filter(e => e.category === 'Vendor Payment');

  const totalBilled = purchases.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = payments.reduce((sum, e) => sum + e.amount, 0);
  const outstanding = totalBilled - totalPaid;"""
code = code.replace(calc_old, calc_new)

# Update Tabs
code = code.replace("{ id: 'purchases', label: `Purchase History (${vendorExpenses.length})` }", "{ id: 'purchases', label: `Khata / Ledger (${vendorExpenses.length})` }")
code = code.replace("View Purchase History", "View Khata (Ledger)")

# Update KPI Cards
kpi_old = """          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
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
          </div>"""

kpi_new = """          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Billed</div>
            <div className="text-2xl font-bold text-on-surface">PKR {totalBilled.toLocaleString()}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-success">PKR {totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Outstanding Balance</div>
            <div className="text-2xl font-bold text-error">PKR {outstanding.toLocaleString()}</div>
          </div>"""
code = code.replace(kpi_old, kpi_new)

# Update Purchase History section
purchase_header = """            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Purchase History</h3>
              <Button variant="primary" icon="add" onClick={() => setExpenseModalOpen(true)}>Record New Expense</Button>
            </div>"""
khata_header = """            <div className="flex items-center justify-between">
              <h3 className="font-title-lg">Khata (Ledger)</h3>
              <Button variant="primary" icon="add" onClick={() => setExpenseModalOpen(true)}>Record Transaction</Button>
            </div>"""
code = code.replace(purchase_header, khata_header)

table_header_old = """                  <tr>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">Payment</th>
                    <th className="p-4 font-medium text-right">Amount (PKR)</th>
                  </tr>"""
table_header_new = """                  <tr>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-right">Billed (Debit)</th>
                    <th className="p-4 font-medium text-right">Paid (Credit)</th>
                  </tr>"""
code = code.replace(table_header_old, table_header_new)

row_old = """                    <tr key={expense.id} className="hover:bg-surface-variant/20">
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
                    </tr>"""
row_new = """                    <tr key={expense.id} className="hover:bg-surface-variant/20">
                      <td className="p-4 text-on-surface">{expense.dateStr}</td>
                      <td className="p-4 text-on-surface-variant">
                        <div className="font-medium text-on-surface">{expense.category}</div>
                        {expense.description && <div className="text-sm opacity-80">{expense.description}</div>}
                      </td>
                      <td className="p-4 text-right text-on-surface">
                        {expense.category !== 'Vendor Payment' ? expense.amount.toLocaleString() : '-'}
                      </td>
                      <td className="p-4 text-right text-success font-medium">
                        {expense.category === 'Vendor Payment' ? expense.amount.toLocaleString() : '-'}
                      </td>
                    </tr>"""
code = code.replace(row_old, row_new)

summary_old = """                <div className="flex gap-6 text-sm">
                  <span className="text-on-surface-variant">Total: <span className="font-bold text-on-surface">PKR {totalPurchases.toLocaleString()}</span></span>
                  <span className="text-on-surface-variant">Outstanding: <span className="font-bold text-error">PKR {outstanding.toLocaleString()}</span></span>
                </div>"""
summary_new = """                <div className="flex gap-6 text-sm">
                  <span className="text-on-surface-variant">Total Billed: <span className="font-bold text-on-surface">PKR {totalBilled.toLocaleString()}</span></span>
                  <span className="text-on-surface-variant">Total Paid: <span className="font-bold text-success">PKR {totalPaid.toLocaleString()}</span></span>
                  <span className="text-on-surface-variant">Outstanding: <span className="font-bold text-error">PKR {outstanding.toLocaleString()}</span></span>
                </div>"""
code = code.replace(summary_old, summary_new)

# Update Modal options
options_old = """            options={[
              { value: 'Vendor Payment', label: 'Vendor Payment' },
              { value: 'Catering', label: 'Catering' },
              { value: 'Decoration', label: 'Decoration' },
              { value: 'AV/Lighting', label: 'AV/Lighting' },
              { value: 'Security', label: 'Security' },
              { value: 'Florist', label: 'Florist' },
              { value: 'Other', label: 'Other' },
            ]}"""
options_new = """            options={[
              { value: 'Vendor Payment', label: 'Payment Made (Credit)' },
              { value: 'Catering', label: 'Purchase: Catering (Debit)' },
              { value: 'Decoration', label: 'Purchase: Decoration (Debit)' },
              { value: 'AV/Lighting', label: 'Purchase: AV/Lighting (Debit)' },
              { value: 'Security', label: 'Purchase: Security (Debit)' },
              { value: 'Florist', label: 'Purchase: Florist (Debit)' },
              { value: 'Other', label: 'Purchase: Other (Debit)' },
            ]}"""
code = code.replace(options_old, options_new)
code = code.replace("title=\"Record Expense\"", "title=\"Record Khata Transaction\"")
code = code.replace("Log a payment or purchase for", "Log a payment or purchase for")
code = code.replace("Save Expense", "Save Transaction")


with open(vendor_details, "w") as f:
    f.write(code)

print("Vendor Details updated.")
