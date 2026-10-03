import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { enquiriesService } from '../../services/enquiriesService';
import { useToast } from '../../context/ToastContext';
import type { Enquiry, EnquiryStatsDto, EnquiryLifecycleDto } from '../../types';

export const Enquiries = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<EnquiryStatsDto | null>(null);
    const [lifecycle, setLifecycle] = useState<EnquiryLifecycleDto | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('preferredDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        enquiriesService.getEnquiries({
          searchTerm,
          status: statusFilter !== 'All' && statusFilter !== 'Draft' ? statusFilter as any : undefined,
          pageNumber,
          pageSize,
          sortBy: sortColumn === 'preferredDate' && sortDirection === 'asc' ? 'PreferredDateAsc' :
                  sortColumn === 'preferredDate' && sortDirection === 'desc' ? 'PreferredDateDesc' :
                  sortColumn === 'status' ? 'StatusAsc' :
                  sortDirection === 'asc' ? 'CreatedAtAsc' : 'CreatedAtDesc'
        }),
        enquiriesService.getStats(),
        enquiriesService.getLifecycle('all')
      ]);

      if (results[0].status === 'fulfilled') {
        let data = results[0].value.items;
        let count = results[0].value.totalCount;

        if (statusFilter === 'Draft' || statusFilter === 'All') {
          const draftStr = localStorage.getItem('enquiryDraft');
          if (draftStr) {
            try {
              const draftData = JSON.parse(draftStr);
              const draftObj: Enquiry = {
                id: 'draft',
                referenceNumber: 'DRAFT',
                customerName: draftData.customerName || 'Unsaved Draft',
                customerPhone: draftData.customerPhone || '-',
                eventName: draftData.eventName || 'Untitled Event',
                preferredDate: draftData.dateStr ? new Date(draftData.dateStr).toISOString() : new Date().toISOString(),
                status: 'Draft' as any,
                guestCount: draftData.guests || 0,
                budget: draftData.budget || 0,
                createdAt: new Date().toISOString()
              };
              
              if (statusFilter === 'Draft') {
                data = [draftObj];
                count = 1;
              } else {
                data = [draftObj, ...data];
                count += 1;
              }
            } catch(e) {}
          } else if (statusFilter === 'Draft') {
            data = [];
            count = 0;
          }
        }
        
        setEnquiries(data);
        setTotalCount(count);
      } else {
        const error = results[0].reason as any;
        console.error("Failed to load Enquiries list", error.response?.status, error.response?.data);
      }

      if (results[1].status === 'fulfilled') {
        setStats(results[1].value);
      } else {
        const error = results[1].reason as any;
        console.error("Failed to load Enquiries stats", error.response?.status, error.response?.data);
      }

      if (results[2].status === 'fulfilled') {
        setLifecycle(results[2].value);
      } else {
        const error = results[2].reason as any;
        console.error("Failed to load Enquiries lifecycle", error.response?.status, error.response?.data);
      }

    } catch (error: any) {
      console.error("Failed to load Enquiries dashboard", error.response?.status, error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, sortColumn, sortDirection, pageNumber, statusFilter]);

  const handleExport = async () => {
    try {
      const blob = await enquiriesService.exportReportPdf({
        searchTerm,
        sortBy: sortColumn === 'preferredDate' && sortDirection === 'asc' ? 'PreferredDateAsc' :
                sortColumn === 'preferredDate' && sortDirection === 'desc' ? 'PreferredDateDesc' :
                sortColumn === 'status' ? 'StatusAsc' :
                sortDirection === 'asc' ? 'CreatedAtAsc' : 'CreatedAtDesc'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'EnquiriesReport.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Failed to export report');
    }
  };

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      try {
        await enquiriesService.deleteEnquiry(id);
        success('Enquiry deleted successfully');
        fetchData();
      } catch (err) {
        console.error('Failed to delete enquiry', err);
        showError('Failed to delete enquiry');
      }
    }
  };

  const columns: ColumnDef<Enquiry>[] = [
    {
      key: 'referenceNumber',
      header: 'Enquiry Ref',
      sortable: true,
      render: (item) => <span className="font-semibold text-primary">{item.referenceNumber}</span>
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => (
        <div>
          <div className="font-semibold">{item.customerName}</div>
          <div className="text-on-surface-variant text-[12px]">{item.customerPhone}</div>
        </div>
      )
    },
    {
      key: 'eventName',
      header: 'Event',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-on-surface">{item.eventName}</div>
          <div className="flex items-center gap-2 text-on-surface-variant text-[12px] mt-0.5">
            <span className="material-symbols-outlined text-[14px]">event</span>
            {new Date(item.preferredDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'guestCount',
      header: 'Pax',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => {
        let variant: any = 'neutral';
        if (item.status === 'Inquiry') variant = 'primary';
        if (item.status === 'TokenReceived' || item.status === 'AdvancePaid') variant = 'success';
        if (item.status === 'Cancelled') variant = 'error';
        if (item.status === 'SiteVisit') variant = 'warning';
        if (item.status === 'Draft' as any) variant = 'neutral';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => item.id === 'draft' ? navigate('/app/enquiries/new') : navigate(`/app/enquiries/${item.id}`)} className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-variant/50 transition-colors" title={item.id === 'draft' ? 'Resume Draft' : 'View'}>
            <span className="material-symbols-outlined text-[18px]">{item.id === 'draft' ? 'edit' : 'visibility'}</span>
          </button>
          {item.id !== 'draft' && (
            <button onClick={() => navigate(`/app/enquiries/${item.id}/edit`)} className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg hover:bg-surface-variant/50 transition-colors" title="Edit">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          )}
          <button onClick={(e) => {
            if (item.id === 'draft') {
              e.stopPropagation();
              if (window.confirm('Delete this draft?')) {
                localStorage.removeItem('enquiryDraft');
                fetchData();
              }
            } else {
              handleDelete(item.id, e);
            }
          }} className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error/10 transition-colors" title="Delete">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Enquiries Ledger"
        category="Hospitality Inbound Inquiries"
        icon="contact_mail"
        description="Manage prospective wedding parties, corporate galas, personalized walkthroughs, and banquet proposals."
        actions={
          <div className="flex overflow-x-auto items-center gap-2 hide-scrollbar pb-1 md:pb-0 w-full md:w-auto">
            <Button variant="primary" icon="add" onClick={() => navigate('/app/enquiries/new')} className="whitespace-nowrap shrink-0 !bg-[#5C0A1E]">
              New Enquiry
            </Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        {/* SUMMARY KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#5C0A1E]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
              <span className="material-symbols-outlined text-[20px]">all_inbox</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Total Enquiries</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats?.totalEnquiries ?? '-'}</div>
            </div>
          </div>
          
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#b0891d]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
              <span className="material-symbols-outlined text-[20px]">new_releases</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">New This Week</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats?.newThisWeek ?? '-'}</div>
            </div>
          </div>
          
          <div className="bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#e02424]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#e02424]/10 flex items-center justify-center text-[#e02424]">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Follow-ups Due</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats?.followUpsDue ?? '-'}</div>
            </div>
          </div>
          

          
          <div className="col-span-2 lg:col-span-1 bg-white p-3.5 md:p-5 rounded-xl shadow-sm flex items-center gap-3 border-l-[3px] border-[#b0891d]">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] md:text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">Conversion Rate</span>
              <div className="font-serif text-base md:text-headline-sm text-[#4a1420] font-bold mt-1">{stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '-'}</div>
            </div>
          </div>
        </div>

        {/* WORKFLOW STAGE PIPELINE FUNNEL */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-serif text-lg md:text-title-md font-bold text-[#4a1420]">Inquiry Lifecycle</h2>
            <div className="flex gap-1.5">
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            {[
              { stage: 'Inquiry', count: lifecycle?.inquiry ?? 0 }, 
              { stage: 'Site Visit', count: lifecycle?.siteVisit ?? 0 }, 
              { stage: 'Token Received', count: lifecycle?.tokenReceived ?? 0 }, 
              { stage: 'Advance Paid', count: lifecycle?.advancePaid ?? 0 }, 
              { stage: 'Cancelled / Lost', count: lifecycle?.cancelled ?? 0 }
            ].map((item, i) => (
              <div key={item.stage} className="bg-[#FAF8F5] p-3 rounded-lg text-left border-t-2 border-[#b0891d]">
                <div className="font-label-sm text-[10px] md:text-label-sm text-on-surface-variant uppercase font-semibold">{i+1}. {item.stage}</div>
                <div className="font-serif text-xl md:text-headline-sm text-[#4a1420] font-bold mt-1">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Draft', 'Inquiry', 'SiteVisit', 'TokenReceived', 'AdvancePaid', 'Cancelled'].map(f => (
              <button
                key={f}
                onClick={() => {
                  setStatusFilter(f);
                  setPageNumber(1);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  statusFilter === f 
                    ? "bg-[#5C0A1E] text-white border-[#5C0A1E] shadow-md"
                    : "bg-white text-on-surface-variant border-outline-variant/40 hover:bg-surface-variant/30 hover:border-outline-variant"
                }`}
              >
                {f === 'SiteVisit' ? 'Site Visit' : f === 'TokenReceived' ? 'Token Received' : f === 'AdvancePaid' ? 'Advance Paid' : f}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="w-full md:w-auto">
            <SearchInput 
              placeholder="Search enquiries..." 
              value={searchTerm} 
              onChange={(val) => {
                setSearchTerm(val);
                setPageNumber(1);
              }} 
            />
          </div>
          <div className="flex overflow-x-auto items-center gap-2 hide-scrollbar pb-1 md:pb-0 w-full md:w-auto">
            <Button variant="outline" icon="download" onClick={handleExport} className="shrink-0 !text-[#4a1420] !border-surface-variant">Export</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/enquiries/new')} className="shrink-0 !bg-[#5C0A1E]">
              New Enquiry
            </Button>
          </div>
        </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="py-8 text-center text-on-surface-variant">Loading enquiries...</div>
            ) : (
              <DataGrid 
                data={enquiries}
                columns={columns}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => item.id === 'draft' ? navigate('/app/enquiries/new') : navigate(`/app/enquiries/${item.id}`)}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                currentPage={pageNumber}
                totalPages={Math.ceil(totalCount / pageSize)}
                totalItems={totalCount}
                onPageChange={setPageNumber}
              />
            )}
          </div>
        </div>
      </div>

      <Drawer
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        title={selectedEnquiry ? `Enquiry ${selectedEnquiry.referenceNumber}` : ''}
        subtitle={selectedEnquiry ? selectedEnquiry.customerName : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>Close</Button>
            <Button variant="primary" onClick={() => navigate(`/app/enquiries/${selectedEnquiry?.id}`)}>View Details</Button>
          </div>
        }
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-2">Event Details</h3>
              <div className="grid grid-cols-2 gap-4 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block">Event Name</span>
                  <span className="font-semibold">{selectedEnquiry.eventName}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Preferred Date</span>
                  <span className="font-semibold">{new Date(selectedEnquiry.preferredDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Expected Pax</span>
                  <span className="font-semibold">{selectedEnquiry.guestCount}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Current Status</span>
                  <Badge variant="primary" className="mt-1">{selectedEnquiry.status}</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-2">Customer Info</h3>
              <div className="grid grid-cols-2 gap-4 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block">Name</span>
                  <span className="font-semibold">{selectedEnquiry.customerName}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Phone</span>
                  <span className="font-semibold">{selectedEnquiry.customerPhone}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Enquiries;

