import React, { useState } from 'react';

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsedState);
    }
  };

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', href: '/' },
    { id: 'sports', name: 'Sports Activities', icon: '⚽', href: '/sports' },
    { id: 'calendar', name: 'Calendar', icon: '📅', href: '/calendar' },
    { id: 'students', name: 'Students', icon: '👥', href: '/students' },
    { id: 'coaches', name: 'Coaches', icon: '🏃', href: '/coaches' },
    { id: 'payment', name: 'Payment', icon: '💳', href: '/payment' },
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

  return (
    <div className={`sidebar ${isCollapsed ? 'w-16' : 'w-64'} bg-gray-800 text-white fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-50 shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-semibold text-white">School Sports</h1>
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

      {/* User Profile Section */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@school.com</p>
            </div>
          )}
          {!isCollapsed && (
            <button className="p-1 rounded-lg hover:bg-gray-700 transition-colors">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;