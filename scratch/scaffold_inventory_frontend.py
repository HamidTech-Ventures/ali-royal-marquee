import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"

# 1. Update Types
types_path = os.path.join(frontend_src, "types", "index.ts")
with open(types_path, "r") as f:
    code = f.read()

types_additions = """
export type InventoryMovement = {
  id: string;
  type: 'IN' | 'OUT' | 'RELOCATE';
  quantity: number;
  notes?: string;
  reference?: string;
  createdAt: string;
};

export type InventoryReservation = {
  id: string;
  eventId: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
};
"""
code += types_additions
code = code.replace("  status: 'In Stock' | 'Low Stock' | 'Out of Stock';", 
                    "  status: 'In Stock' | 'Low Stock' | 'Out of Stock';\n"
                    "  unitPrice?: number;\n  location?: string;\n"
                    "  movements?: InventoryMovement[];\n  reservations?: InventoryReservation[];")

with open(types_path, "w") as f:
    f.write(code)

# 2. Update Service
service_path = os.path.join(frontend_src, "services", "inventoryService.ts")
with open(service_path, "r") as f:
    code = f.read()

service_additions = """
  getInventoryItemById: async (id: string): Promise<InventoryItem> => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  addInventoryMovement: async (data: any): Promise<string> => {
    const response = await api.post('/inventory/movements', data);
    return response.data;
  },

  updateInventoryItemDetails: async (id: string, data: any): Promise<void> => {
    await api.put(`/inventory/${id}/details`, data);
  },
"""
code = code.replace("  getInventoryItems: async (): Promise<InventoryItem[]> => {", service_additions + "  getInventoryItems: async (): Promise<InventoryItem[]> => {")
with open(service_path, "w") as f:
    f.write(code)

print("Frontend models and services updated.")
