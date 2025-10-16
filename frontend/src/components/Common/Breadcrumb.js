import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useRoutePath } from '../../hooks/useRoutePath';

const Breadcrumb = () => {
  const location = useLocation();
  const getRoutePath = useRoutePath();
  const routePathParam = ["pending", "completed"].find((s) =>
    location.pathname.includes(s)
  ) || "pending";
  // Split current path into segments, filtering empty strings
  const rawSegments = location.pathname.split('/').filter(Boolean);

  // Detect and hide configured prefixes from display (e.g., 'admin' or a user prefix)
  const adminPrefix = process.env.REACT_APP_ADMIN_ROUTE_PREFIX || 'admin';
  const userPrefix = process.env.REACT_APP_USER_ROUTE_PREFIX || '';
  const isPrefixed = (seg) => seg === adminPrefix || (userPrefix && seg === userPrefix);

  // Map for friendly names
  const friendlyName = (segment, index, segments) => {
    // Skip known technical segments
    if (segment === 'admin' || segment === userPrefix) return null;

    // Skip showing IDs if preceded by resource segment; show as Edit instead
    const prev = segments[index - 1];
    const isNumeric = !isNaN(Number(segment));
    if (isNumeric && prev && [
       
      'patients', 'clinics', 'users', 'reports', 'settings', 'support', 'emails', 'templates'
    ].includes(prev)) {
      return 'Edit';
    }

    switch (segment) {
      case 'dashboard':
        return 'Dashboard';
      case 'patients':
        return 'Patients';
      case 'clinics':
        return 'Clinics';
      case 'users':
        return 'Users';
      case 'reports':
        return 'Reports';
      case 'settings':
        return 'Settings';
      case 'support':
        return 'Support';
      case 'emails':
        return 'Emails';
      case 'templates':
        return 'Templates';
      case 'new':
        return 'Create New';
      case 'edit':
        return null; // handled by numeric id as Edit
      default:
        if (!isNaN(parseInt(segment, 10))) {
          return 'Edit';
        }
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  // Build display segments by skipping prefixes and segments that map to null
  const displayItems = rawSegments
    .map((seg, idx) => ({
      seg,
      idx,
      name: isPrefixed(seg) ? null : friendlyName(seg, idx, rawSegments)
    }))
    .filter(({ name }) => name !== null);

  // Helper to reconstruct a link path including any leading prefixes
  const buildPathThroughIndex = (rawIndexInclusive) => `/${rawSegments.slice(0, rawIndexInclusive + 1).join('/')}`;

  return (
    <nav className="flex mb-4 bg-white p-4 rounded-lg shadow-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to={getRoutePath('/')} className="text-gray-400 hover:text-gray-500">
            <HomeIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {displayItems.map(({ seg, idx: rawIdx, name }, displayIdx) => {
          const isLast = displayIdx === displayItems.length - 1;
          const toPath = buildPathThroughIndex(rawIdx);
          return (
            <li key={`${toPath}-${seg}`}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                {isLast ? (
                  <span className="ml-2 text-sm font-medium text-gray-500">{name}</span>
                ) : (
                  <Link to={toPath + (routePathParam ? '/' + routePathParam : '')} className="ml-2 text-sm font-medium text-[#009efb] hover:text-[#0089db]">
                    {name}
                  </Link>  
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;


