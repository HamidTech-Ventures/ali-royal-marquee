import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormSection, FormActions } from '../../components/ui/forms/FormLayout';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { inventoryService } from '../../services/inventoryService';

export const InventoryForm = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Furniture',
    quantity: 0,
    minQuantity: 10,
    unit: 'pcs'
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await inventoryService.createInventoryItem(formData);
      success('Item added successfully');
      navigate('/app/inventory');
    } catch (err) {
      console.error(err);
      error('Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Add Inventory Item"
        category="Operations & Logistics"
        onBack={() => navigate(-1)}
      />

      <div className="bg-white rounded-xl border border-[#e8e4db] shadow-sm p-4 md:p-8 max-w-4xl mx-auto mt-6 md:mt-8">
        <FormSection title="Item Details" description="Add a new physical asset or consumable.">
          <Input 
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
          />
          <Input 
            label="Initial Quantity" 
            type="number" 
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
          />
          <Input 
            label="Reorder Level (Min Quantity)" 
            type="number" 
            value={formData.minQuantity}
            onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})}
          />
          <Input 
            label="Unit" 
            placeholder="pcs, kg, etc." 
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
          />
          <div className="col-span-1 md:col-span-2">
            <Input label="Supplier (Optional)" placeholder="Select vendor" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input label="Notes" placeholder="Enter notes..." />
          </div>
        </FormSection>

        <FormActions 
          onCancel={() => navigate(-1)} 
          onSave={handleSubmit} 
          isSaving={isSubmitting} 
          saveLabel="Add Item" 
        />
      </div>
    </div>
  );
};
