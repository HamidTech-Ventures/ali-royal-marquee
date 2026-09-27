import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventoryItems();
      setInventory(data);
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
  }, [inventory, searchTerm, statusFilter, sortColumn, sortDirection]);

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
      header: 'In Stock',
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
      render: (item) => {
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
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Asset & Inventory Master"
        category="Operations & Logistics"
        icon="inventory_2"
        description="Track physical assets, catering supplies, decor materials, and monitor reorder levels in real-time."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <>
            <Button variant="outline" icon="sync" onClick={fetchInventory}>Refresh Stock</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/inventory/new')}>Add Item</Button>
          </>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Cataloged Items</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">shelves</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-primary font-bold">{inventory.length}</div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Low Stock</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">notifications_active</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-secondary font-bold">
              {inventory.filter(i => i.status === 'Low Stock').length}
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-semibold">Out of Stock</span>
              <span className="material-symbols-outlined text-[18px] text-error">warning</span>
            </div>
            <div className="mt-3 font-headline-md text-headline-md text-error font-bold">
              {inventory.filter(i => i.status === 'Out of Stock').length}
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
              All Items
            </Button>
            <Button 
              variant={statusFilter === 'Low Stock' ? 'primary' : 'text'} 
              className={statusFilter === 'Low Stock' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setStatusFilter('Low Stock')}
            >
              Low Stock
            </Button>
            <Button 
              variant={statusFilter === 'Out of Stock' ? 'primary' : 'text'} 
              className={statusFilter === 'Out of Stock' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-error hover:text-error'} 
              onClick={() => setStatusFilter('Out of Stock')}
            >
              Out of Stock
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput 
              placeholder="Search items or SKUs..." 
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
          onRowClick={(item) => setSelectedItem(item)}
          loading={loading}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={1}
          totalPages={1}
          totalItems={filteredData.length}
        />
      </div>

      <Drawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name || ''}
        subtitle={selectedItem ? `Category: ${selectedItem.category}` : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              navigate(`/app/inventory/${selectedItem?.id}`);
              setSelectedItem(null);
            }}>Manage Item</Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3 flex items-center justify-between">
                <span>Stock Information</span>
                <Badge variant={selectedItem.status === 'In Stock' ? 'success' : selectedItem.status === 'Low Stock' ? 'warning' : 'error'}>{selectedItem.status}</Badge>
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Current Quantity</span>
                  <span className="font-semibold text-[18px]">{selectedItem.quantity} {selectedItem.unit}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Minimum Level</span>
                  <span className="font-semibold text-[18px] text-on-surface-variant">{selectedItem.minQuantity} {selectedItem.unit}</span>
                </div>
              </div>
            </div>
            
            {selectedItem.status !== 'In Stock' && (
              <div className="bg-error-container/20 p-4 rounded-lg border border-error-container text-body-sm">
                <span className="material-symbols-outlined text-[20px] text-error mb-2 block">warning</span>
                <strong className="text-on-surface font-semibold block mb-1">Stock Action Required</strong>
                <p className="text-on-surface-variant">
                  This item is currently below its minimum required threshold. An urgent purchase order needs to be raised.
                </p>
                <Button variant="outline" className="mt-4 border-error text-error hover:bg-error-container/50">Create Purchase Order</Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Inventory;
