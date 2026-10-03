import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
ui_path = os.path.join(frontend_src, "features", "inventory", "InventoryDetails.tsx")
with open(ui_path, "r") as f:
    code = f.read()

# 1. Remove "Activity" from TabType
code = code.replace("type TabType = 'overview' | 'movements' | 'reservations' | 'purchases' | 'wastage' | 'activity';",
                    "type TabType = 'overview' | 'movements' | 'reservations' | 'purchases' | 'wastage';")

# 2. Remove "Activity" from tabs array
tabs_old = """    { id: 'purchases', label: 'Purchases' },
    { id: 'wastage', label: 'Wastage' },
    { id: 'activity', label: 'Activity' },"""
tabs_new = """    { id: 'purchases', label: 'Purchases' },
    { id: 'wastage', label: 'Wastage' }"""
code = code.replace(tabs_old, tabs_new)

# 3. Replace Stock In/Out with Edit
header_old = """            <div className="flex items-center gap-2">
              <Button variant="primary" icon="add">Stock In</Button>
              <Button variant="secondary" icon="remove">Stock Out</Button>
            </div>"""
header_new = """            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit" onClick={() => navigate(`/app/inventory/${item.id}/edit`)}>Edit Details</Button>
            </div>"""
code = code.replace(header_old, header_new)

# 4. Add state for forms and handle functions
state_insert = """  const [showMovementForm, setShowMovementForm] = useState(false);
  const [movementForm, setMovementForm] = useState({ type: 'IN', quantity: '', notes: '', reference: '' });
  
  const handleRecordMovement = async () => {
    try {
      await inventoryService.addInventoryMovement({
        inventoryItemId: item.id,
        type: movementForm.type,
        quantity: Number(movementForm.quantity),
        notes: movementForm.notes,
        reference: movementForm.reference
      });
      // Refresh
      const data = await inventoryService.getInventoryItemById(item.id);
      setItem(data);
      setShowMovementForm(false);
      setMovementForm({ type: 'IN', quantity: '', notes: '', reference: '' });
    } catch(e) {
      console.error(e);
      alert('Failed to record movement');
    }
  };

  const [showResForm, setShowResForm] = useState(false);
"""
# insert after activeTab
code = code.replace("const [activeTab, setActiveTab] = useState<TabType>('overview');", 
                    "const [activeTab, setActiveTab] = useState<TabType>('overview');\n" + state_insert)

# 5. Movements Form
move_old = """              <h3 className="font-title-lg">Stock Movement History</h3>
              <Button variant="primary" onClick={() => alert("Add movement modal to be implemented")}>Record Movement</Button>
            </div>"""
move_new = """              <h3 className="font-title-lg">Stock Movement History</h3>
              <Button variant="primary" onClick={() => setShowMovementForm(!showMovementForm)}>Record Movement</Button>
            </div>
            
            {showMovementForm && (
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
              </div>
            )}"""
code = code.replace(move_old, move_new)

# 6. Reservations Form
res_old = """          <div className="space-y-4">
            <h3 className="font-title-lg mb-4">Active Reservations</h3>
            <div className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden">"""
res_new = """          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title-lg">Active Reservations</h3>
              <Button variant="primary" onClick={() => setShowResForm(!showResForm)}>Add Reservation</Button>
            </div>
            
            {showResForm && (
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 mb-4 flex items-center justify-center text-on-surface-variant">
                 Backend API for reservations is not yet linked. Forms will be active soon!
              </div>
            )}

            <div className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden">"""
code = code.replace(res_old, res_new)

# 7. Remove activity from bottom placeholders
pl_old = "{['purchases', 'wastage', 'activity'].includes(activeTab) && ("
pl_new = "{['purchases', 'wastage'].includes(activeTab) && ("
code = code.replace(pl_old, pl_new)

with open(ui_path, "w") as f:
    f.write(code)

print("InventoryDetails updated.")
