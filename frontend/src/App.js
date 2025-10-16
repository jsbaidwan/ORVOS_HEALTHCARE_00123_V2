import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { PatientProvider } from './context/PatientContext';
import { ReportProvider } from './context/ReportContext';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';

// Layout Components
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import Footer from './components/Common/Footer';
import Loader from './components/Common/Loader';

// Auth Components
import UserLogin from './components/Auth/UserLogin';
import SuperAdminLogin from './components/Auth/SuperAdminLogin';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

// Main Components
import Dashboard from './components/Dashboard/Dashboard';
import ClinicsList from './components/Clinics/ClinicsList';
import ArchiveClinics from './components/Clinics/ArchiveClinics';
import PatientsList from './components/Patients/PatientsList';
import PatientForm from './components/Patients/PatientForm';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import UsersList from './components/Users/UsersList';

// Support Components
import Support from './components/Support/Support';

// Get route prefixes from environment
const ADMIN_PREFIX = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
const USER_PREFIX = process.env.REACT_APP_USER_ROUTE_PREFIX || '';

// Support Page Wrapper moved to its own component

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole && user?.role_id !== requiredRole) {
    // Redirect to appropriate dashboard
    const prefix = user?.role_id === 1 ? `/${ADMIN_PREFIX}` : (USER_PREFIX ? `/${USER_PREFIX}` : '');
    return <Navigate to={`${prefix}/dashboard`} replace />;
  }

  return children;
};

// Main Layout Component
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

// Create protected route wrapper for both user and admin
const createProtectedRoutes = (prefix, roleId) => {
  const basePath = prefix ? `/${prefix}` : '';
  
  return (
    <>
      <Route
        path={`${basePath}/dashboard`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><ClinicsList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics/archived`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><ArchiveClinics /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><PatientsList status="all" /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/pending`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><PatientsList status="pending" /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/completed`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><PatientsList status="completed" /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/add`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><PatientForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/edit/:id`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><PatientForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/reports`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><Reports /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/users`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><UsersList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><Settings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/support`}
        element={
          <ProtectedRoute requiredRole={roleId}>
            <MainLayout><Support /></MainLayout>
          </ProtectedRoute>
        }
      />
    </>
  );
};

// App Content (wrapped with auth context)
const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes - Authentication */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <UserLogin />
          )
        } 
      />
      <Route 
        path="/admin/login" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <SuperAdminLogin />
          )
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <ForgotPassword />
          )
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <ResetPassword />
          )
        } 
      />

      {/* Admin Protected Routes (with admin prefix) */}
      {createProtectedRoutes(ADMIN_PREFIX, 1)}

      {/* User Protected Routes (with user prefix or no prefix) */}
      {createProtectedRoutes(USER_PREFIX, 2)}

      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <ClinicProvider>
          <PatientProvider>
            <ReportProvider>
              <SettingsProvider>
                <UserProvider>
                  <AppContent />
                </UserProvider>
              </SettingsProvider>
            </ReportProvider>
          </PatientProvider>
        </ClinicProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
