import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  open?: boolean; // New: controls sidebar open state on mobile
  onClose?: () => void; // New: callback to close sidebar on mobile
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange, open = false, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Optional: Call logout API endpoint
    // fetch('http://10.128.2.113:3000/api/auth/logout', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // });
    
    // Redirect to login page
    navigate('/login');
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', href: '/dashboard' },
    { id: 'sports', name: 'Sports Activities', icon: '⚽', href: '/sports' },
    { id: 'students', name: 'Students', icon: '👥', href: '/students' },
    { id: 'coaches', name: 'Coaches', icon: '🏃', href: '/coaches' },
    { id: 'attendance', name: 'Attendance', icon: '💳', href: '/attendance' },
    { id: 'calendar', name: 'Calendar', icon: '📅', href: '/calendar' },
    { id: 'reports', name: 'Reports', icon: '📈', href: '/reports' },
  ];

  const quickActions = [
    { name: 'Create Activity', icon: '➕', action: () => console.log('Create activity') },
    { name: 'View Schedule', icon: '📋', action: () => console.log('View schedule') },
    { name: 'Manage Students', icon: '👨‍🎓', action: () => console.log('Manage students') },
  ];

  if (!navigationItems || !quickActions) {
    console.error('Arrays are undefined');
    return <div className="bg-red-500 text-white p-4">Error: Arrays not defined</div>;
  }

  // Get user data from localStorage
  const userDataString = localStorage.getItem('user');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'Johndel Villanueva';
  const userEmail = userData?.email || 'johndel.villanueva@westfields.edu.ph';
  const userInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'J';

  // Responsive: show as overlay on mobile, fixed on md+
  return (
    <>
      {/* Overlay background for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      <div
        className={`sidebar
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-gray-800 text-white
          h-full shadow-xl
          transition-all duration-300 ease-in-out
          z-50
          fixed top-0 left-0
          md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:block
          md:static
          md:h-screen
          ${open ? 'block' : 'hidden'} md:block
          flex flex-col
        `}
        style={{ maxWidth: isCollapsed ? 64 : 256 }}
        tabIndex={-1}
        aria-modal={open ? 'true' : undefined}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              {/* Logo image */}
              {/* <img src="/WestfieldsBadge.png" alt="Logo" className="h-10 w-10 object-contain rounded-lg bg-white p-1" /> */}
              {/* Greatness through lifelong learning image */}
              <img src="/WestfieldsLogotypeV1.png" alt="Greatness through lifelong learning" className="h-15 w-auto" />
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
          {/* Close button for mobile overlay */}
          <button
            className="md:hidden ml-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3">
            <h3 className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${isCollapsed ? 'text-center' : ''}`}>
              {!isCollapsed && 'Navigation'}
            </h3>
            <ul className="space-y-1">
              {navigationItems && navigationItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="px-3 mt-6">
            <h3 className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${isCollapsed ? 'text-center' : ''}`}>
              {!isCollapsed && 'Quick Actions'}
            </h3>
            <ul className="space-y-1">
              {quickActions && quickActions.map((action, index) => (
                <li key={index}>
                  <button
                    onClick={action.action}
                    className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                  >
                    <span className="text-lg mr-3">{action.icon}</span>
                    {!isCollapsed && <span>{action.name}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* User Profile and Logout Section - Fixed at the very bottom */}
        <div className="mt-auto border-t border-gray-700 p-4">
          {/* User Profile Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">{userInitial}</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900 hover:bg-opacity-20 hover:text-red-300 transition-all duration-200 border border-red-400 border-opacity-30"
            title="Logout"
          >
            <svg 
              className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;