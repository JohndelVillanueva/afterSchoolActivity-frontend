// SportPages.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import MainContent from '../../components/MainContent';
import type { Activity, Category } from '../../src/types/types';
import { API_BASE_URL } from '../../src/types/types';
// import { useToast } from '../../components/ToastProvider';

const SportPages = () => {
  //   const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // New: mobile sidebar state
  const [sportsActivities, setSportsActivities] = useState<Activity[]>([]);

  // const { success, error } = useToast();

  // Debug log
  console.log('SportPages component is rendering');

  useEffect(() => {
    // Fetch all sports from backend
    fetch(`${API_BASE_URL}/getAllSports`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setSportsActivities(result.data);
        } else {
          setSportsActivities([]);
        }
      })
      .catch(() => setSportsActivities([]));
  }, []);

  const filteredActivities = sportsActivities; // Show all activities since we don't have categories yet

  const handleCreateSport = () => {
    // Just re-fetch all sports from backend
    fetch(`${API_BASE_URL}/getAllSports`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setSportsActivities(result.data);
        } else {
          setSportsActivities([]);
        }
      })
      .catch(() => setSportsActivities([]));
  };

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
      <span className="text-lg font-semibold text-gray-800">Sports</span>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={`flex-1 bg-transparent min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {MobileTopBar}
        <MainContent
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          handleCreateSport={handleCreateSport}
          setActiveCategory={setActiveCategory}
          filteredActivities={filteredActivities}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>
    </div>
  );
};

export default SportPages;