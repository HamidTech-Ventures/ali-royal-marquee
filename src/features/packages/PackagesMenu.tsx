import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

import type { Package, MenuItem, Addon, PricingRule } from '../../services/packagesService';
import { packagesService } from '../../services/packagesService';
import { useToast } from '../../context/ToastContext';

export const PackagesMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.state?.fromBusiness;
  const { success, error: showError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'packages' | 'menu' | 'addons' | 'pricing'>('packages');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [featuredPackageId, setFeaturedPackageId] = useState<string | null>(null);

  const [packages, setPackages] = useState<Package[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Form States
  const [menuFormData, setMenuFormData] = useState({ name: '', category: '', description: '', cost: 0 });
  const [addonFormData, setAddonFormData] = useState({ name: '', category: '', price: 0, description: '', unit: '' });
  const [pricingFormData, setPricingFormData] = useState({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const [pkgs, menus, adds, rules] = await Promise.all([
          packagesService.getPackages(),
          packagesService.getMenuItems(),
          packagesService.getAddons(),
          packagesService.getPricingRules()
        ]);
        setPackages(pkgs);
        setMenuItems(menus);
        setAddons(adds);
        setPricingRules(rules);
      } catch (err) {
        console.error('Failed to load package data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = packages;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((p: Package) => p.name.toLowerCase().includes(lowerSearch) || p.type.toLowerCase().includes(lowerSearch));
    }
    result.sort((a: Package, b: Package) => {
      const valA = (a as any)[sortColumn];
      const valB = (b as any)[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [searchTerm, sortColumn, sortDirection, packages]);

  const featuredPackage = useMemo(() => {
    if (featuredPackageId) {
      return packages.find(p => p.id === featuredPackageId) || filteredData[0];
    }
    return filteredData[0];
  }, [featuredPackageId, packages, filteredData]);

  const handleDeletePackage = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the package "${name}"?`)) {
      try {
        await packagesService.deletePackage(id);
        success('Package deleted successfully');
        setPackages(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting package:', error);
        showError('Failed to delete package');
      }
    }
  };

  const columns: ColumnDef<Package>[] = [
    { key: 'name', header: 'Package Name', sortable: true, render: (item) => <span className="font-semibold text-on-surface">{item.name}</span> },
    { key: 'type', header: 'Type / Tier', sortable: true },
    { key: 'minGuests', header: 'Min Guests', sortable: true, render: (item) => <span>{item.minGuests} Pax</span> },
    { key: 'price', header: 'Base Price', sortable: true, align: 'right', render: (item) => <span className="font-currency-num font-bold text-primary">PKR {item.price.toLocaleString()}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (item) => {
        let variant: any = 'neutral';
        if (item.status === 'Active') variant = 'success';
        if (item.status === 'Draft') variant = 'warning';
        if (item.status === 'Archived') variant = 'error';
        return <Badge variant={variant}>{item.status}</Badge>;
    }},
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/packages/${item.id}`); }} title="Manage">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Button>
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/packages/${item.id}/edit`); }} title="Edit">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Button>
          <Button variant="text" className="!p-2 text-error hover:bg-error/10" onClick={(e) => { e.stopPropagation(); handleDeletePackage(item.id, item.name); }} title="Delete">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </Button>
        </div>
      )
    }
  ];

  const menuColumns: ColumnDef<MenuItem>[] = [
    { key: 'name', header: 'Item Name', sortable: true, render: (item) => <span className="font-semibold">{item.name}</span> },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'description', header: 'Description', sortable: false },
    { key: 'cost', header: 'Cost', align: 'right', sortable: true, render: (item) => <span className="font-currency-num text-primary">PKR {item.cost.toLocaleString()}</span> },
    { key: 'actions', header: '', align: 'right', render: (item) => (
      <button onClick={() => handleDeleteMenuItem(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    )}
  ];

  const addonColumns: ColumnDef<Addon>[] = [
    { key: 'name', header: 'Addon Name', sortable: true, render: (item) => <span className="font-semibold">{item.name}</span> },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'price', header: 'Price', align: 'right', sortable: true, render: (item) => <span className="font-currency-num text-primary">PKR {item.price.toLocaleString()}</span> },
    { key: 'unit', header: 'Unit', sortable: false },
    { key: 'actions', header: '', align: 'right', render: (item) => (
      <button onClick={() => handleDeleteAddon(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    )}
  ];

  const pricingColumns: ColumnDef<PricingRule>[] = [
    { key: 'name', header: 'Rule Name', sortable: true, render: (item) => <span className="font-semibold">{item.name}</span> },
    { key: 'ruleType', header: 'Type', sortable: true },
    { key: 'amount', header: 'Amount', align: 'right', sortable: false, render: (item) => (
      <span className="font-currency-num text-primary">
        {item.flatAmount ? `PKR ${item.flatAmount.toLocaleString()}` : `${item.percentageAmount}%`}
      </span>
    )},
    { key: 'actions', header: '', align: 'right', render: (item) => (
      <button onClick={() => handleDeletePricingRule(item.id)} className="text-error hover:bg-error/10 p-1.5 rounded-md">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    )}
  ];

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm('Delete this menu item?')) {
      await packagesService.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (confirm('Delete this addon?')) {
      await packagesService.deleteAddon(id);
      setAddons(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleDeletePricingRule = async (id: string) => {
    if (confirm('Delete this pricing rule?')) {
      await packagesService.deletePricingRule(id);
      setPricingRules(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleCreateMenuItem = async () => {
    try {
      const res = await packagesService.createMenuItem(menuFormData);
      setMenuItems(prev => [...prev, { ...menuFormData, id: res }]);
      setIsMenuModalOpen(false);
      setMenuFormData({ name: '', category: '', description: '', cost: 0 });
    } catch (err) {
      console.error('Failed to create menu item', err);
    }
  };

  const handleCreateAddon = async () => {
    try {
      const res = await packagesService.createAddon(addonFormData);
      setAddons(prev => [...prev, { ...addonFormData, id: res }]);
      setIsAddonModalOpen(false);
      setAddonFormData({ name: '', category: '', price: 0, description: '', unit: '' });
    } catch (err) {
      console.error('Failed to create addon', err);
    }
  };

  const handleCreatePricingRule = async () => {
    try {
      const payload: any = { name: pricingFormData.name, ruleType: pricingFormData.ruleType };
      if (pricingFormData.flatAmount) payload.flatAmount = Number(pricingFormData.flatAmount);
      if (pricingFormData.percentageAmount) payload.percentageAmount = Number(pricingFormData.percentageAmount);
      
      const res = await packagesService.createPricingRule(payload);
      setPricingRules(prev => [...prev, { ...payload, id: res }]);
      setIsPricingModalOpen(false);
      setPricingFormData({ name: '', ruleType: 'Surcharge', flatAmount: '', percentageAmount: '' });
    } catch (err) {
      console.error('Failed to create pricing rule', err);
    }
  };

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col w-full space-y-6">
        <PageHeader 
          title="Packages & Menu Management"
          category="Commercial Operations"
          icon="layers"
          description="Curate luxury banquet tiers, culinary riders, per-head rate cards, and bespoke event add-ons across Ali Royal Marquee venues."
          onBack={showBack ? () => navigate(-1) : undefined}
          actions={
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="hidden md:flex items-center bg-white px-3.5 py-2 rounded-lg shadow-sm border border-[#e8e4db]">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant mr-2">search</span>
                <input 
                  className="bg-transparent text-on-surface font-body-sm text-body-sm outline-none w-48 placeholder:text-on-surface-variant/60" 
                  placeholder="Search catalog, dish, SKU..." 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant ml-2 font-medium">⌘K</span>
              </div>
              <button 
                className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e8e4db] text-[#4a1420] px-3 md:px-4 py-2 rounded-lg shadow-sm transition-all border border-[#e8e4db] text-xs md:text-sm font-medium" 
                type="button"
                onClick={() => setIsMenuModalOpen(true)}
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span className="whitespace-nowrap">Menu Item</span>
              </button>
              <button className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-[#5C0A1E] hover:bg-[#4a1420] text-white px-3 md:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all" type="button" onClick={() => navigate('/app/packages/new')}>
                <span className="material-symbols-outlined text-[20px] text-[#b0891d]">layers</span>
                <span className="text-xs md:text-sm font-semibold tracking-wide whitespace-nowrap">Create Package</span>
              </button>
            </div>
          }
        />

        {/* Executive Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-5 mb-4 md:mb-8">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Active Packages</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{filteredData.length}</span>
                  <span className="text-[10px] md:text-xs text-[#b0891d] font-medium">Tiers</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">auto_awesome_motion</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/50 px-3 py-2.5 rounded-b-xl w-full">
              <span>Across 4 Venue Halls</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">+2 Seasonal</span>
            </div>
          </div>
          
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Culinary Dishes</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{menuItems.length}</span>
                  <span className="text-[10px] md:text-xs text-on-surface-variant font-medium">Collections</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">restaurant</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/50 px-3 py-2.5 rounded-b-xl w-full">
              <span className="truncate">Desi, Continental & Mughal</span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">Live Live</span>
            </div>
          </div>
          
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Add-on Inventory</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{addons.length}</span>
                  <span className="text-[10px] md:text-xs text-[#b0891d] font-medium">Upgrades</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">room_service</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/50 px-3 py-2.5 rounded-b-xl w-full">
              <span className="truncate">Live Stalls, Floral, FX</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">Active</span>
            </div>
          </div>

          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4a1420]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Top Revenue Tier</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-lg md:text-2xl text-[#4a1420] font-bold truncate max-w-[120px]">
                    {filteredData.length > 0 ? [...filteredData].sort((a,b) => b.price - a.price)[0].name : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#4a1420]/10 flex items-center justify-center text-[#4a1420]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">hotel_class</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/50 px-3 py-2.5 rounded-b-xl w-full">
              <span>42 Confirmed Events</span>
              <span className="font-currency-num text-[13px] text-primary font-bold">PKR 32.8M</span>
            </div>
          </div>

          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Average Head Yield</p>
                <div className="flex items-baseline gap-1 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">
                    {filteredData.length > 0 ? Math.round(filteredData.reduce((acc, curr) => acc + curr.price, 0) / filteredData.length).toLocaleString() : '0'}
                  </span>
                  <span className="text-[10px] md:text-xs text-on-surface-variant font-medium">PKR/Pax</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">trending_up</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low/50 px-3 py-2.5 rounded-b-xl w-full">
              <span>Season Index 2025</span>
              <span className="font-label-sm text-label-sm text-[#10b981] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>14% YoY
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation & Action Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg font-title-sm text-title-sm transition-colors ${activeTab === 'packages' ? 'bg-primary text-secondary-fixed shadow-sm font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Packages ({filteredData.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-title-sm text-title-sm transition-colors ${activeTab === 'menu' ? 'bg-primary text-secondary-fixed shadow-sm font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>Menu Repository ({menuItems.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('addons')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-title-sm text-title-sm transition-colors ${activeTab === 'addons' ? 'bg-primary text-secondary-fixed shadow-sm font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">extension</span>
              <span>Add-ons & Upgrades ({addons.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-title-sm text-title-sm transition-colors ${activeTab === 'pricing' ? 'bg-primary text-secondary-fixed shadow-sm font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'}`} 
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">percent</span>
              <span>Pricing & Surcharge Engine ({pricingRules.length})</span>
            </button>
          </div>
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-title-sm text-title-sm px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors" type="button">
              <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
              <span>Compare Tiers</span>
            </button>
          </div>
        </div>

        {activeTab === 'packages' && (
          <>
        {/* FEATURED BANQUET PACKAGE */}
        {featuredPackage && (
        <div className="bg-white rounded-xl border border-[#e8e4db] shadow-sm mb-6 md:mb-10 overflow-hidden relative transition-all duration-300">
          <div className="h-1.5 w-full bg-[#5C0A1E]"></div>
          <div className="p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 md:gap-8">
            <div className="xl:w-5/12 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                  <span className="bg-[#5C0A1E] text-white px-3 py-1 rounded-full font-label-sm text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    Selected Package
                  </span>
                  <div className="space-y-4">
                    <span className="bg-[#b0891d]/20 text-[#b0891d] px-2.5 py-0.5 rounded font-label-sm text-[10px] md:text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-[#4a1420] font-bold tracking-tight">{featuredPackage.name}</h2>
                <p className="font-body-md text-sm md:text-base text-on-surface-variant mt-2 leading-relaxed">
                  {featuredPackage.type} Tier offering.
                </p>
              </div>
              <div className="relative rounded-xl overflow-hidden shadow-sm h-40 md:h-48 w-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                [Image: Luxurious wedding marquee]
                <div className="absolute inset-0 bg-gradient-to-t from-[#5C0A1E]/90 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2 md:gap-3 text-white">
                    <span className="material-symbols-outlined text-[18px] md:text-[20px] text-[#b0891d]">verified_user</span>
                    <span className="font-title-sm text-xs md:text-sm">Includes Crystal Grand Hall & Executive VIP Mezzanine</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#e8e4db] rounded-xl p-3 md:p-4 flex items-center justify-between overflow-x-auto hide-scrollbar gap-4">
                <div className="shrink-0">
                  <span className="font-label-sm text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant block font-medium">Head Tariff</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-label-md text-[10px] md:text-xs text-[#5C0A1E] font-bold">PKR</span>
                    <span className="font-serif text-lg md:text-2xl text-[#5C0A1E] font-bold">{featuredPackage.price.toLocaleString()}</span>
                    <span className="font-body-sm text-[10px] md:text-xs text-on-surface-variant">/ Guest</span>
                  </div>
                </div>
                <div className="h-8 md:h-10 w-[1px] bg-[#e8e4db] shrink-0"></div>
                <div className="shrink-0">
                  <span className="font-label-sm text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant block font-medium">Minimum Floor</span>
                  <span className="font-title-md text-sm md:text-base text-on-surface font-bold mt-0.5 block">PKR 900,000</span>
                </div>
                <div className="h-8 md:h-10 w-[1px] bg-[#e8e4db] shrink-0"></div>
                <div className="shrink-0">
                  <span className="font-label-sm text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant block font-medium">Guest Range</span>
                  <span className="font-title-md text-sm md:text-base text-on-surface font-bold mt-0.5 block">{featuredPackage.minGuests} Pax</span>
                </div>
              </div>
            </div>
            
            <div className="xl:w-7/12 flex flex-col justify-between bg-white border border-[#e8e4db] shadow-sm rounded-xl p-4 md:p-6">
              <div>
                <div className="flex items-center justify-between pb-3 md:pb-4 mb-3 md:mb-4 border-b border-[#e8e4db]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b0891d] text-[20px] md:text-[22px]">restaurant_menu</span>
                    <h3 className="font-serif text-lg md:text-xl text-[#4a1420] font-bold">Inclusions & Culinary Matrix</h3>
                  </div>
                  <span className="font-label-sm text-[10px] md:text-xs text-[#5C0A1E] bg-[#5C0A1E]/10 px-2.5 py-1 rounded-full font-semibold">
                    {featuredPackage.inclusionsJson ? JSON.parse(featuredPackage.inclusionsJson).length : 0} Items
                  </span>
                </div>
                <div className="text-sm md:text-base grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {featuredPackage.inclusionsJson && JSON.parse(featuredPackage.inclusionsJson).map((inc: string, idx: number) => (
                    <div key={idx} className="bg-[#FAF8F5] border border-[#e8e4db] rounded-lg p-2.5 md:p-3 shadow-sm flex items-start gap-2 group hover:border-[#5C0A1E]/30 transition-colors">
                      <span className="material-symbols-outlined text-[16px] text-[#10b981] mt-0.5">check_circle</span>
                      <span className="text-on-surface-variant leading-tight">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm mb-10 overflow-hidden">
          <DataGrid 
            data={filteredData}
            columns={columns}
            keyExtractor={(item) => item.id}
            loading={loading}
            onRowClick={(row) => {
              setFeaturedPackageId(row.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={1}
            totalPages={1}
            totalItems={filteredData.length}
          />
        </div>
        </>
        )}

        {activeTab === 'menu' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-sm text-primary">Menu Repository</h3>
              <button onClick={() => setIsMenuModalOpen(true)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-sm shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Item
              </button>
            </div>
            <DataGrid 
              data={menuItems}
              columns={menuColumns}
              keyExtractor={(item) => item.id}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'addons' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-sm text-primary">Add-ons & Upgrades</h3>
              <button onClick={() => setIsAddonModalOpen(true)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-sm shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Addon
              </button>
            </div>
            <DataGrid 
              data={addons}
              columns={addonColumns}
              keyExtractor={(item) => item.id}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-headline-sm text-primary">Pricing & Surcharge Engine</h3>
              <button onClick={() => setIsPricingModalOpen(true)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-sm shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Rule
              </button>
            </div>
            <DataGrid 
              data={pricingRules}
              columns={pricingColumns}
              keyExtractor={(item) => item.id}
              loading={loading}
            />
          </div>
        )}

      </div>

      {/* MenuItem Modal */}
      <Modal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        title="Add Menu Item"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsMenuModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateMenuItem}>Save Item</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Item Name</label>
            <input type="text" className="w-full border border-outline-variant rounded-md px-3 py-2" value={menuFormData.name} onChange={e => setMenuFormData({...menuFormData, name: e.target.value})} placeholder="e.g. Chicken Karahi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
            <input type="text" className="w-full border border-outline-variant rounded-md px-3 py-2" value={menuFormData.category} onChange={e => setMenuFormData({...menuFormData, category: e.target.value})} placeholder="e.g. Main Course" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Description (Optional)</label>
            <textarea className="w-full border border-outline-variant rounded-md px-3 py-2" value={menuFormData.description} onChange={e => setMenuFormData({...menuFormData, description: e.target.value})} placeholder="Brief description of the item" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Cost (PKR)</label>
            <input type="number" className="w-full border border-outline-variant rounded-md px-3 py-2" value={menuFormData.cost} onChange={e => setMenuFormData({...menuFormData, cost: Number(e.target.value)})} />
          </div>
        </div>
      </Modal>

      {/* Addon Modal */}
      <Modal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        title="Add Addon"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddonModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateAddon}>Save Addon</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Addon Name</label>
            <input type="text" className="w-full border border-outline-variant rounded-md px-3 py-2" value={addonFormData.name} onChange={e => setAddonFormData({...addonFormData, name: e.target.value})} placeholder="e.g. Floral Decor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
            <input type="text" className="w-full border border-outline-variant rounded-md px-3 py-2" value={addonFormData.category} onChange={e => setAddonFormData({...addonFormData, category: e.target.value})} placeholder="e.g. Decor" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface mb-1">Price (PKR)</label>
              <input type="number" className="w-full border border-outline-variant rounded-md px-3 py-2" value={addonFormData.price} onChange={e => setAddonFormData({...addonFormData, price: Number(e.target.value)})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface mb-1">Unit</label>
              <input type="text" className="w-full border border-outline-variant rounded-md px-3 py-2" value={addonFormData.unit} onChange={e => setAddonFormData({...addonFormData, unit: e.target.value})} placeholder="e.g. Event, Guest, Table" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Description (Optional)</label>
            <textarea className="w-full border border-outline-variant rounded-md px-3 py-2" value={addonFormData.description} onChange={e => setAddonFormData({...addonFormData, description: e.target.value})} />
          </div>
        </div>
      </Modal>

      {/* Pricing Rule Modal */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        title="Add Pricing Rule"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPricingModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreatePricingRule}>Save Rule</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Rule Name</label>
            <input type="text" className="w-full border border-outline-variant rounded-md px-3 py-2" value={pricingFormData.name} onChange={e => setPricingFormData({...pricingFormData, name: e.target.value})} placeholder="e.g. Weekend Surcharge" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Rule Type</label>
            <select className="w-full border border-outline-variant rounded-md px-3 py-2" value={pricingFormData.ruleType} onChange={e => setPricingFormData({...pricingFormData, ruleType: e.target.value})}>
              <option value="Surcharge">Surcharge</option>
              <option value="Discount">Discount</option>
              <option value="Tax">Tax</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface mb-1">Flat Amount (Optional)</label>
              <input type="number" className="w-full border border-outline-variant rounded-md px-3 py-2" value={pricingFormData.flatAmount} onChange={e => setPricingFormData({...pricingFormData, flatAmount: e.target.value})} placeholder="PKR" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface mb-1">Percentage (Optional)</label>
              <input type="number" className="w-full border border-outline-variant rounded-md px-3 py-2" value={pricingFormData.percentageAmount} onChange={e => setPricingFormData({...pricingFormData, percentageAmount: e.target.value})} placeholder="%" />
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default PackagesMenu;
