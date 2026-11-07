import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Services } from './pages/public/Services';
import { ServiceDetail } from './pages/public/ServiceDetail';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { TrackRepair } from './pages/public/TrackRepair';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Customer Pages
import { CustomerOverview } from './pages/customer/CustomerOverview';
import { BookService } from './pages/customer/BookService';
import { MyAppointments } from './pages/customer/MyAppointments';
import { TrackRepairTimeline } from './pages/customer/TrackRepairTimeline';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminSlots } from './pages/admin/AdminSlots';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminRepairs } from './pages/admin/AdminRepairs';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminSettings } from './pages/admin/AdminSettings';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite-100 font-quantico text-xs uppercase font-bold text-techgrey-500">
        VALIDATING SECURITY CREDENTIALS...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Admin Route Guard
function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite-100 font-quantico text-xs uppercase font-bold text-techgrey-500">
        VERIFYING ADMINISTRATIVE ACCESS...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/portal/overview" replace />;
  }

  return children;
}

// Public Shell wrapper with Navbar and Footer
function PublicShell({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicShell><Home /></PublicShell>} />
          <Route path="/services" element={<PublicShell><Services /></PublicShell>} />
          <Route path="/services/:slug" element={<PublicShell><ServiceDetail /></PublicShell>} />
          <Route path="/about" element={<PublicShell><About /></PublicShell>} />
          <Route path="/contact" element={<PublicShell><Contact /></PublicShell>} />
          <Route path="/track" element={<PublicShell><TrackRepair /></PublicShell>} />
          <Route path="/login" element={<PublicShell><Login /></PublicShell>} />
          <Route path="/register" element={<PublicShell><Register /></PublicShell>} />

          {/* Customer Portal Protected Routes */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/portal/overview" replace />} />
            <Route path="overview" element={<CustomerOverview />} />
            <Route path="book" element={<BookService />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="repairs/:bookingId" element={<TrackRepairTimeline />} />
            <Route path="notifications" element={<CustomerNotifications />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Admin Operations Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="repairs" element={<AdminRepairs />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <PublicShell>
                <div className="py-24 text-center font-quantico space-y-4">
                  <div className="text-4xl font-bold text-graphite-900">404 // NOT FOUND</div>
                  <p className="text-xs uppercase text-techgrey-500">
                    THE SPECIFIED RESOURCE DOES NOT EXIST ON THE WORKBENCH SERVER.
                  </p>
                  <a href="/" className="inline-block text-xs font-bold text-electric uppercase underline">
                    RETURN TO HEADQUARTERS
                  </a>
                </div>
              </PublicShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
