import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormSection } from '../../components/ui/forms/FormLayout';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/forms/Select';
import { packagesService } from '../../services/packagesService';
import type { MenuItem } from '../../services/packagesService';

export const PackageForm = () => {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const isEditMode = !!packageId;
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode || true); // true to load menu items

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Premium');
  const [price, setPrice] = useState(0);
  const [minGuests, setMinGuests] = useState(100);
  const [internalNotes, setInternalNotes] = useState('');
  
  // Selected Menu Items (IDs)
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState<string[]>([]);

  // Menu Repository Items
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Load from draft if new package
    if (!isEditMode) {
      const draftStr = localStorage.getItem('packageDraft');
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          setName(draft.name || '');
          setType(draft.type || 'Premium');
          setPrice(draft.price || 0);
          setMinGuests(draft.minGuests || 100);
          setInternalNotes(draft.internalNotes || '');
          setSelectedMenuItemIds(draft.selectedMenuItemIds || []);
        } catch(e) {}
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuItems = await packagesService.getMenuItems();
        setAvailableMenuItems(menuItems);

        if (isEditMode && packageId) {
          const pkg = await packagesService.getPackage(packageId);
          setName(pkg.name);
          setType(pkg.type);
          setPrice(pkg.price);
          setMinGuests(pkg.minGuests);
          setInternalNotes(pkg.internalNotes || '');
          
          if (pkg.inclusionsJson) {
            try {
              const parsed = JSON.parse(pkg.inclusionsJson);
              if (Array.isArray(parsed)) {
                // To support older text-based arrays or new ID arrays
                setSelectedMenuItemIds(parsed);
              }
            } catch(e) {
              console.error(e);
            }
          }
        }
      } catch (err) {
        console.error(err);
        error('Failed to load package details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [packageId, isEditMode, error]);

  const handleSaveDraft = () => {
    if (!isEditMode) {
      localStorage.setItem('packageDraft', JSON.stringify({
        name, type, price, minGuests, internalNotes, selectedMenuItemIds
      }));
      success('Draft saved successfully');
    }
  };

  const handleToggleMenuItem = (id: string) => {
    setSelectedMenuItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name || price <= 0) {
      error('Please provide a valid package name and base price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name,
        type,
        price,
        status: 'Active',
        minGuests,
        internalNotes,
        inclusionsJson: JSON.stringify(selectedMenuItemIds)
      };

      if (isEditMode && packageId) {
        await packagesService.updatePackage(packageId, { id: packageId, ...payload });
        success('Package updated successfully');
      } else {
        await packagesService.createPackage(payload);
        success('Package created successfully');
      }
      
      navigate('/app/packages');
    } catch (err) {
      console.error('Failed to save package', err);
      error('Failed to save package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-on-surface-variant">Loading package data...</div>;

  return (
    <div className="w-full px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6 md:space-y-8 pb-32">
      <PageHeader 
        title={isEditMode ? "Edit Package" : "Create New Package"} 
        category="Packages" 
        icon="layers"
        onBack={() => navigate(-1)}
      />

      <div className="bg-white rounded-xl border border-[#e8e4db] overflow-hidden shadow-sm p-4 md:p-8">
        <FormSection title="Package Configuration" description="Define tier pricing and base details.">
          <Input 
            label="Package Name" 
            placeholder="e.g. Royal Diamond Package" 
            className="col-span-1 md:col-span-2" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select 
            label="Tier / Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'Premium', label: 'Premium' },
              { value: 'Standard', label: 'Standard' },
              { value: 'Basic', label: 'Basic' },
              { value: 'Catering & Decor', label: 'Catering & Decor' },
              { value: 'Decor Only', label: 'Decor Only' },
              { value: 'Corporate', label: 'Corporate' },
              { value: 'All-inclusive', label: 'All-inclusive' },
            ]}
          />
          <Input 
            label="Base Price (Per Pax)" 
            type="number"
            value={price.toString()}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <Input 
            label="Minimum Guests" 
            type="number"
            value={minGuests.toString()}
            onChange={(e) => setMinGuests(Number(e.target.value))}
          />
        </FormSection>

        <FormSection title="Menu Inclusions" description="Select the dishes from the Menu Repository included in this package.">
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableMenuItems.length === 0 ? (
              <p className="text-on-surface-variant text-sm col-span-2">No menu items found. Please add them in the Menu Repository first.</p>
            ) : (
              availableMenuItems.map(item => (
                <label key={item.id} className="flex items-start gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-variant/20 transition-colors">
                  <input 
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedMenuItemIds.includes(item.id)}
                    onChange={() => handleToggleMenuItem(item.id)}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-on-surface">{item.name}</span>
                    <span className="text-xs text-on-surface-variant">{item.category}</span>
                  </div>
                </label>
              ))
            )}
          </div>
        </FormSection>

        <FormSection title="Additional Details" description="Internal remarks and guidelines.">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-on-surface mb-2">Internal Notes</label>
            <textarea 
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none h-24"
              placeholder="Any specific restrictions or notes for the sales team..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            ></textarea>
          </div>
        </FormSection>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" onClick={() => navigate('/app/packages')} disabled={isSubmitting}>Cancel</Button>
          {!isEditMode && <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>Save as Draft</Button>}
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Package' : 'Save Package')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageForm;
