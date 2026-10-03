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

import { Inventory } from '../../features/inventory/Inventory';
import { InventoryDetails } from '../../features/inventory/InventoryDetails';
import { InventoryForm } from '../../features/inventory/InventoryForm';
import { Vendors } from '../../features/vendors/Vendors';
import { VendorDetails } from '../../features/vendors/VendorDetails';
import { VendorForm } from '../../features/vendors/VendorForm';
import { Staff } from '../../features/staff/Staff';
import { StaffDetails } from '../../features/staff/StaffDetails';
import { StaffForm } from '../../features/staff/StaffForm';

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
      { path: 'bookings/:bookingId/edit', element: <BookingForm /> },
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
      { path: 'expenses', element: <Navigate to="/app/payments" replace /> },
      { path: 'payments/new', element: <PaymentForm /> },
      { path: 'payments/:paymentId', element: <PaymentDetails /> },

      { path: 'inventory', element: <Inventory /> },
      { path: 'inventory/new', element: <InventoryForm /> },
      { path: 'inventory/:itemId', element: <InventoryDetails /> },
      { path: 'inventory/:itemId/edit', element: <InventoryForm /> },
      { path: 'vendors', element: <Vendors /> },
      { path: 'vendors/new', element: <VendorForm /> },
      { path: 'vendors/:vendorId', element: <VendorDetails /> },
      { path: 'vendors/:vendorId/edit', element: <VendorForm /> },
      { path: 'staff', element: <Staff /> },
      { path: 'staff/new', element: <StaffForm /> },
      { path: 'staff/:staffId', element: <StaffDetails /> },
      { path: 'staff/:staffId/edit', element: <StaffForm /> },

      { path: 'reports', element: <Reports /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings/*', element: <Settings /> },
        ],
      },
    ],
  },
]);

export default router;
