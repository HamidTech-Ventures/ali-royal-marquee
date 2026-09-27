import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { packagesService } from '../../services/packagesService';
import type { Package } from '../../services/packagesService';
import { useToast } from '../../context/ToastContext';

export const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.state?.fromBusiness;
  const { success, error: showError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packagesService.getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await packagesService.deletePackage(id);
        success('Package deleted successfully');
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
        showError('Failed to delete package');
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
    let result = packages;
    
    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.type.toLowerCase().includes(lowerSearch)
      );
    }
    
    result.sort((a, b) => {
      const valA = (a as any)[sortColumn];
      const valB = (b as any)[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [packages, searchTerm, statusFilter, sortColumn, sortDirection]);

  const columns: ColumnDef<Package>[] = [
    {
      key: 'name',
      header: 'Package Name',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-on-surface">{item.name}</span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <span className="text-on-surface-variant font-medium">{item.type}</span>
      )
    },
    {
      key: 'price',
      header: 'Price (Per Pax)',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-currency-num font-bold text-primary">PKR {item.price.toLocaleString()}</span>
      )
    },
    {
      key: 'minGuests',
      header: 'Min Guests',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-on-surface-variant font-medium">{item.minGuests}</span>
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
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/packages/${item.id}`); }} title="Manage">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Button>
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/packages/${item.id}/edit`); }} title="Edit">
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
    <div className="flex flex-col h-full bg-surface-container-lowest">
      <div className="px-8 py-8">
        <PageHeader 
          title="Event Packages"
          category="Sales & Marketing"
          icon="loyalty"
          description="Manage predefined event packages, catering menus, decor bundles, and seasonal promotions."
          onBack={showBack ? () => navigate(-1) : undefined}
          actions={
            <>
              <Button variant="outline" icon="sync" onClick={fetchPackages}>Refresh</Button>
              <Button variant="primary" icon="add" onClick={() => navigate('/app/packages/new')}>Create Package</Button>
            </>
          }
        />

        <div className="flex flex-col w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Packages</span>
                <span className="material-symbols-outlined text-primary text-[20px]">loyalty</span>
              </div>
              <div className="mt-3">
                <div className="text-3xl text-on-surface font-bold tracking-tight">{packages.length}</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Active Packages</span>
                <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
              </div>
              <div className="mt-3">
                <div className="text-3xl text-on-surface font-bold tracking-tight">{packages.filter(p => p.status === 'Active').length}</div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Avg Price (Pax)</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-currency-num text-on-surface font-bold tracking-tight">
                  PKR {packages.length ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString() : 0}
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded shadow-sm border border-surface-variant/70 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
              <div className="flex items-start justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Package Types</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">category</span>
              </div>
              <div className="mt-3">
                <div className="text-3xl text-on-surface font-bold tracking-tight">{new Set(packages.map(p => p.type)).size}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-3 rounded-lg border border-surface-variant/50">
            <div className="flex items-center gap-2">
              <Button 
                variant={statusFilter === 'All' ? 'primary' : 'text'} 
                className={statusFilter === 'All' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
                onClick={() => setStatusFilter('All')}
              >
                All Packages
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
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <SearchInput 
                placeholder="Search package name, type..." 
                value={searchTerm} 
                onChange={setSearchTerm} 
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8 text-on-surface-variant">Loading packages...</div>
          ) : (
            <DataGrid 
              data={filteredData}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/app/packages/${item.id}`)}
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
  );
};

export default Packages;
