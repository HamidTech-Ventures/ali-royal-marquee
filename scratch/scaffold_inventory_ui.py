import os

ui_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\inventory\InventoryDetails.tsx"
with open(ui_path, "r") as f:
    code = f.read()

# Update Stock Value KPI
val_old = "PKR {(item.quantity * 1500).toLocaleString()}"
val_new = "PKR {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}"
code = code.replace(val_old, val_new)

# Update Location in Overview
loc_old = '<div className="col-span-2 font-medium">Main Store (A-12)</div>'
loc_new = '<div className="col-span-2 font-medium">{item.location || "N/A"}</div>'
code = code.replace(loc_old, loc_new)

# Remove Replenishment section as it's not fully baked in backend yet, or just keep it minimal.
# Let's replace Replenishment dummy data with "N/A" for now, or just hide it.
rep_old = """            <div className="space-y-6">
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
            </div>"""

rep_new = """            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Pricing</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Unit Price</div>
                    <div className="col-span-2 font-medium text-primary">PKR {(item.unitPrice || 0).toLocaleString()}</div>
                  </div>
                </div>
              </section>
            </div>"""
code = code.replace(rep_old, rep_new)

# Implement Movements and Reservations tabs
tabs_old = """        {/* Placeholders for others */}
        {['movements', 'reservations', 'purchases', 'wastage', 'activity'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}"""

tabs_new = """        {activeTab === 'movements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title-lg">Stock Movement History</h3>
              <Button variant="primary" onClick={() => alert("Add movement modal to be implemented")}>Record Movement</Button>
            </div>
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
            <h3 className="font-title-lg mb-4">Active Reservations</h3>
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

        {['purchases', 'wastage', 'activity'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}"""
code = code.replace(tabs_old, tabs_new)

# Add fetch logic since inventoryService.getInventoryItemById is now available.
# We need to change the mock fetch to actually call `getInventoryItemById`
fetch_old = """      // Try to find the item in the list if available, otherwise fetch from API
      // Since we don't have a getInventoryItemById yet, we mock it by fetching all and filtering
      const items = await inventoryService.getInventoryItems();
      const foundItem = items.find(i => i.id === id);"""
fetch_new = """      // Fetch full item details including movements and reservations
      const foundItem = await inventoryService.getInventoryItemById(id as string);"""
code = code.replace(fetch_old, fetch_new)

with open(ui_path, "w") as f:
    f.write(code)

print("InventoryDetails UI Refactored Successfully.")
