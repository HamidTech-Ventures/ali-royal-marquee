import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"

# 1. Update InventoryForm.tsx
form_path = os.path.join(frontend_src, "features", "inventory", "InventoryForm.tsx")
with open(form_path, "r") as f:
    code = f.read()

# Add itemType to state
state_old = """  const [formData, setFormData] = useState({
    name: '',
    category: 'Furniture',
    quantity: 0,
    minQuantity: 10,
    unit: 'pcs'
  });"""
state_new = """  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    quantity: number;
    minQuantity: number;
    unit: string;
    itemType: 'Fixed Asset' | 'Consumable';
  }>({
    name: '',
    category: 'Furniture',
    quantity: 0,
    minQuantity: 10,
    unit: 'pcs',
    itemType: 'Fixed Asset'
  });"""
code = code.replace(state_old, state_new)

# Update form layout to include itemType dropdown
form_inputs_old = """          <Input 
            label="Item Name" 
            placeholder="e.g. Banquet Chairs" 
            className="col-span-1 md:col-span-2" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Select 
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            options={[
              { value: 'Furniture', label: 'Furniture' },
              { value: 'Decor', label: 'Decor' },
              { value: 'Catering', label: 'Catering Equipment' },
              { value: 'Consumables', label: 'Consumables' },
            ]}
          />"""
form_inputs_new = """          <Select 
            label="Item Type (Crucial Split)"
            value={formData.itemType}
            className="col-span-1 md:col-span-2"
            onChange={(e) => {
              const newType = e.target.value as 'Fixed Asset' | 'Consumable';
              setFormData({
                ...formData, 
                itemType: newType,
                minQuantity: newType === 'Fixed Asset' ? 0 : 10,
                category: newType === 'Fixed Asset' ? 'Furniture' : 'Kitchen Raw Material'
              });
            }}
            options={[
              { value: 'Fixed Asset', label: 'Fixed Asset (Decor/Furniture)' },
              { value: 'Consumable', label: 'Kitchen Consumable (Food/Beverage)' },
            ]}
          />
          <Input 
            label="Item Name" 
            placeholder="e.g. Banquet Chairs or Cooking Oil" 
            className="col-span-1 md:col-span-2" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Select 
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            options={formData.itemType === 'Fixed Asset' ? [
              { value: 'Furniture', label: 'Furniture' },
              { value: 'Decor', label: 'Decor' },
              { value: 'Catering Equipment', label: 'Catering Equipment' },
              { value: 'AV/Electronics', label: 'AV/Electronics' },
            ] : [
              { value: 'Kitchen Raw Material', label: 'Kitchen Raw Material' },
              { value: 'Beverages', label: 'Beverages' },
              { value: 'Disposables', label: 'Disposables' },
            ]}
          />"""
code = code.replace(form_inputs_old, form_inputs_new)

# Hide Reorder level if fixed asset
reorder_old = """          <Input 
            label="Reorder Level (Min Quantity)" 
            type="number" 
            value={formData.minQuantity}
            onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})}
          />"""
reorder_new = """          {formData.itemType === 'Consumable' && (
            <Input 
              label="Reorder Level (Min Quantity)" 
              type="number" 
              value={formData.minQuantity}
              onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})}
            />
          )}"""
code = code.replace(reorder_old, reorder_new)
with open(form_path, "w") as f:
    f.write(code)

# 2. Update Inventory.tsx
inv_path = os.path.join(frontend_src, "features", "inventory", "Inventory.tsx")
with open(inv_path, "r") as f:
    code = f.read()

# Add activeTab state
tabs_state_old = """  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');"""
tabs_state_new = """  // Filter state
  const [statusFilter, setStatusFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');
  const [activeTab, setActiveTab] = useState<'Fixed Asset' | 'Consumable'>('Fixed Asset');"""
code = code.replace(tabs_state_old, tabs_state_new)

# Filter by tab
filter_old = """    if (statusFilter !== 'All') {
      result = result.filter(i => i.status === statusFilter);
    }"""
filter_new = """    // Filter by item type
    result = result.filter(i => i.itemType === activeTab);

    if (statusFilter !== 'All') {
      result = result.filter(i => i.status === statusFilter);
    }"""
code = code.replace(filter_old, filter_new)

# Add Tab UI
kpi_section_end = """              </div>
            </div>
          </div>
        </div>"""
tabs_ui = """        {/* TABS */}
        <div className="flex border-b border-[#e8e4db] mb-2 px-2">
          <button
            onClick={() => setActiveTab('Fixed Asset')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'Fixed Asset' ? 'border-[#5C0A1E] text-[#5C0A1E]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Fixed Assets (Furniture/Decor)
          </button>
          <button
            onClick={() => setActiveTab('Consumable')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'Consumable' ? 'border-[#5C0A1E] text-[#5C0A1E]' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Kitchen Consumables (Food/Raw Materials)
          </button>
        </div>"""
code = code.replace(kpi_section_end, kpi_section_end + "\n\n" + tabs_ui)

# Make column definitions dynamic based on activeTab
col_def_old = """  const columns: ColumnDef<InventoryItem>[] = ["""
col_def_new = """  const columns: ColumnDef<InventoryItem>[] = ["""
# Find columns block
cols_end_idx = code.find("  ];\n\n  return (")
cols_block = code[code.find(col_def_old):cols_end_idx+4]

new_cols_block = """  const columns: ColumnDef<InventoryItem>[] = [
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
      header: 'In Stock / Qty',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-semibold text-on-surface">{item.quantity}</span>
          <span className="text-on-surface-variant text-[12px]">{item.unit}</span>
        </div>
      )
    },
    ...(activeTab === 'Consumable' ? [{
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'right',
      render: (item: any) => {
        let variant: any = 'neutral';
        if (item.status === 'In Stock') variant = 'success';
        if (item.status === 'Low Stock') variant = 'warning';
        if (item.status === 'Out of Stock') variant = 'error';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    }] as any : []),
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
  ];"""
code = code.replace(cols_block, new_cols_block)

with open(inv_path, "w") as f:
    f.write(code)

print("Inventory Frontend Updated")
