import os
import re

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\packages\PackagesMenu.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove cost from menuFormData and modals
content = content.replace("cost: 0", "")
content = content.replace("cost: item.cost", "")

# 2. Add Editing State
if "const [editItemId, setEditItemId] = useState<string | null>(null);" not in content:
    content = content.replace("const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '', cost: 0 });", 
"""const [editItemId, setEditItemId] = useState<string | null>(null);
  const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '' });""")
    
    content = content.replace("const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '',  });", 
"""const [editItemId, setEditItemId] = useState<string | null>(null);
  const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '' });""")
    
    content = content.replace("const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '' });",
"""const [editItemId, setEditItemId] = useState<string | null>(null);
  const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '' });""")

# 3. Remove Cost column and add Edit button in Menu
menu_col_str = """    { key: 'cost', header: 'Cost', align: 'right', sortable: true, render: (item) => <span className="font-currency-num text-primary">PKR {item.cost.toLocaleString()}</span> },
    { key: 'actions', header: '', align: 'right', render: (item) => (
      <button onClick={() => handleDeleteMenuItem(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    )}"""
menu_col_new = """    { key: 'actions', header: '', align: 'right', render: (item) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => {
            setEditItemId(item.id);
            setMenuFormData({ name: item.name, category: item.category, description: item.description || '' });
            setIsMenuModalOpen(true);
        }} className="text-on-surface-variant hover:text-primary p-1.5 rounded-md">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={() => handleDeleteMenuItem(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    )}"""
content = content.replace(menu_col_str, menu_col_new)

# 4. Add Edit button in Addons
addon_col_str = """    { key: 'actions', header: '', align: 'right', render: (item) => (
      <button onClick={() => handleDeleteAddon(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    )}"""
addon_col_new = """    { key: 'actions', header: '', align: 'right', render: (item) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => {
            setEditItemId(item.id);
            setAddonFormData({ name: item.name, category: item.category, price: item.price, description: item.description || '', unit: item.unit });
            setIsAddonModalOpen(true);
        }} className="text-on-surface-variant hover:text-primary p-1.5 rounded-md">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={() => handleDeleteAddon(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    )}"""
content = content.replace(addon_col_str, addon_col_new)

# 5. Add Edit button in PricingRules
rule_col_str = """    { key: 'actions', header: '', align: 'right', render: (item) => (
      <button onClick={() => handleDeletePricingRule(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    )}"""
rule_col_new = """    { key: 'actions', header: '', align: 'right', render: (item) => (
      <div className="flex justify-end gap-2">
        <button onClick={() => {
            setEditItemId(item.id);
            setPricingFormData({ name: item.name, ruleType: item.ruleType, flatAmount: item.flatAmount?.toString() || '', percentageAmount: item.percentageAmount?.toString() || '' });
            setIsPricingModalOpen(true);
        }} className="text-on-surface-variant hover:text-primary p-1.5 rounded-md">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={() => handleDeletePricingRule(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    )}"""
content = content.replace(rule_col_str, rule_col_new)

# 6. Update Save Handlers for edit mode
content = content.replace("""const handleSaveMenu = async () => {
    try {
      const newId = await packagesService.createMenuItem({
        name: menuFormData.name,
        category: menuFormData.category,
        description: menuFormData.description,
        cost: menuFormData.cost
      });
      setMenuItems([...menuItems, { id: newId, ...menuFormData }]);
      success('Menu item added successfully');
      setIsMenuModalOpen(false);
      setMenuFormData({ name: '', category: '', description: '', cost: 0 });
    } catch (e) {
      showError('Failed to add menu item');
    }
  };""", """const handleSaveMenu = async () => {
    try {
      const payload = {
        name: menuFormData.name,
        category: menuFormData.category,
        description: menuFormData.description
      };
      if (editItemId) {
          await packagesService.updateMenuItem(editItemId, { id: editItemId, ...payload } as any);
          setMenuItems(menuItems.map(m => m.id === editItemId ? { id: editItemId, ...payload } as any : m));
          success('Menu item updated successfully');
      } else {
          const newId = await packagesService.createMenuItem(payload as any);
          setMenuItems([...menuItems, { id: newId, ...payload } as any]);
          success('Menu item added successfully');
      }
      setIsMenuModalOpen(false);
      setMenuFormData({ name: '', category: '', description: '' });
      setEditItemId(null);
    } catch (e) {
      showError('Failed to save menu item');
    }
  };""")

content = content.replace("""const handleSaveAddon = async () => {
    try {
      const newId = await packagesService.createAddon(addonFormData);
      setAddons([...addons, { id: newId, ...addonFormData }]);
      success('Add-on added successfully');
      setIsAddonModalOpen(false);
      setAddonFormData({ name: '', category: '', price: 0, description: '', unit: '' });
    } catch (e) {
      showError('Failed to add Add-on');
    }
  };""", """const handleSaveAddon = async () => {
    try {
      if (editItemId) {
          await packagesService.updateAddon(editItemId, { id: editItemId, ...addonFormData });
          setAddons(addons.map(a => a.id === editItemId ? { id: editItemId, ...addonFormData } : a));
          success('Add-on updated successfully');
      } else {
          const newId = await packagesService.createAddon(addonFormData);
          setAddons([...addons, { id: newId, ...addonFormData }]);
          success('Add-on added successfully');
      }
      setIsAddonModalOpen(false);
      setAddonFormData({ name: '', category: '', price: 0, description: '', unit: '' });
      setEditItemId(null);
    } catch (e) {
      showError('Failed to save Add-on');
    }
  };""")

content = content.replace("""const handleSavePricing = async () => {
    try {
      const payload = {
        name: pricingFormData.name,
        ruleType: pricingFormData.ruleType,
        flatAmount: pricingFormData.flatAmount ? Number(pricingFormData.flatAmount) : undefined,
        percentageAmount: pricingFormData.percentageAmount ? Number(pricingFormData.percentageAmount) : undefined
      };
      const newId = await packagesService.createPricingRule(payload);
      setPricingRules([...pricingRules, { id: newId, ...payload }]);
      success('Pricing rule added successfully');
      setIsPricingModalOpen(false);
      setPricingFormData({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' });
    } catch (e) {
      showError('Failed to add Pricing rule');
    }
  };""", """const handleSavePricing = async () => {
    try {
      const payload = {
        name: pricingFormData.name,
        ruleType: pricingFormData.ruleType,
        flatAmount: pricingFormData.flatAmount ? Number(pricingFormData.flatAmount) : undefined,
        percentageAmount: pricingFormData.percentageAmount ? Number(pricingFormData.percentageAmount) : undefined
      };
      if (editItemId) {
          await packagesService.updatePricingRule(editItemId, { id: editItemId, ...payload });
          setPricingRules(pricingRules.map(r => r.id === editItemId ? { id: editItemId, ...payload } : r));
          success('Pricing rule updated successfully');
      } else {
          const newId = await packagesService.createPricingRule(payload);
          setPricingRules([...pricingRules, { id: newId, ...payload }]);
          success('Pricing rule added successfully');
      }
      setIsPricingModalOpen(false);
      setPricingFormData({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' });
      setEditItemId(null);
    } catch (e) {
      showError('Failed to save Pricing rule');
    }
  };""")

# 7. Remove Cost Input from UI
cost_input = """          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cost (PKR)</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" value={menuFormData.cost} onChange={(e) => setMenuFormData({...menuFormData, cost: Number(e.target.value)})} />
            </div>
          </div>"""
content = content.replace(cost_input, "")

# 8. Reset Edit Item ID on Modal Closes
content = content.replace("setIsMenuModalOpen(true)", "setEditItemId(null); setMenuFormData({ name: '', category: '', description: '' }); setIsMenuModalOpen(true)")
content = content.replace("setIsAddonModalOpen(true)", "setEditItemId(null); setAddonFormData({ name: '', category: '', price: 0, description: '', unit: '' }); setIsAddonModalOpen(true)")
content = content.replace("setIsPricingModalOpen(true)", "setEditItemId(null); setPricingFormData({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' }); setIsPricingModalOpen(true)")

# Fix multiple setEditItemId(null) from double matching
content = content.replace("setEditItemId(null); setMenuFormData({ name: '', category: '', description: '' }); setEditItemId(null);", "setEditItemId(null); setMenuFormData({ name: '', category: '', description: '' });")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
