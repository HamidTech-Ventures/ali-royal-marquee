// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { settingsApi, type SystemSetting } from '../../services/settingsApi';
import { referenceService } from '../../services/referenceService';
import { useToast } from '../../context/ToastContext';

export const Settings = () => {
  const { success, error: showError } = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [venues, setVenues] = useState<any[]>([]);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [venueForm, setVenueForm] = useState({ name: '', capacity: '', description: '', isActive: true });

  
  
  
  


  // Local state for the form
  const [formData, setFormData] = useState({
    BusinessName: '',
    BrandName: '',
    PrimaryPhone: '',
    WhatsApp: '',
    Address: '',
    TaxRate: '',
    Currency: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getSettings();

      const vData = await referenceService.getVenues();
      setVenues(vData);

      setSettings(data);
      
      const newFormData = { ...formData };
      data.forEach(setting => {
        if (setting.key in newFormData) {
          (newFormData as any)[setting.key] = setting.value;
        }
      });
      setFormData(newFormData);
    } catch (error) {
      showError('Failed to load settings', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
    
  const handleSaveVenue = async () => {
    try {
      if (editingVenue) {
        await referenceService.updateVenue(editingVenue.id, {
          id: editingVenue.id,
          name: venueForm.name,
          capacity: Number(venueForm.capacity) || 0,
          description: venueForm.description,
          isActive: venueForm.isActive
        } as any);
      } else {
        await referenceService.addVenue({
          name: venueForm.name,
          capacity: Number(venueForm.capacity) || 0,
          description: venueForm.description,
          isActive: venueForm.isActive
        } as any);
      }
      success('Venue saved successfully', 'Success');
      setShowVenueModal(false);
      setEditingVenue(null);
      setVenueForm({ name: '', capacity: '', description: '', isActive: true });
      const vData = await referenceService.getVenues();
      setVenues(vData);
    } catch (error) {
      showError('Failed to save venue', 'Error');
    }
  };

  const handleSave = async () => {
    try {
      const updatedSettings = settings.map(setting => {
        if (setting.key in formData) {
          return { ...setting, value: (formData as any)[setting.key] };
        }
        return setting;
      });

      await settingsApi.updateSettings(updatedSettings);
      success('Settings saved successfully', 'Success');
    } catch (error) {
      showError('Failed to save settings', 'Error');
    }
  };

  if (isLoading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="w-full px-8 py-8">
      <div className="flex flex-col w-full space-y-8">
        <PageHeader 
          title="System Settings & Business Configuration"
          category="Enterprise Control Center"
          icon="settings"
          description="Configure Ali Royal Marquee estate operational parameters, security protocols, role-based authorization, peak pricing formulas, invoice templates, and real-time FBR/PRA tax integrations."
          actions={
            <Button variant="primary" icon="save" onClick={handleSave}>Save Changes</Button>
          }
        />


        {/* MAIN DUAL-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-28">
          <aside className="lg:col-span-3 sticky top-24 bg-surface-container-lowest rounded-lg p-3 shadow-sm space-y-6">
            <div>
              <div className="px-3 py-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/70 font-bold mb-1.5 flex items-center justify-between">
                <span>General</span>
                <span className="text-[10px] text-secondary uppercase font-semibold">Estate</span>
              </div>
              <nav className="space-y-0.5">
                <a className="group flex items-center justify-between px-3 py-2 rounded bg-primary text-secondary-fixed shadow-[inset_3px_0_0_#ffdea5] font-semibold transition-all" href="#business-profile">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-secondary-fixed">domain</span>
                    <span className="font-title-sm text-title-sm truncate">Business Profile</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed opacity-80">chevron_right</span>
                </a>
                <a className="group flex items-center justify-between px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all" href="#regional-preferences">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                    <span className="font-title-sm text-title-sm truncate">Regional & System</span>
                  </div>
                </a>

                <a className="group flex items-center justify-between px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all" href="#venues-management">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-outline">deck</span>
                    <span className="font-title-sm text-title-sm truncate">Venues Management</span>
                  </div>
                </a>

              </nav>
            </div>
          </aside>

          {/* RIGHT MAIN WORKSPACE: CONFIGURATION SECTIONS */}
          <div className="lg:col-span-9 space-y-10">
            {/* SECTION 1: BUSINESS PROFILE & SOVEREIGN BRANDING */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden" id="business-profile">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 shadow-[0_1px_0_0_rgba(231,222,213,0.7)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">corporate_fare</span>
                    <h2 className="font-headline-md text-headline-md text-primary">Estate Identity & Legal Entity Details</h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Official venue credentials, brand assets, tax registrations, and executive contacts printed on client dossiers and legal contracts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold tracking-wide">
                    Entity: Reg. 1998/PB
                  </span>
                </div>
              </div>

              <div className="pt-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Registered Entity Name
                    </label>
                    <input name="BusinessName" value={formData.BusinessName} onChange={handleInputChange} className="w-full bg-surface-container-lowest rounded px-3.5 py-2.5 text-on-surface font-title-sm text-title-sm shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors" type="text" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Brand Display Name
                    </label>
                    <input name="BrandName" value={formData.BrandName} onChange={handleInputChange} className="w-full bg-surface-container-lowest rounded px-3.5 py-2.5 text-on-surface font-title-sm text-title-sm shadow-sm focus:outline-none focus:bg-surface-container-low transition-colors" type="text" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Primary Directorate Phone (Voice)
                    </label>
                    <div className="flex items-center bg-surface-container-lowest rounded px-3.5 py-2.5 shadow-sm">
                      <span className="material-symbols-outlined text-outline text-[18px] mr-2">phone_in_talk</span>
                      <input name="PrimaryPhone" value={formData.PrimaryPhone} onChange={handleInputChange} className="w-full bg-transparent text-on-surface font-title-sm text-title-sm outline-none" type="text" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                        Official WhatsApp Gateway
                      </label>
                    </div>
                    <div className="flex items-center bg-surface-container-lowest rounded px-3.5 py-2.5 shadow-sm">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px] mr-2">chat</span>
                      <input name="WhatsApp" value={formData.WhatsApp} onChange={handleInputChange} className="w-full bg-transparent text-on-surface font-title-sm text-title-sm outline-none" type="text" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Estate Physical & Venue Dispatch Address
                    </label>
                    <div className="flex items-start bg-surface-container-lowest rounded px-3.5 py-2.5 shadow-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px] mr-2.5 mt-0.5">pin_drop</span>
                      <textarea name="Address" value={formData.Address} onChange={handleInputChange} className="w-full bg-transparent text-on-surface font-body-md text-body-md outline-none resize-none" rows={2}></textarea>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 shadow-[0_-1px_0_0_rgba(231,222,213,0.7)]">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
                    <span>Last verified by Ali Raza (General Manager) on 01 Sep 2026</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded bg-surface-container-low text-primary hover:bg-surface-container font-title-sm text-title-sm font-semibold transition-colors" type="button">
                      Preview Customer Dossier
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded bg-primary-container hover:bg-primary text-on-primary font-title-sm text-title-sm font-semibold shadow transition-colors" type="button">
                      <span className="material-symbols-outlined text-[18px] text-secondary-fixed">save</span>
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>


            {/* SECTION 2: VENUES MANAGEMENT */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm relative overflow-hidden" id="venues-management">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 shadow-[0_1px_0_0_rgba(231,222,213,0.7)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">deck</span>
                    <h2 className="font-headline-md text-headline-md text-primary">Venues Management</h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Manage your halls, their capacities, and operational status.
                  </p>
                </div>
                <Button variant="primary" icon="add" onClick={() => {
                  setEditingVenue(null);
                  setVenueForm({ name: '', capacity: '', description: '', isActive: true });
                  setShowVenueModal(true);
                }}>
                  Add Venue
                </Button>
              </div>

              <div className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Name</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Capacity</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Status</th>
                        <th className="py-3 px-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venues.map((v: any) => (
                        <tr key={v.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-4 font-title-sm text-title-sm">{v.name}</td>
                          <td className="py-4 px-4 font-body-sm text-body-sm">{v.capacity || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${v.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {v.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button variant="text" size="sm" onClick={() => {
                              setEditingVenue(v);
                              setVenueForm({ name: v.name, capacity: v.capacity?.toString() || '', description: v.description || '', isActive: v.isActive });
                              setShowVenueModal(true);
                            }}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {venues.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-on-surface-variant">No venues found. Add one above.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {showVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary">{editingVenue ? 'Edit Venue' : 'Add Venue'}</h3>
              <button onClick={() => setShowVenueModal(false)} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Venue Name</label>
                <input className="w-full border border-outline-variant rounded-md px-3 py-2" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Capacity</label>
                <input type="number" className="w-full border border-outline-variant rounded-md px-3 py-2" value={venueForm.capacity} onChange={e => setVenueForm({...venueForm, capacity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                <textarea className="w-full border border-outline-variant rounded-md px-3 py-2" value={venueForm.description} onChange={e => setVenueForm({...venueForm, description: e.target.value})} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isactive" checked={venueForm.isActive} onChange={e => setVenueForm({...venueForm, isActive: e.target.checked})} className="w-4 h-4 rounded text-primary" />
                <label htmlFor="isactive" className="text-sm font-medium text-on-surface">Is Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-outline-variant bg-surface-container-lowest">
              <Button variant="outline" onClick={() => setShowVenueModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveVenue}>Save Venue</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
