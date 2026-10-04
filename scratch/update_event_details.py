import sys

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\events\EventDetails.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update UUID to Professional ID
uuid_search = """<span className="font-medium text-on-surface">{event.id}</span>"""
uuid_replace = """<span className="font-medium text-on-surface">EVT-{event.id.substring(0,6).toUpperCase()}</span>"""
content = content.replace(uuid_search, uuid_replace)

# 2. Add isStatusModalOpen state & handleStatusUpdate
state_search = """const [newStatus, setNewStatus] = useState('');"""
state_replace = """const [newStatus, setNewStatus] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const { success } = useToast();

  const handleStatusUpdate = async (status: string) => {
    try {
      // Mocking update in UI
      setEvent({...event, status});
      setIsStatusModalOpen(false);
      success("Event status updated to " + status);
    } catch(err){}
  };"""
content = content.replace(state_search, state_replace)

# Remove the commented out handleStatusUpdate block
comment_search = """  /* const handleStatusUpdate = async (status: string) => {
    try {
      await eventsService.updateEvent(event.id, event.title, event.managerId || '', event.staffRequired || 0); // Need to update backend if status update requires separate command
      // Wait, UpdateEventCommand does not update status. Let's just mock update in UI for now
      setEvent({...event, status});
      
      // toast success
    } catch(err){}
  }; */"""
content = content.replace(comment_search, "")

# Add EventStatusModal to JSX
modal_search = """      {/* HEADER SECTION */}"""
modal_replace = """      <EventStatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} currentStatus={event.status} onSave={handleStatusUpdate} />
      {/* HEADER SECTION */}"""
content = content.replace(modal_search, modal_replace)

# Button routing for Print Summary
print_search = """<button className="text-[#4a1420] hover:underline flex items-center gap-1"><FileText className="w-3.5 h-3.5 md:w-4 md:h-4"/> Print Summary</button>"""
print_replace = """<button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={() => window.print()}><FileText className="w-3.5 h-3.5 md:w-4 md:h-4"/> Print Summary</button>"""
content = content.replace(print_search, print_replace)

# Button routing for Add Expense / Record Payment -> navigate
exp_search = """<button className="text-[#4a1420] hover:underline flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4"/> Add Expense</button>"""
exp_replace = """<button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={() => navigate('/app/payments')}><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4"/> Add Expense</button>"""
content = content.replace(exp_search, exp_replace)

pay_search = """<button className="text-[#4a1420] hover:underline flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4"/> Record Payment</button>"""
pay_replace = """<button className="text-[#4a1420] hover:underline flex items-center gap-1" onClick={() => navigate('/app/payments')}><DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4"/> Record Payment</button>"""
content = content.replace(pay_search, pay_replace)


# 3 & 4. KPIs: Readiness toggle and amounts in PKR without K
kpi_search = """      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Readiness</div>
            <div className="flex items-end gap-2">
              <div className="font-serif text-lg md:text-3xl font-bold text-[#4a1420]">{readiness}%</div>
            </div>
            <div className="w-full bg-[#FAF8F5] border border-[#e8e4db] h-1.5 rounded-full mt-2 md:mt-3 overflow-hidden">
              <div className="bg-[#5C0A1E] h-full rounded-full" style={{ width: `${readiness}%` }}></div>
            </div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Staff Assigned</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-on-surface">{staffAssigned} <span className="text-xs md:text-lg text-on-surface-variant font-medium">/ {staffRequired}</span></div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Guest Count</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-on-surface">{event.guests}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e02424]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Outstanding</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#e02424]">PKR {(outstanding/1000).toFixed(0)}k</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Event Cost</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#b0891d]">PKR {(totalExpense/1000).toFixed(0)}k</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Est. Profit</div>
            <div className="font-serif text-lg md:text-3xl font-bold text-[#10b981]">PKR {(estProfit/1000).toFixed(0)}k</div>
          </div>
      </div>"""

kpi_replace = """      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm col-span-2 md:col-span-3 lg:col-span-2">
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-3">Setup Checklist</div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm font-medium text-on-surface">
               <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-[#5C0A1E] rounded-sm cursor-pointer" defaultChecked /> Hall Setup Complete</label>
               <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-[#5C0A1E] rounded-sm cursor-pointer" defaultChecked /> AC/Chillers On</label>
               <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-[#5C0A1E] rounded-sm cursor-pointer" /> Kitchen Ready</label>
            </div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e02424]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Outstanding</div>
            <div className="font-serif text-lg md:text-2xl font-bold text-[#e02424] flex items-baseline gap-1"><span className="text-[10px] md:text-xs font-sans text-on-surface-variant">PKR</span> {outstanding.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Event Cost</div>
            <div className="font-serif text-lg md:text-2xl font-bold text-[#b0891d] flex items-baseline gap-1"><span className="text-[10px] md:text-xs font-sans text-on-surface-variant">PKR</span> {totalExpense.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="text-[9px] md:text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Est. Profit</div>
            <div className="font-serif text-lg md:text-2xl font-bold text-[#10b981] flex items-baseline gap-1"><span className="text-[10px] md:text-xs font-sans text-on-surface-variant">PKR</span> {estProfit.toLocaleString()}</div>
          </div>
      </div>"""
content = content.replace(kpi_search, kpi_replace)

# 5. Attention Required
att_search = """          <ul className="text-xs md:text-sm text-[#e02424]/80 font-medium list-disc pl-4 space-y-1">
            <li>2 staff positions unassigned (Servers)</li>
            <li>Final guest count not confirmed (Due 48hrs prior)</li>
            <li>Sound check incomplete</li>
            <li>PKR {outstanding.toLocaleString()} payment due</li>
          </ul>"""
att_replace = """          <ul className="text-xs md:text-sm text-[#e02424]/80 font-medium list-disc pl-4 space-y-1">
            <li>Final guest count not confirmed (Due 48hrs prior)</li>
            {outstanding > 0 && <li>PKR {outstanding.toLocaleString()} payment due immediately</li>}
          </ul>"""
content = content.replace(att_search, att_replace)

# Also removing useToast missing destructuring warning
toast_search = """const { } = useToast();"""
toast_replace = """const { success, error } = useToast();"""
content = content.replace(toast_search, toast_replace)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating EventDetails.tsx")
