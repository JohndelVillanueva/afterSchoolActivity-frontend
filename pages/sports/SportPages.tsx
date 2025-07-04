// SportPages.tsx
import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import MainContent from '../../components/MainContent';
import type { Activity, Category } from '../../src/types/types';

const SportPages = () => {
//   const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [sportsActivities, setSportsActivities] = useState<Activity[]>([]);

  // Debug log
  console.log('SportPages component is rendering');

  useEffect(() => {
    // Fetch all sports from backend
    fetch('http://localhost:3000/getAllSports')
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

  const handleCreateSport = async (newSport: Activity) => {
    try {
      const response = await fetch('http://localhost:3000/createSport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSport.name,
          description: newSport.description,
          dayOfWeek: newSport.dayOfWeek,
          startTime: newSport.startTime,
          endTime: newSport.endTime,
          location: newSport.location,
          coachName: newSport.coachName,
          photo: newSport.photo,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSportsActivities(prev => [...prev, {
          ...newSport,
          id: result.data.id,
        }]);
        setShowCreateModal(false);
        alert('Sport created successfully!');
      } else {
        alert(result.error || 'Failed to create sport');
      }
    } catch (error) {
      alert('Error creating sport');
      console.error(error);
    }
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

// const handleActivityClick = (activity: Activity) => {
//   navigate(`/sports/${activity.title}`, { 
//     state: { activity } // Pass the full activity data
//   });
// };

  return (
    <div className="min-h-screen flex">
      <Sidebar onCollapsedChange={handleSidebarToggle} />
      
      <MainContent 
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        handleCreateSport={handleCreateSport}
        setActiveCategory={setActiveCategory}
        filteredActivities={filteredActivities}
        sidebarCollapsed={sidebarCollapsed}
        // onActivityClick={handleActivityClick}
      />
    </div>
  );
};

export default SportPages;