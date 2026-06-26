import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange, open = false, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && open && onClose) {
      onClose();
    }
  }, [location.pathname, isMobile, open, onClose]);

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
    { id: 'sports', name: 'After School Activities', icon: '⚽', href: '/sports' },
    { id: 'students', name: 'Enrolled Students', icon: '👥', href: '/students' },
    { id: 'coaches', name: 'Coaches', icon: '🏃', href: '/coaches' },
    { id: 'users', name: 'All Users', icon: '👤', href: '/users' },
    { id: 'attendance', name: 'Attendance', icon: '💳', href: '/attendance' },
    { id: 'calendar', name: 'Calendar', icon: '📅', href: '/calendar' },
    { id: 'reports', name: 'Reports', icon: '📈', href: '/reports' },
  ];

  const quickActions = [
    { name: 'Create Activity', icon: '➕', action: () => navigate('/sports', { state: { openCreateModal: true } }) },
    { name: 'View Schedule', icon: '📋', action: () => navigate('/calendar') },
    { name: 'Manage Students', icon: '👨‍🎓', action: () => navigate('/students') },
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
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      
      {/* Sidebar - Using transform for proper positioning without affecting content */}
      <div
        className={`
          sidebar
          ${isCollapsed && !isMobile ? 'w-20' : 'w-64'}
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          text-white
          h-full shadow-2xl
          transition-all duration-300 ease-in-out
          z-50
          fixed top-0 left-0
          flex flex-col
          border-r border-gray-700/50
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ 
          width: isCollapsed && !isMobile ? 80 : 256,
        }}
        tabIndex={-1}
        aria-modal={open ? 'true' : undefined}
        role="dialog"
      >
        {/* Header with gradient accent */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20"></div>
          <div className="relative flex items-center justify-between p-4 border-b border-gray-700/50">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center space-x-3">
                <div className="w-50 h-10 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                  <img 
                    src="/Westfields Yellow Text.png" 
                    alt="Westfields International School" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Collapse button - only show on desktop */}
            {!isMobile && (
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
            )}
            
            {/* Close button for mobile */}
            {isMobile && (
              <button
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section - Scrollable */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar min-h-0">
          {/* Main Navigation */}
          <div className="mb-8">
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Main Menu</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
            )}
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.href}
                    onClick={() => {
                      if (isMobile && onClose) onClose();
                    }}
                    className={({ isActive }) => `
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium 
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                      ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"></div>
                        )}
                        
                        <span className="text-xl">{item.icon}</span>
                        
                        {(!isCollapsed || isMobile) && (
                          <span className="flex-1">{item.name}</span>
                        )}
                        
                        {(!isCollapsed || isMobile) && isActive && (
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            {(!isCollapsed || isMobile) && (
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
            )}
            <ul className="space-y-1">
              {quickActions.map((action, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      action.action();
                      if (isMobile && onClose) onClose();
                    }}
                    className={`
                      group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium 
                      text-gray-400 hover:text-white hover:bg-white/5
                      transition-all duration-200
                      ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
                    `}
                  >
                    <span className="text-xl">{action.icon}</span>
                    {(!isCollapsed || isMobile) && (
                      <span className="flex-1 text-left">{action.name}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Profile Section - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
          {/* User Info */}
          <div className={`p-4 ${(isCollapsed && !isMobile) ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center ${(isCollapsed && !isMobile) ? 'flex-col' : 'space-x-3'}`}>
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-sm font-bold">{userInitial}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userName}</p>
                  <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 pt-0">
            <button
              onClick={handleLogout}
              className={`
                group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold 
                text-red-400 hover:text-white
                bg-red-500/10 hover:bg-red-500/20
                transition-all duration-200
                border border-red-500/30 hover:border-red-500/50
                active:scale-95
                ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
              `}
              title="Logout"
            >
              <svg 
                className="w-5 h-5"
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
              {(!isCollapsed || isMobile) && <span>Logout</span>}
            </button>
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
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