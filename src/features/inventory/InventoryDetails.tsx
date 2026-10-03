import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import { eventsService } from '../../services/eventsService';
import { referenceService } from '../../services/referenceService';
import type { Event } from '../../types';
import type { InventoryItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Box } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'overview' | 'movements' | 'reservations' | 'purchases' | 'wastage';

export const InventoryDetails = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movementForm, setMovementForm] = useState({ location: '', quantity: '', type: 'Permanent' });
  
  const handleRecordMovement = async () => {
    try {
      await inventoryService.addInventoryMovement({
        inventoryItemId: item.id,
        type: 'RELOCATE',
        quantity: Number(movementForm.quantity),
        notes: `Moved to ${movementForm.location}`,
        reference: movementForm.type
      });
      if (movementForm.type === 'Permanent') {
        await inventoryService.updateInventoryItem(item.id, {
          name: item.name, category: item.category, minQuantity: item.minQuantity, unit: item.unit, itemType: item.itemType, unitPrice: item.unitPrice,
          location: movementForm.location
        });
      }
      // Refresh
      const data = await inventoryService.getInventoryItemById(item.id);
      setItem(data);
      setShowMovementForm(false);
      setMovementForm({ location: '', quantity: '', type: 'Permanent' });
    } catch(e) {
      console.error(e);
      alert('Failed to record movement');
    }
  };

  const [showResForm, setShowResForm] = useState(false);

  const [resForm, setResForm] = useState({ eventId: '', quantity: '' });
  
  const handleRecordReservation = async () => {
    try {
      const ev = events.find(e => e.id === resForm.eventId);
      if (!ev) return alert('Select an event');
      await inventoryService.addInventoryReservation({
        inventoryItemId: item.id,
        eventId: ev.id,
        quantity: Number(resForm.quantity),
        startDate: new Date(`${ev.dateStr}T${ev.startTime || '00:00'}`).toISOString(),
        endDate: new Date(`${ev.dateStr}T${ev.endTime || '23:59'}`).toISOString(),
        status: 'Active'
      });
      // Refresh
      const data = await inventoryService.getInventoryItemById(item.id);
      setItem(data);
      setShowResForm(false);
      setResForm({ eventId: '', quantity: '' });
    } catch(e) {
      console.error(e);
      alert('Failed to record reservation');
    }
  };



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

    const fetchEvents = async () => {
      try {
        const evData = await eventsService.getEvents();
        setEvents(evData);
        const vData = await referenceService.getVenues();
        setVenues(vData);
      } catch(e) {}
    };
    fetchEvents();

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
    { id: 'wastage', label: 'Wastage' }
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
                <div className="flex items-center gap-1.5">
                  <Badge variant="neutral">{item.itemType}</Badge>
                  <Badge variant="neutral">{item.category}</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit" onClick={() => navigate(`/app/inventory/${item.id}/edit`)}>Edit Details</Button>
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
          {item.itemType === 'Consumable' && (
            <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Reorder Level</div>
              <div className="text-3xl font-bold text-on-surface">{item.minQuantity}</div>
            </div>
          )}
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Stock Value</div>
            <div className="text-3xl font-currency-num font-bold text-on-surface">PKR {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</div>
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
                    <div className="col-span-2 font-medium">{item.location || "N/A"}</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Pricing</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Unit Price</div>
                    <div className="col-span-2 font-medium text-primary">PKR {(item.unitPrice || 0).toLocaleString()}</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title-lg">Stock Movement History</h3>
              <Button variant="primary" onClick={() => setShowMovementForm(!showMovementForm)}>Record Movement</Button>
            </div>
            
            {showMovementForm && (
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 space-y-4">
                <div className="text-sm font-medium text-on-surface-variant bg-surface-variant/30 p-2 rounded-lg inline-block">
                  Current Location: <span className="text-on-surface font-semibold">{item.location || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination Location/Hall</label>
                    <select className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.location} onChange={e => setMovementForm({...movementForm, location: e.target.value})}>
                      <option value="">Select Location...</option>
                      <option value="Main Store">Main Store</option>
                      <option value="Kitchen">Kitchen</option>
                      {venues.map((v: any) => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input type="number" className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.quantity} onChange={e => setMovementForm({...movementForm, quantity: e.target.value})} placeholder="Qty"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Movement Type</label>
                    <select className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.type} onChange={e => setMovementForm({...movementForm, type: e.target.value})}>
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <Button variant="primary" className="w-full py-2" onClick={handleRecordMovement} disabled={!movementForm.location || !movementForm.quantity}>Submit Movement</Button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Quantity</th>
                    <th className="p-4 font-medium">Notes</th>
                    <th className="p-4 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {item.movements && item.movements.length > 0 ? item.movements.map((m: any) => (
                    <tr key={m.id} className="hover:bg-surface-variant/10">
                      <td className="p-4">{new Date(m.createdAt).toLocaleString()}</td>
                      <td className="p-4"><Badge variant={m.type === 'IN' ? 'success' : m.type === 'OUT' ? 'error' : 'warning'}>{m.type}</Badge></td>
                      <td className="p-4 font-semibold">{m.quantity}</td>
                      <td className="p-4">{m.notes || '-'}</td>
                      <td className="p-4 text-primary">{m.reference || '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No stock movements recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title-lg">Active Reservations</h3>
              <Button variant="primary" onClick={() => setShowResForm(!showResForm)}>Add Reservation</Button>
            </div>
            
            {showResForm && (
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Event</label>
                  <select className="w-full rounded-lg border border-outline-variant p-2" value={resForm.eventId} onChange={e => setResForm({...resForm, eventId: e.target.value})}>
                    <option value="">-- Choose Event --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} ({ev.dateStr} - Shift: {ev.startTime})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity to Reserve</label>
                  <input type="number" className="w-full rounded-lg border border-outline-variant p-2" value={resForm.quantity} onChange={e => setResForm({...resForm, quantity: e.target.value})} placeholder="Qty"/>
                </div>
                <div>
                  <Button variant="primary" className="w-full py-2" onClick={handleRecordReservation} disabled={!resForm.eventId || !resForm.quantity}>Submit Reservation</Button>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-variant/30 text-on-surface-variant text-sm">
                  <tr>
                    <th className="p-4 font-medium">Event ID</th>
                    <th className="p-4 font-medium">Start Date</th>
                    <th className="p-4 font-medium">End Date</th>
                    <th className="p-4 font-medium">Quantity</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {item.reservations && item.reservations.length > 0 ? item.reservations.map((r: any) => (
                    <tr key={r.id} className="hover:bg-surface-variant/10">
                      <td className="p-4 text-primary">{r.eventId.substring(0,8)}...</td>
                      <td className="p-4">{new Date(r.startDate).toLocaleDateString()}</td>
                      <td className="p-4">{new Date(r.endDate).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold">{r.quantity}</td>
                      <td className="p-4"><Badge>{r.status}</Badge></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">No active reservations.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {['purchases', 'wastage'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
