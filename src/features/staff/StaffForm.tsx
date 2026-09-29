import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormSection, FormActions } from '../../components/ui/forms/FormLayout';
import { Input } from '../../components/ui/forms/Input';
import { Select } from '../../components/ui/forms/Select';
import { staffService } from '../../services/staffService';
import type { StaffRole } from '../../types';

export const StaffForm = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { staffId } = useParams<{ staffId: string }>();
  const isEditing = !!staffId;

  const [formData, setFormData] = useState({
    name: '',
    role: '' as StaffRole | '',
    phone: '',
    shift: 'Morning' as 'Morning' | 'Evening' | 'Night',
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
    salary: '',
  });

  useEffect(() => {
    if (isEditing && staffId) {
      staffService.getStaff().then(data => {
        const found = data.find(s => s.id === staffId);
        if (found) {
          setFormData({
            name: found.name,
            role: found.role,
            phone: found.phone,
            shift: found.shift,
            status: found.status,
            salary: found.salary ? found.salary.toString() : '',
          });
        }
      }).catch(err => console.error('Failed to load staff details', err));
    }
  }, [isEditing, staffId]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.role || !formData.phone || !formData.shift || !formData.status) {
      error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        role: formData.role as StaffRole,
        salary: formData.salary ? parseFloat(formData.salary) : undefined
      };

      if (isEditing && staffId) {
        await staffService.updateStaff(staffId, { ...payload, id: staffId } as any);
        success('Employee updated successfully');
      } else {
        await staffService.createStaff(payload);
        success('Employee added successfully');
      }
      navigate('/app/staff');
    } catch (err) {
      console.error('Error saving staff member:', err);
      error(`Failed to ${isEditing ? 'update' : 'add'} employee`);
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
        title={isEditing ? "Edit Employee" : "Add New Employee"}
        category="Human Resources"
        onBack={() => navigate(-1)}
      />

      <div className="bg-white rounded-xl border border-[#e8e4db] shadow-sm p-4 md:p-8 max-w-4xl mx-auto mt-6 md:mt-8">
        <FormSection title="Personal Information" description="Basic demographic and identification details.">
          <Input 
            label="Full Name *" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Ali Raza" 
          />
          <Input 
            label="Phone Number *" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+92 3XX XXXXXXX" 
          />
        </FormSection>

        <FormSection title="Employment Details" description="Role, department, and employment status.">
          <Select 
            label="Role *"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select Role' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Supervisor', label: 'Supervisor' },
              { value: 'Waiter', label: 'Waiter' },
              { value: 'Chef', label: 'Chef' },
              { value: 'Security', label: 'Security' },
            ]}
          />
          <Select 
            label="Shift *"
            name="shift"
            value={formData.shift}
            onChange={handleChange}
            options={[
              { value: 'Morning', label: 'Morning' },
              { value: 'Evening', label: 'Evening' },
              { value: 'Night', label: 'Night' },
            ]}
          />
          <Select 
            label="Status *"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'On Leave', label: 'On Leave' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
          <Input 
            label="Salary (PKR)" 
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            type="number"
            placeholder="e.g. 50000" 
          />
        </FormSection>

        <FormActions 
          onCancel={() => navigate(-1)} 
          onSave={handleSubmit} 
          isSaving={isSubmitting} 
          saveLabel={isEditing ? "Update Employee" : "Save Employee"} 
        />
      </div>
    </div>
  );
};
