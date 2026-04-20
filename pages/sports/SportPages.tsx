import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import MainContent from '../../components/MainContent';
import type { Activity } from '../../src/types/types';
import { API_BASE_URL } from '../../src/types/types';

// ✅ Default sport image (inline SVG - works offline, no external dependency)
const DEFAULT_SPORT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%2366746f'/%3E%3Crect x='40' y='40' width='120' height='220' rx='12' fill='%233b82f6' opacity='0.3'/%3E%3Ccircle cx='200' cy='130' r='60' fill='%23ffffff' opacity='0.15'/%3E%3Cpath d='M200 75l-20 30-40 10v50c0 33.137 26.863 60 60h0c33.137 0 60-26.863V105c0-33.137 26.863-60 60h0c-16.569 0-30-13.431-30-30v0c16.569 0-30 13.431-30 30h0v-10' stroke='%23ffffff' stroke-width='2' opacity='0.4'/%3E%3Crect x='180' y='85' width='40' height='90' rx='4' fill='%23ffffff' opacity='0.2'/%3E%3Cpath d='M160 150v-20c0-11-9-20-20h0' stroke='%23ffffff' stroke-width='2' opacity='0.3'/%3E%3C/svg%3E";

// ✅ Helper function to get sport image with fallback
export const getSportImage = (sport: Activity | null): string => {
  if (sport?.photo) return `${API_BASE_URL}${sport.photo}`;
  return DEFAULT_SPORT_IMAGE;
};

const SportPages = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<Activity | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sportsActivities, setSportsActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = () => {
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

  const handleEditSport = (sport: Activity) => {
    setSelectedSport(sport);
    setShowEditModal(true);
  };

  const handleUpdateSport = (updatedSport: Activity) => {
    fetch(`${API_BASE_URL}/updateSport`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSport),
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          fetchSports();
        }
      })
      .catch(() => {})
      .finally(() => {
        setShowEditModal(false);
        setSelectedSport(null);
      });
  };

  const handleCreateSport = () => {
    fetchSports();
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const filteredActivities = sportsActivities;

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
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          selectedSport={selectedSport}
          handleEditSport={handleEditSport}
          handleUpdateSport={handleUpdateSport}
          handleCreateSport={handleCreateSport}
          setActiveCategory={() => {}}
          filteredActivities={filteredActivities}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>
    </div>
  );
};

export default SportPages;