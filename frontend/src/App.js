import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { ClinicGroupProvider } from './context/ClinicGroupContext';
import { PatientProvider } from './context/PatientContext';
import { ReportProvider } from './context/ReportContext';
import { SettingsProvider } from './context/SettingsContext';
import { PdfTemplateProvider } from './context/PdfTemplateContext';
import { ChangePasswordProvider } from './context/ChangePasswordContext';
import { UserProvider } from './context/UserContext';
import { ForgotPasswordProvider } from './context/ForgotPasswordContext';
import { PermissionsProvider, usePermissions } from './context/PermissionsContext';
import { ClinicStaffsProvider } from './context/ClinicStaffsContext';

// Layout Components
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import Footer from './components/Common/Footer';
import Loader from './components/Common/Loader';
import NoInternet from './components/Common/NoInternet';

// Auth Components
import UserLogin from './components/Auth/UserLogin';
import SuperAdminLogin from './components/Auth/SuperAdminLogin';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

// Main Components
import Dashboard from './components/Dashboard/Dashboard';
import ClinicsList from './components/Clinics/ClinicsList';
import ClinicForm from './components/Clinics/ClinicForm';
import ClinicView from './components/Clinics/ClinicView';
import StaffsList from './components/Clinics/Staffs/StaffsList';
import ArchiveClinics from './components/Clinics/ArchiveClinics';
import ClinicGroupList from './components/ClinicGroups/ClinicGroupList';
import ArchiveClinicGroups from './components/ClinicGroups/ArchiveClinicGroups';
import ClinicGroupView from './components/ClinicGroups/ClinicGroupView';
import PatientsList from './components/Patients/PatientsList';
import PatientForm from './components/Patients/PatientForm';
import PatientGuestForm from './components/Patients/PatientGuestForm';
import PatientView from './components/Patients/PatientView';
import ClinicPatientsReport from './components/Reports/ClinicPatients';
import OrvosDoctorReviewReport from './components/Reports/OrvosDoctorReview';
import Settings from './components/Settings/Settings';
import PdfTemplateList from './components/Settings/PdfTemplates/PdfTemplateList';
import PdfTemplateForm from './components/Settings/PdfTemplates/PdfTemplateForm';
import PdfTemplateView from './components/Settings/PdfTemplates/PdfTemplateView';
import ArchivePdfTemplate from './components/Settings/PdfTemplates/ArchivePdfTemplate';
import UsersList from './components/Users/UsersList';
import UserForm from './components/Users/UserForm';
import UserView from './components/Users/UserView';
import ArchiveUsers from './components/Users/ArchiveUsers';
import Profile from './components/Users/Profile';
// Support Components
import Support from './components/Support/Support';

//Errors
import NotFound from './components/Common/Errors/NotFound';

// Hooks
import useAutoLogoutOnIdle from './hooks/useAutoLogoutOnIdle';
import { AdditionalDataProvider } from './context/AdditionalDataContext';
import { useUserRoleSlugs } from './constants/userRoles';

// Get route prefixes from environment
const ADMIN_PREFIX = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
const USER_PREFIX = process.env.REACT_APP_USER_ROUTE_PREFIX || '';

// Support Page Wrapper moved to its own component

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, permission }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!permission) {
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
  const { isAuthenticated } = useAuth();
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
const createProtectedRoutes = (prefix, roleId, permission, userRoleSlugs = []) => {
  const basePath = prefix ? `/${prefix}` : '';

  return (
    <>
      <Route
        path={`${basePath}/dashboard`}
        element={
          <ProtectedRoute permission={permission(true, 'read')} requiredRole={roleId}>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics`}
        element={
          <ProtectedRoute permission={permission(1, 'read')} requiredRole={roleId}>
            <MainLayout><ClinicsList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics/create`}
        element={
          <ProtectedRoute permission={permission(1, 'create')} requiredRole={roleId}>
            <MainLayout><ClinicForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics/:id/edit`}
        element={
          <ProtectedRoute permission={permission(1, 'write')} requiredRole={roleId}>
            <MainLayout><ClinicForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics/view/:id`}
        element={
          <ProtectedRoute permission={permission(1, 'read')} requiredRole={roleId}>
            <MainLayout><ClinicView /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/clinics/archived`}
        element={
          <ProtectedRoute permission={permission(1, 'read')} requiredRole={roleId}>
            <MainLayout><ArchiveClinics /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/clinics/:id/staffs`}
        element={
          <ProtectedRoute permission={permission(4, 'read')} requiredRole={roleId}>
            <MainLayout><StaffsList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients`}
        element={
          <ProtectedRoute permission={permission(2, 'read')} requiredRole={roleId}>
            <MainLayout><PatientsList status="all" diagnosis_status='all' /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/pending`}
        element={
          <ProtectedRoute permission={permission(2, 'read')} requiredRole={roleId}>
            <MainLayout><PatientsList status="pending" diagnosis_status='0' /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/completed`}
        element={
          <ProtectedRoute permission={permission(2, 'read')} requiredRole={roleId}>
            <MainLayout><PatientsList status="completed" diagnosis_status='1' /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/create`}
        element={
          <ProtectedRoute permission={permission(2, 'create')} requiredRole={roleId}>
            <MainLayout><PatientForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/:id/edit`}
        element={
          <ProtectedRoute permission={permission(2, 'write')} requiredRole={roleId}>
            <MainLayout><PatientForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/patients/view/:id`}
        element={
          <ProtectedRoute permission={permission(2, 'read')} requiredRole={roleId}>
            <MainLayout><PatientView /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/reports/clinic-patients`}
        element={
          <ProtectedRoute permission={permission(6, 'read')} requiredRole={roleId}>
            <MainLayout><ClinicPatientsReport /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/reports/orvos-doctor-review`}
        element={
          <ProtectedRoute permission={permission(6, 'read')} requiredRole={roleId}>
            <MainLayout><OrvosDoctorReviewReport /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/users`}
        element={
          <ProtectedRoute permission={permission(3, 'read')} requiredRole={roleId}>
            <MainLayout><UsersList /></MainLayout>
          </ProtectedRoute>
        }
      />
      {userRoleSlugs.map(({ slug, roleId: filterRoleId }) => (
        <React.Fragment key={`users-${slug}`}>
          <Route
            path={`${basePath}/users/${slug}`}
            element={
              <ProtectedRoute permission={permission(3, 'read')} requiredRole={roleId}>
                <MainLayout><UsersList roleId={filterRoleId} /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={`${basePath}/users/${slug}/archived`}
            element={
              <ProtectedRoute permission={permission(3, 'read')} requiredRole={roleId}>
                <MainLayout><ArchiveUsers roleId={filterRoleId} /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={`${basePath}/users/${slug}/:id/edit`}
            element={
              <ProtectedRoute permission={permission(3, 'write')} requiredRole={roleId}>
                <MainLayout><UserForm roleSlug={slug} /></MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path={`${basePath}/users/${slug}/view/:id`}
            element={
              <ProtectedRoute permission={permission(3, 'read')} requiredRole={roleId}>
                <MainLayout><UserView roleSlug={slug} /></MainLayout>
              </ProtectedRoute>
            }
          />
        </React.Fragment>
      ))}
      <Route
        path={`${basePath}/users/create`}
        element={
          <ProtectedRoute permission={permission(3, 'create')} requiredRole={roleId}>
            <MainLayout><UserForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/users/:id/edit`}
        element={
          <ProtectedRoute permission={permission(3, 'write')} requiredRole={roleId}>
            <MainLayout><UserForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/users/view/:id`}
        element={
          <ProtectedRoute permission={permission(3, 'read')} requiredRole={roleId}>
            <MainLayout><UserView /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/users/archived`}
        element={
          <ProtectedRoute permission={permission(3, 'read')} requiredRole={roleId}>
            <MainLayout><ArchiveUsers /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/clinic-groups`}
        element={
          <ProtectedRoute permission={permission(8, 'read')} requiredRole={roleId}>
            <MainLayout><ClinicGroupList /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/clinic-groups/archived`}
        element={
          <ProtectedRoute permission={permission(8, 'read')} requiredRole={roleId}>
            <MainLayout><ArchiveClinicGroups /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/clinic-groups/view/:id`}
        element={
          <ProtectedRoute permission={permission(8, 'read')} requiredRole={roleId}>
            <MainLayout><ClinicGroupView /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings`}
        element={
          <ProtectedRoute permission={permission(true, 'read')} requiredRole={roleId}>
            <MainLayout><Settings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings/change-password`}
        element={
          <ProtectedRoute permission={permission(7, 'read')} requiredRole={roleId}>
            <MainLayout><Settings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings/pdf-templates`}
        element={
          <ProtectedRoute permission={permission(7, 'read')} requiredRole={roleId}>
            <MainLayout><PdfTemplateList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings/pdf-templates/create`}
        element={
          <ProtectedRoute permission={permission(7, 'create')} requiredRole={roleId}>
            <MainLayout><PdfTemplateForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings/pdf-templates/:id/edit`}
        element={
          <ProtectedRoute permission={permission(7, 'write')} requiredRole={roleId}>
            <MainLayout><PdfTemplateForm /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings/pdf-templates/view/:id`}
        element={
          <ProtectedRoute permission={permission(7, 'read')} requiredRole={roleId}>
            <MainLayout><PdfTemplateView /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={`${basePath}/settings/pdf-templates/archived`}
        element={
          <ProtectedRoute permission={permission(true, 'read')} requiredRole={roleId}>
            <MainLayout><ArchivePdfTemplate /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/profile`}
        element={
          <ProtectedRoute permission={permission(true, 'read')} requiredRole={roleId}>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={`${basePath}/support`}
        element={
          <ProtectedRoute permission={permission(true, 'read')} requiredRole={roleId}>
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
  const userRoleSlugs = useUserRoleSlugs();
  const navigate = useNavigate();

  useEffect(() => {

    const handleOffline = () => {
      navigate("/no-internet");
    };

    const handleOnline = () => {
      navigate("/");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };

  }, [navigate]);


  useAutoLogoutOnIdle();
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
        path={ADMIN_PREFIX + "/login"}
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

      {/* Guest Patient Form - Public Route */}
      <Route
        path="/patients/guest/create"
        element={
          <MainLayout><PatientGuestForm /></MainLayout>
        }
      />

      {/* Admin Protected Routes (with admin prefix) */}
      {createProtectedRoutes(ADMIN_PREFIX, 1, permission, userRoleSlugs)}

      {/* User Protected Routes (with user prefix or no prefix) */}
      {createProtectedRoutes(USER_PREFIX, user?.role_id !== 1 ? user?.role_id : 2, permission, userRoleSlugs)}

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
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />

      <Route path="/no-internet" element={<NoInternet />} />

      <Route
        path={`/${ADMIN_PREFIX}`}
        element={<Navigate to={`/${ADMIN_PREFIX}/dashboard`} replace />}
      />

      <Route
        path={`/${USER_PREFIX}`}
        element={<Navigate to={`/${USER_PREFIX}/dashboard`} replace />}
      />
    </Routes>
  );
};

// Main App Component
function App() {

  return (
    <Router>
      <AuthProvider>
        <AdditionalDataProvider>
          <ForgotPasswordProvider>
            <PermissionsProvider>
              <ClinicProvider>
                <ClinicStaffsProvider>
                  <ClinicGroupProvider>
                    <PatientProvider>
                      <ReportProvider>
                        <SettingsProvider>
                          <PdfTemplateProvider>
                            <ChangePasswordProvider>
                              <UserProvider>
                                <AppContent />
                              </UserProvider>
                            </ChangePasswordProvider>
                          </PdfTemplateProvider>
                        </SettingsProvider>
                      </ReportProvider>
                    </PatientProvider>
                  </ClinicGroupProvider>
                </ClinicStaffsProvider>
              </ClinicProvider>
            </PermissionsProvider>
          </ForgotPasswordProvider>
        </AdditionalDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
