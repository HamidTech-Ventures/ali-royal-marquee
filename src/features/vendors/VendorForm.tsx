import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormSection, FormActions } from '../../components/ui/forms/FormLayout';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { vendorsService } from '../../services/vendorsService';

export const VendorForm = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contactName: '',
    phone: '',
    status: 'Active' as const,
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.contactName || !formData.phone) {
      error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await vendorsService.createVendor(formData);
      success('Vendor registered successfully');
      navigate('/app/vendors');
    } catch (err) {
      console.error('Error registering vendor:', err);
      error('Failed to register vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Register New Vendor"
        category="Procurement Ledger"
        onBack={() => navigate(-1)}
      />

      <div className="bg-white rounded-xl border border-[#e8e4db] shadow-sm p-4 md:p-8 max-w-4xl mx-auto mt-6 md:mt-8">
        <FormSection title="Company Information" description="Basic details of the supplier or contractor.">
          <Input 
            label="Company / Vendor Name *" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Royal Foods Pvt Ltd" 
            className="col-span-1 md:col-span-2" 
          />
          <Select 
            label="Category *"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Category' },
              { value: 'Catering', label: 'Catering' },
              { value: 'Decor', label: 'Decor & Floral' },
              { value: 'Lighting', label: 'Lighting & Sound' },
              { value: 'Logistics', label: 'Logistics' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Select 
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </FormSection>

        <FormSection title="Contact Details" description="Primary communication handles.">
          <Input 
            label="Primary Contact Name *" 
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Full name" 
          />
          <Input 
            label="Phone Number *" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+92 3XX XXXXXXX" 
          />
          <Input label="Email Address" type="email" placeholder="vendor@example.com" />
          <div className="col-span-1 md:col-span-2">
            <Input label="Address" placeholder="Physical address or warehouse location" />
          </div>
        </FormSection>

        <FormActions 
          onCancel={() => navigate(-1)} 
          onSave={handleSubmit} 
          isSaving={isSubmitting} 
          saveLabel="Save Vendor" 
        />
      </div>
    </div>
  );
};
