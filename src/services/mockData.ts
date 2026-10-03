import type {  
  Customer, 
  Event, 
  Payment, 
  Expense, 
  InventoryItem, 
  Vendor, 
  Staff, 
  Notification 
 } from '../types';

export const mockCustomers: Customer[] = [
  { id: 'CUST-001', name: 'Ahsan Malik', phone: '+92 300 1234567', email: 'ahsan@example.com', tier: 'VIP', totalSpent: 2450000 },
  { id: 'CUST-002', name: 'Fatima Zahra', phone: '+92 321 7654321', email: 'fatima.z@example.com', tier: 'Standard', totalSpent: 0 },
  { id: 'CUST-003', name: 'Bilal Ahmed', phone: '+92 333 9876543', email: 'bilal@corp.com', tier: 'Corporate', totalSpent: 1200000 },
  { id: 'CUST-004', name: 'Ayesha Khan', phone: '+92 345 1122334', email: 'ayesha.k@example.com', tier: 'Standard', totalSpent: 450000 },
  { id: 'CUST-005', name: 'Usman Tariq', phone: '+92 300 9988776', email: 'usman.t@example.com', tier: 'VIP', totalSpent: 3100000 },
];

export const mockEnquiries: any[] = [
  { id: 'ENQ-2042', customerId: 'CUST-002', eventName: 'Fatima\'s Mehndi', preferredDate: '2026-10-15', guestCount: 350, status: 'Quoted', createdAt: '2026-09-05' },
  { id: 'ENQ-2043', customerId: 'CUST-004', eventName: 'Corporate Annual Dinner', preferredDate: '2026-11-20', guestCount: 500, status: 'New', createdAt: '2026-09-06' },
  { id: 'ENQ-2044', customerId: 'CUST-005', eventName: 'Usman Walima', preferredDate: '2026-12-05', guestCount: 800, status: 'Converted', createdAt: '2026-08-20' },
  { id: 'ENQ-2045', customerId: 'CUST-001', eventName: 'Anniversary Party', preferredDate: '2026-09-25', guestCount: 150, status: 'Negotiating', createdAt: '2026-09-01' },
];

export const mockBookings: any[] = [
  { id: 'BK-1042', customerId: 'CUST-001', eventId: 'EV-2042', hall: 'Grand Ballroom', dateStr: '2026-09-08', shift: 'Night (Cleanup)', guests: 450, totalAmount: 1850000, paidAmount: 1700000, status: 'Confirmed', paymentStatus: 'Partial', createdAt: '2026-07-15' },
  { id: 'BK-1043', customerId: 'CUST-003', eventId: 'EV-2043', hall: 'Royal Marquee', dateStr: '2026-09-12', shift: 'Day', guests: 600, totalAmount: 2100000, paidAmount: 2100000, status: 'Confirmed', paymentStatus: 'Paid', createdAt: '2026-08-01' },
  { id: 'BK-1044', customerId: 'CUST-005', eventId: 'EV-2044', hall: 'Grand Ballroom', dateStr: '2026-12-05', shift: 'Night (Cleanup)', guests: 800, totalAmount: 3100000, paidAmount: 500000, status: 'Confirmed', paymentStatus: 'Partial', createdAt: '2026-08-25' },
];

export const mockEvents: Event[] = [
  { id: 'EV-2042', bookingId: 'BK-1042', title: 'Ahsan Malik Walima', dateStr: '2026-09-08', startTime: '19:00', endTime: '23:30', status: 'Upcoming', manager: 'Ali Raza' },
  { id: 'EV-2043', bookingId: 'BK-1043', title: 'TechCorp Annual Summit', dateStr: '2026-09-12', startTime: '09:00', endTime: '16:00', status: 'Upcoming', manager: 'Sara Khan' },
  { id: 'EV-2044', bookingId: 'BK-1044', title: 'Usman Tariq Walima', dateStr: '2026-12-05', startTime: '19:00', endTime: '23:59', status: 'Upcoming', manager: 'Ali Raza' },
];

export const mockPayments: Payment[] = [
  { id: 'PAY-8012', bookingId: 'BK-1042', customerId: 'CUST-001', amount: 1000000, method: 'Bank Transfer', status: 'Completed', dateStr: '2026-07-15', reference: 'TRX-99812' },
  { id: 'PAY-8013', bookingId: 'BK-1042', customerId: 'CUST-001', amount: 700000, method: 'Cheque', status: 'Completed', dateStr: '2026-08-10', reference: 'CHQ-4451' },
  { id: 'PAY-8014', bookingId: 'BK-1043', customerId: 'CUST-003', amount: 2100000, method: 'Bank Transfer', status: 'Completed', dateStr: '2026-08-05', reference: 'TRX-10023' },
  { id: 'PAY-8015', bookingId: 'BK-1044', customerId: 'CUST-005', amount: 500000, method: 'Card', status: 'Completed', dateStr: '2026-08-25', reference: 'CRD-8821' },
];

export const mockVendors: Vendor[] = [
  { id: 'VND-001', name: 'Fresh Farms Poultry', category: 'Catering Supplies', contactName: 'Rafiq Ahmed', phone: '+92 300 1112222', status: 'Active' },
  { id: 'VND-002', name: 'Attock Petroleum', category: 'Fuel & Utilities', contactName: 'Tariq Mehmood', phone: '+92 333 4445555', status: 'Active' },
  { id: 'VND-003', name: 'Royal Florals', category: 'Decorations', contactName: 'Zainab Ali', phone: '+92 321 9998888', status: 'Active' },
];

export const mockInventory: InventoryItem[] = [
  { id: 'INV-001', name: 'Banquet Chairs (Gold)', category: 'Furniture', quantity: 850, minQuantity: 1000, unit: 'pcs', status: 'Low Stock' },
  { id: 'INV-002', name: 'Round Tables (10-seater)', category: 'Furniture', quantity: 150, minQuantity: 100, unit: 'pcs', status: 'In Stock' },
  { id: 'INV-003', name: 'Chafing Dishes', category: 'Catering', quantity: 45, minQuantity: 50, unit: 'pcs', status: 'Low Stock' },
  { id: 'INV-004', name: 'Generator Diesel', category: 'Utilities', quantity: 1200, minQuantity: 500, unit: 'L', status: 'In Stock' },
];

export const mockStaff: Staff[] = [
  { id: 'EMP-1001', name: 'Zahid Khan', role: 'Manager', phone: '+92 300 1234567', shift: 'Afternoon (Lunch)', status: 'Active' },
  { id: 'EMP-1002', name: 'Farooq Ahmed', role: 'Chef', phone: '+92 300 1234568', shift: 'Afternoon (Lunch)', status: 'Active' },
  { id: 'EMP-1003', name: 'Ali Raza', role: 'Supervisor', phone: '+92 300 1234569', shift: 'Evening (Dinner)', status: 'Active' },
  { id: 'EMP-1004', name: 'Kamran Shah', role: 'Security', phone: '+92 300 1234570', shift: 'Night (Cleanup)', status: 'On Leave' },
  { id: 'EMP-1005', name: 'Tariq Mehmood', role: 'Waiter', phone: '+92 300 1234571', shift: 'Evening (Dinner)', status: 'Active' }
];

export const mockExpenses: Expense[] = [
  { id: 'EXP-4001', dateStr: '12 Sep 2026', category: 'Procurement', description: 'Catering raw materials for EV-2042', amount: 350000, status: 'Approved', vendorId: 'VEN-01', bookingId: 'BK-1042' },
  { id: 'EXP-4002', dateStr: '11 Sep 2026', category: 'Overheads', description: 'Diesel for generators (800L)', amount: 240000, status: 'Approved' },
  { id: 'EXP-4003', dateStr: '12 Sep 2026', category: 'Procurement', description: 'Fresh floral arrangements for stage', amount: 85000, status: 'Pending', vendorId: 'VEN-03' },
  { id: 'EXP-4004', dateStr: '10 Sep 2026', category: 'Maintenance', description: 'HVAC servicing for Crystal Pavilion', amount: 45000, status: 'Approved' },
  { id: 'EXP-4005', dateStr: '13 Sep 2026', category: 'Procurement', description: 'Extra crockery rental', amount: 25000, status: 'Pending', vendorId: 'VEN-02', bookingId: 'BK-1043' }
];

export const mockNotifications: Notification[] = [
  { id: 'NOTIF-01', title: 'Payment overdue', description: 'Ahsan Malik has PKR 150,000 outstanding for BK-1042.', type: 'alert', read: false, link: '/app/payments', timestamp: '10 mins ago' },
  { id: 'NOTIF-02', title: 'Upcoming event', description: 'Walima for Ahsan Malik starts tomorrow at 7:00 PM.', type: 'info', read: false, link: '/app/events/EV-2042', timestamp: '1 hour ago' },
  { id: 'NOTIF-03', title: 'Low inventory', description: 'Banquet chairs (Gold) are below reorder level (850/1000).', type: 'warning', read: false, link: '/app/inventory', timestamp: '2 hours ago' },
  { id: 'NOTIF-04', title: 'New enquiry', description: 'A new high-priority corporate enquiry was received.', type: 'success', read: true, link: '/app/enquiries', timestamp: '1 day ago' },
];
