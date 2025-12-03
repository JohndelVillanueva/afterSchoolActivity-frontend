import React, { useState } from 'react';
import Sidebar from '../../components/SideBar';

const CalendarPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // New: mobile sidebar state

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Hamburger button for mobile
  const MobileTopBar = (
    <div className="md:hidden flex items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <button
        className="mr-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-lg font-semibold text-gray-800">Calendar</span>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 bg-transparent min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} flex items-center justify-center`}
      >
        {MobileTopBar}
        <style>{`
          @keyframes float404 {
            0% { transform: translateY(0); }
            50% { transform: translateY(-18px); }
            100% { transform: translateY(0); }
          }
          .animate-float404 {
            animation: float404 2.5s ease-in-out infinite;
          }
        `}</style>
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-float404">
              <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="90" cy="90" r="90" fill="#F3F4F6" />
                <ellipse cx="90" cy="135" rx="50" ry="10" fill="#E5E7EB" />
                <rect x="55" y="60" width="70" height="40" rx="8" fill="#E0E7FF" />
                <rect x="70" y="80" width="10" height="10" rx="2" fill="#6366F1" />
                <rect x="100" y="80" width="10" height="10" rx="2" fill="#6366F1" />
                <rect x="85" y="70" width="10" height="10" rx="2" fill="#6366F1" />
                <rect x="85" y="90" width="10" height="10" rx="2" fill="#6366F1" />
                <path d="M70 120 Q90 140 110 120" stroke="#6366F1" strokeWidth="4" fill="none" />
                <text x="90" y="50" textAnchor="middle" fontSize="32" fill="#6366F1" fontWeight="bold">404</text>
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">404 Not Found</h1>
          <p className="text-lg text-gray-600 mb-2">This feature is not yet ready.</p>
          <p className="text-gray-400">Please check back later.</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 