import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  open?: boolean;
  onClose?: () => void;
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

  // Get user data from localStorage
  const userDataString = localStorage.getItem('user');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'Johndel Villanueva';
  const userEmail = userData?.email || 'johndel.villanueva@westfields.edu.ph';
  const userInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : 'J';

  return (
    <>
      {/* Overlay background for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      
      <div
        className={`sidebar
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          text-white
          h-full shadow-2xl
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
          border-r border-gray-700
        `}
        style={{ maxWidth: isCollapsed ? 64 : 256 }}
        tabIndex={-1}
        aria-modal={open ? 'true' : undefined}
        role="dialog"
      >
        {/* Header with gradient accent */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20"></div>
          <div className="relative flex items-center justify-between p-4 border-b border-gray-700/50">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <img 
                  src="/WestfieldsLogotypeV1.png" 
                  alt="Greatness through lifelong learning" 
                  className="h-12 w-auto drop-shadow-lg" 
                />
              </div>
            )}
            <button
              onClick={handleToggle}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
            {/* Close button for mobile overlay */}
            <button
              className="md:hidden ml-2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          {/* Main Navigation Section */}
          <div className="mb-8">
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3 flex items-center">
                <span className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mr-2"></span>
                Navigation
              </h3>
            )}
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className={`
                      group relative flex items-center px-3 py-3 rounded-xl text-sm font-medium 
                      text-gray-300 hover:text-white
                      hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20
                      transition-all duration-300 ease-out
                      hover:shadow-lg hover:shadow-blue-500/20
                      hover:translate-x-1
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    {/* Animated border on hover */}
                    <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></span>
                    
                    <span className="text-xl group-hover:scale-110 transition-transform duration-200 mr-3">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="flex-1">{item.name}</span>
                    )}
                    
                    {!isCollapsed && (
                      <svg 
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions Section */}
          <div>
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3 flex items-center">
                <span className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 mr-2"></span>
                Quick Actions
              </h3>
            )}
            <ul className="space-y-1">
              {quickActions.map((action, index) => (
                <li key={index}>
                  <button
                    onClick={action.action}
                    className={`
                      group relative w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium 
                      text-gray-300 hover:text-white
                      hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20
                      transition-all duration-300 ease-out
                      hover:shadow-lg hover:shadow-purple-500/20
                      hover:translate-x-1
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    {/* Animated border on hover */}
                    <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></span>
                    
                    <span className="text-xl group-hover:scale-110 transition-transform duration-200 mr-3">
                      {action.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="flex-1 text-left">{action.name}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* User Profile and Logout Section - Enhanced Design */}
        <div className="mt-auto border-t border-gray-700/50 p-4 bg-gray-900/50 backdrop-blur-sm">
          {/* User Profile Info with Avatar */}
          <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-sm font-bold">{userInitial}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              </div>
            )}
          </div>

          {/* Logout Button with Enhanced Style */}
          <button
            onClick={handleLogout}
            className={`
              group w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold 
              text-red-400 hover:text-white
              bg-red-500/10 hover:bg-red-500/20
              transition-all duration-300 ease-out
              border border-red-500/30 hover:border-red-500/50
              hover:shadow-lg hover:shadow-red-500/30
              active:scale-95
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title="Logout"
          >
            <svg 
              className={`w-5 h-5 group-hover:rotate-12 transition-transform duration-200 ${!isCollapsed ? 'mr-3' : ''}`}
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

        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #6366f1, #a855f7);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #4f46e5, #9333ea);
          }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;