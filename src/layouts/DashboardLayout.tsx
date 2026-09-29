import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import clsx from 'clsx';

export const DashboardLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <div className="hidden md:block">
        <Sidebar isExpanded={isSidebarExpanded} onHoverChange={setIsSidebarExpanded} />
      </div>
      <div 
        className={clsx(
          "transition-[padding] duration-300 ease-in-out pb-16 md:pb-0", // pb-16 for mobile bottom nav
          isSidebarExpanded ? "md:pl-64" : "md:pl-20"
        )}
      >
        <Header isSidebarExpanded={isSidebarExpanded} />
        <main className="w-full pt-20 bg-background min-h-screen">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-surface-container flex items-center justify-around z-50 rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <NavLink to="/app/dashboard" className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full space-y-1", isActive ? "text-primary" : "text-on-surface-variant")}>
            <span className="material-symbols-outlined text-2xl">dashboard</span>
            <span className="text-[10px] font-semibold">Dashboard</span>
          </NavLink>
          <NavLink to="/app/bookings" className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full space-y-1", isActive ? "text-primary" : "text-on-surface-variant")}>
            <span className="material-symbols-outlined text-2xl">event_available</span>
            <span className="text-[10px] font-medium">Bookings</span>
          </NavLink>
          <NavLink to="/app/customers" className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full space-y-1", isActive ? "text-primary" : "text-on-surface-variant")}>
            <span className="material-symbols-outlined text-2xl">people</span>
            <span className="text-[10px] font-medium">Customers</span>
          </NavLink>
          <NavLink to="/app/payments" className={({ isActive }) => clsx("flex flex-col items-center justify-center w-full h-full space-y-1", isActive ? "text-primary" : "text-on-surface-variant")}>
            <span className="material-symbols-outlined text-2xl">account_balance</span>
            <span className="text-[10px] font-medium">Finance</span>
          </NavLink>
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl">more_horiz</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
