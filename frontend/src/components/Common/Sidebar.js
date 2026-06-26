import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRoutePath } from '../../hooks/useRoutePath';
import OrvosLogo from '../../assets/images/orvos-logos.png';
import { usePermissions } from '../../context/PermissionsContext';
import { useUserRoleSlugs } from '../../constants/userRoles';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  LifebuoyIcon,
  PlusIcon,
  ChevronRightIcon,
  Bars3Icon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const getRoutePath = useRoutePath();
  const { permission } = usePermissions();
  const userRoleSlugs = useUserRoleSlugs();
  const { user } = useAuth();
  let menuItems = [
    { title: 'Dashboard', basePath: '/dashboard', icon: <HomeIcon className="w-5 h-5" />, module_id: true }, // No module for dashboard
    { title: 'Clinic Groups', basePath: '/clinic-groups', icon: <BuildingOfficeIcon className="w-5 h-5" />, module_id: 8 },
    { title: 'Clinics', basePath: '/clinics', icon: <BuildingStorefrontIcon className="w-5 h-5" />, module_id: 1 },
    {
      title: 'Users',
      basePath: '/users',
      icon: <UserGroupIcon className="w-5 h-5" />,
      module_id: 3,
      subItems: [
        ...userRoleSlugs.map((r) => ({
          title: r.title,
          basePath: `/users/${r.slug}`,
          module_id: 3,
        })),
        { title: 'Add User', basePath: '/users/create', icon: <PlusIcon className="w-4 h-4" />, module_id: 3 },
      ],
    },
    {
      title: 'Patients',
      basePath: '/patients',
      icon: <UserGroupIcon className="w-5 h-5" />,
      module_id: 2,
      subItems: [
        { title: 'Pending Patients', basePath: '/patients/pending', module_id: 2 },
        { title: 'Completed Patients', basePath: '/patients/completed', module_id: 2 },
        { title: 'Add Patient', basePath: '/patients/create', icon: <PlusIcon className="w-4 h-4" />, module_id: 2 },
      ],
    },
    {
      title: 'Reports',
      basePath: '/reports',
      icon: <DocumentChartBarIcon className="w-5 h-5" />,
      module_id: 6,
      subItems: [
        { title: 'Clinic Patients', basePath: '/reports/clinic-patients', module_id: 6 },
        { title: 'Orvos Doctor Review', basePath: '/reports/orvos-doctor-review', module_id: 6 },
      ]
    },
    {
      title: 'Settings',
      basePath: '/settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      module_id: true,
      subItems: [
        { title: 'Change Password', basePath: '/settings/change-password', module_id: true },
        { title: 'PDF Templates', basePath: '/settings/pdf-templates', module_id: 7 },
        // { title: 'Email Templates', basePath: '/settings/email-templates', module_id: true },
      ]
    },
    { title: 'Support', basePath: '/support', icon: <LifebuoyIcon className="w-5 h-5" />, module_id: true },
  ];

  if (![1].includes(user?.role_id)) {

    menuItems = menuItems.map(item => {

      if (item?.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(
            sub => sub?.basePath !== '/users/orvos-doctor'
          ),
        };
      }
      return item;
    });
  }

  const filteredMenuItems = menuItems
    .filter(item => {

      // Always show menu items with no module_id
      if (!item.module_id) return true;

      // Show only if read permission exists
      return permission(item.module_id, 'read');
    })
    .map(item => ({
      ...item,
      subItems: item.subItems
        ? item.subItems.filter(sub => {

          if (!sub.module_id) return true;
          if (sub?.basePath?.includes('create')) {
            return permission(sub.module_id, 'write');
          }
          return permission(sub.module_id, 'read');


        })
        : null,
    }));

  // Add actual paths
  const menuItemsWithPaths = filteredMenuItems.map(item => ({
    ...item,
    path: getRoutePath(item.basePath),
    subItems: item.subItems?.map(sub => ({
      ...sub,
      path: getRoutePath(sub.basePath),
    })),
  }));

  const isActive = path => location.pathname === path || location.pathname.startsWith(path + '/');

  // Track which parent menu is open
  const [openParentId, setOpenParentId] = useState(null);

  useEffect(() => {
    const activeParent = menuItemsWithPaths.find(item => isActive(item.path) && item.subItems);
    setOpenParentId(activeParent ? activeParent.basePath : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-3 py-4 border-b border-primary-100 relative">
          <div className="flex items-center space-x-3">
            <img src={OrvosLogo} alt="Orvos Logo" className="w-100" />
          </div>
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 lg:hidden p-1 rounded-md hover:bg-gray-200"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 scrollbar-thin overflow-y-auto h-[calc(100vh-88px)]">
          <ul className="space-y-2">
            {menuItemsWithPaths.map((item, index) => (
              <li key={index}>
                {item.subItems ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenParentId(prev => (prev === item.basePath ? null : item.basePath))
                      }
                      className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path) || openParentId === item.basePath
                        ? 'bg-white text-primary'
                        : 'hover:bg-gray-50 hover:shadow-sm hover:text-primary'
                        }`}
                    >
                      <span className="flex items-center space-x-3">
                        {item.icon}
                        <span className="text-sm">{item.title}</span>
                      </span>
                      <ChevronRightIcon
                        className={`w-4 h-4 text-current transition-transform duration-200 ${openParentId === item.basePath ? 'rotate-90' : ''
                          }`}
                      />
                    </button>

                    {/* Sub-items */}
                    {openParentId === item.basePath && (
                      <ul className="ml-8 mt-2 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              onClick={() => { if (isOpen) toggleSidebar(); }}
                              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${location.pathname === subItem.path
                                ? 'bg-primary-100 text-primary border'
                                : 'hover:bg-primary-50 hover:text-primary'
                                }`}
                            >
                              {subItem.icon && (
                                <span className="mr-2 flex items-center">{subItem.icon}</span>
                              )}
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => { if (isOpen) toggleSidebar(); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                      ? 'bg-white text-primary'
                      : 'hover:bg-gray-50 hover:shadow-sm hover:text-primary'
                      }`}
                  >
                    <span className="flex items-center space-x-3">
                      {item.icon}
                      <span className="text-sm">{item.title}</span>
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
