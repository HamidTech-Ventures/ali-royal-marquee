import os

# Fix mockData
frontend_src = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src"
mock_data = os.path.join(frontend_src, "services", "mockData.ts")
with open(mock_data, "r") as f:
    code = f.read()

code = code.replace("shift: 'Morning'", "shift: 'Afternoon (Lunch)'")
code = code.replace("shift: 'Evening'", "shift: 'Evening (Dinner)'")
code = code.replace("shift: 'Night'", "shift: 'Night (Cleanup)'")

with open(mock_data, "w") as f:
    f.write(code)

# Fix StaffDetails.tsx
staff_details = os.path.join(frontend_src, "features", "staff", "StaffDetails.tsx")
with open(staff_details, "r") as f:
    code = f.read()

# 1. Remove Emergency Contact
emergency_contact = """                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-on-surface-variant text-sm">Emergency Contact</div>
                    <div className="col-span-2 font-medium">+92 300 0000000 (Brother)</div>
                  </div>"""
code = code.replace(emergency_contact, "")

# 2. Dynamic Next Shift & Assigned Events
# First, update state
if "const [staffEvents, setStaffEvents] = useState<any[]>([]);" not in code:
    code = code.replace("const [events, setEvents] = useState<any[]>([]);", 
                        "const [events, setEvents] = useState<any[]>([]);\n  const [staffEvents, setStaffEvents] = useState<any[]>([]);\n  const [nextEvent, setNextEvent] = useState<any>(null);")

# Update useEffect to fetch assigned events
use_effect_old = """        setEmployee(found || null);
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching staff member:', err);
        setLoading(false);
      });
    }
  }, [staffId]);"""

use_effect_new = """        setEmployee(found || null);
        // Also fetch events this staff is assigned to
        eventsService.getEvents().then(allEvents => {
          const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === staffId));
          setStaffEvents(assigned);
          
          // Find next upcoming
          const upcoming = assigned.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          if (upcoming.length > 0) {
            setNextEvent(upcoming[0]);
          }
        }).catch(err => console.error(err));
        
        setLoading(false);
      }).catch(err => {
        console.error('Error fetching staff member:', err);
        setLoading(false);
      });
    }
  }, [staffId]);"""
code = code.replace(use_effect_old, use_effect_new)

# Update Next Shift UI
next_shift_old = """                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Date</div>
                    <div className="col-span-2 font-medium">14 September 2026</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Timing</div>
                    <div className="col-span-2 font-medium">18:00 - 23:30 (Night Shift)</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                    <div className="col-span-1 text-on-surface-variant text-sm">Assignment</div>
                    <div className="col-span-2 font-medium text-primary">EV-2045 (Walima)</div>
                  </div>
                </div>"""

next_shift_new = """                <div className="bg-surface rounded-xl border border-outline-variant/40 p-5 space-y-4">
                  {nextEvent ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                        <div className="col-span-1 text-on-surface-variant text-sm">Date</div>
                        <div className="col-span-2 font-medium">{new Date(nextEvent.date).toLocaleDateString('en-GB')}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                        <div className="col-span-1 text-on-surface-variant text-sm">Timing</div>
                        <div className="col-span-2 font-medium">{nextEvent.time || employee.shift}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 border-b border-outline-variant/20 pb-3">
                        <div className="col-span-1 text-on-surface-variant text-sm">Assignment</div>
                        <div className="col-span-2 font-medium text-primary">{nextEvent.title}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-on-surface-variant py-4 text-center">No upcoming shifts assigned.</div>
                  )}
                </div>"""
code = code.replace(next_shift_old, next_shift_new)

# Update handleAssignSubmit to refetch events
assign_old = """      await eventsService.addStaff(selectedEventId, employee.name, employee.role, employee.id);
      success(`${employee.name} has been assigned to the event successfully.`);
      setAssignModalOpen(false);
      setSelectedEventId('');
    } catch (err) {"""

assign_new = """      await eventsService.addStaff(selectedEventId, employee.name, employee.role, employee.id);
      success(`${employee.name} has been assigned to the event successfully.`);
      setAssignModalOpen(false);
      setSelectedEventId('');
      
      // Refetch
      const allEvents = await eventsService.getEvents();
      const assigned = allEvents.filter(e => e.staff && e.staff.some((s: any) => s.staffId === employee.id));
      setStaffEvents(assigned);
      const upcoming = assigned.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (upcoming.length > 0) setNextEvent(upcoming[0]);
    } catch (err) {"""
code = code.replace(assign_old, assign_new)

# Update Event Assignments Tab
events_tab_old = """            <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] p-6 text-center text-on-surface-variant">
               No past events found for this employee yet. (Event history loads from bookings and finalised events).
            </div>"""

events_tab_new = """            <div className="bg-white rounded-xl shadow-sm border border-[#e8e4db] overflow-hidden">
              {staffEvents.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/30 text-on-surface-variant text-sm">
                      <th className="p-4 font-medium">Event Title</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffEvents.map(evt => (
                      <tr key={evt.id} className="border-t border-outline-variant/30">
                        <td className="p-4 font-medium text-on-surface">{evt.title}</td>
                        <td className="p-4 text-on-surface-variant">{new Date(evt.date).toLocaleDateString('en-GB')}</td>
                        <td className="p-4"><Badge variant={evt.status === 'Finalised' ? 'success' : evt.status === 'Upcoming' ? 'primary' : 'neutral'}>{evt.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-on-surface-variant">
                  No events found for this employee yet.
                </div>
              )}
            </div>"""
code = code.replace(events_tab_old, events_tab_new)


with open(staff_details, "w") as f:
    f.write(code)

print("Updates completed.")
