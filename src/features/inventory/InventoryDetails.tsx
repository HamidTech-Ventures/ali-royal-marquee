import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Box } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'overview' | 'movements' | 'reservations' | 'purchases' | 'wastage' | 'activity';

export const InventoryDetails = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await inventoryService.getInventoryItems();
        const found = data.find((i) => i.id === itemId);
        setItem(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryService.deleteInventoryItem(itemId!);
        navigate('/app/inventory');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading inventory item...</div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-on-surface-variant">Inventory item not found.</div>;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Item Overview' },
    { id: 'movements', label: 'Stock Movements' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'purchases', label: 'Purchases' },
    { id: 'wastage', label: 'Wastage' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* HEADER SECTION */}
      <div className="border-b border-outline-variant/30 bg-surface px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/inventory')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Inventory
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{item.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surface-variant text-on-surface-variant font-headline-lg flex items-center justify-center rounded-xl shrink-0">
              <Box className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-on-surface">{item.name}</h1>
                <Badge variant={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'} className="text-sm px-3 py-1">
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-4 text-on-surface-variant mt-2">
                <div className="flex items-center gap-1.5"><Badge variant="neutral">{item.category}</Badge></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="add">Stock In</Button>
              <Button variant="secondary" icon="remove">Stock Out</Button>
            </div>
            <div className="flex items-center justify-end gap-3 text-sm">
              <button className="text-error hover:underline flex items-center gap-1" onClick={handleDelete}>Delete Item</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-8 py-6 bg-surface-container-lowest border-b border-outline-variant/20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Current Stock</div>
            <div className="text-3xl font-bold text-primary flex items-end gap-2">
              {item.quantity} <span className="text-lg text-on-surface-variant font-medium">{item.unit}</span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Reserved</div>
            <div className="text-3xl font-bold text-warning flex items-end gap-2">
              0 <span className="text-lg text-on-surface-variant font-medium">{item.unit}</span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Available</div>
            <div className="text-3xl font-bold text-success flex items-end gap-2">
              {item.quantity} <span className="text-lg text-on-surface-variant font-medium">{item.unit}</span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Reorder Level</div>
            <div className="text-3xl font-bold text-on-surface">{item.minQuantity}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Stock Value</div>
            <div className="text-3xl font-currency-num font-bold text-on-surface">PKR {(item.quantity * 1500).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-8 border-b border-outline-variant/30 flex overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Item Configuration</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Category</div>
                    <div className="col-span-2 font-medium">{item.category}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Unit of Measure</div>
                    <div className="col-span-2 font-medium">{item.unit}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Location</div>
                    <div className="col-span-2 font-medium">Main Store (A-12)</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Replenishment</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Default Supplier</div>
                    <div className="col-span-2 font-medium text-primary">Ali Foods Ltd.</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Avg Lead Time</div>
                    <div className="col-span-2 font-medium">2 Days</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Last Restock</div>
                    <div className="col-span-2 font-medium">01 Sep 2026</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Placeholders for others */}
        {['movements', 'reservations', 'purchases', 'wastage', 'activity'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
