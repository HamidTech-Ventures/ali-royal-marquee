export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: 'VIP' | 'Standard' | 'Corporate';
  totalSpent: number;
};

export type EnquiryStatus = 'Inquiry' | 'SiteVisit' | 'TokenReceived' | 'AdvancePaid' | 'Cancelled';
export type EnquirySource = 'WalkIn' | 'Phone' | 'Email' | 'SocialMedia' | 'Referral' | 'Website' | 'Other';
export type EventShift = 'Afternoon' | 'Evening';
export type FollowUpType = 'Call' | 'Email' | 'Meeting' | 'Message' | 'Other';
export type FollowUpStatus = 'Pending' | 'Completed' | 'Cancelled';
export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
export type EnquiryActivityType = 'Created' | 'Updated' | 'StatusChanged' | 'NoteAdded' | 'FollowUpScheduled' | 'FollowUpCompleted' | 'QuotationSent' | 'Converted' | 'MarkedLost' | 'Other';

export interface CreateEnquiryRequest {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  eventName: string;
  eventType?: string;
  preferredDate: string; // YYYY-MM-DD
  alternativeDate?: string; // YYYY-MM-DD
  shift: EventShift;
  bufferCapacity: number;
  partitionRequired: boolean;
  guestCount: number;
  preferredVenueId?: string;
  budget?: number;
  notes?: string;
  source: EnquirySource;
  assignedToId?: string;
}

export interface UpdateEnquiryRequest {
  eventName: string;
  eventType?: string;
  preferredDate: string; // YYYY-MM-DD
  alternativeDate?: string; // YYYY-MM-DD
  shift: EventShift;
  bufferCapacity: number;
  partitionRequired: boolean;
  guestCount: number;
  preferredVenueId?: string;
  budget?: number;
  source: EnquirySource;
  assignedToId?: string;
  notes?: string;
  estimatedValue?: number;
}

export type Enquiry = {
    id: string;
    referenceNumber: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    eventName: string;
    eventType?: string;
    preferredDate: string;
    guestCount: number;
    source: EnquirySource;
    shift: EventShift;
    bufferCapacity: number;
    partitionRequired: boolean;
    status: EnquiryStatus;
    assignedToName?: string;
    estimatedValue?: number;
    createdAt: string;
};

export type EnquiryDetail = Enquiry & {
    alternativeDate?: string;
    preferredVenueId?: string;
    preferredVenueName?: string;
    budget?: number;
    assignedToId?: string;
    notes?: string;
    lostReason?: string;
    followUps: EnquiryFollowUp[];
    quotations: EnquiryQuotation[];
    activities: EnquiryActivity[];
};

export type EnquiryFollowUp = {
    id: string;
    dueDate: string;
    dueTime?: string;
    type: FollowUpType;
    notes?: string;
    assignedToId?: string;
    assignedToName?: string;
    status: FollowUpStatus;
    completedAt?: string;
    completedByName?: string;
    result?: string;
};

export interface EnquiryStatsDto {
  totalEnquiries: number;
  newThisWeek: number;
  followUpsDue: number;
  conversionRate: number;
  estimatedPipelineValue: number;
}

export interface EnquiryLifecycleDto {
  inquiry: number;
  siteVisit: number;
  tokenReceived: number;
  advancePaid: number;
  cancelled: number;
}

export type QuotationItemType = 'PerHead' | 'Fixed';

export type QuotationLineItem = {
    id: string;
    itemType: QuotationItemType;
    category: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
    sortOrder: number;
};

export type EnquiryQuotation = {
    id: string;
    quotationReference: string;
    version: number;
    subtotal: number;
    discountAmount: number;
    serviceChargeAmount: number;
    praTaxAmount: number;
    grandTotal: number;
    tokenMoney: number;
    advancePayment: number;
    validUntil?: string;
    status: QuotationStatus;
    notes?: string;
    creatorName: string;
    createdAt: string;
    lineItems: QuotationLineItem[];
};

export type EnquiryActivity = {
    id: string;
    type: EnquiryActivityType;
    description: string;
    performedByName: string;
    timestamp: string;
};

export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export type Booking = {
  id: string;
  referenceNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  eventId?: string; // Links to Event if generated
  eventTitle?: string;
  venueId?: string;
  hall: string;
  dateStr: string;
  shift: string;
  guests: number;
  totalAmount: number;
  paidAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Draft';

export type Event = {
  id: string;
  bookingId: string;
  title: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  manager: string;
  readinessScore?: number;
};

export type Payment = {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
  status: 'Completed' | 'Pending' | 'Failed';
  dateStr: string;
  reference: string;
};


export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Expense {
  id: string;
  dateStr: string;
  category: string;
  description: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  paymentStatus?: 'Paid' | 'Unpaid';
  vendorId?: string;
  bookingId?: string;
}

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  itemType: 'Fixed Asset' | 'Consumable';
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  unitPrice?: number;
  location?: string;
  movements?: InventoryMovement[];
  reservations?: InventoryReservation[];
};

export type StaffRole = 'Manager' | 'Supervisor' | 'Waiter' | 'Chef' | 'Security';
export type Staff = {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  shift: 'Afternoon (Lunch)' | 'Evening (Dinner)' | 'Night (Cleanup)';
  status: 'Active' | 'On Leave' | 'Inactive';
  salary?: number;
  cnic: string;
  compensationType: 'Fixed Monthly' | 'Per-Event/Daily Wage';
  createdAt?: string;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  read: boolean;
  link?: string;
  timestamp: string;
};

export type Package = {
  id: string;
  name: string;
  type: string;
  price: number;
  status: 'Active' | 'Draft' | 'Archived';
  minGuests?: number;
};

export type InventoryMovement = {
  id: string;
  type: 'IN' | 'OUT' | 'RELOCATE';
  quantity: number;
  notes?: string;
  reference?: string;
  createdAt: string;
};

export type InventoryReservation = {
  id: string;
  eventId: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
};
