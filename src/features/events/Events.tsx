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
    <div className="w-full px-8 py-8">
      <PageHeader 
        title="Events Command Center"
        category="Sovereign Floor Operations"
        icon="celebration"
        description="Plan, prepare, orchestrate, and close luxury wedding banquets and high-profile galas across Ali Royal estate with zero tolerance for error."
        actions={
          <Button variant="primary" icon="bolt">Quick Dispatch</Button>
        }
      />

      <div className="flex flex-col w-full space-y-8">
        {/* OPERATIONAL KPI CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Today's Banquets</span>
              <span className="material-symbols-outlined text-[20px] text-primary">celebration</span>
            </div>
            <div className="font-display text-display text-primary leading-none mb-1.5">{todaysBanquets.length}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
              <span>{paxToday} Pax Today</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">In Preparation</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">handyman</span>
            </div>
            <div className="font-display text-display text-secondary leading-none mb-1.5">{inPrep.length}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              <span>Events getting ready</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-surface-tint"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Live In Progress</span>
              <span className="material-symbols-outlined text-[20px] text-surface-tint animate-pulse">radio_button_checked</span>
            </div>
            <div className="font-display text-display text-on-surface leading-none mb-1.5">{liveNow.length}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {liveNow.map(e => e.hall).join(', ') || 'None'}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-outline-variant"></div>
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider">This Week's Horizon</span>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">calendar_view_week</span>
            </div>
            <div className="font-display text-display text-on-surface leading-none mb-1.5">{thisWeek.length}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              <span>Upcoming next 7 days</span>
            </div>
          </div>
        </section>

        {/* ATTENTION REQUIRED */}
        <div className="rounded-xl p-5 bg-primary-container text-on-primary shadow-md relative overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-secondary text-primary font-bold flex items-center justify-center shrink-0 shadow">
                <span className="material-symbols-outlined text-[20px] text-surface-container-lowest">warning</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-title-sm text-title-sm uppercase tracking-wider text-secondary-fixed">Critical Operations Guard</span>
                  <span className="text-xs bg-error text-on-error px-2 py-0.5 rounded-full font-bold">4 Action Items</span>
                </div>
                <p className="font-body-sm text-body-sm text-primary-fixed">Immediate supervisor attention required for Ahsan Malik Walima & reception gate security.</p>
              </div>
            </div>
          </div>
        </div>

        {/* EVENTS GRID */}
        {loading ? (
          <div className="flex justify-center p-8"><span className="animate-spin material-symbols-outlined text-4xl text-primary">autorenew</span></div>
        ) : (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {events.map(event => {
            return (
              <div 
                key={event.id}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between cursor-pointer group"
                onClick={() => navigate(`/app/events/${event.id}`)}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary-fixed opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-currency-num text-currency-num text-primary font-bold">{event.referenceNumber}</span>
                      <span className="font-label-sm text-label-sm bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold">{event.hall}</span>
                    </div>
                    {event.status === 'Ongoing' && (
                      <span className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded text-xs font-bold text-on-surface">
                        <span className="w-2 h-2 rounded-full bg-error animate-ping"></span> LIVE
                      </span>
                    )}
                    {event.status === 'Upcoming' && (
                      <Badge variant="warning">UPCOMING</Badge>
                    )}
                    {event.status === 'Completed' && (
                      <Badge variant="success">COMPLETED</Badge>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-headline-sm text-primary">{event.title}</h3>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary font-semibold mt-0.5">
                      {event.dateStr} • {event.startTime} – {event.endTime} · {event.guests} Pax
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-title-sm text-title-sm text-on-surface-variant">Manager on Duty</span>
                      <span className="font-bold text-primary">{event.managerId}</span>
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
