import sys

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\payments\Payments.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Save Expense button to be enabled
btn_search = """<Button variant="primary" onClick={handleAddExpenseSubmit} disabled={true}>Save Expense</Button>"""
btn_replace = """<Button variant="primary" onClick={handleAddExpenseSubmit} disabled={submittingExpense || !newExpense.amount || !newExpense.description}>Save Expense</Button>"""
content = content.replace(btn_search, btn_replace)

# 2. Update filteredPayments search logic to use real customerName if available
filter_search = """mockCustomerName(p.customerId).toLowerCase().includes(lower) ||
        mockEventName(p.bookingId).toLowerCase().includes(lower) ||"""
filter_replace = """(p.customerName || mockCustomerName(p.customerId)).toLowerCase().includes(lower) ||
        mockEventName(p.bookingId).toLowerCase().includes(lower) ||"""
content = content.replace(filter_search, filter_replace)

# 3. Update the paymentColumns render to use real customerName
columns_search = """    { key: 'customer', header: 'Client & Booking', render: (i) => (
      <div>
        <div className="font-bold text-on-surface">{mockCustomerName(i.customerId)}</div>
        <div className="text-[12px] text-on-surface-variant mt-0.5">{mockEventName(i.bookingId)}</div>
      </div>
    ) },"""
columns_replace = """    { key: 'customer', header: 'Client & Booking', render: (i) => (
      <div>
        <div className="font-bold text-on-surface">{i.customerName || mockCustomerName(i.customerId)}</div>
        <div className="text-[12px] text-on-surface-variant mt-0.5">{mockEventName(i.bookingId)}</div>
      </div>
    ) },"""
content = content.replace(columns_search, columns_replace)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating Payments.tsx")
