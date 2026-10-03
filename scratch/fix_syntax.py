import os

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\packages\PackagesMenu.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix useState duplication
content = content.replace(
    "const [editItemId, setEditItemId] = useState<string | null>(null);\n  const [editItemId, setEditItemId] = useState<string | null>(null);",
    "const [editItemId, setEditItemId] = useState<string | null>(null);"
)

# Fix onClick handlers missing braces
content = content.replace("onClick={() => setEditItemId(null); setMenuFormData({ name: '', category: '', description: '' }); setIsMenuModalOpen(true)}", "onClick={() => { setEditItemId(null); setMenuFormData({ name: '', category: '', description: '' }); setIsMenuModalOpen(true); }}")
content = content.replace("onClick={() => setEditItemId(null); setAddonFormData({ name: '', category: '', price: 0, description: '', unit: '' }); setIsAddonModalOpen(true)}", "onClick={() => { setEditItemId(null); setAddonFormData({ name: '', category: '', price: 0, description: '', unit: '' }); setIsAddonModalOpen(true); }}")
content = content.replace("onClick={() => setEditItemId(null); setPricingFormData({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' }); setIsPricingModalOpen(true)}", "onClick={() => { setEditItemId(null); setPricingFormData({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' }); setIsPricingModalOpen(true); }}")

# Handle handleSave functions missing closing brace
content = content.replace("""const handleSaveMenu = async () => {
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

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
