import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { bookingsService } from '../../services/bookingsService';
import { useVenues } from '../../hooks/useVenues';
import clsx from 'clsx';

export const Calendar = () => {
  const navigate = useNavigate();
  type ViewType = 'Month' | 'Week' | 'Day' | 'List';
  const [currentView, setCurrentView] = useState<ViewType>('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { venues } = useVenues();

  // View navigation
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
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate Calendar Grid
  const days = useMemo(() => {
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
  }, [currentDate, currentView]);

  // Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        // Fetch slightly wider range to cover the grid
        const start = new Date(year, month, -7).toISOString();
        const end = new Date(year, month + 1, 7).toISOString();
        
        const response = await bookingsService.getBookings({ 
          startDate: start, 
          endDate: end,
          pageSize: 1000 
        });
        setBookings(response.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [currentDate]);

  // Stats and Conflicts
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  
  const stats = useMemo(() => {
    const today = new Date();
    const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    };
    
    const todaysBookings = activeBookings.filter(b => b.dateStr && isToday(b.dateStr));
    
    const monthBookings = activeBookings.filter(b => {
      if(!b.dateStr) return false;
      const d = new Date(b.dateStr);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });

    const tentativeCount = monthBookings.filter(b => b.status === 'Pending' || b.status === 'Draft').length;
    
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const venueCount = venues.length > 0 ? venues.length : 3; // Fallback to 3 if venues are still loading
    const totalPossibleShifts = daysInMonth * 2 * venueCount; // Days * 2 shifts (Day/Night) * Venues
    
    const util = totalPossibleShifts > 0 ? Math.round((monthBookings.length / totalPossibleShifts) * 100) : 0;

    return {
      todaysOps: todaysBookings.length,
      availableShifts: Math.max(0, totalPossibleShifts - monthBookings.length),
      tentativeCount,
      utilization: util > 100 ? 100 : util
    };
  }, [activeBookings, currentDate, venues]);

  const conflicts = useMemo(() => {
    const map = new Map<string, any[]>();
    activeBookings.forEach(b => {
      if (!b.dateStr || !b.shift || !b.venueId) return;
      const key = `${b.dateStr}_${b.shift}_${b.venueId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    });
    
    const conflictGroups: any[][] = [];
    map.forEach(group => {
      if (group.length > 1) conflictGroups.push(group);
    });
    return conflictGroups;
  }, [activeBookings]);

  // UI Helpers
  const getVenueColor = (hall: string) => {
    if (!hall) return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
    if (hall.toLowerCase().includes('grand')) return 'bg-primary-container text-on-primary-container border-primary/20';
    if (hall.toLowerCase().includes('crystal')) return 'bg-secondary-container text-on-secondary-container border-secondary/20';
    if (hall.toLowerCase().includes('garden')) return 'bg-success/20 text-success border-success/30';
    return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
  };
  
  const displayStr = useMemo(() => {
    if (currentView === 'Month' || currentView === 'List') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (currentView === 'Day') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      const startDay = currentDate.getDay();
      const diff = startDay === 0 ? 6 : startDay - 1; // start on Monday
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }, [currentDate, currentView]);
  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        <PageHeader 
          title="Calendar & Venue Availability"
          category="Estate Operations"
          icon="calendar_month"
          description="Real-time hall occupancy, conflict prevention engine, and banquet schedule coordination across Ali Royal Marquee estate."
          actions={
            <div className="flex items-center gap-2 w-full md:w-auto">

              <Button variant="primary" icon="add" className="flex-1 md:flex-auto !bg-[#5C0A1E]" onClick={() => navigate('/app/bookings/new')}>New Booking</Button>
            </div>
          }
        />



        {/* VENUE AVAILABILITY & CAPACITY SUMMARY */}
        {/* VENUE AVAILABILITY & CAPACITY SUMMARY */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Today's Operations</span>
                <div className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold mt-1 md:mt-2 flex items-baseline gap-2">
                  <span>{stats.todaysOps} Active</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#5C0A1E]/10 flex items-center justify-center text-[#5C0A1E]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">festival</span>
              </div>
            </div>
            <div className="mt-2 md:mt-4 pt-2 md:pt-3 flex items-center justify-between text-on-surface-variant text-[10px] md:text-xs">
              <span>Bookings scheduled for today</span>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Available Shifts</span>
                <div className="font-serif text-2xl md:text-4xl text-[#10b981] font-bold mt-1 md:mt-2 flex items-baseline gap-2">
                  <span>{stats.availableShifts} Slots</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">event_available</span>
              </div>
            </div>
            <div className="mt-2 md:mt-4 pt-2 md:pt-3 flex items-center justify-between text-on-surface-variant text-[10px] md:text-xs">
              <span>Remaining slots this month</span>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Tentative Holds</span>
                <div className="font-serif text-2xl md:text-4xl text-[#b0891d] font-bold mt-1 md:mt-2 flex items-baseline gap-2">
                  <span>{stats.tentativeCount} Pending</span>
                </div>
              </div>
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-[#b0891d]/10 flex items-center justify-center text-[#b0891d]">
                <span className="material-symbols-outlined text-[16px] md:text-[22px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-2 md:mt-4 pt-2 md:pt-3 flex items-center justify-between text-on-surface-variant text-[10px] md:text-xs">
              <span>Awaiting confirmation</span>
            </div>
          </div>
          <div className="bg-white p-3 md:p-5 rounded-xl border border-[#e8e4db] shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] md:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">Estate Utilization</span>
                <div className="font-serif text-2xl md:text-4xl text-[#4a1420] font-bold mt-1 md:mt-2 flex items-baseline gap-2">
                  <span>{stats.utilization}%</span>
                </div>
              </div>
              <div className="relative w-7 h-7 md:w-10 md:h-10 bg-[#5C0A1E]/10 rounded-lg flex items-center justify-center">
                <span className="font-bold text-[#5C0A1E] text-xs md:text-sm">{stats.utilization}%</span>
              </div>
            </div>
            <div className="mt-2 md:mt-4 pt-2 md:pt-3 flex items-center justify-between text-on-surface-variant text-[10px] md:text-xs">
              <span>Booked capacity this month</span>
            </div>
          </div>
        </section>

        {/* SMART CONFLICT DETECTION RIBBON */}
        {conflicts.length > 0 && (
          <section className="bg-[#FAF8F5] p-3 md:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 border border-[#e02424]/20">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#e02424]/10 text-[#e02424] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] md:text-[20px]">warning</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-sm md:text-base text-[#e02424] font-bold">Slot Overlap Conflict Detected</span>
                  <span className="text-[9px] md:text-xs uppercase tracking-wide bg-[#e02424]/10 text-[#e02424] px-2 py-0.5 rounded font-bold">{conflicts.length} Action(s) Required</span>
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
                  {conflicts.length} overlapping slot(s) found. Check {conflicts[0][0].dateStr} ({conflicts[0][0].hall} - {conflicts[0][0].shift}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto mt-2 md:mt-0">
              <button className="w-full md:w-auto bg-[#e02424]/10 hover:bg-[#e02424] hover:text-white text-[#e02424] px-4 py-2 rounded text-xs md:text-sm font-semibold transition-colors shadow-sm" type="button">
                Resolve Conflict
              </button>
            </div>
          </section>
        )}

        {/* CALENDAR GRID */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-3 md:p-4 border border-[#e8e4db] w-full max-w-[100vw] overflow-x-hidden relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
              <div className="flex items-center bg-[#FAF8F5] border border-[#e8e4db] rounded-lg p-1 w-full sm:w-auto justify-between sm:justify-start">
                <button onClick={prevDateRange} className="p-1 md:p-1.5 hover:bg-[#e8e4db] rounded transition-colors text-[#4a1420]" type="button">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <span className="font-serif text-sm md:text-base text-[#4a1420] font-bold px-2 md:px-4 w-auto md:w-[200px] text-center">{displayStr}</span>
                <button onClick={nextDateRange} className="p-1 md:p-1.5 hover:bg-[#e8e4db] rounded transition-colors text-[#4a1420]" type="button">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
              <button onClick={goToToday} className="bg-[#b0891d]/10 hover:bg-[#b0891d]/20 text-[#b0891d] px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap" type="button">
                Today ({todayDateStr})
              </button>
            </div>
            <div className="bg-[#FAF8F5] border border-[#e8e4db] p-1 rounded-lg flex items-center shadow-sm overflow-x-auto w-full sm:w-auto hide-scrollbar">
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
            </div>
          </div>

          {loading ? (
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
                        "p-5 rounded-xl flex items-center justify-between cursor-pointer border shadow-sm hover:shadow-md transition-all hover:scale-[1.01] hover:-translate-y-0.5",
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
              )}

            <div className={clsx("grid gap-3", currentView === 'Day' ? "grid-cols-1 max-w-3xl mx-auto" : "grid-cols-7")}>
              {days.map((dayObj, i) => {
                const isToday = dayObj.date.getDate() === new Date().getDate() && 
                                dayObj.date.getMonth() === new Date().getMonth() && 
                                dayObj.date.getFullYear() === new Date().getFullYear();
                const dayBookings = activeBookings.filter(b => {
                  if(!b.dateStr) return false;
                  const bDate = new Date(b.dateStr);
                  return bDate.getDate() === dayObj.date.getDate() && 
                         bDate.getMonth() === dayObj.date.getMonth() && 
                         bDate.getFullYear() === dayObj.date.getFullYear();
                });

                return (
                  <div key={i} className={clsx(
                    "min-h-[120px] p-2.5 rounded-xl flex flex-col transition-all border",
                    dayObj.isCurrentMonth 
                      ? "bg-white hover:bg-[#FAF8F5] border-[#e8e4db] hover:shadow-sm" 
                      : "bg-[#FAF8F5] opacity-50 border-transparent",
                    isToday ? "ring-2 ring-[#4a1420]/30 bg-[#4a1420]/5 border-[#4a1420]/20" : "",
                    "relative"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={clsx(
                        "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold font-serif",
                        isToday ? "bg-[#4a1420] text-white shadow-sm" : 
                        dayObj.isCurrentMonth ? "text-[#4a1420]" : "text-on-surface-variant"
                      )}>
                        {dayObj.date.getDate()}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="font-label-sm text-[10px] text-secondary font-bold">{dayBookings.length} Events</span>
                      )}
                    </div>
                    
                    <div className="space-y-1 my-1 overflow-y-auto max-h-[80px] no-scrollbar">
                      {dayBookings.map((b, idx) => {
                        const colorClass = getVenueColor(b.hall);
                        const isConflict = conflicts.some(cGroup => cGroup.includes(b));
                        
                        return (
                          <div 
                            key={idx} 
                            onClick={() => navigate(`/app/bookings/${b.id}`)}
                            className={clsx(
                              "px-2 py-1.5 rounded-md text-[10.5px] font-bold truncate shadow-sm cursor-pointer border transition-transform hover:scale-[1.02]",
                              colorClass,
                              isConflict && "ring-2 ring-error animate-pulse"
                            )}
                            title={`${b.hall} - ${b.shift}`}
                          >
                            {b.shift === 'Night' ? '🌙' : '☀️'} {b.hall?.split(' ')[0]}: {b.customerName || 'Booking'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Calendar;
