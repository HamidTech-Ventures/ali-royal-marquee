import os
import re

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"

staff_details = os.path.join(frontend_src, "features", "staff", "StaffDetails.tsx")
with open(staff_details, "r") as f:
    code = f.read()

# 1. Update Tabs
if "{ id: 'overview', label: 'Employee Overview' }," in code and "{ id: 'schedule', label: 'Schedule' }," in code:
    old_tabs = """  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Employee Overview' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'events', label: 'Event Assignments' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'payroll', label: 'Payroll & Salary' },
    { id: 'leave', label: 'Leave' },
    { id: 'performance', label: 'Performance' },
  ];"""
    new_tabs = """  const tabs: { id: string; label: string }[] = [
    { id: 'overview', label: 'Employee Overview' },
    { id: 'events', label: 'Event Assignments' },
    { id: 'payroll', label: 'Payroll & Compensation' },
  ];"""
    code = code.replace(old_tabs, new_tabs)
    code = code.replace("type TabType = 'overview' | 'schedule' | 'events' | 'attendance' | 'leave' | 'payroll' | 'performance';", "")
    code = code.replace("useState<TabType>('overview');", "useState<string>('overview');")

# 2. Update overview to show CNIC and comp type
overview_additions = """                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">CNIC Number</div>
                    <div className="col-span-2 font-medium">{employee.cnic || 'N/A'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Compensation</div>
                    <div className="col-span-2 font-medium">{employee.compensationType || 'Fixed Monthly'}</div>
                  </div>"""

code = code.replace("                  <div className=\"grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3\">\n                    <div className=\"col-span-1 text-on-surface-variant text-sm\">Contact Number</div>", overview_additions + "\n                  <div className=\"grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3\">\n                    <div className=\"col-span-1 text-on-surface-variant text-sm\">Contact Number</div>")

# 3. Replace the Placeholders for others
placeholders = """        {/* Placeholders for others */}
        {['schedule', 'events', 'attendance', 'leave', 'payroll', 'performance'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <h3 className="text-xl font-medium text-on-surface mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workspace</h3>
            <p>Ready for integration.</p>
          </div>
        )}"""

new_tabs_content = """
        {activeTab === 'events' && (
          <div className="space-y-6">
            <h3 className="font-title-lg">Event Assignments</h3>
            <p className="text-on-surface-variant">History of events assigned to this staff member.</p>
            <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] p-6 text-center text-on-surface-variant">
               No past events found for this employee yet. (Event history loads from bookings and finalised events).
            </div>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <h3 className="font-title-lg">Payroll & Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                <h4 className="font-semibold text-primary border-b border-outline-variant/20 pb-2">Salary Details</h4>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-sm">Compensation Type:</span>
                  <span className="font-medium bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-xs">{employee.compensationType || 'Fixed Monthly'}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-on-surface-variant text-sm">{employee.compensationType === 'Per-Event/Daily Wage' ? 'Wage Per Event:' : 'Monthly Salary:'}</span>
                  <span className="font-medium">PKR {employee.salary?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
"""

code = code.replace(placeholders, new_tabs_content)

with open(staff_details, "w") as f:
    f.write(code)

print("StaffDetails.tsx updated.")
