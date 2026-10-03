import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
staff_details = os.path.join(frontend_src, "features", "staff", "StaffDetails.tsx")
with open(staff_details, "r") as f:
    code = f.read()

# Fix e.date -> e.dateStr in two places (useEffect and handleAssignSubmit)
code = code.replace("new Date(e.date) >=", "new Date(e.dateStr) >=")
code = code.replace("new Date(a.date)", "new Date(a.dateStr)")
code = code.replace("new Date(b.date)", "new Date(b.dateStr)")
code = code.replace("evt.date", "evt.dateStr")
code = code.replace("nextEvent.date", "nextEvent.dateStr")
code = code.replace("nextEvent.time || employee.shift", "nextEvent.startTime + ' - ' + nextEvent.endTime")

# Add Joined Date in overview
overview_additions = """                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Role/Position</div>
                    <div className="col-span-2 font-medium">{employee.role}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Joined Date</div>
                    <div className="col-span-2 font-medium">{employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-GB') : 'N/A'}</div>
                  </div>"""
code = code.replace("""                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Role/Position</div>
                    <div className="col-span-2 font-medium">{employee.role}</div>
                  </div>""", overview_additions)

# Check overlapping in handleAssignSubmit
assign_logic = """  const handleAssignSubmit = async () => {
    if (!selectedEventId || !employee) return;
    
    // Find selected event
    const selEvt = events.find(e => e.id === selectedEventId);
    if (selEvt) {
      // Check for overlap
      const overlap = staffEvents.some(se => se.dateStr === selEvt.dateStr && se.startTime === selEvt.startTime);
      if (overlap) {
        alert("Cannot assign! Employee is already assigned to another event at the exact same shift and time.");
        return;
      }
    }
    
    setAssigning(true);"""
code = code.replace("""  const handleAssignSubmit = async () => {
    if (!selectedEventId || !employee) return;
    
    setAssigning(true);""", assign_logic)

with open(staff_details, "w") as f:
    f.write(code)

print("StaffDetails updated.")
