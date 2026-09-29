import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  isSidebarExpanded: boolean;
}

export const Header = ({ isSidebarExpanded }: HeaderProps) => {
  const { currentUser, logout } = useAuth();

  const [currentDate, setCurrentDate] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: 07 Sep 2026
      const formattedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      // Format: 09:42 AM
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentDate(`${formattedDate} · ${formattedTime}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className={clsx(
        "fixed top-0 right-0 h-20 bg-surface-container-lowest z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-[left] duration-300 ease-in-out",
        isSidebarExpanded ? "left-64" : "left-20"
      )}
    >
      <div className="h-20 w-full px-8 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <div className="font-headline-sm text-headline-sm text-primary">
            Good morning, {currentUser?.fullName?.split(' ')[0] || 'User'}
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Here's what's happening with Ali Royal Marquee today.
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-2 text-on-surface-variant font-label-md text-label-md bg-surface-container-lowest px-3 py-1.5 rounded-full ring-1 ring-surface-container-highest">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              calendar_today
            </span>
            <span>{currentDate}</span>
          </div>

          <NotificationBell />

          <div className="relative">
            <div 
              className="flex items-center gap-3 pl-2 border-l border-surface-container-highest cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-title-sm font-semibold ring-2 ring-surface-container hover:ring-primary transition-all">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden 2xl:flex flex-col">
                <span className="font-title-sm text-title-sm text-on-surface leading-tight font-semibold">
                  {currentUser?.fullName || 'User'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant capitalize">
                  {currentUser?.role || 'Role'}
                </span>
              </div>
            </div>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-[45]" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 top-12 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-xl ring-1 ring-surface-container-highest z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-surface-container-highest bg-surface-container-low flex flex-col">
                     <span className="font-title-sm font-semibold">{currentUser?.fullName}</span>
                     <span className="text-label-sm text-on-surface-variant">{currentUser?.email}</span>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={() => {
                         setIsProfileOpen(false);
                         navigate('/settings/profile');
                      }}
                      className="w-full text-left px-3 py-2 text-on-surface hover:bg-surface-container-lowest/50 rounded-md transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-error hover:bg-error/10 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
