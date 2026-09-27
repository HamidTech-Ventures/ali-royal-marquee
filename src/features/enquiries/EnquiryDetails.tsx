import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Phone, MapPin, Calendar, MessageSquare, FileText } from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '../../context/ToastContext';
import { enquiriesService } from '../../services/enquiriesService';
import type { EnquiryDetail } from '../../types';
import { EventRequirements } from './components/EventRequirements';
import { QuotationBuilder } from './components/QuotationBuilder';
import { ActivityFeed } from './components/ActivityFeed';
import { FollowUpLog } from './components/FollowUpLog';

type TabType = 'overview' | 'requirements' | 'followups' | 'quotations' | 'timeline';

export const EnquiryDetails = () => {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enquiryId) {
      fetchEnquiry();
    }
  }, [enquiryId]);

  const fetchEnquiry = async () => {
    try {
      setLoading(true);
      const data = await enquiriesService.getEnquiryById(enquiryId!);
      setEnquiry(data);
    } catch (err) {
      console.error(err);
      error('Failed to load enquiry details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading Enquiry...</div>;
  }

  if (!enquiry) {
    return <div className="p-8 text-center text-on-surface-variant">Enquiry not found.</div>;
  }

  const handleUpdateStatus = async (newStatus: any) => {
    try {
      await enquiriesService.updateStatus(enquiry.id, newStatus);
      success(`Enquiry marked as ${newStatus}`);
      fetchEnquiry();
    } catch (err) {
      error(`Failed to update status`);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Lead Overview' },
    { id: 'requirements', label: 'Event Requirements' },
    { id: 'followups', label: 'Follow-ups' },
    { id: 'quotations', label: 'Quotations' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const isHot = enquiry.priority === 'High' || enquiry.priority === 'Urgent';
  const score = isHot ? 85 : enquiry.priority === 'Medium' ? 60 : 40;
  const estValue = enquiry.estimatedValue || enquiry.budget || 0;

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* HEADER SECTION */}
      <div className="border-b border-outline-variant/30 bg-surface px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <button onClick={() => navigate('/app/enquiries')} className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Enquiries
          </button>
          <span>/</span>
          <span className="font-medium text-on-surface">{enquiry.referenceNumber}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container font-headline-lg flex items-center justify-center rounded-full shrink-0 uppercase">
              {enquiry.customerName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-on-surface">{enquiry.customerName}</h1>
                <Badge variant={enquiry.status === 'New' ? 'primary' : enquiry.status === 'Converted' ? 'success' : enquiry.status === 'Lost' ? 'error' : 'warning'} className="text-sm px-3 py-1">
                  {enquiry.status}
                </Badge>
              </div>
              <div className="flex items-center flex-wrap gap-4 text-on-surface-variant mt-2">
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {enquiry.customerPhone}</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date: {new Date(enquiry.preferredDate).toLocaleDateString()}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Source: {enquiry.source}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Button variant="primary" icon="edit" onClick={() => navigate(`/app/enquiries/${enquiry.id}/edit`)}>Edit Lead</Button>
              {enquiry.status !== 'Converted' && (
                <Button 
                  variant="secondary" 
                  icon="check_circle"
                  onClick={() => navigate('/app/bookings/new', { state: { fromEnquiry: enquiry } })}
                >
                  Convert to Booking
                </Button>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 text-sm">
              <button 
                onClick={() => setActiveTab('followups')}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4"/> Log Follow-up
              </button>
              <span className="text-outline-variant">•</span>
              <button 
                onClick={() => setActiveTab('quotations')}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="w-4 h-4"/> Create Quote
              </button>
              {enquiry.status !== 'Lost' && enquiry.status !== 'Converted' && (
                <>
                  <span className="text-outline-variant">•</span>
                  <button className="text-error hover:underline flex items-center gap-1" onClick={() => handleUpdateStatus('Lost')}><FileText className="w-4 h-4"/> Mark Lost</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="px-8 py-6 bg-surface-container-lowest border-b border-outline-variant/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className={clsx("absolute left-0 top-0 bottom-0 w-1", isHot ? "bg-error" : "bg-warning")}></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Lead Temperature</div>
            <div className={clsx("text-3xl font-bold", isHot ? "text-error" : "text-warning")}>{enquiry.priority}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Conversion Score</div>
            <div className="text-3xl font-bold text-on-surface">{score}/100</div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${score}%` }}></div>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-success"></div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Est. Value</div>
            <div className="text-3xl font-currency-num font-bold text-success">PKR {estValue.toLocaleString()}</div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Source</div>
            <div className="text-3xl font-bold text-primary">{enquiry.source}</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="px-8 border-b border-outline-variant/30 flex overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Lead Information</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Customer Name</div>
                    <div className="col-span-2 font-medium">{enquiry.customerName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Contact Number</div>
                    <div className="col-span-2 font-medium">{enquiry.customerPhone}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Inquiry Date</div>
                    <div className="col-span-2 font-medium">{new Date(enquiry.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Sales Rep</div>
                    <div className="col-span-2 font-medium">{enquiry.assignedToName || 'Unassigned'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Notes</div>
                    <div className="col-span-2 font-medium">{enquiry.notes || '-'}</div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <section>
                <h3 className="font-title-lg mb-4">Initial Event Details</h3>
                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Event Name</div>
                    <div className="col-span-2 font-medium">{enquiry.eventName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Event Type</div>
                    <div className="col-span-2 font-medium">{enquiry.eventType || 'Not specified'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Target Date</div>
                    <div className="col-span-2 font-medium">{new Date(enquiry.preferredDate).toLocaleDateString()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Expected Guests</div>
                    <div className="col-span-2 font-medium">{enquiry.guestCount}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Venue Preference</div>
                    <div className="col-span-2 font-medium">{enquiry.preferredVenueName || 'No preference'}</div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <EventRequirements enquiry={enquiry} onUpdate={fetchEnquiry} />
        )}

        {activeTab === 'followups' && (
          <FollowUpLog enquiry={enquiry} onUpdate={fetchEnquiry} />
        )}

        {activeTab === 'quotations' && (
          <QuotationBuilder enquiry={enquiry} onUpdate={fetchEnquiry} />
        )}

        {activeTab === 'timeline' && (
          <ActivityFeed enquiry={enquiry} onUpdate={fetchEnquiry} />
        )}

      </div>
    </div>
  );
};

export default EnquiryDetails;
