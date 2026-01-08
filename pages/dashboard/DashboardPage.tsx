import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import { API_BASE_URL } from '../../src/types/types';

const DashboardPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // New: mobile sidebar state

  // Dynamic dashboard state
  const [summary, setSummary] = useState({
    students: 0,
    coaches: 0,
    activities: 0,
    // payments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <span className="text-lg font-semibold text-gray-800">Dashboard</span>
    </div>
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch all dashboard data in parallel
    Promise.all([
      fetch(`${API_BASE_URL}/getAllStudents`).then(res => res.json()),
      fetch(`${API_BASE_URL}/getAllCoaches`).then(res => res.json()),
      fetch(`${API_BASE_URL}/getAllSports`).then(res => res.json()),
      fetch(`${API_BASE_URL}/getAllAttendanceTransactions`).then(res => res.json()),
    ])
      .then(([studentsRes, coachesRes, sportsRes, paymentsRes]) => {
        if (!studentsRes.success || !coachesRes.success || !sportsRes.success || !paymentsRes.success) {
          throw new Error('Failed to fetch dashboard data');
        }
        const students = Array.isArray(studentsRes.data) ? studentsRes.data.length : 0;
        const coaches = Array.isArray(coachesRes.data) ? coachesRes.data.length : 0;
        // Count activities
        const activities = sportsRes.data.length;
        // Count payments (wispay transactions)
        const payments = paymentsRes.data.length;
        setSummary({ students, coaches, activities });

        // Build recent activity timeline (show last 5 transactions)
        const timeline = paymentsRes.data.slice(0, 5).map((item: any) => {
          let text = '';
          if (item.status === 'present') {
            text = `${item.studentName || 'A student'} attended ${item.activity || 'an activity'}.`;
          } else if (item.credit > 0) {
            text = `Payment received from ${item.studentName || 'Unknown'}.`;
          } else {
            text = `${item.studentName || 'A student'} had a transaction.`;
          }
          // Use transaction date or fallback
          return {
            time: item.date || 'Recent',
            text,
          };
        });
        setRecentActivity(timeline);
      })
      .catch(() => {
        setError('Failed to load dashboard data.');
        setSummary({ students: 0, coaches: 0, activities: 0 });
        setRecentActivity([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const summaryData = [
    {
      label: 'Students',
      icon: '👥',
      value: summary.students,
      color: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-200',
    },
    {
      label: 'Coaches',
      icon: '🏃',
      value: summary.coaches,
      color: 'bg-green-100 text-green-800',
      iconBg: 'bg-green-200',
    },
    {
      label: 'Activities',
      icon: '⚽',
      value: summary.activities,
      color: 'bg-yellow-100 text-yellow-800',
      iconBg: 'bg-yellow-200',
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 transition-colors duration-300">
      {/* Sidebar: overlay on mobile, fixed on md+ */}
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} md:block`}
      >
        {/* Mobile Top Bar */}
        {MobileTopBar}
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white drop-shadow">Welcome to the Afterschool Dashboard!</h1>
          <p className="text-white/90 mb-0">Here's a quick overview of your afterschool activity system.</p>
        </div>
        {/* Loading/Error State */}
        {loading ? (
          <div className="w-full flex justify-center items-center py-12">
            <span className="text-gray-500 text-lg">Loading dashboard...</span>
          </div>
        ) : error ? (
          <div className="w-full flex justify-center items-center py-12">
            <span className="text-red-500 text-lg">{error}</span>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-10 px-8">
              {summaryData.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl shadow-lg p-4 flex items-center space-x-4 ${item.color} hover:scale-105 hover:shadow-2xl transition-transform duration-300 group`}
                >
                  <span className={`text-4xl rounded-full p-3 ${item.iconBg} animate-bounce-slow group-hover:animate-pulse`}>{item.icon}</span>
                  <div>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Activity Overview Chart (static for now) */}
            <div className="px-8 mb-10">
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Activity Overview</h2>
                <svg viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="url(#areaGradient)"
                    stroke="#6366F1"
                    strokeWidth="3"
                    points="0,60 30,50 60,55 90,30 120,40 150,20 180,35 210,25 240,40 270,30 300,50 300,80 0,80 0,60"
                  />
                </svg>
                <p className="text-gray-400 text-xs mt-2">(Sample data for visual effect)</p>
              </div>
            </div>
            {/* Recent Activity Timeline */}
            {/* <div className="px-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
                <ul className="relative border-l-2 border-blue-200 pl-6">
                  {recentActivity.length === 0 ? (
                    <li className="text-gray-400 text-sm py-4">No recent activity found.</li>
                  ) : (
                    recentActivity.map((item, idx) => (
                      <li key={idx} className="mb-6 last:mb-0">
                        <div className="absolute -left-3.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {idx + 1}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm text-gray-700 font-semibold">{item.time}</div>
                          <div className="text-gray-500">{item.text}</div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div> */}
          </>
        )}
        {/* Daily Quote Section */}
        <div className="w-full text-center mt-8 mb-4">
          <span className="text-large italic text-gray-400">
            “Stay positive and keep moving forward!”
          </span>
        </div>
        {/* Custom Animation for summary icons */}
        <style>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2.2s infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DashboardPage; 