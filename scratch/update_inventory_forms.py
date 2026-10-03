import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
ui_path = os.path.join(frontend_src, "features", "inventory", "InventoryDetails.tsx")
with open(ui_path, "r") as f:
    code = f.read()

# Add eventsService import if missing
if "import { eventsService }" not in code:
    code = code.replace("import { inventoryService } from '../../services/inventoryService';", 
                        "import { inventoryService } from '../../services/inventoryService';\nimport { eventsService } from '../../services/eventsService';\nimport type { Event } from '../../types';")

# Add events state
if "const [events, setEvents] = useState<Event[]>([]);" not in code:
    code = code.replace("const [item, setItem] = useState<InventoryItem | null>(null);",
                        "const [item, setItem] = useState<InventoryItem | null>(null);\n  const [events, setEvents] = useState<Event[]>([]);")
    
    fetch_insert = """
    const fetchEvents = async () => {
      try {
        const evData = await eventsService.getEvents();
        setEvents(evData);
      } catch(e) {}
    };
    fetchEvents();
"""
    code = code.replace("fetchItem();", "fetchItem();\n" + fetch_insert)

# 1. Update Movement Form logic
move_state_old = """  const [movementForm, setMovementForm] = useState({ type: 'IN', quantity: '', notes: '', reference: '' });"""
move_state_new = """  const [movementForm, setMovementForm] = useState({ location: '', quantity: '', type: 'Permanent' });"""
code = code.replace(move_state_old, move_state_new)

move_func_old = """      await inventoryService.addInventoryMovement({
        inventoryItemId: item.id,
        type: movementForm.type,
        quantity: Number(movementForm.quantity),
        notes: movementForm.notes,
        reference: movementForm.reference
      });"""
move_func_new = """      await inventoryService.addInventoryMovement({
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
      }"""
code = code.replace(move_func_old, move_func_new)

code = code.replace("setMovementForm({ type: 'IN', quantity: '', notes: '', reference: '' });", 
                    "setMovementForm({ location: '', quantity: '', type: 'Permanent' });")

# Update Movement Form UI
move_ui_old = """              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.type} onChange={e => setMovementForm({...movementForm, type: e.target.value})}>
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                    <option value="RELOCATE">Relocate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.quantity} onChange={e => setMovementForm({...movementForm, quantity: e.target.value})} placeholder="Qty"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reference</label>
                  <input type="text" className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.reference} onChange={e => setMovementForm({...movementForm, reference: e.target.value})} placeholder="PO-123"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <input type="text" className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.notes} onChange={e => setMovementForm({...movementForm, notes: e.target.value})} placeholder="Details..."/>
                </div>
                <div>
                  <Button variant="primary" className="w-full py-2" onClick={handleRecordMovement}>Submit</Button>
                </div>
              </div>"""

move_ui_new = """              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 space-y-4">
                <div className="text-sm font-medium text-on-surface-variant bg-surface-variant/30 p-2 rounded-lg inline-block">
                  Current Location: <span className="text-on-surface font-semibold">{item.location || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination Location/Hall</label>
                    <select className="w-full rounded-lg border border-outline-variant p-2" value={movementForm.location} onChange={e => setMovementForm({...movementForm, location: e.target.value})}>
                      <option value="">Select Location...</option>
                      <option value="Main Store">Main Store</option>
                      <option value="Hall A (Royal)">Hall A (Royal)</option>
                      <option value="Hall B (Crown)">Hall B (Crown)</option>
                      <option value="Kitchen">Kitchen</option>
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
              </div>"""
code = code.replace(move_ui_old, move_ui_new)

# 2. Update Reservation Form logic
res_state_old = """  const [resForm, setResForm] = useState({ eventId: '', quantity: '', startDate: '', endDate: '', status: 'Active' });"""
res_state_new = """  const [resForm, setResForm] = useState({ eventId: '', quantity: '' });"""
code = code.replace(res_state_old, res_state_new)

res_func_old = """      await inventoryService.addInventoryReservation({
        inventoryItemId: item.id,
        eventId: resForm.eventId || '00000000-0000-0000-0000-000000000000', // Mock event ID if empty
        quantity: Number(resForm.quantity),
        startDate: new Date(resForm.startDate).toISOString(),
        endDate: new Date(resForm.endDate).toISOString(),
        status: resForm.status
      });"""
res_func_new = """      const ev = events.find(e => e.id === resForm.eventId);
      if (!ev) return alert('Select an event');
      await inventoryService.addInventoryReservation({
        inventoryItemId: item.id,
        eventId: ev.id,
        quantity: Number(resForm.quantity),
        startDate: new Date(`${ev.dateStr}T${ev.startTime || '00:00'}`).toISOString(),
        endDate: new Date(`${ev.dateStr}T${ev.endTime || '23:59'}`).toISOString(),
        status: 'Active'
      });"""
code = code.replace(res_func_old, res_func_new)

code = code.replace("setResForm({ eventId: '', quantity: '', startDate: '', endDate: '', status: 'Active' });", 
                    "setResForm({ eventId: '', quantity: '' });")

# Update Reservation Form UI
res_ui_old = """              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Event/Booking ID</label>
                  <input type="text" className="w-full rounded-lg border border-outline-variant p-2" value={resForm.eventId} onChange={e => setResForm({...resForm, eventId: e.target.value})} placeholder="Event GUID..."/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" className="w-full rounded-lg border border-outline-variant p-2" value={resForm.quantity} onChange={e => setResForm({...resForm, quantity: e.target.value})} placeholder="Qty"/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" className="w-full rounded-lg border border-outline-variant p-2" value={resForm.startDate} onChange={e => setResForm({...resForm, startDate: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" className="w-full rounded-lg border border-outline-variant p-2" value={resForm.endDate} onChange={e => setResForm({...resForm, endDate: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full rounded-lg border border-outline-variant p-2" value={resForm.status} onChange={e => setResForm({...resForm, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <Button variant="primary" className="w-full py-2" onClick={handleRecordReservation}>Submit</Button>
                </div>
              </div>"""

res_ui_new = """              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
              </div>"""
code = code.replace(res_ui_old, res_ui_new)

with open(ui_path, "w") as f:
    f.write(code)

print("Inventory forms successfully updated.")
