import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { FormSection } from '../../components/ui/forms/FormLayout';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/forms/Select';
import { packagesService } from '../../services/packagesService';

export const PackageForm = () => {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const isEditMode = !!packageId;
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Premium');
  const [price, setPrice] = useState(0);
  const [minGuests, setMinGuests] = useState(100);
  const [profitMarginTarget, setProfitMarginTarget] = useState(30);
  const [internalNotes, setInternalNotes] = useState('');
  
  // Inclusions state
  const [inclusionsText, setInclusionsText] = useState('');

  useEffect(() => {
    if (isEditMode && packageId) {
      packagesService.getPackage(packageId)
        .then(pkg => {
          setName(pkg.name);
          setType(pkg.type);
          setPrice(pkg.price);
          setMinGuests(pkg.minGuests);
          setProfitMarginTarget(pkg.profitMarginTarget || 30);
          setInternalNotes(pkg.internalNotes || '');
          
          if (pkg.inclusionsJson) {
            try {
              const parsed = JSON.parse(pkg.inclusionsJson);
              if (Array.isArray(parsed)) {
                setInclusionsText(parsed.join('\n'));
              }
            } catch(e) {
              console.error(e);
            }
          }
        })
        .catch(err => {
          console.error(err);
          error('Failed to load package details');
        })
        .finally(() => setIsLoading(false));
    }
  }, [packageId, isEditMode, error]);

  const handleSubmit = async () => {
    if (!name || price <= 0) {
      error('Please provide a valid package name and base price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inclusions = inclusionsText.split('\n').map(i => i.trim()).filter(i => i.length > 0);

      const payload = {
        name,
        type,
        price,
        status: 'Active',
        minGuests,
        profitMarginTarget,
        internalNotes,
        inclusionsJson: JSON.stringify(inclusions)
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
    <div className="w-full px-8 py-8 max-w-4xl mx-auto space-y-8 pb-32">
      <PageHeader 
        title={isEditMode ? "Edit Package" : "Create New Package"} 
        category="Packages" 
        icon="layers"
        onBack={() => navigate(-1)}
      />

      <div className="bg-surface rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm p-8">
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
          <Input 
            label="Target Profit Margin (%)" 
            type="number"
            value={profitMarginTarget.toString()}
            onChange={(e) => setProfitMarginTarget(Number(e.target.value))}
          />
        </FormSection>

        <FormSection title="Inclusions" description="List what is included in this package (one item per line).">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-on-surface mb-2">Package Items</label>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none h-40"
              placeholder="e.g.&#10;Premium Hall Setup&#10;Chicken Biryani&#10;Standard Floral Decor"
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
            />
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
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Package' : 'Save Package')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PackageForm;
