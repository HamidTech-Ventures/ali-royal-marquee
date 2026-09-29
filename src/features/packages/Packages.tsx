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
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        <PageHeader 
          title="Event Packages"
          category="Sales & Marketing"
          icon="loyalty"
          description="Manage predefined event packages, catering menus, decor bundles, and seasonal promotions."
          onBack={showBack ? () => navigate(-1) : undefined}
          actions={
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" icon="sync" onClick={fetchPackages} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e8e4db] text-[#4a1420] px-3 md:px-4 py-2 rounded-lg shadow-sm transition-all border border-[#e8e4db] text-xs md:text-sm font-medium">Refresh</Button>
              <Button variant="primary" icon="add" onClick={() => navigate('/app/packages/new')} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-[#5C0A1E] hover:bg-[#4a1420] text-white px-3 md:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-xs md:text-sm">Create Package</Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Packages</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{packages.length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">loyalty</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Active Packages</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{packages.filter(p => p.status === 'Active').length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">check_circle</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Avg Price (Pax)</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-lg md:text-2xl text-[#4a1420] font-bold leading-none">PKR {packages.length ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString() : 0}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">payments</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4a1420]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Package Types</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{new Set(packages.map(p => p.type)).size}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#4a1420]/10 flex items-center justify-center text-[#4a1420]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">category</span>
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
