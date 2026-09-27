// import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  {
    category: 'Overview',
    items: [
      { name: 'Dashboard', path: '/app/dashboard', icon: 'dashboard' },
    ],
  },
  {
    category: 'Operations',
    items: [
      { name: 'Enquiries', path: '/app/enquiries', icon: 'contact_mail', badge: '4' },
      { name: 'Bookings', path: '/app/bookings', icon: 'event_available' },
      { name: 'Calendar', path: '/app/calendar', icon: 'calendar_month' },
      { name: 'Events', path: '/app/events', icon: 'celebration' },
      { name: 'Customers', path: '/app/customers', icon: 'people' },
    ],
  },
  {
    category: 'Business',
    items: [
      { name: 'Finances', path: '/app/payments', icon: 'account_balance' },
      { name: 'Packages', path: '/app/packages', icon: 'restaurant_menu' },
      { name: 'Inventory', path: '/app/inventory', icon: 'inventory_2' },
      { name: 'Vendors', path: '/app/vendors', icon: 'storefront' },
      { name: 'Staff', path: '/app/staff', icon: 'badge' },
    ],
  },
  {
    category: 'Insights',
    items: [
      { name: 'Overview', path: '/app/insights/overview', icon: 'insights' },
      { name: 'Revenue', path: '/app/insights/revenue', icon: 'trending_up' },
      { name: 'Bookings', path: '/app/insights/bookings', icon: 'event_note' },
      { name: 'Customers', path: '/app/insights/customers', icon: 'group' },
      { name: 'Operations', path: '/app/insights/operations', icon: 'local_shipping' },
      { name: 'Financial', path: '/app/insights/financial', icon: 'account_balance_wallet' },
      { name: 'Forecast', path: '/app/insights/forecast', icon: 'online_prediction' },
    ],
  },
];

interface SidebarProps {
  isExpanded: boolean;
  onHoverChange: (expanded: boolean) => void;
}

export const Sidebar = ({ isExpanded, onHoverChange }: SidebarProps) => {
  return (
    <aside 
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={clsx(
        "fixed left-0 top-0 h-screen bg-primary-container text-on-primary z-50 flex flex-col justify-between overflow-y-auto overflow-x-hidden shadow-xl transition-all duration-300 ease-in-out scrollbar-none",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col">
        <div className="px-5 pt-6 pb-5 flex flex-col items-center">
          <div className="flex items-center gap-3 w-full" style={{ paddingLeft: isExpanded ? '0' : '4px' }}>
            <img
              alt="Ali Royal Marquee Logo"
              className="h-8 w-8 object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WzN9tmuje6ruMFaTqKZlNEJ_n8Sf6CREyW0LGPmbsPFO64n7OJQYk_RAOEUg_rENgII3ESbRmmUwSqnVOxhjc4bxjVEoCKKB3OHaF5fvlNNi_MW2lOaZH3pvQadPijHVXI_116D2_gotyuSZBAr2oAMtBhr3xRK-gx61orjsJZvteLGB7eVdhWOK76sa9rFNO6MQx9h2FCbeo6wBWU9p7FRqmnt7SelFFXxo6AFJTxmAxgCniWnELS93P2"
            />
            <div 
              className={clsx(
                "flex flex-col transition-opacity duration-300 overflow-hidden whitespace-nowrap",
                isExpanded ? "opacity-100" : "opacity-0 w-0"
              )}
            >
              <span className="font-headline-sm text-headline-sm tracking-tight text-surface-container-lowest leading-none">
                Ali Royal
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-fixed mt-1 text-[10px]">
                Management System
              </span>
            </div>
          </div>
          <div className="mt-5 h-[1px] w-full bg-secondary-fixed/20"></div>
        </div>

        <nav className="px-3 space-y-4">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {isExpanded ? (
                <div className="px-3 py-1 font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim/60 font-semibold transition-opacity duration-300">
                  {section.category}
                </div>
              ) : (
                <div className="h-6" /> // spacer to keep vertical rhythm roughly same
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  title={!isExpanded ? item.name : undefined}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center rounded transition-colors relative group h-10',
                      isExpanded ? 'justify-between px-3' : 'justify-center',
                      isActive
                        ? 'bg-primary text-secondary-fixed shadow-[inset_3px_0_0_#ffdea5] font-semibold'
                        : 'text-tertiary-fixed-dim hover:bg-primary/50 hover:text-secondary-fixed'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={clsx("flex items-center gap-3 overflow-hidden", isExpanded ? "" : "w-full justify-center")}>
                        <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                        <span className={clsx(
                          "font-title-sm text-title-sm whitespace-nowrap transition-opacity duration-300",
                          isExpanded ? "opacity-100" : "opacity-0 w-0"
                        )}>
                          {item.name}
                        </span>
                      </div>
                      
                      {/* Active indicator for collapsed state */}
                      {!isExpanded && isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed rounded-r"></div>
                      )}

                      {isExpanded && item.badge && (
                        <span className="bg-secondary text-on-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {!isExpanded && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-surface-container-highest text-on-surface text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3 mt-6 mb-4">
        <div className="h-[1px] w-full bg-secondary-fixed/10 mb-3"></div>
        <div className="space-y-1">
          <NavLink
            to="/app/settings"
            title={!isExpanded ? 'Settings' : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center rounded transition-colors relative group h-10',
                isExpanded ? 'gap-3 px-3' : 'justify-center',
                isActive
                  ? 'bg-primary text-secondary-fixed shadow-[inset_3px_0_0_#ffdea5] font-semibold'
                  : 'text-tertiary-fixed-dim hover:bg-primary/50 hover:text-secondary-fixed'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px] shrink-0">settings</span>
                <span className={clsx(
                  "font-title-sm text-title-sm whitespace-nowrap transition-opacity duration-300",
                  isExpanded ? "opacity-100" : "opacity-0 w-0"
                )}>
                  Settings
                </span>
                {!isExpanded && isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed rounded-r"></div>
                )}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-surface-container-highest text-on-surface text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    Settings
                  </div>
                )}
              </>
            )}
          </NavLink>
          <Link
            to="/login"
            title={!isExpanded ? 'Logout' : undefined}
            className={clsx(
              "flex items-center rounded text-tertiary-fixed-dim hover:bg-primary/50 hover:text-secondary-fixed transition-colors group relative h-10",
              isExpanded ? 'gap-3 px-3' : 'justify-center'
            )}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
            <span className={clsx(
              "font-title-sm text-title-sm whitespace-nowrap transition-opacity duration-300",
              isExpanded ? "opacity-100" : "opacity-0 w-0"
            )}>
              Logout
            </span>
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-surface-container-highest text-on-surface text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
};
