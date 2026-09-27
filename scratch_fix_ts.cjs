const fs = require('fs');
const path = require('path');

const cwd = 'c:/My working/HamidTech_Ventures/Clients/marquee-management-system/frontend/src';

function replaceInFile(filepath, searchValue, replaceValue) {
    const fullPath = path.join(cwd, filepath);
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(searchValue, replaceValue);
    fs.writeFileSync(fullPath, content);
}

// DataGrid.tsx
let dg = fs.readFileSync(path.join(cwd, 'components/ui/DataGrid.tsx'), 'utf8');
dg = dg.replace(
    '          <tbody className="divide-y divide-surface-container-highest">',
    '          <tbody className="divide-y divide-surface-container-highest">\n            {loading && <tr><td colSpan={columns.length} className="py-12 text-center">Loading...</td></tr>}'
);
dg = dg.replace('{data.length === 0 ? (', '{!loading && data.length === 0 ? (');
dg = dg.replace('data.map((item) => (', '!loading && data.map((item) => (');
fs.writeFileSync(path.join(cwd, 'components/ui/DataGrid.tsx'), dg);

// Customers.tsx
let cus = fs.readFileSync(path.join(cwd, 'features/customers/Customers.tsx'), 'utf8');
cus = cus.replace(/const { success, error } = useToast\(\);/g, 'const { error } = useToast();');
cus = cus.replace(/const getCustomerBookings = .*?\n/g, ''); // If any definition existed?
cus = cus.replace(/getCustomerBookings\(customer\.id\)\.length/g, 'customer.totalBookings || 0');
cus = cus.replace(/getCustomerBookings\(customer\.id\)\.some\(\(booking: any\) => booking\.status === 'Pending'\)/g, 'false');
fs.writeFileSync(path.join(cwd, 'features/customers/Customers.tsx'), cus);

// CustomerDetails.tsx
let cd = fs.readFileSync(path.join(cwd, 'features/customers/CustomerDetails.tsx'), 'utf8');
cd = cd.replace(/const { success, error } = useToast\(\);/g, 'const { error } = useToast();');
cd = cd.replace(/b =>/g, '(b: any) =>');
cd = cd.replace(/booking =>/g, '(booking: any) =>');
fs.writeFileSync(path.join(cwd, 'features/customers/CustomerDetails.tsx'), cd);

// Payments.tsx
let pm = fs.readFileSync(path.join(cwd, 'features/payments/Payments.tsx'), 'utf8');
pm = pm.replace(/const { success, error } = useToast\(\);/g, 'const { error } = useToast();');
pm = pm.replace(/getCustomer\(item\.customerId\)\?.name/g, 'item.customerName');
pm = pm.replace(/import type { Payment } from '\.\.\/\.\.\/types';/g, '');
fs.writeFileSync(path.join(cwd, 'features/payments/Payments.tsx'), pm);

// Expenses.tsx
let ex = fs.readFileSync(path.join(cwd, 'features/expenses/Expenses.tsx'), 'utf8');
ex = ex.replace(/const { success, error } = useToast\(\);/g, 'const { error } = useToast();');
fs.writeFileSync(path.join(cwd, 'features/expenses/Expenses.tsx'), ex);

// BusinessFinances.tsx
let bf = fs.readFileSync(path.join(cwd, 'features/business/BusinessFinances.tsx'), 'utf8');
bf = bf.replace(/const { success, error } = useToast\(\);/g, 'const { error } = useToast();');
fs.writeFileSync(path.join(cwd, 'features/business/BusinessFinances.tsx'), bf);

// Dashboard.tsx
let db = fs.readFileSync(path.join(cwd, 'features/dashboard/Dashboard.tsx'), 'utf8');
db = db.replace(/, LineChart, Line/g, '');
fs.writeFileSync(path.join(cwd, 'features/dashboard/Dashboard.tsx'), db);

console.log('Fixed more errors.');
