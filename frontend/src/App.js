import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { ClinicGroupProvider } from './context/ClinicGroupContext';
import { PatientProvider } from './context/PatientContext';
import { ReportProvider } from './context/ReportContext';
import { SettingsProvider } from './context/SettingsContext';
import { UserProvider } from './context/UserContext';
import { ForgotPasswordProvider } from './context/ForgotPasswordContext';
import { PermissionsProvider,usePermissions } from './context/PermissionsContext';

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
import ClinicGroupList from './components/ClinicGroups/ClinicGroupList';
import ArchiveClinicGroups from './components/ClinicGroups/ArchiveClinicGroups';
import ClinicGroupView from './components/ClinicGroups/ClinicGroupView';
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
const ProtectedRoute = ({ children, requiredRole,permission }) => {
  const { isAuthenticated, loading, user } = useAuth();
 
  if (loading) {
    return <Loader />;
  } 

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if(!permission){
    return <Navigate to="/" replace />;
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
  const { isAuthenticated} = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={isAuthenticated() ? "flex h-screen overflow-hidden bg-gray-50" : " "}>
      
      {isAuthenticated() ? (
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      ) : null}
      
      <div className={isAuthenticated() ? "flex flex-col flex-1 overflow-hidden lg:ml-64" : " "}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className={isAuthenticated() ? "flex-1 scrollbar-thin overflow-y-auto p-6" : "scrollbar-thin overflow-y-auto "}>
          {children}
        </main>
        
          <Footer />  
      </div>
    </div>
  );
  
};

// Create protected route wrapper for both user and admin
const createProtectedRoutes = (prefix, roleId,permission) => {
  const basePath = prefix ? `/${prefix}` : '';
  
  return (
    <>
      <Route
        path={`${basePath}/dashboard`}
        element={
          <ProtectedRoute permission={permission(true,'read')} requiredRole={roleId}>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics`}
        element={
          <ProtectedRoute permission={permission(1,'read')} requiredRole={roleId}>
            <MainLayout><ClinicsList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics/archived`}
        element={
          <ProtectedRoute permission={permission(1,'read')} requiredRole={roleId}>
            <MainLayout><ArchiveClinics /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients`}
        element={
          <ProtectedRoute permission={permission(2,'read')} requiredRole={roleId}>
            <MainLayout><PatientsList status="all" /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/pending`}
        element={
          <ProtectedRoute permission={permission(2,'read')} requiredRole={roleId}>
            <MainLayout><PatientsList status="pending" /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/completed`}
        element={
          <ProtectedRoute permission={permission(2,'read')} requiredRole={roleId}>
            <MainLayout><PatientsList status="completed" /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/add`}
        element={
          <ProtectedRoute permission={permission(2,'create')} requiredRole={roleId}>
            <MainLayout><PatientForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/edit/:id`}
        element={
          <ProtectedRoute permission={permission(2,'edit')} requiredRole={roleId}>
            <MainLayout><PatientForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/reports`}
        element={
          <ProtectedRoute permission={permission(6,'read')} requiredRole={roleId}>
            <MainLayout><Reports /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/users`}
        element={
          <ProtectedRoute permission={permission(3,'read')} requiredRole={roleId}>
            <MainLayout><UsersList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinic-groups`}
        element={
          <ProtectedRoute permission={permission(8,'read')} requiredRole={roleId}>
            <MainLayout><ClinicGroupList /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/clinic-groups/archived`}
        element={
          <ProtectedRoute permission={permission(8,'read')} requiredRole={roleId}>
            <MainLayout><ArchiveClinicGroups /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/clinic-groups/view/:id`}
        element={
          <ProtectedRoute permission={permission(8,'read')} requiredRole={roleId}>
            <MainLayout><ClinicGroupView /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings`}
        element={
          <ProtectedRoute permission={permission(true,'read')} requiredRole={roleId}>
            <MainLayout><Settings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/support`}
        element={
          <ProtectedRoute permission={permission(true,'read')} requiredRole={roleId}>
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
  const { permission } = usePermissions();
   
  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes - Authentication */}
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <MainLayout><UserLogin /></MainLayout>
          )
        } 
      />
      <Route 
        path={ADMIN_PREFIX+"/login"} 
        element={
          isAuthenticated() ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <MainLayout><SuperAdminLogin /></MainLayout>
          )
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          isAuthenticated() ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <MainLayout><ForgotPassword /></MainLayout>
          )
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          isAuthenticated() ? (
            <Navigate to={user?.role_id === 1 ? `/${ADMIN_PREFIX}/dashboard` : (USER_PREFIX ? `/${USER_PREFIX}/dashboard` : '/dashboard')} replace />
          ) : (
            <MainLayout><ResetPassword /></MainLayout>
          )
        } 
      />

      {/* Admin Protected Routes (with admin prefix) */}
      {createProtectedRoutes(ADMIN_PREFIX, 1,permission)}

      {/* User Protected Routes (with user prefix or no prefix) */}
      {createProtectedRoutes(USER_PREFIX, user?.role_id !== 1 ? user?.role_id : 2,permission)}

      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          isAuthenticated() ? (
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
        <ForgotPasswordProvider>
          <PermissionsProvider>
          <ClinicProvider>
            <ClinicGroupProvider>
              <PatientProvider>
                <ReportProvider>
                  <SettingsProvider>
                    <UserProvider>
                      <AppContent />
                    </UserProvider>
                  </SettingsProvider>
                </ReportProvider>
              </PatientProvider>
            </ClinicGroupProvider>
          </ClinicProvider>
          </PermissionsProvider>
        </ForgotPasswordProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
