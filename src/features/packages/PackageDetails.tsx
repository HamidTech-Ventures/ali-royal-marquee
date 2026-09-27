import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Layers, CheckCircle2 } from 'lucide-react';
import type { Package } from '../../services/packagesService';
import { packagesService } from '../../services/packagesService';
import { useToast } from '../../context/ToastContext';

export const PackageDetails = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<'overview'|'activity'>('overview');

  useEffect(() => {
    if (packageId) {
      packagesService.getPackage(packageId)
        .then(data => setPkg(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [packageId]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this package?')) {
      if (packageId) {
        try {
          await packagesService.deletePackage(packageId);
          success('Package deleted successfully');
          navigate('/app/packages');
        } catch(error) {
          showError('Failed to delete package');
        }
      }
    }
  };

  if (loading) return <div className="p-8">Loading package...</div>;
  if (!pkg) return <div className="p-8 text-center text-on-surface-variant">Package not found.</div>;

  let inclusions: string[] = [];
  try {
    inclusions = pkg.inclusionsJson ? JSON.parse(pkg.inclusionsJson) : [];
  } catch(e) {
    inclusions = [];
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* HEADER SECTION */}
      <div className="border-b border-outline-variant/30 bg-surface px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/packages')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Packages
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{pkg.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container font-headline-lg flex items-center justify-center rounded-2xl shrink-0 shadow-sm border border-primary/20">
              <Layers className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-on-surface">{pkg.name}</h1>
                <Badge variant={pkg.status === 'Active' ? 'success' : 'neutral'} className="text-sm px-3 py-1 shadow-sm">
                  {pkg.status || 'Active'}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-4 text-on-surface-variant mt-2">
                <div className="flex items-center gap-1.5"><Badge variant="primary">{pkg.type}</Badge></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit" onClick={() => navigate(`/app/packages/${pkg.id}/edit`)}>Edit Package</Button>
            </div>
            <div className="flex items-center justify-end gap-3 text-sm">
              <button className="text-error hover:underline flex items-center gap-1" onClick={handleDelete}>Delete Package</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-8 border-b border-outline-variant/30">
          <button 
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
          </button>
          <button 
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'activity' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Log
            {activeTab === 'activity' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="max-w-6xl space-y-6">
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Base Price</div>
                <div className="text-3xl font-currency-num font-bold text-primary">PKR {pkg.price?.toLocaleString()}</div>
              </div>
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Min Guests</div>
                <div className="text-xl font-bold text-on-surface mt-2">{pkg.minGuests} Pax</div>
              </div>
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Profit Target</div>
                <div className="text-xl font-bold text-success mt-2">{pkg.profitMarginTarget || 0}%</div>
              </div>
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Inclusions</div>
                <div className="text-xl font-bold text-on-surface mt-2">{inclusions.length} items</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                    Package Inclusions
                  </h3>
                  {inclusions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {inclusions.map((inc: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-surface-container-lowest p-3 rounded border border-outline-variant/20">
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                          <span className="text-on-surface font-medium">{inc}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-on-surface-variant italic">No specific inclusions listed.</div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-surface border border-outline-variant/40 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    Internal Notes
                  </h3>
                  {pkg.internalNotes ? (
                    <p className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">{pkg.internalNotes}</p>
                  ) : (
                    <p className="text-on-surface-variant/70 italic">No notes available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="max-w-4xl bg-surface border border-outline-variant/40 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history</span>
              <p>No recent activity recorded for this package.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageDetails;
