import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { FormActions } from '../../components/ui/forms/FormLayout';
import { useToast } from '../../context/ToastContext';
import { customersService } from '../../services/customersService';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerToEdit?: any;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSuccess, customerToEdit }) => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: customerToEdit?.name || '',
    phone: customerToEdit?.phone || '',
    email: customerToEdit?.email || '',
    tier: customerToEdit?.tier || 'Standard'
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: customerToEdit?.name || '',
        phone: customerToEdit?.phone || '',
        email: customerToEdit?.email || '',
        tier: customerToEdit?.tier || 'Standard'
      });
    }
  }, [isOpen, customerToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (customerToEdit) {
        await customersService.updateCustomer(customerToEdit.id, { id: customerToEdit.id, ...formData });
        success('Customer updated successfully');
      } else {
        await customersService.createCustomer(formData);
        success('Customer added successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      error('Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? "Edit Customer" : "Add New Customer"}
      description={customerToEdit ? "Update customer profile." : "Create a new customer profile."}
      maxWidth="lg"
      footer={
        <FormActions 
          onCancel={onClose} 
          onSave={handleSubmit} 
          isSaving={isSubmitting} 
          saveLabel={customerToEdit ? "Save Changes" : "Add Customer"} 
          className="pt-0 mt-0 border-0 w-full"
        />
      }
    >
      <div className="flex flex-col gap-4 py-2">
        <Input 
          label="Full Name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          required 
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Phone Number" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange}
            required 
          />
          <Input 
            label="Email Address" 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange}
          />
        </div>
        <Select 
          label="Customer Tier" 
          name="tier"
          value={formData.tier}
          onChange={handleChange}
          options={[
            { label: 'Standard', value: 'Standard' },
            { label: 'Corporate', value: 'Corporate' },
            { label: 'VIP', value: 'VIP' }
          ]}
        />
      </div>
    </Modal>
  );
};
