import { useState, useEffect } from 'react';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import type { Activity } from '../../src/types/types';
import RegistrationModal from '../../modals/RegistrationModal';

const SportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activity, setActivity] = useState<Activity | undefined>(location.state?.activity);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch activity by ID if not present (e.g., on refresh)
  useEffect(() => {
    if (!activity && id) {
      fetch(`http://localhost:3000/getActivityById/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setActivity(data.data);
        });
    }
  }, [activity, id]);

  useEffect(() => {
    if (!activity?.id && !id) return;
    const activityId = activity?.id || Number(id);
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3000/activities/${activityId}/enrolled-students`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.data);
        } else {
          setStudents([]);
          setError(data.error || 'Failed to fetch students');
        }
        setLoading(false);
      })
      .catch(err => {
        setStudents([]);
        setError('Failed to fetch students');
        setLoading(false);
      });
  }, [activity?.id, id]);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (!activity) {
    return (
      <div className="min-h-screen flex">
        <Sidebar onCollapsedChange={handleSidebarToggle} />
        <div className={`flex-1 bg-white min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
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
      <Sidebar onCollapsedChange={handleSidebarToggle} />
      <div className={`flex-1 bg-transparent min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Header */}
        <header className="border-b border-gray-100 py-4 px-4 md:py-8 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-light text-gray-900 ">{activity.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {activity.dayOfWeek} • {activity.location || 'No location'}
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
                        <p className="text-sm text-gray-500">Grade {student.grade}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        Registered: {student.registeredOn ? new Date(student.registeredOn).toLocaleDateString() : 'N/A'}
                        {typeof student.balance === 'number' ? ` | Balance: ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(student.balance)}` : ''}
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
                {activity.photo ? (
                  <img 
                    src={`http://localhost:3000${activity.photo}`} 
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-10 h-10 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    />
                  </svg>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Description:</span>
                  <span className="text-gray-900 text-right">{activity.description || 'No description'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Day:</span>
                  <span className="text-gray-900">{activity.dayOfWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Time:</span>
                  <span className="text-gray-900">{new Date(activity.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Time:</span>
                  <span className="text-gray-900">{new Date(activity.endTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900">Westfields International School</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate:</span>
                  <span className="text-gray-900">{activity.rate !== undefined ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(activity.rate)) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coach:</span>
                  <span className="text-gray-900">{activity.coachName || 'No coach assigned'}</span>
                </div>
              </div>

              <button
                onClick={() => setShowRegistrationModal(true)}
                className="w-full mt-6 py-3 bg-gray-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                Register New Student
              </button>
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