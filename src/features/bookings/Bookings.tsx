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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Tentative'>('All');

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
        status: statusFilter === 'Tentative' ? 'Pending' : statusFilter
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
  }, [debouncedSearch, statusFilter]);

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
    const tentative = allBookings.filter(b => b.status === 'Pending').length;
    const balance = allBookings.reduce((sum, b) => sum + ((b.totalAmount || 0) - (b.paidAmount || 0)), 0);
    
    // Upcoming (next 14 days)
    const now = new Date();
    const in14Days = new Date();
    in14Days.setDate(now.getDate() + 14);
    
    const upcoming = allBookings.filter(b => {
      if (!b.dateStr) return false;
      const bDate = new Date(b.dateStr);
      return bDate >= now && bDate <= in14Days;
    }).length;

    const formatCurrency = (val: number) => {
      if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
      return val.toString();
    };

    return { total, confirmed, tentative, upcoming, balanceStr: formatCurrency(balance) };
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
    }
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Bookings"
        category="Operations"
        icon="event_available"
        description="Manage venue reservations, event details, payments, and booking status across Grand Ballroom, Crystal Pavilion & Garden Marquee."
        actions={
          <>
            <Button variant="outline" icon="download">Export</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/bookings/new')}>New Booking</Button>
          </>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Bookings</span>
              <span className="material-symbols-outlined text-[18px] text-primary-container">event_available</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-primary font-bold">{stats.total}</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Confirmed</span>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-on-surface font-bold">{stats.confirmed}</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Tentative</span>
              <span className="material-symbols-outlined text-[18px] text-secondary-container">schedule</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-on-surface font-bold">{stats.tentative}</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Upcoming (14d)</span>
              <span className="material-symbols-outlined text-[18px] text-primary">celebration</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-on-surface font-bold">{stats.upcoming}</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Balance</span>
              <span className="material-symbols-outlined text-[18px] text-error">receipt_long</span>
            </div>
            <div className="mt-3 font-currency-num text-currency-num text-primary font-bold">PKR {stats.balanceStr}</div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-surface-container-lowest p-3 rounded shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5">
            <Button 
              variant={statusFilter === 'All' ? 'primary' : 'text'} 
              className={statusFilter === 'All' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('All')}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === 'Confirmed' ? 'primary' : 'text'} 
              className={statusFilter === 'Confirmed' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Confirmed')}
            >
              Confirmed
            </Button>
            <Button 
              variant={statusFilter === 'Tentative' ? 'primary' : 'text'} 
              className={statusFilter === 'Tentative' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Tentative')}
            >
              Tentative
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput 
              placeholder="Search bookings..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
            <Button variant="outline" icon="filter_list">More Filters</Button>
          </div>
        </div>

        {/* DATA GRID */}
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
    </div>
  );
};

export default Bookings;
