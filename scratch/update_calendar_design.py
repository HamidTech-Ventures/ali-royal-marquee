import sys
import re

file_path = r"c:\My working\HamidTech_Ventures\Clients\marquee-management-system\frontend\src\features\calendar\Calendar.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the standalone Views block
views_block_search = """        {/* Views */}
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
content = content.replace(views_block_search, "")

# 2. Replace All Venues block with the Views buttons
all_venues_search = """            <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F5] border border-[#e8e4db] p-1 rounded-lg w-full sm:w-auto">
              <button className="bg-white text-[#4a1420] text-xs md:text-sm font-bold px-3 py-1.5 rounded-md shadow-sm w-full sm:w-auto" type="button">All Venues</button>
            </div>"""

views_replace = """            <div className="bg-[#FAF8F5] border border-[#e8e4db] p-1 rounded-lg flex items-center shadow-sm overflow-x-auto w-full sm:w-auto hide-scrollbar">
              {(['Month', 'Week', 'Day', 'List'] as ViewType[]).map(view => (
                <button 
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={clsx(
                    "text-xs md:text-sm px-3 md:px-4 py-1.5 rounded-md font-bold transition-all whitespace-nowrap",
                    currentView === view 
                      ? "bg-white text-[#4a1420] shadow-sm border border-[#e8e4db]"
                      : "text-on-surface-variant hover:text-[#4a1420]"
                  )}
                  type="button"
                >
                  {view}
                </button>
              ))}
            </div>"""
content = content.replace(all_venues_search, views_replace)

# 3. Enhance day grid styling
day_grid_start_search = """              {days.map((dayObj, i) => {
                const dayBookings = activeBookings.filter(b => {"""
day_grid_start_replace = """              {days.map((dayObj, i) => {
                const isToday = dayObj.date.getDate() === new Date().getDate() && 
                                dayObj.date.getMonth() === new Date().getMonth() && 
                                dayObj.date.getFullYear() === new Date().getFullYear();
                const dayBookings = activeBookings.filter(b => {"""
content = content.replace(day_grid_start_search, day_grid_start_replace)

# Grid cell styling
cell_styling_search = """                  <div key={i} className={clsx(
                    "min-h-[110px] p-2 rounded flex flex-col transition-colors border",
                    dayObj.isCurrentMonth ? "bg-surface-container-low hover:bg-surface-container border-transparent" : "bg-surface-container-lowest opacity-50 border-transparent",
                    "relative"
                  )}>"""

cell_styling_replace = """                  <div key={i} className={clsx(
                    "min-h-[120px] p-2.5 rounded-xl flex flex-col transition-all border",
                    dayObj.isCurrentMonth 
                      ? "bg-white hover:bg-[#FAF8F5] border-[#e8e4db] hover:shadow-sm" 
                      : "bg-[#FAF8F5] opacity-50 border-transparent",
                    isToday ? "ring-2 ring-[#4a1420]/30 bg-[#4a1420]/5 border-[#4a1420]/20" : "",
                    "relative"
                  )}>"""
content = content.replace(cell_styling_search, cell_styling_replace)

# Header styling
header_styling_search = """                      <span className={clsx("font-title-sm text-title-sm font-semibold", dayObj.isCurrentMonth ? "text-on-surface" : "text-on-surface-variant")}>
                        {dayObj.date.getDate()}
                      </span>"""
header_styling_replace = """                      <span className={clsx(
                        "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-serif",
                        isToday ? "bg-[#4a1420] text-white shadow-sm" : 
                        dayObj.isCurrentMonth ? "text-[#4a1420]" : "text-on-surface-variant"
                      )}>
                        {dayObj.date.getDate()}
                      </span>"""
content = content.replace(header_styling_search, header_styling_replace)

# Event chip styling
chip_search = """                            className={clsx(
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold truncate shadow-xs cursor-pointer border",
                              colorClass,
                              isConflict && "ring-2 ring-error"
                            )}"""
chip_replace = """                            className={clsx(
                              "px-2 py-1.5 rounded-md text-[10.5px] font-bold truncate shadow-sm cursor-pointer border transition-transform hover:scale-[1.02]",
                              colorClass,
                              isConflict && "ring-2 ring-error animate-pulse"
                            )}"""
content = content.replace(chip_search, chip_replace)

# Update day view grid gap for better presentation
day_view_gap_search = """            <div className={clsx("grid gap-2", currentView === 'Day' ? "grid-cols-1" : "grid-cols-7")}>"""
day_view_gap_replace = """            <div className={clsx("grid gap-3", currentView === 'Day' ? "grid-cols-1 max-w-3xl mx-auto" : "grid-cols-7")}>"""
content = content.replace(day_view_gap_search, day_view_gap_replace)

# Improve list view presentation
list_view_search = """                    <div 
                      key={idx}
                      onClick={() => navigate(`/app/bookings/${b.id}`)}
                      className={clsx(
                        "p-4 rounded-lg flex items-center justify-between cursor-pointer border shadow-sm hover:shadow-md transition-shadow",
                        colorClass,"""

list_view_replace = """                    <div 
                      key={idx}
                      onClick={() => navigate(`/app/bookings/${b.id}`)}
                      className={clsx(
                        "p-5 rounded-xl flex items-center justify-between cursor-pointer border shadow-sm hover:shadow-md transition-all hover:scale-[1.01] hover:-translate-y-0.5",
                        colorClass,"""
content = content.replace(list_view_search, list_view_replace)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done updating Calendar design")
