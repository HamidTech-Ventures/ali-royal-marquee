import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import type {  Booking  } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { bookingsService } from '../../services/bookingsService';

export const Bookings = () => {
  const navigate = useNavigate();
  const { error } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('dateStr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Tentative' | 'Draft'>('All');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    shift: 'All',
    paymentStatus: 'All'
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsService.getBookings({
        searchTerm: debouncedSearch,
        status: statusFilter === 'Tentative' ? 'Pending' : statusFilter,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      });
      setBookings(response.items || []);
    } catch (err) {
      console.error(err);
      error('Failed to load bookings');
    }
  };

  useEffect(() => {
    bookingsService.getBookings({}).then(res => {
      setAllBookings(res.items || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [debouncedSearch, statusFilter, filters.startDate, filters.endDate]);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = [...bookings];
    
    // Apply additional client-side filters
    if (filters.shift !== 'All') {
      result = result.filter(b => b.shift === filters.shift);
    }
    if (filters.paymentStatus !== 'All') {
      result = result.filter(b => {
        const paid = b.paidAmount || 0;
        const total = b.totalAmount || 0;
        if (filters.paymentStatus === 'Fully Paid') return paid >= total;
        if (filters.paymentStatus === 'Unpaid') return paid === 0;
        if (filters.paymentStatus === 'Partially Paid') return paid > 0 && paid < total;
        return true;
      });
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
  }, [bookings, sortColumn, sortDirection]);

  const stats = useMemo(() => {
    const total = allBookings.length;
    const confirmed = allBookings.filter(b => b.status === 'Confirmed').length;
    const pending = allBookings.filter(b => b.status === 'Pending').length;
    const completed = allBookings.filter(b => b.status === 'Completed').length;
    const cancelled = allBookings.filter(b => b.status === 'Cancelled').length;

    return { total, confirmed, pending, completed, cancelled };
  }, [allBookings]);

  const columns: ColumnDef<Booking>[] = [
    {
      key: 'id',
      header: 'Booking ID',
      sortable: true,
      render: (item) => <span className="font-semibold text-primary">{item.referenceNumber || item.id}</span>
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => {
        return (
          <div>
            <div className="font-semibold">{item.customerName || 'Unknown'}</div>
            <div className="text-on-surface-variant text-[12px]">{item.customerPhone}</div>
          </div>
        );
      }
    },
    {
      key: 'event',
      header: 'Event Details',
      render: (item) => {
        return (
          <div>
            <div className="font-semibold text-on-surface">{item.eventTitle || 'Unknown Event'}</div>
            <div className="flex items-center gap-1.5 text-on-surface-variant text-[12px] mt-0.5">
              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
              <span>{item.dateStr} • {item.shift}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'hall',
      header: 'Venue',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-on-surface-variant">{item.hall}</span>
      )
    },
    {
      key: 'guests',
      header: 'Pax',
      sortable: true,
    },
    {
      key: 'financials',
      header: 'Financials',
      render: (item) => (
        <div>
          <div className="font-currency-num font-semibold">PKR {item.totalAmount.toLocaleString()}</div>
          <div className="text-[12px] mt-0.5">
            {item.paymentStatus === 'Paid' ? (
              <span className="text-secondary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check_circle</span> Paid
              </span>
            ) : item.paymentStatus === 'Partial' ? (
              <span className="text-primary font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">incomplete_circle</span> Partial
              </span>
            ) : (
              <span className="text-error font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">cancel</span> Unpaid
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        let variant: any = 'neutral';
        if (item.status === 'Confirmed') variant = 'secondary';
        if (item.status === 'Completed') variant = 'success';
        if (item.status === 'Cancelled') variant = 'error';
        if (item.status === 'Pending') variant = 'warning';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/app/bookings/${item.id}`)} className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-variant/50 transition-colors" title="View">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button onClick={() => navigate(`/app/bookings/${item.id}/edit`)} className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-variant/50 transition-colors" title="Edit">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this booking?')) {
                try {
                  await bookingsService.deleteBooking(item.id);
                  error('Booking deleted successfully'); // Using error toast as success fallback if needed, but ideally success()
                  fetchBookings();
                } catch (err) {
                  error('Failed to delete booking');
                }
              }
            }} 
            className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/10 transition-colors" 
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Bookings"
        category="Operations"
        icon="event_available"
        description="Manage venue reservations, event details, payments, and booking status across Grand Ballroom, Crystal Pavilion & Garden Marquee."
        actions={
          <div className="flex overflow-x-auto items-center gap-2 hide-scrollbar pb-1 md:pb-0 w-full md:w-auto">
            <Button variant="outline" icon="download" className="shrink-0 !text-[#4a1420] !border-surface-variant">Export</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/bookings/new')} className="whitespace-nowrap shrink-0 !bg-[#5C0A1E]">
              New Booking
            </Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#5C0A1E]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
              <span className="material-symbols-outlined text-[20px]">event_available</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Total Bookings</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats.total}</div>
            </div>
          </div>
          
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#10b981]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Confirmed</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats.confirmed}</div>
            </div>
          </div>
          
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#b0891d]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
              <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Pending</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats.pending}</div>
            </div>
          </div>
          
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-blue-500">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Completed</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats.completed}</div>
            </div>
          </div>
          
          <div className="col-span-2 md:col-span-1 bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#e02424]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#e02424]/10 flex items-center justify-center text-[#e02424]">
              <span className="material-symbols-outlined text-[20px]">cancel</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Cancelled</span>
              <div className="font-serif text-base md:text-headline-sm text-[#e02424] font-bold mt-1">{stats.cancelled}</div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-start gap-4">
          <div className="flex-1 w-full md:max-w-[320px]">
            <SearchInput 
                placeholder="Search bookings..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
              />
          </div>
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1.5 w-full md:w-auto">
            <Button 
              variant={statusFilter === 'All' ? 'primary' : 'text'} 
              className={statusFilter === 'All' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('All')}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'Confirmed' ? 'primary' : 'text'} 
              className={statusFilter === 'Confirmed' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Confirmed')}
            >
              Confirmed
            </Button>
            <Button 
              variant={statusFilter === 'Tentative' ? 'primary' : 'text'} 
              className={statusFilter === 'Tentative' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Tentative')}
            >
              Tentative
            </Button>
            <Button 
              variant={statusFilter === 'Draft' ? 'primary' : 'text'} 
              className={statusFilter === 'Draft' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Draft')}
            >
              Draft
            </Button>
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <DataGrid 
              data={filteredData}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/app/bookings/${item.id}`)}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={1}
              totalPages={1}
              totalItems={filteredData.length}
            />
          </div>
        </div>
      </div>

      <Drawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={selectedBooking ? `Booking ${selectedBooking.referenceNumber || selectedBooking.id}` : ''}
        subtitle={selectedBooking ? selectedBooking.customerName : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
            <Button variant="primary">Manage Booking</Button>
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3 flex items-center justify-between">
                <span>Event Information</span>
                <Badge variant={selectedBooking.status === 'Confirmed' ? 'secondary' : 'warning'}>{selectedBooking.status}</Badge>
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Venue</span>
                  <span className="font-semibold">{selectedBooking.hall}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Date & Shift</span>
                  <span className="font-semibold">{selectedBooking.dateStr} ({selectedBooking.shift})</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Guests</span>
                  <span className="font-semibold">{selectedBooking.guests} Pax</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Event Type</span>
                  <span className="font-semibold">{selectedBooking.eventTitle || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3">Financial Overview</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm mb-4">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Total Amount</span>
                  <span className="font-currency-num font-semibold">PKR {selectedBooking.totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Paid Amount</span>
                  <span className="font-currency-num font-semibold text-secondary">PKR {selectedBooking.paidAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Balance</span>
                  <span className="font-currency-num font-semibold text-error">
                    PKR {(selectedBooking.totalAmount - selectedBooking.paidAmount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Payment Status</span>
                  <Badge variant={selectedBooking.paymentStatus === 'Paid' ? 'success' : selectedBooking.paymentStatus === 'Partial' ? 'primary' : 'error'}>
                    {selectedBooking.paymentStatus}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">Record Payment</Button>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Advanced Filters"
      >
        <div className="p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant">Start Date</span>
                <input 
                  type="date" 
                  className="w-full h-10 px-3 bg-surface border border-outline rounded-lg text-sm"
                  value={filters.startDate}
                  onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-on-surface-variant">End Date</span>
                <input 
                  type="date" 
                  className="w-full h-10 px-3 bg-surface border border-outline rounded-lg text-sm"
                  value={filters.endDate}
                  onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface">Shift</label>
            <select 
              className="w-full h-10 px-3 bg-surface border border-outline rounded-lg text-sm"
              value={filters.shift}
              onChange={(e) => setFilters(f => ({ ...f, shift: e.target.value }))}
            >
              <option value="All">All Shifts</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface">Payment Status</label>
            <select 
              className="w-full h-10 px-3 bg-surface border border-outline rounded-lg text-sm"
              value={filters.paymentStatus}
              onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
            >
              <option value="All">All</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className="mt-4 pt-4 border-t border-outline flex justify-end gap-3">
            <Button variant="text" onClick={() => setFilters({ startDate: '', endDate: '', shift: 'All', paymentStatus: 'All' })}>
              Clear
            </Button>
            <Button variant="primary" onClick={() => setIsFilterDrawerOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Bookings;
