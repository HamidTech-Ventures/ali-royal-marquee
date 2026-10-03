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
  const { error, success } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [tierFilter, setTierFilter] = useState<'All' | 'VIP' | 'Standard' | 'Corporate'>('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, tierFilter, sortColumn, sortDirection]);

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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      // Optimistically remove the customer from the UI immediately to prevent double-clicks
      // and bypass any aggressive browser caching on subsequent GET requests.
      setCustomers(prev => prev.filter(c => c.id !== id));
      
      try {
        await customersService.deleteCustomer(id);
        success('Customer deleted successfully');
        fetchCustomers();
      } catch (err: any) {
        console.error('Delete customer error:', err);
        // Revert on failure
        fetchCustomers();
        
        if (err.response && err.response.data && err.response.data.title) {
          error(err.response.data.title);
        } else if (err.response && err.response.data && err.response.data.message) {
          error(err.response.data.message);
        } else {
          error(`Failed to delete customer: ${err.message || 'Unknown error'}`);
        }
      }
    }
  };

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

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      sortable: true,
      render: (item) => <span className="font-semibold text-primary">CST-{item.id.substring(0, 6).toUpperCase()}</span>
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
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/app/customers/${item.id}`)} className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-variant/50 transition-colors" title="View">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button onClick={() => { setCustomerToEdit(item); setIsAddModalOpen(true); }} className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-variant/50 transition-colors" title="Edit">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/10 transition-colors" title="Delete">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Customer Management & CRM"
        category="Client Relationship Ledger"
        icon="groups"
        description="Review VIP patronage, historical ledger balances, banquet culinary riders, and high-stakes family event preferences."
        actions={
          <div className="flex overflow-x-auto items-center gap-2 hide-scrollbar pb-1 md:pb-0 w-full md:w-auto">
            <Button variant="outline" icon="download" className="shrink-0 !text-[#4a1420] !border-surface-variant">Export Roster</Button>
            <Button variant="primary" icon="person_add" onClick={() => setIsAddModalOpen(true)} className="whitespace-nowrap shrink-0 !bg-[#5C0A1E]">New Customer</Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        {/* KPI Summary */}
        {(() => {
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const totalVerified = customers.length;
          const newThisMonth = customers.filter(c => {
            const d = new Date(c.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          }).length;
          const repeatClientele = customers.filter(c => (c.bookingsCount || 0) > 1).length;
          const vipElite = customers.filter(c => c.tier === 'VIP').length;
          const ledgerReceivables = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#5C0A1E]">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                  <span className="material-symbols-outlined text-[20px]">groups</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Total Verified</span>
                  <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{totalVerified.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#10b981]">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">New This Month</span>
                  <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{newThisMonth.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#b0891d]">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                  <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Repeat Clientele</span>
                  <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{repeatClientele.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#4a1420]">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#4a1420]/10 flex items-center justify-center text-[#4a1420]">
                  <span className="material-symbols-outlined text-[20px]">stars</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">VIP / Elite</span>
                  <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{vipElite.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="col-span-2 md:col-span-1 bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#e02424]">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#e02424]/10 flex items-center justify-center text-[#e02424]">
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Ledger Receivables</span>
                  <div className="font-serif text-base md:text-headline-sm text-[#e02424] font-bold mt-1">PKR {(ledgerReceivables / 1000000).toFixed(2)}M</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1.5 w-full">
            <Button 
              variant={tierFilter === 'All' ? 'primary' : 'text'} 
              className={tierFilter === 'All' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setTierFilter('All')}
            >
              All Clients
            </Button>
            <Button 
              variant={tierFilter === 'VIP' ? 'primary' : 'text'} 
              className={tierFilter === 'VIP' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setTierFilter('VIP')}
            >
              VIP Elite
            </Button>
            <Button 
              variant={tierFilter === 'Corporate' ? 'primary' : 'text'} 
              className={tierFilter === 'Corporate' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setTierFilter('Corporate')}
            >
              Corporate
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-auto">
              <SearchInput 
                placeholder="Search customers..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
              />
            </div>
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <DataGrid 
              data={paginatedData}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/app/customers/${item.id}`)}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredData.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              loading={loading}
            />
          </div>
        </div>
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
            <Button variant="primary" onClick={() => { setSelectedCustomer(null); setCustomerToEdit(selectedCustomer); setIsAddModalOpen(true); }}>Edit Profile</Button>
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
        onClose={() => { setIsAddModalOpen(false); setCustomerToEdit(null); }} 
        onSuccess={fetchCustomers}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};

export default Customers;
