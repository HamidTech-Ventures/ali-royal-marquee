import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
inv_path = os.path.join(frontend_src, "features", "inventory", "Inventory.tsx")
with open(inv_path, "r") as f:
    code = f.read()

# 1. Remove selectedItem state
state_old = "  const [searchTerm, setSearchTerm] = useState('');\n  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);"
state_new = "  const [searchTerm, setSearchTerm] = useState('');"
code = code.replace(state_old, state_new)

# 2. Remove Drawer Import
import_old = "import { Drawer } from '../../components/ui/Drawer';\n"
code = code.replace(import_old, "")

# 3. Change onRowClick
row_click_old = "onRowClick={(item) => setSelectedItem(item)}"
row_click_new = "onRowClick={(item) => navigate(`/app/inventory/${item.id}`)}"
code = code.replace(row_click_old, row_click_new)

# 4. Remove Tabs block
tabs_start = "{/* TABS */}"
tabs_end = "        {/* CONTROLS */}"
idx_start = code.find(tabs_start)
idx_end = code.find(tabs_end)
if idx_start != -1 and idx_end != -1:
    code = code[:idx_start] + code[idx_end:]

# 5. Inject buttons into Controls
controls_old = """        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1.5 w-full">
            <Button """
controls_new = """        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1.5 w-full">
            <Button
              variant={activeTab === 'Fixed Asset' ? 'primary' : 'text'}
              className={activeTab === 'Fixed Asset' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'}
              onClick={() => setActiveTab('Fixed Asset')}
            >
              Fixed Assets
            </Button>
            <Button
              variant={activeTab === 'Consumable' ? 'primary' : 'text'}
              className={activeTab === 'Consumable' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'}
              onClick={() => setActiveTab('Consumable')}
            >
              Kitchen Consumables
            </Button>
            <div className="w-px h-6 bg-[#e8e4db] mx-1"></div>
            <Button """
code = code.replace(controls_old, controls_new)

# 6. Remove Drawer component entirely
drawer_start = "      <Drawer"
drawer_end = "      </Drawer>\n    </div>"
idx_dstart = code.find(drawer_start)
idx_dend = code.find(drawer_end)
if idx_dstart != -1 and idx_dend != -1:
    code = code[:idx_dstart] + "    </div>"

with open(inv_path, "w") as f:
    f.write(code)

print("Inventory UI Refactored Successfully.")
