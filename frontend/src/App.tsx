import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

// Navbar Component
import { Navbar } from '@/components/Navbar';

// Public & Auth Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RoleSelectionPage } from '@/pages/auth/RoleSelectionPage';
import { CustomerSignupPage } from '@/pages/Customer/CustomerSignupPage';
import { OtpVerifyPage } from '@/pages/auth/OtpVerifyPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { WaitingApprovalPage } from '@/pages/auth/WaitingApprovalPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Admin Pages
import { AdminPortalLayout } from '@/pages/Admin/AdminPortalLayout';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';
import { ManageUsersPage } from './pages/Admin/ManageUsersPage';
import { ManagerRequestsPage } from './pages/Admin/ManagerRequestsPage';
import { ManageManagersPage } from '@/pages/Admin/ManageManagersPage';

// Customer Pages
import { CustomerPortalLayout } from '@/pages/Customer/CustomerPortalLayout';
import { CustomerDashboardPage } from '@/pages/Customer/CustomerDashboardPage';
import { CustomerRequestsPage } from '@/pages/Customer/CustomerRequestsPage';
import { CustomerRaiseRequestPage } from '@/pages/Customer/CustomerRaiseRequestPage';
import { CustomerSitesPage } from '@/pages/Customer/CustomerSitesPage';
import { CustomerInvoicesPage } from '@/pages/Customer/CustomerInvoicesPage';
import { CustomerNotificationsPage } from '@/pages/Customer/CustomerNotificationsPage';
import { CustomerProfilePage } from '@/pages/Customer/CustomerProfilePage';
import { CustomerHelpPage } from '@/pages/Customer/CustomerHelpPage';

// Dispatcher Pages
import { DispatcherPortalLayout } from '@/pages/Dispatcher/DispatcherPortalLayout';
import { DispatcherDashboardPage } from '@/pages/Dispatcher/DispatcherDashboardPage';
import { DispatcherWorkOrdersPage } from '@/pages/Dispatcher/DispatcherWorkOrdersPage';
import { DispatcherKanbanPage } from '@/pages/Dispatcher/DispatcherKanbanPage';
import { DispatcherTechniciansPage } from '@/pages/Dispatcher/DispatcherTechniciansPage';
import { DispatcherCustomersPage } from '@/pages/Dispatcher/DispatcherCustomersPage';
import { DispatcherSitesPage } from '@/pages/Dispatcher/DispatcherSitesPage';
import { DispatcherReportsPage } from '@/pages/Dispatcher/DispatcherReportsPage';
import { DispatcherSlaPage } from '@/pages/Dispatcher/DispatcherSlaPage';
import { DispatcherSettingsPage } from '@/pages/Dispatcher/DispatcherSettingsPage';

// Manager Pages
import { ManagerPortalLayout } from '@/pages/Manager/ManagerPortalLayout';
import { ManagerDashboardPage } from '@/pages/Manager/ManagerDashboardPage';
import { ManagerWorkOrdersPage } from '@/pages/Manager/ManagerWorkOrdersPage';
import { ManagerCustomersPage } from '@/pages/Manager/ManagerCustomersPage';
import { ManagerSitesPage } from '@/pages/Manager/ManagerSitesPage';
import  ManagerTechniciansPage  from '@/pages/Manager/ManagerTechniciansPage';
import  ManagerDispatchersPage  from '@/pages/Manager/ManagerDispatchersPage';
import { ManagerInventoryPage } from '@/pages/Manager/ManagerInventoryPage';
import { ManagerReportsPage } from '@/pages/Manager/ManagerReportsPage';
import { ManagerUsersPage } from '@/pages/Manager/ManagerUsersPage';
import { ManagerSettingsPage } from '@/pages/Manager/ManagerSettingsPage';
import { ManagerProfilePage } from '@/pages/Manager/ManagerProfilePage';
import  MessagesPage  from '@/pages/Manager/MessagesPage';

// Technician Pages
import { TechnicianPortalLayout } from '@/pages/Technician/TechnicianPortalLayout';
import { TechnicianDashboardPage } from '@/pages/Technician/TechnicianDashboardPage';
import { TechnicianJobsPage } from '@/pages/Technician/TechnicianJobsPage';
import { TechnicianTimeLogPage } from '@/pages/Technician/TechnicianTimeLogPage';
import { TechnicianPartsPage } from '@/pages/Technician/TechnicianPartsPage';
import { TechnicianSchedulePage } from '@/pages/Technician/TechnicianSchedulePage';
import { TechnicianNotificationsPage } from '@/pages/Technician/TechnicianNotificationsPage';
import { TechnicianProfilePage } from '@/pages/Technician/TechnicianProfilePage';

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public & Auth Routes */}
          <Route
            path="/"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <LandingPage />
              </motion.div>
            }
          />
          <Route
            path="/signup"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <RoleSelectionPage />
              </motion.div>
            }
          />
          <Route
            path="/signup/customer"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <CustomerSignupPage />
              </motion.div>
            }
          />
          <Route
            path="/verify-email"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <VerifyEmailPage />
              </motion.div>
            }
          />
          <Route
            path="/waiting-approval"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <WaitingApprovalPage />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <LoginPage />
              </motion.div>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <OtpVerifyPage />
              </motion.div>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <ForgotPasswordPage />
              </motion.div>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <AdminPortalLayout />
              </motion.div>
            }
          >
            <Route index element={<Navigate to="managers" replace />} />
            <Route path="managers" element={<ManageManagersPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="requests" element={<ManagerRequestsPage />} />
            <Route path="roles" element={<div>Role Permissions</div>} />
            <Route path="audit-logs" element={<div>Audit Logs</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>

          {/* Customer Portal */}
          <Route
            path="/portal/customer"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <CustomerPortalLayout />
              </motion.div>
            }
          >
            <Route index element={<CustomerDashboardPage />} />
            <Route path="dashboard" element={<CustomerDashboardPage />} />
            <Route path="requests" element={<CustomerRequestsPage />} />
            <Route path="raise-request" element={<CustomerRaiseRequestPage />} />
            <Route path="sites" element={<CustomerSitesPage />} />
            <Route path="invoices" element={<CustomerInvoicesPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
            <Route path="help" element={<CustomerHelpPage />} />
          </Route>

          {/* Technician Portal */}
          <Route
            path="/portal/technician"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <TechnicianPortalLayout />
              </motion.div>
            }
          >
            <Route index element={<TechnicianDashboardPage />} />
            <Route path="dashboard" element={<TechnicianDashboardPage />} />
            <Route path="jobs" element={<TechnicianJobsPage />} />
            <Route path="time-log" element={<TechnicianTimeLogPage />} />
            <Route path="parts" element={<TechnicianPartsPage />} />
            <Route path="schedule" element={<TechnicianSchedulePage />} />
            <Route path="notifications" element={<TechnicianNotificationsPage />} />
            <Route path="profile" element={<TechnicianProfilePage />} />
          </Route>

          {/* Dispatcher Portal */}
          <Route
            path="/portal/dispatcher"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <DispatcherPortalLayout />
              </motion.div>
            }
          >
            <Route index element={<DispatcherDashboardPage />} />
            <Route path="dashboard" element={<DispatcherDashboardPage />} />
            <Route path="work-orders" element={<DispatcherWorkOrdersPage />} />
            <Route path="kanban" element={<DispatcherKanbanPage />} />
            <Route path="technicians" element={<DispatcherTechniciansPage />} />
            <Route path="customers" element={<DispatcherCustomersPage />} />
            <Route path="sites" element={<DispatcherSitesPage />} />
            <Route path="reports" element={<DispatcherReportsPage />} />
            <Route path="sla" element={<DispatcherSlaPage />} />
            <Route path="settings" element={<DispatcherSettingsPage />} />
          </Route>

          {/* Manager Portal */}
          <Route
            path="/portal/manager"
            element={
              <motion.div {...pageTransition} transition={{ duration: 0.45 }}>
                <ManagerPortalLayout />
              </motion.div>
            }
          >
            <Route index element={<ManagerDashboardPage />} />
            <Route path="dashboard" element={<ManagerDashboardPage />} />
            <Route path="work-orders" element={<ManagerWorkOrdersPage />} />
            <Route path="customers" element={<ManagerCustomersPage />} />
            <Route path="sites" element={<ManagerSitesPage />} />
            <Route path="technicians" element={<ManagerTechniciansPage />} />
            <Route path="dispatchers" element={<ManagerDispatchersPage />} />
            <Route path="inventory" element={<ManagerInventoryPage />} />
            <Route path="reports" element={<ManagerReportsPage />} />
            <Route path="users" element={<ManagerUsersPage />} />
            <Route path="settings" element={<ManagerSettingsPage />} />
            <Route path="profile" element={<ManagerProfilePage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}