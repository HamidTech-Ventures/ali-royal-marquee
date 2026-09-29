import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { financesService } from '../../services/financesService';


export const Payments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useToast();
  const showBack = location.state?.fromBusiness;

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort state
  const [sortColumn, setSortColumn] = useState('dateStr');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await financesService.getPayments();
      setPayments(data);
    } catch (err) {
      error('Failed to load payments');
    } finally {
      setLoading(false);
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

  const filteredData = useMemo(() => {
    let result = [...payments];
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => {
        return (
          p.id.toLowerCase().includes(lowerSearch) ||
          (p.reference && p.reference.toLowerCase().includes(lowerSearch)) ||
          (p.customerName && p.customerName.toLowerCase().includes(lowerSearch)) ||
          p.bookingId.toLowerCase().includes(lowerSearch)
        );
      });
    }
    
    // Sort
    result.sort((a, b) => {
      const valA = (a as any)[sortColumn];
      const valB = (b as any)[sortColumn];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [payments, searchTerm, sortColumn, sortDirection]);

  const columns: ColumnDef<any>[] = [
    {
      key: 'dateStr',
      header: 'Date',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-on-surface-variant">{item.dateStr}</span>
      )
    },
    {
      key: 'id',
      header: 'Voucher ID',
      sortable: true,
      render: (item) => <span className="font-semibold text-primary">{item.id}</span>
    },
    {
      key: 'customer',
      header: 'Client & Booking',
      render: (item) => {
        return (
          <div>
            <div className="font-semibold text-on-surface">Client ID: {item.customerId}</div>
            <div className="text-[12px] text-on-surface-variant font-medium mt-0.5">{item.bookingId}</div>
          </div>
        );
      }
    },
    {
      key: 'method',
      header: 'Method',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
          <span className="material-symbols-outlined text-[16px]">
            {item.method === 'Bank Transfer' ? 'account_balance' : item.method === 'Cash' ? 'payments' : 'credit_card'}
          </span>
          {item.method}
        </div>
      )
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (item) => (
        <span className="text-[12px] bg-surface-container-low px-2 py-1 rounded font-mono">{item.reference || 'N/A'}</span>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="font-currency-num font-bold text-primary">PKR {item.amount.toLocaleString()}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'right',
      render: (item) => {
        let variant: any = 'neutral';
        if (item.status === 'Completed') variant = 'success';
        if (item.status === 'Pending') variant = 'warning';
        if (item.status === 'Failed') variant = 'error';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    }
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Payments & Commercial Settlements"
        category="Commercial & Financial Settlements"
        icon="account_balance_wallet"
        description="Monitor revenue collections, scheduled milestone receivables, multi-channel gateways, and daily accounts reconciliation."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" icon="download" className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e8e4db] text-[#4a1420] px-3 md:px-4 py-2 rounded-lg shadow-sm transition-all border border-[#e8e4db] text-xs md:text-sm font-medium">Export Ledger</Button>
            <Button variant="primary" icon="add" onClick={() => navigate('/app/payments/new')} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-[#5C0A1E] hover:bg-[#4a1420] text-white px-3 md:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-xs md:text-sm">Record Payment</Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8 mt-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Collected</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">
                    PKR {(payments.filter(p => p.status === 'Completed').reduce((acc, p) => acc + p.amount, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">account_balance_wallet</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Outstanding</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">
                    PKR {(payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">pending_actions</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Failed</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-lg md:text-2xl text-red-600 font-bold leading-none">
                    PKR {(payments.filter(p => p.status === 'Failed').reduce((acc, p) => acc + p.amount, 0) / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">warning</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Payments</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{payments.length}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">calendar_clock</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-500"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Refunds</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-lg md:text-2xl text-gray-700 font-bold leading-none">
                    PKR {(payments.filter(p => p.status === 'Refunded').reduce((acc, p) => acc + p.amount, 0) / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-500">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">receipt_long</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SearchInput 
              placeholder="Search by voucher, client..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
            <Button variant="outline" icon="filter_list" className="hidden md:flex">More Filters</Button>
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <DataGrid 
              data={filteredData}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/app/payments/${item.id}`)}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={1}
              totalPages={1}
              totalItems={filteredData.length}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
