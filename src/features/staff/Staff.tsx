import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { DataGrid } from '../../components/ui/DataGrid';
import type { ColumnDef } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
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
  const [selectedStaff, setSelectedStaff] = useState<StaffType | null>(null);
  
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
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Human Resources & Staffing"
        category="Operations & Administration"
        icon="badge"
        description="Manage venue management personnel, operational teams, scheduling, payroll, and event assignments."
        onBack={showBack ? () => navigate(-1) : undefined}
        actions={
          <>
            <Button variant="outline" icon="print" onClick={handleExportPayroll}>Export Payroll</Button>
            <Button variant="primary" icon="person_add" onClick={() => navigate('/app/staff/new')}>Add Employee</Button>
          </>
        }
      />

      <div className="flex flex-col w-full space-y-6">
        {/* KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Staff</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">groups</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-primary tracking-tight">{totalStaff}</div>
          </div>
          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Active Roster</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-primary tracking-tight">{activeStaff}</div>
          </div>
          <div className="relative bg-surface-container-lowest p-5 rounded shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed-dim"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Available Today</span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              </div>
            </div>
            <div className="font-headline-lg text-headline-lg text-primary tracking-tight">{availableToday}</div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-surface-container-lowest p-3 rounded shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Button 
              variant={shiftFilter === 'All' ? 'primary' : 'text'} 
              className={shiftFilter === 'All' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('All')}
            >
              All Shifts
            </Button>
            <Button 
              variant={shiftFilter === 'Morning' ? 'primary' : 'text'} 
              className={shiftFilter === 'Morning' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('Morning')}
            >
              Morning
            </Button>
            <Button 
              variant={shiftFilter === 'Evening' ? 'primary' : 'text'} 
              className={shiftFilter === 'Evening' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('Evening')}
            >
              Evening
            </Button>
            <Button 
              variant={shiftFilter === 'Night' ? 'primary' : 'text'} 
              className={shiftFilter === 'Night' ? 'py-1.5 px-3' : 'py-1.5 px-3 text-on-surface-variant'} 
              onClick={() => setShiftFilter('Night')}
            >
              Night
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput 
              placeholder="Search staff members..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>
        </div>

        {/* DATA GRID */}
        <DataGrid 
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => setSelectedStaff(item)}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={1}
          totalPages={1}
          totalItems={filteredData.length}
        />
      </div>

      <Drawer
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        title={selectedStaff?.name || ''}
        subtitle={selectedStaff ? `Employee ID: ${selectedStaff.id} | Role: ${selectedStaff.role}` : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedStaff(null)}>Close</Button>
            <Button variant="primary" onClick={() => {
              setSelectedStaff(null);
              navigate(`/app/staff/${selectedStaff?.id}`);
            }}>Manage Profile</Button>
          </div>
        }
      >
        {selectedStaff && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3 flex items-center justify-between">
                <span>Employee Overview</span>
                <Badge variant={selectedStaff.status === 'Active' ? 'success' : selectedStaff.status === 'On Leave' ? 'warning' : 'error'}>{selectedStaff.status}</Badge>
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Primary Contact</span>
                  <span className="font-semibold text-on-surface">{selectedStaff.phone}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Assigned Shift</span>
                  <span className="font-semibold text-on-surface bg-surface-container-high px-2 py-0.5 rounded">{selectedStaff.shift}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-lg border border-surface-container-highest text-center">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2 block">event_note</span>
              <h3 className="font-title-md mb-2 text-on-surface">Weekly Attendance</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">Attendance records are up to date for this week.</p>
              <Button variant="outline">View Timesheet</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Staff;
