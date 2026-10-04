import sys

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\calendar\Calendar.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add currentView state
state_search = "const [currentDate, setCurrentDate] = useState(new Date());"
state_replace = """type ViewType = 'Month' | 'Week' | 'Day' | 'List';
  const [currentView, setCurrentView] = useState<ViewType>('Month');
  const [currentDate, setCurrentDate] = useState(new Date());"""
content = content.replace(state_search, state_replace)

# 2. Update navigation functions
nav_search = """  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };"""

nav_replace = """  // View navigation
  const prevDateRange = () => {
    if (currentView === 'Month' || currentView === 'List') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()));
    } else if (currentView === 'Week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else if (currentView === 'Day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    }
  };
  
  const nextDateRange = () => {
    if (currentView === 'Month' || currentView === 'List') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()));
    } else if (currentView === 'Week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else if (currentView === 'Day') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    }
  };"""
content = content.replace(nav_search, nav_replace)

# 3. Update days generation
days_search = """  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const result = [];
    
    const startDay = date.getDay(); // 0 is Sunday, 1 is Monday
    const diff = startDay === 0 ? 6 : startDay - 1; // start on Monday
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - diff);
    
    while (prevDate < date) {
      result.push({ date: new Date(prevDate), isCurrentMonth: false });
      prevDate.setDate(prevDate.getDate() + 1);
    }
    
    while (date.getMonth() === month) {
      result.push({ date: new Date(date), isCurrentMonth: true });
      date.setDate(date.getDate() + 1);
    }
    
    while (result.length % 7 !== 0) {
      result.push({ date: new Date(date), isCurrentMonth: false });
      date.setDate(date.getDate() + 1);
    }
    
    return result;
  }, [currentDate]);"""

days_replace = """  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (currentView === 'Month') {
      const date = new Date(year, month, 1);
      const result = [];
      const startDay = date.getDay(); // 0 is Sunday, 1 is Monday
      const diff = startDay === 0 ? 6 : startDay - 1; // start on Monday
      const prevDate = new Date(date);
      prevDate.setDate(date.getDate() - diff);
      
      while (prevDate < date) {
        result.push({ date: new Date(prevDate), isCurrentMonth: false });
        prevDate.setDate(prevDate.getDate() + 1);
      }
      
      while (date.getMonth() === month) {
        result.push({ date: new Date(date), isCurrentMonth: true });
        date.setDate(date.getDate() + 1);
      }
      
      while (result.length % 7 !== 0) {
        result.push({ date: new Date(date), isCurrentMonth: false });
        date.setDate(date.getDate() + 1);
      }
      return result;
    }
    
    if (currentView === 'Week') {
      const result = [];
      const current = new Date(currentDate);
      const startDay = current.getDay();
      const diff = startDay === 0 ? 6 : startDay - 1;
      current.setDate(current.getDate() - diff); // go to monday
      
      for(let i=0; i<7; i++) {
        result.push({ date: new Date(current), isCurrentMonth: current.getMonth() === month });
        current.setDate(current.getDate() + 1);
      }
      return result;
    }
    
    if (currentView === 'Day') {
      return [{ date: new Date(currentDate), isCurrentMonth: true }];
    }
    
    return []; // For List view, days array is not strictly used in grid
  }, [currentDate, currentView]);"""
content = content.replace(days_search, days_replace)

# 4. Remove Block/Hold Button
block_search = """              <Button variant="outline" icon="lock" className="flex-1 md:flex-auto border-[#e8e4db] text-[#4a1420]">Block / Hold</Button>"""
content = content.replace(block_search, "")

# 5. Remove Search bar, Filters, and update View buttons
filters_search = """        {/* Filters and Views */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex w-full md:w-auto items-center gap-3">
             <div className="flex-1 md:w-64">
               <SearchInput placeholder="Search booking, client, VIP..." value="" onChange={() => {}} />
             </div>
             <Button variant="outline" icon="tune" className="border-[#e8e4db] text-[#4a1420]">Filters</Button>
          </div>
          <div className="bg-white border border-[#e8e4db] p-1 rounded-lg flex items-center shadow-sm overflow-x-auto w-full md:w-auto hide-scrollbar">
            <button className="bg-[#FAF8F5] text-[#4a1420] shadow-sm text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-md font-medium transition-all whitespace-nowrap" type="button">Month</button>
            <button className="text-on-surface-variant hover:text-[#4a1420] text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors whitespace-nowrap" type="button">Week</button>
            <button className="text-on-surface-variant hover:text-[#4a1420] text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors whitespace-nowrap" type="button">Day</button>
            <button className="text-on-surface-variant hover:text-[#4a1420] text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors whitespace-nowrap" type="button">List</button>
          </div>
        </div>"""

filters_replace = """        {/* Views */}
        <div className="flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="bg-white border border-[#e8e4db] p-1 rounded-lg flex items-center shadow-sm overflow-x-auto w-full md:w-auto hide-scrollbar">
            {(['Month', 'Week', 'Day', 'List'] as ViewType[]).map(view => (
              <button 
                key={view}
                onClick={() => setCurrentView(view)}
                className={clsx(
                  "text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-md font-medium transition-all whitespace-nowrap",
                  currentView === view 
                    ? "bg-[#FAF8F5] text-[#4a1420] shadow-sm"
                    : "text-on-surface-variant hover:text-[#4a1420]"
                )}
                type="button"
              >
                {view}
              </button>
            ))}
          </div>
        </div>"""
content = content.replace(filters_search, filters_replace)

# 6. Update prevMonth/nextMonth calls to prevDateRange/nextDateRange
content = content.replace("onClick={prevMonth}", "onClick={prevDateRange}")
content = content.replace("onClick={nextMonth}", "onClick={nextDateRange}")

# 7. Update display string based on view
display_str_search = """  const monthYearStr = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });"""
display_str_replace = """  const displayStr = useMemo(() => {
    if (currentView === 'Month' || currentView === 'List') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (currentView === 'Day') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      const endOfWeek = new Date(currentDate);
      const startDay = endOfWeek.getDay();
      const diff = startDay === 0 ? 6 : startDay - 1;
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - diff);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }, [currentDate, currentView]);"""
content = content.replace(display_str_search, display_str_replace)

content = content.replace("{monthYearStr}", "{displayStr}")

# 8. Render Grid or List based on currentView
grid_search = """          <div className="overflow-x-auto no-scrollbar w-full">
            <div className="min-w-[700px] w-full">
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className={`text-center py-2 text-[10px] md:text-xs uppercase tracking-wider font-bold ${['Thu', 'Fri', 'Sat', 'Sun'].includes(day) ? (day === 'Thu' ? 'text-[#b0891d]' : 'text-[#5C0A1E]') : 'text-on-surface-variant'}`}>{day}</div>
                ))}
              </div>

          {loading ? (
            <div className="py-20 text-center text-on-surface-variant">Loading calendar...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayObj, i) => {"""

# Replace grid wrapper so we can handle Day and List view appropriately
grid_wrapper_search = """          <div className="overflow-x-auto no-scrollbar w-full">
            <div className="min-w-[700px] w-full">
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className={`text-center py-2 text-[10px] md:text-xs uppercase tracking-wider font-bold ${['Thu', 'Fri', 'Sat', 'Sun'].includes(day) ? (day === 'Thu' ? 'text-[#b0891d]' : 'text-[#5C0A1E]') : 'text-on-surface-variant'}`}>{day}</div>
                ))}
              </div>"""

grid_wrapper_replace = """          {loading ? (
            <div className="py-20 text-center text-on-surface-variant">Loading calendar...</div>
          ) : currentView === 'List' ? (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] w-full mt-4">
              {activeBookings.length === 0 ? (
                <div className="py-10 text-center text-on-surface-variant">No bookings for this period.</div>
              ) : (
                activeBookings.map((b, idx) => {
                  const colorClass = getVenueColor(b.hall);
                  const isConflict = conflicts.some(cGroup => cGroup.includes(b));
                  return (
                    <div 
                      key={idx}
                      onClick={() => navigate(`/app/bookings/${b.id}`)}
                      className={clsx(
                        "p-4 rounded-lg flex items-center justify-between cursor-pointer border shadow-sm hover:shadow-md transition-shadow",
                        colorClass,
                        isConflict && "ring-2 ring-error"
                      )}
                    >
                      <div>
                        <div className="font-bold text-lg">{b.customerName || 'Booking'}</div>
                        <div className="text-sm opacity-80">{b.dateStr} • {b.shift}</div>
                      </div>
                      <div className="font-semibold text-right">
                        <div>{b.hall}</div>
                        <div className="text-xs mt-1 opacity-75">{b.guests} Guests</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <div className="min-w-[700px] w-full">
              {currentView !== 'Day' && (
                <div className={clsx("grid gap-1 md:gap-2 mb-2", currentView === 'Week' ? "grid-cols-7" : "grid-cols-7")}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className={`text-center py-2 text-[10px] md:text-xs uppercase tracking-wider font-bold ${['Thu', 'Fri', 'Sat', 'Sun'].includes(day) ? (day === 'Thu' ? 'text-[#b0891d]' : 'text-[#5C0A1E]') : 'text-on-surface-variant'}`}>{day}</div>
                  ))}
                </div>
              )}"""
content = content.replace(grid_wrapper_search, grid_wrapper_replace)

grid_body_search = """          {loading ? (
            <div className="py-20 text-center text-on-surface-variant">Loading calendar...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">"""
            
grid_body_replace = """            <div className={clsx("grid gap-2", currentView === 'Day' ? "grid-cols-1" : "grid-cols-7")}>"""
content = content.replace(grid_body_search, grid_body_replace)

# Close the new ternary appropriately
grid_end_search = """            </div>
          )}
            </div>
          </div>"""
          
grid_end_replace = """            </div>
            </div>
          </div>
          )}"""
content = content.replace(grid_end_search, grid_end_end_replace := """            </div>
            </div>
          </div>
          )}""") # wait, I just need to replace the end correctly. Let's do it safely.

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
