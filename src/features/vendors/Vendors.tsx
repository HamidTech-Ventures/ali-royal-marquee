import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import type { Vendor } from '../../types';
import { vendorsService } from '../../services/vendorsService';

export const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.state?.fromBusiness;

  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await vendorsService.getVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await vendorsService.deleteVendor(id);
        fetchVendors();
      } catch (err) {
        console.error('Error deleting vendor:', err);
        alert('Failed to delete vendor.');
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
    let result = vendors;
    
    if (statusFilter !== 'All') {
      result = result.filter(v => v.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(lowerSearch) ||
        v.category.toLowerCase().includes(lowerSearch) ||
        v.contactName.toLowerCase().includes(lowerSearch)
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
  }, [vendors, searchTerm, statusFilter, sortColumn, sortDirection]);

  const columns: ColumnDef<Vendor>[] = [
    {
      key: 'name',
      header: 'Vendor Name',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-on-surface">{item.name}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category / Service',
      sortable: true,
      render: (item) => (
        <span className="text-on-surface-variant font-medium">{item.category}</span>
      )
    },
    {
      key: 'contactName',
      header: 'Primary Contact',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-on-surface">{item.contactName}</div>
          <div className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[12px]">phone</span> {item.phone}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'right',
      render: (item) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'neutral'}>{item.status}</Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/vendors/${item.id}`); }} title="Manage">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Button>
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/vendors/${item.id}/edit`); }} title="Edit">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Button>
          <Button variant="text" className="!p-2 text-error hover:bg-error/10" onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }} title="Delete">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Vendors & Suppliers Management"
        category="Commercial & Procurement Ledger"
        icon="corporate_fare"
        description="Manage authorized suppliers, service contractors, active purchase commitments, commercial payables, and performance audit records."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" icon="tune" className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e8e4db] text-[#4a1420] px-3 md:px-4 py-2 rounded-lg shadow-sm transition-all border border-[#e8e4db] text-xs md:text-sm font-medium">Filters</Button>
            <Button variant="primary" icon="add_business" onClick={() => navigate('/app/vendors/new')} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-[#5C0A1E] hover:bg-[#4a1420] text-white px-3 md:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-xs md:text-sm">Add Vendor</Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8 mt-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Registered Vendors</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{vendors.length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">corporate_fare</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Active Contractors</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{vendors.filter(v => v.status === 'Active').length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">handshake</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Inactive Vendors</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-red-600 font-bold leading-none">{vendors.filter(v => v.status === 'Inactive').length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">block</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Service Categories</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{new Set(vendors.map(v => v.category)).size}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">category</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1.5 w-full">
            <Button 
              variant={statusFilter === 'All' ? 'primary' : 'text'} 
              className={statusFilter === 'All' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('All')}
            >
              All Vendors
            </Button>
            <Button 
              variant={statusFilter === 'Active' ? 'primary' : 'text'} 
              className={statusFilter === 'Active' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </Button>
            <Button 
              variant={statusFilter === 'Inactive' ? 'primary' : 'text'} 
              className={statusFilter === 'Inactive' ? 'py-1.5 px-3 !bg-gray-600' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Inactive')}
            >
              Inactive
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SearchInput 
              placeholder="Search vendor name, category..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
        {error && <div className="text-error">{error}</div>}
        {loading ? (
          <div className="flex justify-center p-8">Loading vendors...</div>
        ) : (
          <DataGrid 
            data={filteredData}
            columns={columns}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => navigate(`/app/vendors/${item.id}`)}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={1}
            totalPages={1}
            totalItems={filteredData.length}
          />
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
