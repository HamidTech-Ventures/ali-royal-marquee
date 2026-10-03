import os
import re

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
settings_path = os.path.join(frontend_src, "features/settings/Settings.tsx")

with open(settings_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Insert State Variables
state_vars = """
  const [venues, setVenues] = useState<any[]>([]);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [venueForm, setVenueForm] = useState({ name: '', capacity: '', description: '', isActive: true });
"""
if "const [venues, setVenues]" not in content:
    content = content.replace("const [isLoading, setIsLoading] = useState(true);", "const [isLoading, setIsLoading] = useState(true);\n" + state_vars)

# 2. Insert handleSaveVenue function
save_func = """
  const handleSaveVenue = async () => {
    try {
      if (editingVenue) {
        await referenceService.updateVenue(editingVenue.id, {
          name: venueForm.name,
          capacity: Number(venueForm.capacity) || 0,
          description: venueForm.description,
          isActive: venueForm.isActive
        } as any);
      } else {
        await referenceService.addVenue({
          name: venueForm.name,
          capacity: Number(venueForm.capacity) || 0,
          description: venueForm.description,
          isActive: venueForm.isActive
        } as any);
      }
      success('Venue saved successfully', 'Success');
      setShowVenueModal(false);
      setEditingVenue(null);
      setVenueForm({ name: '', capacity: '', description: '', isActive: true });
      const vData = await referenceService.getVenues();
      setVenues(vData);
    } catch (error) {
      showError('Failed to save venue', 'Error');
    }
  };
"""
if "const handleSaveVenue =" not in content:
    content = content.replace("const handleSave = async () => {", save_func + "\n  const handleSave = async () => {")

# 3. Insert the Venues Management UI Section
venues_ui = """
            {/* SECTION 2: VENUES MANAGEMENT */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden" id="venues-management">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 shadow-[0_1px_0_0_rgba(231,222,213,0.7)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">deck</span>
                    <h2 className="font-headline-md text-headline-md text-primary">Venues Management</h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Manage your halls, their capacities, and operational status.
                  </p>
                </div>
                <Button variant="primary" icon="add" onClick={() => {
                  setEditingVenue(null);
                  setVenueForm({ name: '', capacity: '', description: '', isActive: true });
                  setShowVenueModal(true);
                }}>
                  Add Venue
                </Button>
              </div>

              <div className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Name</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Capacity</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Status</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venues.map((v: any) => (
                        <tr key={v.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-4 font-title-sm text-title-sm">{v.name}</td>
                          <td className="py-4 px-4 font-body-sm text-body-sm">{v.capacity || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${v.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {v.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="text" size="sm" onClick={() => {
                              setEditingVenue(v);
                              setVenueForm({ name: v.name, capacity: v.capacity?.toString() || '', description: v.description || '', isActive: v.isActive });
                              setShowVenueModal(true);
                            }}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {venues.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-on-surface-variant">No venues found. Add one above.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
"""
if "id=\"venues-management\"" not in content:
    # Insert after BUSINESS PROFILE section ends
    content = content.replace("</section>\n          </div>", "</section>\n\n" + venues_ui + "\n          </div>")

# 4. Insert Modal
modal_ui = """
      {showVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary">{editingVenue ? 'Edit Venue' : 'Add Venue'}</h3>
              <button onClick={() => setShowVenueModal(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Venue Name</label>
                <input className="w-full border border-outline-variant rounded-md px-3 py-2" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Capacity</label>
                <input type="number" className="w-full border border-outline-variant rounded-md px-3 py-2" value={venueForm.capacity} onChange={e => setVenueForm({...venueForm, capacity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                <textarea className="w-full border border-outline-variant rounded-md px-3 py-2" value={venueForm.description} onChange={e => setVenueForm({...venueForm, description: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isactive" checked={venueForm.isActive} onChange={e => setVenueForm({...venueForm, isActive: e.target.checked})} className="w-4 h-4 rounded text-primary" />
                <label htmlFor="isactive" className="text-sm font-medium text-on-surface">Is Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-outline-variant bg-surface-container-lowest">
              <Button variant="outline" onClick={() => setShowVenueModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveVenue}>Save Venue</Button>
            </div>
          </div>
        </div>
      )}
"""
if "showVenueModal &&" not in content:
    # Insert just before final </div>
    content = content.replace("    </div>\n  );\n};", modal_ui + "\n    </div>\n  );\n};")
    
# Also add Venues Management to sidebar navigation
sidebar_link = """
                <a className="group flex items-center justify-between px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all" href="#venues-management">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-outline">deck</span>
                    <span className="font-title-sm text-title-sm truncate">Venues Management</span>
                  </div>
                </a>
"""
if "href=\"#venues-management\"" not in content:
    content = content.replace("href=\"#regional-preferences\">\n                  <div className=\"flex items-center gap-2.5 min-w-0\">\n                    <span className=\"material-symbols-outlined text-[18px] text-outline\">tune</span>\n                    <span className=\"font-title-sm text-title-sm truncate\">Regional & System</span>\n                  </div>\n                </a>", "href=\"#regional-preferences\">\n                  <div className=\"flex items-center gap-2.5 min-w-0\">\n                    <span className=\"material-symbols-outlined text-[18px] text-outline\">tune</span>\n                    <span className=\"font-title-sm text-title-sm truncate\">Regional & System</span>\n                  </div>\n                </a>\n" + sidebar_link)

with open(settings_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Settings.tsx fully restored with Venues module!")
