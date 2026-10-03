import os

frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
staff_details = os.path.join(frontend_src, "features", "staff", "StaffDetails.tsx")

with open(staff_details, "r") as f:
    code = f.read()

# 1. Add "Actions" column to table header
header_old = """                      <th className="p-4 font-medium">Status</th>
                    </tr>"""
header_new = """                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>"""
code = code.replace(header_old, header_new)

# 2. Add "Actions" column to table body
body_old = """                        <td className="p-4"><Badge variant={evt.status === 'Finalised' ? 'success' : evt.status === 'Upcoming' ? 'primary' : 'neutral'}>{evt.status}</Badge></td>
                      </tr>"""
body_new = """                        <td className="p-4"><Badge variant={evt.status === 'Finalised' ? 'success' : evt.status === 'Upcoming' ? 'primary' : 'neutral'}>{evt.status}</Badge></td>
                        <td className="p-4 text-right">
                          <Button variant="text" size="sm" className="text-primary mr-2" onClick={() => handleChangeEventClick(evt.id)}>Change</Button>
                          <Button variant="text" size="sm" className="text-error" onClick={() => handleRemoveEvent(evt.id)}>Delete</Button>
                        </td>
                      </tr>"""
code = code.replace(body_old, body_new)

# 3. Add helper functions for handling Change and Delete
functions_new = """
  const handleRemoveEvent = async (eventId: string) => {
    if (!employee || !window.confirm('Are you sure you want to remove this employee from this event?')) return;
    try {
      await eventsService.removeStaff(eventId, employee.id);
      success('Employee removed from the event.');
      // Refetch
      const allEvents = await eventsService.getEvents();
      const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === employee.id));
      setStaffEvents(assigned);
      const upcoming = assigned.filter(e => new Date(e.dateStr) >= new Date()).sort((a,b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
    } catch (err) {
      console.error('Failed to remove staff:', err);
      alert('Failed to remove from event.');
    }
  };

  const handleChangeEventClick = async (currentEventId: string) => {
    // For "Change", we'll just open the Assign modal, but when they submit it, we might want to delete the old one or just let them manage it manually.
    // For simplicity, we can ask them to delete the current one and add a new one, or we can automate it.
    // Given the simple requirement, opening the assign modal and automatically removing the old one IF they succeed would be "Changing".
    // Alternatively, just alert them to delete then assign. We'll automate: delete then open assign modal.
    if (!employee || !window.confirm('To change this event assignment, we will first remove this one. Proceed?')) return;
    
    try {
      await eventsService.removeStaff(currentEventId, employee.id);
      success('Old assignment removed. Please select the new event.');
      
      // Refetch so UI updates
      const allEvents = await eventsService.getEvents();
      const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === employee.id));
      setStaffEvents(assigned);
      const upcoming = assigned.filter(e => new Date(e.dateStr) >= new Date()).sort((a,b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      setNextEvent(upcoming.length > 0 ? upcoming[0] : null);
      
      // Open modal to assign a new one
      const eventsData = await eventsService.getEvents();
      setEvents(eventsData.filter((e: any) => e.status === 'Upcoming' || e.status === 'Draft'));
      setAssignModalOpen(true);
    } catch (err) {
      console.error('Failed to change assignment:', err);
      alert('Failed to remove old assignment.');
    }
  };
"""

code = code.replace("  const handleProcessPayroll = async () => {", functions_new + "\n  const handleProcessPayroll = async () => {")

with open(staff_details, "w") as f:
    f.write(code)

print("StaffDetails updated with Actions.")
