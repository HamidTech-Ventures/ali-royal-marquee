import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { bookingsService } from '../../services/bookingsService';
import clsx from 'clsx';

export const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate Calendar Grid
  const days = useMemo(() => {
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
  }, [currentDate]);

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

    const tentativeCount = monthBookings.filter(b => b.status === 'Pending').length;
    
    const totalPossibleShifts = 30 * 2 * 3; // roughly 30 days * 2 shifts * 3 venues
    const util = Math.round((monthBookings.length / totalPossibleShifts) * 100);

    return {
      todaysOps: todaysBookings.length,
      availableShifts: totalPossibleShifts - monthBookings.length,
      tentativeCount,
      utilization: util > 100 ? 100 : util
    };
  }, [activeBookings, currentDate]);

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
  
  const monthYearStr = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayDateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="w-full px-8 py-8">
      <div className="flex flex-col w-full space-y-8">
        <PageHeader 
          title="Calendar & Venue Availability"
          category="Estate Operations"
          icon="calendar_month"
          description="Real-time hall occupancy, conflict prevention engine, and banquet schedule coordination across Ali Royal Marquee estate."
          actions={
            <>
              <Button variant="outline" icon="lock">Block / Hold</Button>
              <Button variant="primary" icon="add" onClick={() => navigate('/app/bookings/new')}>New Booking</Button>
            </>
          }
        />

        {/* Filters and Views */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-64">
               <SearchInput placeholder="Search booking, client, VIP..." value="" onChange={() => {}} />
             </div>
             <Button variant="outline" icon="tune">Filters</Button>
          </div>
          <div className="bg-surface-container-low p-1 rounded flex items-center shadow-inner">
            <button className="bg-surface-container-lowest text-primary shadow-sm font-title-sm text-title-sm px-3.5 py-1.5 rounded font-semibold transition-all" type="button">Month</button>
            <button className="text-on-surface-variant hover:text-on-surface font-title-sm text-title-sm px-3 py-1.5 rounded transition-colors" type="button">Week</button>
            <button className="text-on-surface-variant hover:text-on-surface font-title-sm text-title-sm px-3 py-1.5 rounded transition-colors" type="button">Day</button>
            <button className="text-on-surface-variant hover:text-on-surface font-title-sm text-title-sm px-3 py-1.5 rounded transition-colors" type="button">List</button>
          </div>
        </div>

        {/* VENUE AVAILABILITY & CAPACITY SUMMARY */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Today's Operations</span>
                <div className="font-headline-md text-headline-md text-primary mt-1 flex items-baseline gap-2">
                  <span>{stats.todaysOps} Active</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">festival</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Bookings scheduled for today</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Available Shifts</span>
                <div className="font-headline-md text-headline-md text-on-surface mt-1 flex items-baseline gap-2">
                  <span>{stats.availableShifts} Slots</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">event_available</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Remaining slots this month</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed-dim"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Tentative Holds</span>
                <div className="font-headline-md text-headline-md text-on-surface mt-1 flex items-baseline gap-2">
                  <span>{stats.tentativeCount} Pending</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[22px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Awaiting confirmation</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Estate Utilization</span>
                <div className="font-headline-md text-headline-md text-primary mt-1 flex items-baseline gap-2">
                  <span>{stats.utilization}%</span>
                </div>
              </div>
              <div className="relative w-10 h-10">
                <span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm font-bold text-primary">{stats.utilization}%</span>
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Booked capacity this month</span>
            </div>
          </div>
        </section>

        {/* SMART CONFLICT DETECTION RIBBON */}
        {conflicts.length > 0 && (
          <section className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-error/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-title-sm text-title-sm text-error font-bold">Slot Overlap Conflict Detected</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wide bg-error/10 text-error px-2 py-0.2 rounded font-bold">{conflicts.length} Action(s) Required</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {conflicts.length} overlapping slot(s) found. Check {conflicts[0][0].dateStr} ({conflicts[0][0].hall} - {conflicts[0][0].shift}).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button className="bg-primary-container hover:bg-primary text-on-primary px-4 py-1.5 rounded font-title-sm text-title-sm font-semibold transition-colors shadow-sm" type="button">
                Resolve Conflict
              </button>
            </div>
          </section>
        )}

        {/* CALENDAR GRID */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-surface-container-low rounded p-1 shadow-inner">
                <button onClick={prevMonth} className="p-1 hover:bg-surface-container-lowest rounded transition-colors text-on-surface" type="button">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <span className="font-headline-sm text-headline-sm text-primary px-4 w-[200px] text-center">{monthYearStr}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-surface-container-lowest rounded transition-colors text-on-surface" type="button">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
              <button onClick={goToToday} className="bg-secondary-container/40 hover:bg-secondary-container text-secondary px-3 py-1.5 rounded font-title-sm text-title-sm font-semibold transition-colors" type="button">
                Today ({todayDateStr})
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1 rounded">
              <button className="bg-surface-container-lowest text-primary font-label-md text-label-md font-bold px-3 py-1.5 rounded shadow-sm" type="button">All Venues</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className={`text-center py-2 font-label-sm text-label-sm uppercase tracking-wider font-bold ${['Thu', 'Fri', 'Sat', 'Sun'].includes(day) ? (day === 'Thu' ? 'text-secondary' : 'text-primary') : 'text-on-surface-variant'}`}>{day}</div>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-on-surface-variant">Loading calendar...</div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((dayObj, i) => {
                const dayBookings = activeBookings.filter(b => {
                  if(!b.dateStr) return false;
                  const bDate = new Date(b.dateStr);
                  return bDate.getDate() === dayObj.date.getDate() && 
                         bDate.getMonth() === dayObj.date.getMonth() && 
                         bDate.getFullYear() === dayObj.date.getFullYear();
                });

                return (
                  <div key={i} className={clsx(
                    "min-h-[110px] p-2 rounded flex flex-col transition-colors border",
                    dayObj.isCurrentMonth ? "bg-surface-container-low hover:bg-surface-container border-transparent" : "bg-surface-container-lowest opacity-50 border-transparent",
                    "relative"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={clsx("font-title-sm text-title-sm font-semibold", dayObj.isCurrentMonth ? "text-on-surface" : "text-on-surface-variant")}>
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
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold truncate shadow-xs cursor-pointer border",
                              colorClass,
                              isConflict && "ring-2 ring-error"
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
          )}
        </div>

      </div>
    </div>
  );
};

export default Calendar;
