// import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Login } from '../../features/dashboard/Login';
import { Dashboard } from '../../features/dashboard/Dashboard';

import { Enquiries } from '../../features/enquiries/Enquiries';
import { EnquiryDetails } from '../../features/enquiries/EnquiryDetails';
import { EnquiryForm } from '../../features/enquiries/EnquiryForm';
import { Bookings } from '../../features/bookings/Bookings';
import { BookingDetails } from '../../features/bookings/BookingDetails';
import { BookingForm } from '../../features/bookings/BookingForm';
import { Calendar } from '../../features/calendar/Calendar';
import { Events } from '../../features/events/Events';
import { EventDetails } from '../../features/events/EventDetails';
import { Customers } from '../../features/customers/Customers';
import { CustomerDetails } from '../../features/customers/CustomerDetails';
import { PackagesMenu as Packages } from '../../features/packages/PackagesMenu';
import { PackageForm } from '../../features/packages/PackageForm';
import { PackageDetails } from '../../features/packages/PackageDetails';
import { Payments } from '../../features/payments/Payments';
import { PaymentDetails } from '../../features/payments/PaymentDetails';
import { PaymentForm } from '../../features/payments/PaymentForm';
import { Expenses } from '../../features/expenses/Expenses';
import { Inventory } from '../../features/inventory/Inventory';
import { InventoryDetails } from '../../features/inventory/InventoryDetails';
import { InventoryForm } from '../../features/inventory/InventoryForm';
import { Vendors } from '../../features/vendors/Vendors';
import { VendorDetails } from '../../features/vendors/VendorDetails';
import { VendorForm } from '../../features/vendors/VendorForm';
import { Staff } from '../../features/staff/Staff';
import { StaffDetails } from '../../features/staff/StaffDetails';
import { StaffForm } from '../../features/staff/StaffForm';
import { BusinessOverview } from '../../features/business/BusinessOverview';
import { BusinessFinances } from '../../features/business/BusinessFinances';
import { BusinessPackages } from '../../features/business/BusinessPackages';
import { BusinessInventory } from '../../features/business/BusinessInventory';
import { BusinessVendors } from '../../features/business/BusinessVendors';
import { BusinessStaff } from '../../features/business/BusinessStaff';
import { InsightsOverview } from '../../features/insights/InsightsOverview';
import { InsightsRevenue } from '../../features/insights/InsightsRevenue';
import { InsightsBookings } from '../../features/insights/InsightsBookings';
import { InsightsCustomers } from '../../features/insights/InsightsCustomers';
import { InsightsOperations } from '../../features/insights/InsightsOperations';
import { InsightsFinancial } from '../../features/insights/InsightsFinancial';
import { InsightsForecast } from '../../features/insights/InsightsForecast';
import { Reports } from '../../features/reports/Reports';
import { Analytics } from '../../features/analytics/Analytics';
import { Settings } from '../../features/settings/Settings';

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'enquiries', element: <Enquiries /> },
      { path: 'enquiries/new', element: <EnquiryForm /> },
      { path: 'enquiries/:enquiryId', element: <EnquiryDetails /> },
      { path: 'enquiries/:enquiryId/edit', element: <EnquiryForm /> },
      { path: 'bookings', element: <Bookings /> },
      { path: 'bookings/new', element: <BookingForm /> },
      { path: 'bookings/:bookingId', element: <BookingDetails /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'events', element: <Events /> },
      { path: 'events/:eventId', element: <EventDetails /> },
      { path: 'customers', element: <Customers /> },
      { path: 'customers/:customerId', element: <CustomerDetails /> },
      { path: 'packages', element: <Packages /> },
      { path: 'packages/new', element: <PackageForm /> },
      { path: 'packages/:packageId', element: <PackageDetails /> },
      { path: 'packages/:packageId/edit', element: <PackageForm /> },
      { path: 'payments', element: <Payments /> },
      { path: 'payments/new', element: <PaymentForm /> },
      { path: 'payments/:paymentId', element: <PaymentDetails /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'inventory/new', element: <InventoryForm /> },
      { path: 'inventory/:itemId', element: <InventoryDetails /> },
      { path: 'inventory/:itemId/edit', element: <InventoryForm /> },
      { path: 'vendors', element: <Vendors /> },
      { path: 'vendors/new', element: <VendorForm /> },
      { path: 'vendors/:vendorId', element: <VendorDetails /> },
      { path: 'staff', element: <Staff /> },
      { path: 'staff/new', element: <StaffForm /> },
      { path: 'staff/:staffId', element: <StaffDetails /> },
      { path: 'staff/:staffId/edit', element: <StaffForm /> },
      { path: 'business/overview', element: <BusinessOverview /> },
      { path: 'business/finances', element: <BusinessFinances /> },
      { path: 'business/packages', element: <BusinessPackages /> },
      { path: 'business/inventory', element: <BusinessInventory /> },
      { path: 'business/vendors', element: <BusinessVendors /> },
      { path: 'business/staff', element: <BusinessStaff /> },
      { path: 'insights/overview', element: <InsightsOverview /> },
      { path: 'insights/revenue', element: <InsightsRevenue /> },
      { path: 'insights/bookings', element: <InsightsBookings /> },
      { path: 'insights/customers', element: <InsightsCustomers /> },
      { path: 'insights/operations', element: <InsightsOperations /> },
      { path: 'insights/financial', element: <InsightsFinancial /> },
      { path: 'insights/forecast', element: <InsightsForecast /> },
      { path: 'reports', element: <Reports /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings/*', element: <Settings /> },
        ],
      },
    ],
  },
]);

export default router;
