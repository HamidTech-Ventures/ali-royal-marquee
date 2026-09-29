import { useState, useEffect, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { notificationsApi, type NotificationDto } from '../../services/notificationsApi';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const connection = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/hubs/notifications` : 'http://localhost:5020/hubs/notifications')
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    connection.on('ReceiveNotification', (notification: NotificationDto) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    return () => {
      connection.stop();
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotifClick = async (notif: NotificationDto) => {
    setIsNotifOpen(false);
    
    if (!notif.isRead) {
      try {
        await notificationsApi.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error(err);
      }
    }

    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    // In a real app, you'd call an API endpoint to mark all read. For now we just map locally.
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsNotifOpen(!isNotifOpen)}
        className={clsx(
          "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
          isNotifOpen ? "bg-surface-container text-primary" : "hover:bg-surface-container-low text-on-surface-variant"
        )}
        type="button"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse"></span>
        )}
      </button>
      
      {isNotifOpen && (
        <>
          <div className="fixed inset-0 z-[45]" onClick={() => setIsNotifOpen(false)}></div>
          <div className="absolute right-0 top-12 mt-2 w-96 bg-surface-container-lowest rounded-lg shadow-xl ring-1 ring-surface-container-highest z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-surface-container-highest flex items-center justify-between bg-surface-container-low">
              <span className="font-title-md text-title-md text-on-surface font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-primary hover:text-secondary text-label-sm font-label-sm font-semibold transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant font-body-sm">
                  You're all caught up!
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={clsx(
                      "px-4 py-3 border-b border-surface-container-highest hover:bg-surface-container-lowest/50 cursor-pointer transition-colors",
                      !notif.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        {notif.type === 'Alert' && <span className="material-symbols-outlined text-error text-[20px]">error</span>}
                        {notif.type === 'Warning' && <span className="material-symbols-outlined text-secondary text-[20px]">warning</span>}
                        {notif.type === 'Success' && <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>}
                        {(notif.type === 'Info' || !['Alert', 'Warning', 'Success'].includes(notif.type)) && <span className="material-symbols-outlined text-primary text-[20px]">info</span>}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className={clsx("font-title-sm text-title-sm", !notif.isRead ? "text-on-surface font-semibold" : "text-on-surface-variant")}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-balance">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
