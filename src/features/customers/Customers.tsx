import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import type { Customer } from '../../types';
import { useNavigate } from 'react-router-dom';
import { AddCustomerModal } from './AddCustomerModal';
import { customersService } from '../../services/customersService';
import { useToast } from '../../context/ToastContext';

export const Customers = () => {
  const navigate = useNavigate();
  const { error } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [tierFilter, setTierFilter] = useState<'All' | 'VIP' | 'Standard' | 'Corporate'>('All');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customersService.getCustomers();
      setCustomers(data);
    } catch (err) {
      error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = [...customers];
    
    if (tierFilter !== 'All') {
      result = result.filter(c => c.tier === tierFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.id.toLowerCase().includes(lowerSearch) ||
        c.name.toLowerCase().includes(lowerSearch) ||
        c.phone.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(lowerSearch))
      );
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
  }, [customers, searchTerm, tierFilter, sortColumn, sortDirection]);

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      sortable: true,
      render: (item) => <span className="font-semibold text-primary">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Client Details',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center shrink-0">
            {item.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-on-surface">{item.name}</div>
            <div className="text-[12px] text-on-surface-variant mt-0.5">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone / WhatsApp',
      render: (item) => (
        <span className="font-medium">{item.phone}</span>
      )
    },
    {
      key: 'tier',
      header: 'Category / Tier',
      sortable: true,
      render: (item) => {
        let variant: any = 'neutral';
        if (item.tier === 'VIP') variant = 'secondary';
        if (item.tier === 'Corporate') variant = 'primary';
        return <Badge variant={variant}>{item.tier}</Badge>;
      }
    },
    {
      key: 'totalSpent',
      header: 'Lifetime Value',
      sortable: true,
      render: (item) => (
        <div className="font-currency-num font-semibold text-primary">
          PKR {item.totalSpent.toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Customer Management & CRM"
        category="Client Relationship Ledger"
        icon="groups"
        description="Review VIP patronage, historical ledger balances, banquet culinary riders, and high-stakes family event preferences."
        actions={
          <>
            <Button variant="outline" icon="download">Export Roster</Button>
            <Button variant="primary" icon="person_add" onClick={() => setIsAddModalOpen(true)}>New Customer</Button>
          </>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Verified</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">groups</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-primary font-bold">1,284</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">New This Month</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">how_to_reg</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-on-surface font-bold">86</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Repeat Clientele</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">workspace_premium</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-on-surface font-bold">342</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">VIP / Elite</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">stars</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-on-surface font-bold">84</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden col-span-2 md:col-span-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-surface-tint"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Ledger Receivables</span>
              <span className="material-symbols-outlined text-[18px] text-error">account_balance_wallet</span>
            </div>
            <div className="mt-3 font-currency-num text-currency-num text-primary font-bold">PKR 2.48M</div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-surface-container-lowest p-3 rounded shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5">
            <Button 
              variant={tierFilter === 'All' ? 'primary' : 'text'} 
              className={tierFilter === 'All' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setTierFilter('All')}
            >
              All Clients
            </Button>
            <Button 
              variant={tierFilter === 'VIP' ? 'primary' : 'text'} 
              className={tierFilter === 'VIP' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setTierFilter('VIP')}
            >
              VIP Elite
            </Button>
            <Button 
              variant={tierFilter === 'Corporate' ? 'primary' : 'text'} 
              className={tierFilter === 'Corporate' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setTierFilter('Corporate')}
            >
              Corporate
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput 
              placeholder="Search customers..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
        <DataGrid 
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => navigate(`/app/customers/${item.id}`)}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={1}
          totalPages={1}
          totalItems={filteredData.length}
          loading={loading}
        />
      </div>

      <Drawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || ''}
        subtitle={selectedCustomer ? `ID: ${selectedCustomer.id} | Tier: ${selectedCustomer.tier}` : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Close</Button>
            <Button variant="primary">Edit Profile</Button>
          </div>
        }
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 gap-y-4 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Primary Phone</span>
                  <span className="font-semibold flex items-center gap-2">
                    {selectedCustomer.phone}
                    <Button variant="icon" icon="chat" title="WhatsApp" className="h-6 w-6" />
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Email Address</span>
                  <span className="font-semibold">{selectedCustomer.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-title-md">Booking History</h3>
                <span className="font-currency-num font-bold text-primary">PKR {selectedCustomer.totalSpent.toLocaleString()} LTV</span>
              </div>
              <div className="space-y-3">
                {[]?.length === 0 ? (
                  <div className="text-on-surface-variant text-body-sm">No booking history available.</div>
                ) : (
                  [].map((booking: any) => (
                    <div key={booking.id} className="bg-surface-container-lowest p-3 rounded border border-surface-container-highest flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{booking.hall}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{booking.dateStr} • {booking.guests} Pax</div>
                      </div>
                      <div className="text-right">
                        <div className="font-currency-num font-semibold text-sm text-primary">PKR {booking.totalAmount.toLocaleString()}</div>
                        <Badge variant={booking.status === 'Confirmed' ? 'secondary' : 'neutral'} className="mt-1 text-[10px] px-1.5 py-0">{booking.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
      
      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchCustomers}
      />
    </div>
  );
};

export default Customers;
