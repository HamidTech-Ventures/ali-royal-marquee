// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import type { Staff as StaffType } from '../../types';
import { staffService } from '../../services/staffService';
import { useToast } from '../../context/ToastContext';

export const Staff = () => {
  const [staff, setStaff] = useState<StaffType[]>([]);
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = (location.state as any)?.fromBusiness;

  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchStaff = async () => {
    try {
      const data = await staffService.getStaff();
      setStaff(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Sort state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter state
  const [shiftFilter, setShiftFilter] = useState<'All' | 'Morning' | 'Evening' | 'Night'>('All');

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = staff;
    
    if (shiftFilter !== 'All') {
      result = result.filter(s => s.shift === shiftFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(lowerSearch) ||
        s.role.toLowerCase().includes(lowerSearch) ||
        s.phone.includes(lowerSearch)
      );
    }
    
    if (sortColumn) {
      result.sort((a, b) => {
        const valA = (a as any)[sortColumn] || '';
        const valB = (b as any)[sortColumn] || '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [staff, shiftFilter, searchTerm, sortColumn, sortDirection]);

  // Derived KPI Stats
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const availableToday = staff.filter(s => s.status === 'Active' && s.shift !== 'Night').length;

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await staffService.deleteStaff(id);
        success('Staff member deleted successfully.');
        fetchStaff();
      } catch (err) {
        console.error('Error deleting staff:', err);
        alert('Failed to delete staff member.');
      }
    }
  };

  const handleExportPayroll = () => {
    if (staff.length === 0) return;
    const headers = ['ID', 'Name', 'Role', 'Phone', 'Shift', 'Status', 'Salary (PKR)'];
    const csvContent = [
      headers.join(','),
      ...staff.map(s => `"${s.id}","${s.name}","${s.role}","${s.phone}","${s.shift}","${s.status}","${s.salary || 0}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `staff_payroll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Payroll exported successfully');
  };

  const columns: ColumnDef<StaffType>[] = [
    {
      key: 'name',
      header: 'Staff Name',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center shrink-0">
            {item.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-on-surface">{item.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role / Wing',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-on-surface-variant">{item.role}</span>
      )
    },
    {
      key: 'shift',
      header: 'Shift',
      sortable: true,
      render: (item) => (
        <span className="text-[13px] text-on-surface bg-surface-container px-2 py-1 rounded">{item.shift}</span>
      )
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (item) => (
        <span className="text-[13px] text-on-surface font-medium">{item.phone}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      align: 'right',
      render: (item) => {
        let variant: any = 'neutral';
        if (item.status === 'Active') variant = 'success';
        if (item.status === 'On Leave') variant = 'warning';
        if (item.status === 'Inactive') variant = 'error';
        return <Badge variant={variant}>{item.status}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/staff/${item.id}`); }} title="Manage">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </Button>
          <Button variant="text" className="!p-2 text-on-surface-variant hover:text-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/staff/${item.id}/edit`); }} title="Edit">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </Button>
          <Button variant="text" className="!p-2 text-error hover:bg-error/10" onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }} title="Delete">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Human Resources & Staffing"
        category="Operations & Administration"
        icon="badge"
        description="Manage venue management personnel, operational teams, scheduling, payroll, and event assignments."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" icon="print" onClick={handleExportPayroll} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-white hover:bg-[#e8e4db] text-[#4a1420] px-3 md:px-4 py-2 rounded-lg shadow-sm transition-all border border-[#e8e4db] text-xs md:text-sm font-medium">Export Payroll</Button>
            <Button variant="primary" icon="person_add" onClick={() => navigate('/app/staff/new')} className="flex-1 md:flex-auto flex items-center justify-center gap-2 bg-[#5C0A1E] hover:bg-[#4a1420] text-white px-3 md:px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-xs md:text-sm">Add Employee</Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8 mt-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Total Staff</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{totalStaff}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">groups</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Active Roster</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{activeStaff}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">verified_user</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Available Today</p>
                <div className="flex items-baseline gap-2 mt-1 md:mt-2">
                  <span className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold leading-none">{availableToday}</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">how_to_reg</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-3 md:p-4 border border-[#e8e4db] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center overflow-x-auto hide-scrollbar gap-1.5 w-full">
            <Button 
              variant={shiftFilter === 'All' ? 'primary' : 'text'} 
              className={shiftFilter === 'All' ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('All')}
            >
              All Shifts
            </Button>
            <Button 
              variant={shiftFilter === ('Afternoon' as any) ? 'primary' : 'text'} 
              className={shiftFilter === ('Afternoon' as any) ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('Afternoon' as any)}
            >
              Afternoon (Lunch)
            </Button>
            <Button 
              variant={shiftFilter === ('Evening' as any) ? 'primary' : 'text'} 
              className={shiftFilter === ('Evening' as any) ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('Evening' as any)}
            >
              Evening (Dinner)
            </Button>
            <Button 
              variant={shiftFilter === ('Night' as any) ? 'primary' : 'text'} 
              className={shiftFilter === ('Night' as any) ? 'py-1.5 px-3 !bg-[#5C0A1E]' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('Night' as any)}
            >
              Night (Cleanup)
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SearchInput 
              placeholder="Search staff members..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
          <div className="overflow-x-auto w-full">
        <DataGrid 
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => navigate(`/app/staff/${item.id}`)}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={1}
          totalPages={1}
          totalItems={filteredData.length}
        />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
