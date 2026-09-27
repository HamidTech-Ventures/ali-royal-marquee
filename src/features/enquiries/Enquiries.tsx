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
import type { Enquiry, EnquiryStatsDto, EnquiryLifecycleDto } from '../../types';

export const Enquiries = () => {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<EnquiryStatsDto | null>(null);
  const [lifecycle, setLifecycle] = useState<EnquiryLifecycleDto | null>(null);
  const [lifecycleScope, setLifecycleScope] = useState<'all' | 'hot'>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  
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
          pageNumber,
          pageSize,
          sortBy: sortColumn === 'preferredDate' && sortDirection === 'asc' ? 'PreferredDateAsc' :
                  sortColumn === 'preferredDate' && sortDirection === 'desc' ? 'PreferredDateDesc' :
                  sortColumn === 'status' ? 'StatusAsc' :
                  sortDirection === 'asc' ? 'CreatedAtAsc' : 'CreatedAtDesc'
        }),
        enquiriesService.getStats(),
        enquiriesService.getLifecycle(lifecycleScope)
      ]);

      if (results[0].status === 'fulfilled') {
        setEnquiries(results[0].value.items);
        setTotalCount(results[0].value.totalCount);
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
  }, [searchTerm, sortColumn, sortDirection, pageNumber, lifecycleScope]);

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
        if (item.status === 'New') variant = 'primary';
        if (item.status === 'Converted') variant = 'success';
        if (item.status === 'Lost') variant = 'error';
        if (item.status === 'Negotiating') variant = 'warning';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    },
    {
      key: 'assignedToName',
      header: 'Owner',
      sortable: true,
      render: (item) => item.assignedToName || 'Unassigned'
    }
  ];

  return (
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Enquiries Ledger"
        category="Hospitality Inbound Inquiries"
        icon="contact_mail"
        description="Manage prospective wedding parties, corporate galas, personalized walkthroughs, and banquet proposals."
        actions={
          <Button variant="primary" icon="add" onClick={() => navigate('/app/enquiries/new')}>
            New Enquiry
          </Button>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* SUMMARY KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Enquiries</span>
            <div className="font-display text-[32px] leading-tight text-primary mt-1 font-bold">{stats?.totalEnquiries ?? '-'}</div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">New This Week</span>
            <div className="font-display text-[32px] leading-tight text-on-surface mt-1 font-bold">{stats?.newThisWeek ?? '-'}</div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Follow-ups Due</span>
            <div className="font-display text-[32px] leading-tight text-error mt-1 font-bold">{stats?.followUpsDue ?? '-'}</div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-container"></div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Hot Leads</span>
            <div className="font-display text-[32px] leading-tight text-primary-container mt-1 font-bold">{stats?.hotLeads ?? '-'}</div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Conversion Rate</span>
            <div className="font-display text-[32px] leading-tight text-on-surface mt-1 font-bold">{stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '-'}</div>
          </div>
        </div>

        {/* WORKFLOW STAGE PIPELINE FUNNEL */}
        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-headline-sm text-headline-sm text-primary">Inquiry Lifecycle</span>
            <div className="flex gap-1.5">
              <Button 
                variant={lifecycleScope === 'all' ? 'primary' : 'secondary'} 
                className="py-1 px-3 text-label-sm"
                onClick={() => setLifecycleScope('all')}
              >All</Button>
              <Button 
                variant={lifecycleScope === 'hot' ? 'primary' : 'secondary'} 
                className="py-1 px-3 text-label-sm"
                onClick={() => setLifecycleScope('hot')}
              >Hot Leads</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
            {[
              { stage: 'New', count: lifecycle?.new ?? 0 }, 
              { stage: 'Contacted', count: lifecycle?.contacted ?? 0 }, 
              { stage: 'Qualified', count: lifecycle?.qualified ?? 0 }, 
              { stage: 'Scheduled', count: lifecycle?.visitScheduled ?? 0 }, 
              { stage: 'Quoted', count: lifecycle?.quotationSent ?? 0 }, 
              { stage: 'Negotiating', count: lifecycle?.negotiation ?? 0 }, 
              { stage: 'Converted', count: lifecycle?.converted ?? 0 }, 
              { stage: 'Lost', count: lifecycle?.lost ?? 0 }
            ].map((item, i) => (
              <div key={item.stage} className="bg-surface-container-low p-3 rounded text-left border-t-2 border-secondary-fixed/50">
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">{i+1}. {item.stage}</div>
                <div className="font-headline-sm text-headline-sm text-primary font-bold mt-1">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between gap-4">
          <SearchInput 
            placeholder="Search enquiries..." 
            value={searchTerm} 
            onChange={(val) => {
              setSearchTerm(val);
              setPageNumber(1);
            }} 
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" icon="download" onClick={handleExport}>Export</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/enquiries/new')}>
              New Enquiry
            </Button>
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="py-8 text-center text-on-surface-variant">Loading enquiries...</div>
        ) : (
          <DataGrid 
            data={enquiries}
            columns={columns}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => navigate(`/app/enquiries/${item.id}`)}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={pageNumber}
            totalPages={Math.ceil(totalCount / pageSize)}
            totalItems={totalCount}
          />
        )}
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

