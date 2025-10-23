import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRoutePath } from '../../hooks/useRoutePath';
import { Link } from 'react-router-dom';
import OrvosLogo from '../../assets/images/orvos-logos.png';
import OrvosBanner from '../../assets/images/orvos_background.jpeg';
import OrvosBannerLogo from '../../assets/images/OrvosTransparentLogo1.png';

const Header = ({ toggleSidebar }) => {
  const { user, logout, isAuthenticated} = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const getRoutePath = useRoutePath();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => { 
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Add event listener when dropdown is open
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (

    isAuthenticated() ? (
    <>
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
       
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Menu button & Logo */}
        <div className="flex items-center space-x-4 ">
 
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
   
        </div>

        <div className="flex items-center space-x-3 block sm:hidden">
             <img src={`${OrvosLogo}`} alt="Orvos Logo" className='w-100  '/>
          </div> 

        {/* Right side - Notifications & User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {/* <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button> */}
  
          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.first_name + ' ' + user?.last_name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role?.name || ''}</p>
              </div>
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                <Link 
                  to={getRoutePath('/settings')} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </div>
                </Link>
                <Link 
                  to={getRoutePath('/support')} 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors duration-200"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Support</span>
                  </div>
                </Link>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  ) : (
    <>
    <div className="w-full h-30 sm:h-60 relative">
      {/* Banner Image */}
      <img 
        src={OrvosBanner} 
        alt="Orvos Logo" 
        className="w-full h-full object-cover"
      />

      {/* Logo on top-left */}
      <img
        src={OrvosBannerLogo}
        alt="Orvos Logo"
       className="absolute w-40 h-auto top-4 left-1/2 transform -translate-x-1/2 sm:top-4 sm:left-4 sm:translate-x-0 sm:w-60 md:w-72 lg:w-96"
      />
    </div>
 
    </>
  )
  );
};

export default Header;

