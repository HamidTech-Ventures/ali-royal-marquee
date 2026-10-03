import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import clsx from 'clsx';

const moreMenuItems = [
  { name: 'Enquiries', path: '/app/enquiries', icon: 'contact_mail' },
  { name: 'Calendar', path: '/app/calendar', icon: 'calendar_month' },
  { name: 'Events', path: '/app/events', icon: 'celebration' },
  { name: 'Packages', path: '/app/packages', icon: 'restaurant_menu' },
  { name: 'Inventory', path: '/app/inventory', icon: 'inventory_2' },
  { name: 'Vendors', path: '/app/vendors', icon: 'storefront' },
  { name: 'Staff', path: '/app/staff', icon: 'badge' },
  { name: 'Insights Overview', path: '/app/insights/overview', icon: 'insights' },
  { name: 'Revenue Insights', path: '/app/insights/revenue', icon: 'trending_up' },
  { name: 'Booking Insights', path: '/app/insights/bookings', icon: 'event_note' },
  { name: 'Customer Insights', path: '/app/insights/customers', icon: 'group' },
  { name: 'Operations Insights', path: '/app/insights/operations', icon: 'local_shipping' },
  { name: 'Financial Insights', path: '/app/insights/financial', icon: 'account_balance_wallet' },
  { name: 'Forecast Insights', path: '/app/insights/forecast', icon: 'online_prediction' },
  { name: 'Settings', path: '/app/settings', icon: 'settings' },
];

export const DashboardLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen overflow-x-hidden w-full max-w-[100vw]">
      <div className="hidden md:block">
        <Sidebar isExpanded={isSidebarExpanded} onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} />
      </div>
      <div 
        className={clsx(
          "transition-[padding] duration-300 ease-in-out pb-16 md:pb-0", // pb-16 for mobile bottom nav
          isSidebarExpanded ? "md:pl-64" : "md:pl-20"
        )}
      >
        <Header isSidebarExpanded={isSidebarExpanded} />
        <main className="w-full pt-[130px] md:pt-20 bg-[#FAF8F5] min-h-screen overflow-x-hidden max-w-[100vw]">
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
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={clsx("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isMobileMenuOpen ? "text-[#5C0A1E]" : "text-on-surface-variant")}>
            <span className="material-symbols-outlined text-2xl">more_horiz</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>

        {/* Mobile More Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="bg-white rounded-t-3xl p-6 pb-24 shadow-2xl relative animate-in slide-in-from-bottom-full duration-300 z-50 max-h-[80vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6"></div>
              <h3 className="font-serif text-xl font-bold text-[#4a1420] mb-6">More Operations</h3>
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                {moreMenuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#e8e4db] flex items-center justify-center text-[#5C0A1E] group-hover:bg-[#5C0A1E] group-hover:text-white transition-all shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <span className="text-[10px] font-medium text-on-surface text-center break-words">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
