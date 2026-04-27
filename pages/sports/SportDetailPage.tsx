import { useState, useEffect } from 'react';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import type { Activity } from '../../src/types/types';
import RegistrationModal from '../../modals/RegistrationModal';
import { API_BASE_URL } from '../../src/types/types';

// ✅ Import the same default image from MainContent
import defaultSportImage from "../../src/assets/deh54s1-25929919-c63d-4834-ba80-c3a00fe2fbcc.png";

// ✅ Helper function to get sport image with fallback (same as MainContent)
const getSportImage = (activity: Activity | null): string => {
  if (activity?.photo) return `${API_BASE_URL}${activity.photo}`;
  return defaultSportImage;
};

const SportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activity, setActivity] = useState<Activity | undefined>(location.state?.activity);
  const [students, setStudents] = useState<any[]>([]);

  // Fetch activity by ID if not present (e.g., on refresh)
  useEffect(() => {
    if (!activity && id) {
      fetch(`${API_BASE_URL}/getActivityById/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setActivity(data.data);
        });
    }
  }, [activity, id]);

  useEffect(() => {
    if (!activity?.id && !id) return;
    const activityId = activity?.id || Number(id);
    fetch(`${API_BASE_URL}/activities/${activityId}/enrolled-students`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.data);
        } else {
          setStudents([]);
        }
      })
      .catch(() => {
        setStudents([]);
      });
  }, [activity?.id, id]);

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
      <span className="text-lg font-semibold text-gray-800">Activity Details</span>
    </div>
  );

  if (!activity) {
    return (
      <div className="min-h-screen flex">
        <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 bg-white min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {MobileTopBar}
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="mt-2 text-xl font-medium text-gray-900">Activity not found</h1>
            <button
              onClick={() => navigate('/sports')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Sports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`flex-1 bg-transparent min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Header */}
        <header className="border-b border-gray-100 py-4 px-4 md:py-8 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-light text-gray-900">{activity.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {/* {activity.location || 'No location'} */}
              </p>
            </div>
            <button
              onClick={() => navigate('/sports')}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content - 60/40 split */}
        <main className="flex flex-col md:flex-row p-4 md:p-8 gap-6">
          {/* Left Column - Student List (60%) */}
          <div className="w-full md:w-3/5">
            <div className="bg-transparent border border-gray-200 rounded-lg shadow p-6 overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-light text-gray-900">Registered Students</h2>
                <span className="text-sm text-gray-500">{students.length} students</span>
              </div>
              
              <div className="space-y-3">
                {students.length > 0 ? (
                  students.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        {/* <p className="text-sm text-gray-500">Grade {student.grade}</p> */}
                      </div>
                      <span className="text-xs text-gray-400">
                        Registered: {student.registeredOn ? new Date(student.registeredOn).toLocaleDateString() : 'N/A'}
                        {/* {typeof student.balance === 'number' ? ` | Balance: ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(student.balance)}` : ''} */}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No students registered yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sport Details (40%) */}
          <div className="w-full md:w-2/5">
            <div className="bg-transparent border border-gray-200 rounded-lg shadow p-6 overflow-x-auto">
              <h2 className="text-lg font-light text-gray-900 mb-4">Activity Details</h2>
              
              <div className="aspect-[4/3] bg-gray-50 mb-4 flex items-center justify-center rounded-md overflow-hidden">
                <img 
                  src={getSportImage(activity)} 
                  alt={activity.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Ultimate fallback: If the image fails to load, show a placeholder
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%2366746f'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%23ffffff' opacity='0.15'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='white' font-size='16' opacity='0.5' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Description:</span>
                  <span className="text-gray-900 text-right">{activity.description || 'No description'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">{activity.location || 'No location'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coach:</span>
                  <span className="text-gray-900">{activity.coachName || 'No coach assigned'}</span>
                </div>
              </div>

              {/* <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full mt-6 py-3 bg-gray-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                Register New Student
              </button> */}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6 px-8 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} School Sports Program. All rights reserved.
          </p>
        </footer>

        {/* Registration Modal */}
        <RegistrationModal
          show={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          selectedActivity={activity}
        />
      </div>
    </div>
  );
};

export default SportDetailPage;