import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import { API_BASE_URL } from '../../src/types/types';

const DashboardPage: React.FC = () => {
  const dailyQuotes = [
    'Stay positive and keep moving forward!',
    'Small daily progress leads to big results.',
    'Discipline today creates success tomorrow.',
    'Great teams are built one effort at a time.',
    'Your consistency is your superpower.',
    'Show up, work hard, and trust the process.',
    'Every challenge is a chance to grow.',
  ];

  const getDailyQuote = (): string => {
    const now = new Date();
    const dayStamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let hash = 0;

    for (let i = 0; i < dayStamp.length; i += 1) {
      hash = (hash << 5) - hash + dayStamp.charCodeAt(i);
      hash |= 0;
    }

    const quoteIndex = Math.abs(hash) % dailyQuotes.length;
    return dailyQuotes[quoteIndex];
  };

  const todaysQuote = getDailyQuote();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // New: mobile sidebar state

  // Dynamic dashboard state
  const [summary, setSummary] = useState({
    students: 0,
    coaches: 0,
    activities: 0,
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
      cardBg: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700',
    },
    {
      label: 'Coaches',
      icon: '🏃',
      value: summary.coaches,
      cardBg: 'from-emerald-50 to-green-50',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-700',
    },
    {
      label: 'Activities',
      icon: '⚽',
      value: summary.activities,
      cardBg: 'from-amber-50 to-yellow-50',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-700',
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 transition-colors duration-300">
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

        {/* Dashboard Header */}
        <div className="px-4 pt-4 pb-3 md:px-8 md:pt-8">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-6 h-36 w-36 rounded-full bg-white/15" />
            <div className="absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-white/10" />
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Welcome to the Afterschool Dashboard</h1>
              <p className="text-white/90 text-sm md:text-base">Track your students, coaches, and activities from one place.</p>
            </div>
          </div>
        </div>

        {/* Loading/Error State */}
        {loading ? (
          <div className="w-full flex justify-center items-center py-14">
            <span className="text-slate-500 text-lg">Loading dashboard...</span>
          </div>
        ) : error ? (
          <div className="px-4 md:px-8 py-6">
            <div className="w-full rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-center font-medium">
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8 px-4 md:px-8">
              {summaryData.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${item.cardBg} p-5 flex items-center justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                >
                  <div>
                    <p className="text-sm text-slate-600 font-medium">{item.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-1">Live data</p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl ${item.iconBg} ${item.iconText} text-2xl grid place-items-center shadow-sm`}>
                    {item.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Timeline */}
            <div className="px-4 md:px-8 pb-8">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-800">Recent Activity</h2>
                  <span className="text-xs md:text-sm text-slate-500">Latest 5 transactions</span>
                </div>

                <ul className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <li className="text-slate-400 text-sm py-2">No recent activity found.</li>
                  ) : (
                    recentActivity.map((item, idx) => (
                      <li key={`${item.time}-${idx}`} className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold grid place-items-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500 mb-0.5">{item.time}</div>
                          <div className="text-sm text-slate-700">{item.text}</div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Daily Quote Section */}
        <div className="w-full text-center mt-1 mb-8">
          <span className="text-base italic text-slate-400">
            "{todaysQuote}"
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 