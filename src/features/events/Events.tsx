import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { eventsService } from '../../services/eventsService';
import { useNavigate } from 'react-router-dom';

export const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events', error);
    } finally {
      setLoading(false);
    }
  };

  const todaysBanquets = events.filter(e => new Date(e.dateStr).toDateString() === new Date().toDateString());
  const paxToday = todaysBanquets.reduce((sum, e) => sum + (e.guests || 0), 0);
  const inPrep = events.filter(e => e.status === 'Upcoming' && e.readinessScore > 0 && e.readinessScore < 100);
  const liveNow = events.filter(e => e.status === 'Ongoing');
  const thisWeek = events.filter(e => {
    const d = new Date(e.dateStr);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    return d >= now && d <= weekFromNow;
  });

  return (
    <div className="w-full px-4 md:px-8 py-6 bg-[#FAF8F5] min-h-screen">
      <PageHeader 
        title="Events Command Center"
        category="Sovereign Floor Operations"
        icon="celebration"
        description="Plan, prepare, orchestrate, and close luxury wedding banquets and high-profile galas across Ali Royal estate with zero tolerance for error."
        actions={
          <div className="flex w-full md:w-auto">
            <Button variant="primary" icon="bolt" className="w-full md:w-auto !bg-[#5C0A1E]">Quick Dispatch</Button>
          </div>
        }
      />

      <div className="flex flex-col w-full space-y-6 md:space-y-8">
        {/* OPERATIONAL KPI CARDS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white border border-[#e8e4db] rounded-xl p-3.5 md:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C0A1E]"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-1 md:mb-2">
              <span className="text-[9px] md:text-label-sm uppercase tracking-wider font-bold">Today's Banquets</span>
              <span className="material-symbols-outlined text-[16px] md:text-[20px] text-[#5C0A1E]">celebration</span>
            </div>
            <div className="font-serif text-2xl md:text-4xl font-bold text-[#4a1420] mb-0.5 md:mb-1">{todaysBanquets.length}</div>
            <div className="text-[10px] md:text-body-sm text-on-surface-variant flex items-center justify-between font-medium">
              <span>{paxToday} Pax Today</span>
            </div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-3.5 md:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b0891d]"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-1 md:mb-2">
              <span className="text-[9px] md:text-label-sm uppercase tracking-wider font-bold">In Preparation</span>
              <span className="material-symbols-outlined text-[16px] md:text-[20px] text-[#b0891d]">handyman</span>
            </div>
            <div className="font-serif text-2xl md:text-4xl font-bold text-[#4a1420] mb-0.5 md:mb-1">{inPrep.length}</div>
            <div className="text-[10px] md:text-body-sm text-on-surface-variant font-medium">
              <span>Events getting ready</span>
            </div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-3.5 md:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e02424]"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-1 md:mb-2">
              <span className="text-[9px] md:text-label-sm uppercase tracking-wider font-bold">Live In Progress</span>
              <span className="material-symbols-outlined text-[16px] md:text-[20px] text-[#e02424] animate-pulse">radio_button_checked</span>
            </div>
            <div className="font-serif text-2xl md:text-4xl font-bold text-[#e02424] mb-0.5 md:mb-1">{liveNow.length}</div>
            <div className="text-[10px] md:text-body-sm text-[#e02424] font-medium truncate">
              {liveNow.map(e => e.hall).join(', ') || 'None'}
            </div>
          </div>
          <div className="bg-white border border-[#e8e4db] rounded-xl p-3.5 md:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-1 md:mb-2">
              <span className="text-[9px] md:text-label-sm uppercase tracking-wider font-bold">This Week</span>
              <span className="material-symbols-outlined text-[16px] md:text-[20px] text-on-surface-variant">calendar_view_week</span>
            </div>
            <div className="font-serif text-2xl md:text-4xl font-bold text-[#4a1420] mb-0.5 md:mb-1">{thisWeek.length}</div>
            <div className="text-[10px] md:text-body-sm text-on-surface-variant font-medium">
              <span>Upcoming next 7 days</span>
            </div>
          </div>
        </section>

        {/* ATTENTION REQUIRED */}
        {inPrep.length > 0 && (
          <div className="rounded-xl p-4 md:p-5 bg-[#5C0A1E]/10 border border-[#5C0A1E]/20 relative overflow-hidden">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 md:gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#5C0A1E] text-white font-bold flex items-center justify-center shrink-0 shadow">
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">warning</span>
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#4a1420]">Critical Operations Guard</span>
                    <span className="text-[10px] md:text-xs bg-[#e02424] text-white px-2 py-0.5 rounded-full font-bold">{inPrep.length} Events Pending Readiness</span>
                  </div>
                  <p className="text-xs md:text-sm text-[#4a1420]/80 font-medium">
                    Immediate supervisor attention required for {inPrep.map(e => e.title).join(', ')}. Ensure all tasks are completed before event start.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-[#e8e4db]">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-none pb-2 md:pb-0">
            {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map(filter => (
              <Button 
                key={filter}
                variant={statusFilter === filter ? 'primary' : 'outline'} 
                className={statusFilter === filter ? '!bg-[#4a1420] !text-[#ffdea5] shrink-0' : 'shrink-0 text-on-surface-variant'}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-96 shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              type="text" 
              placeholder="Search by title, reference, or customer..." 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* EVENTS GRID */}
        {loading ? (
          <div className="flex justify-center p-8"><span className="animate-spin material-symbols-outlined text-4xl text-primary">autorenew</span></div>
        ) : (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {events.filter(e => 
            (statusFilter === 'All' || e.status === statusFilter) &&
            (e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             e.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             e.customerName?.toLowerCase().includes(searchQuery.toLowerCase()))
          ).map(event => {
            return (
              <div 
                key={event.id}
                className="bg-white border border-[#e8e4db] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between cursor-pointer group"
                onClick={() => navigate(`/app/events/${event.id}`)}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#b0891d] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-[#4a1420] font-bold text-sm md:text-base">{event.referenceNumber}</span>
                      <span className="text-[10px] bg-[#5C0A1E]/10 text-[#5C0A1E] px-2 py-0.5 rounded uppercase font-bold tracking-wider">{event.hall}</span>
                    </div>
                    {event.status === 'Ongoing' && (
                      <span className="flex items-center gap-1.5 bg-[#e02424]/10 px-2 py-0.5 rounded text-[10px] font-bold text-[#e02424]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e02424] animate-ping"></span> LIVE
                      </span>
                    )}
                    {event.status === 'Upcoming' && (
                      <Badge variant="warning" className="text-[9px] md:text-[10px] px-2 py-0.5">UPCOMING</Badge>
                    )}
                    {event.status === 'Completed' && (
                      <Badge variant="success" className="text-[9px] md:text-[10px] px-2 py-0.5">COMPLETED</Badge>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg md:text-xl font-bold text-[#4a1420]">{event.title}</h3>
                    </div>
                    <p className="text-xs md:text-sm text-on-surface-variant font-medium mt-1">
                      {event.dateStr} • {event.startTime} – {event.endTime} · {event.guests} Pax
                    </p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#e8e4db]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-on-surface-variant">Manager on Duty</span>
                      <span className="font-bold text-[#4a1420]">{event.managerId}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
        )}
      </div>

      <Drawer
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || ''}
        subtitle={selectedEvent ? `Ref: ${selectedEvent.referenceNumber}` : ''}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
            <Button variant="primary" onClick={() => navigate(`/app/events/${selectedEvent?.id}`)}>Manage Event</Button>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3 flex items-center justify-between">
                <span>Event Schedule</span>
                <Badge variant={selectedEvent.status === 'Ongoing' ? 'error' : selectedEvent.status === 'Completed' ? 'success' : 'warning'}>{selectedEvent.status}</Badge>
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Date</span>
                  <span className="font-semibold">{selectedEvent.dateStr}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Time</span>
                  <span className="font-semibold">{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Venue</span>
                  <span className="font-semibold">{selectedEvent.hall}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Manager</span>
                  <span className="font-semibold">{selectedEvent.managerId}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-lg">
              <h3 className="font-title-md mb-3">Client Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-body-sm">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Guests</span>
                  <span className="font-semibold">{selectedEvent.guests} Pax</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Events;
