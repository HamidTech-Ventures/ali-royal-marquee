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
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Vendors & Suppliers Management"
        category="Commercial & Procurement Ledger"
        icon="corporate_fare"
        description="Manage authorized suppliers, service contractors, active purchase commitments, commercial payables, and performance audit records."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <>
            <Button variant="outline" icon="tune">Filters</Button>
            <Button variant="primary" icon="add_business" onClick={() => navigate('/app/vendors/new')}>Add Vendor</Button>
          </>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-start justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Registered Vendors</span>
              <span className="material-symbols-outlined text-primary text-[20px]">corporate_fare</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl text-on-surface font-bold tracking-tight">{vendors.length}</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-start justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Active Contractors</span>
              <span className="material-symbols-outlined text-secondary text-[20px]">handshake</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl text-on-surface font-bold tracking-tight">{vendors.filter(v => v.status === 'Active').length}</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="flex items-start justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Inactive Vendors</span>
              <span className="material-symbols-outlined text-error text-[20px]">block</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl text-on-surface font-bold tracking-tight">{vendors.filter(v => v.status === 'Inactive').length}</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <div className="flex items-start justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Service Categories</span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">category</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl text-on-surface font-bold tracking-tight">{new Set(vendors.map(v => v.category)).size}</div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-surface-container-lowest p-3 rounded shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button 
              variant={statusFilter === 'All' ? 'primary' : 'text'} 
              className={statusFilter === 'All' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('All')}
            >
              All Vendors
            </Button>
            <Button 
              variant={statusFilter === 'Active' ? 'primary' : 'text'} 
              className={statusFilter === 'Active' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Active')}
            >
              Active
            </Button>
            <Button 
              variant={statusFilter === 'Inactive' ? 'primary' : 'text'} 
              className={statusFilter === 'Inactive' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Inactive')}
            >
              Inactive
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput 
              placeholder="Search vendor name, category..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
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
  );
};

export default Vendors;
