import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.state?.fromBusiness;
  const { success, error: showError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');
  const [activeTab, setActiveTab] = useState<'All' | 'Fixed Asset' | 'Consumable'>('All');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventoryItems();
      const enhancedData = data.map((item: any) => {
        let status = 'In Stock';
        if (item.quantity === 0) status = 'Out of Stock';
        else if (item.quantity <= item.minQuantity) status = 'Low Stock';
        return { ...item, status };
      });
      setInventory(enhancedData);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await inventoryService.deleteInventoryItem(id);
        success('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        console.error('Error deleting item:', error);
        showError('Failed to delete item');
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
    let result = inventory;
    
    // Filter by item type
    result = result.filter((i: any) => {
      if (activeTab === 'All') return true;
      const typeStr = (i.itemType || i.type || '').toString().toLowerCase();
      if (activeTab === 'Fixed Asset') return !typeStr.includes('consumable');
      if (activeTab === 'Consumable') return typeStr.includes('consumable');
      return true;
    });

    if (statusFilter !== 'All') {
      result = result.filter(i => i.status === statusFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(i => 
        i.name.toLowerCase().includes(lowerSearch) ||
        i.category.toLowerCase().includes(lowerSearch)
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
  }, [inventory, searchTerm, statusFilter, activeTab, sortColumn, sortDirection]);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      key: 'name',
      header: 'Item Name',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-on-surface">{item.name}</span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="text-on-surface-variant font-medium">{item.category}</span>
      )
    },
    {
      key: 'quantity',
      header: 'In Stock / Qty',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-semibold text-on-surface">{item.quantity}</span>
          <span className="text-on-surface-variant text-[12px]">{item.unit}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'right',
      render: (item: any) => {
        let variant: any = 'neutral';
        if (item.status === 'In Stock') variant = 'success';
        if (item.status === 'Low Stock') variant = 'warning';
        if (item.status === 'Out of Stock') variant = 'error';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/inventory/${item.id}`); }} title="Manage">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Button>
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/inventory/${item.id}/edit`); }} title="Edit">
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
        title="Asset & Inventory Master"
        category="Operations & Logistics"
        icon="inventory_2"
        description="Track physical assets, catering supplies, decor materials, and monitor reorder levels in real-time."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" icon="sync" onClick={fetchInventory} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e8e4db] text-[#4a1420] px-3 md:px-4 py-2 rounded-lg shadow-sm transition-all border border-[#e8e4db] text-xs md:text-sm font-medium">Refresh Stock</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/inventory/new')} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-[#5C0A1E] hover:bg-[#4a1420] text-white px-3 md:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-xs md:text-sm">Add Item</Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8 mt-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Cataloged Items</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{inventory.length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">shelves</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Low Stock</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{inventory.filter(i => i.status === 'Low Stock').length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">notifications_active</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Out of Stock</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-red-600 font-bold leading-none">{inventory.filter(i => i.status === 'Out of Stock').length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">warning</span>
              </div>
            </div>
          </div>
        </div>

                {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
            
            {/* TYPE FILTER - PILL DESIGN */}
            <div className="flex items-center bg-[#f8f6f3] p-1 rounded-lg border border-[#e8e4db] shadow-inner overflow-x-auto hide-scrollbar max-w-full">
              <button
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'All' ? 'bg-white text-[#5C0A1E] shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:text-[#5C0A1E] hover:bg-white/50'}`}
                onClick={() => setActiveTab('All')}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">category</span>
                All Types
              </button>
              <button
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'Fixed Asset' ? 'bg-white text-[#5C0A1E] shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:text-[#5C0A1E] hover:bg-white/50'}`}
                onClick={() => setActiveTab('Fixed Asset')}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">chair</span>
                Fixed Assets
              </button>
              <button
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'Consumable' ? 'bg-white text-[#5C0A1E] shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:text-[#5C0A1E] hover:bg-white/50'}`}
                onClick={() => setActiveTab('Consumable')}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">restaurant_menu</span>
                Consumables
              </button>
            </div>

            <div className="hidden md:block w-px h-8 bg-[#e8e4db]"></div>

            {/* STATUS FILTER - PILL DESIGN */}
            <div className="flex items-center bg-[#f8f6f3] p-1 rounded-lg border border-[#e8e4db] shadow-inner overflow-x-auto hide-scrollbar max-w-full">
              <button
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === 'All' ? 'bg-white text-[#5C0A1E] shadow-sm ring-1 ring-black/5' : 'text-on-surface-variant hover:text-[#5C0A1E] hover:bg-white/50'}`}
                onClick={() => setStatusFilter('All')}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">inventory_2</span>
                All Status
              </button>
              <button
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === 'Low Stock' ? 'bg-[#fdf3c7] text-[#b0891d] shadow-sm ring-1 ring-[#b0891d]/20' : 'text-on-surface-variant hover:text-[#b0891d] hover:bg-[#fdf3c7]/50'}`}
                onClick={() => setStatusFilter('Low Stock')}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">warning</span>
                Low Stock
              </button>
              <button
                className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === 'Out of Stock' ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-600/20' : 'text-on-surface-variant hover:text-red-600 hover:bg-red-50'}`}
                onClick={() => setStatusFilter('Out of Stock')}
              >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">error</span>
                Out of Stock
              </button>
            </div>
            
          </div>
          
          <div className="flex items-center gap-4 w-full xl:w-72 shrink-0">
            <SearchInput 
              placeholder="Search items or SKUs..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <DataGrid 
              data={filteredData}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/app/inventory/${item.id}`)}
              loading={loading}
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
    </div>
  );
};

export default Inventory;