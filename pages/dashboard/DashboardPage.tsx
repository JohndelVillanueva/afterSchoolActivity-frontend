import React, { useState } from 'react';
import Sidebar from '../../components/SideBar';

const summaryData = [
  {
    label: 'Students',
    icon: '👥',
    value: 120, // Placeholder value
    color: 'bg-blue-100 text-blue-800',
    iconBg: 'bg-blue-200',
  },
  {
    label: 'Coaches',
    icon: '🏃',
    value: 12, // Placeholder value
    color: 'bg-green-100 text-green-800',
    iconBg: 'bg-green-200',
  },
  {
    label: 'Activities',
    icon: '⚽',
    value: 8, // Placeholder value
    color: 'bg-yellow-100 text-yellow-800',
    iconBg: 'bg-yellow-200',
  },
  {
    label: 'Payments',
    icon: '💳',
    value: 45, // Placeholder value
    color: 'bg-purple-100 text-purple-800',
    iconBg: 'bg-purple-200',
  },
];

const mockTimeline = [
  { time: 'Today', text: '3 students attended Football.' },
  { time: 'Yesterday', text: 'Payment received from John Doe.' },
  { time: '2 days ago', text: 'New coach added: Coach Smith.' },
  { time: '3 days ago', text: 'Basketball activity created.' },
];

const DashboardPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 transition-colors duration-300">
      <Sidebar onCollapsedChange={handleSidebarToggle} />
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} p-0`}
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 rounded-b-3xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white drop-shadow">Welcome to the Afterschool Dashboard!</h1>
          <p className="text-white/90 mb-0">Here's a quick overview of your afterschool activity system.</p>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-8">
          {summaryData.map((item) => (
            <div
              key={item.label}
              className={`rounded-xl shadow-lg p-6 flex items-center space-x-4 ${item.color} hover:scale-105 hover:shadow-2xl transition-transform duration-300 group`}
            >
              <span className={`text-4xl rounded-full p-3 ${item.iconBg} animate-bounce-slow group-hover:animate-pulse`}>{item.icon}</span>
              <div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-sm font-medium">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Activity Overview Chart */}
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
        <div className="px-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
            <ul className="relative border-l-2 border-blue-200 pl-6">
              {mockTimeline.map((item, idx) => (
                <li key={idx} className="mb-6 last:mb-0">
                  <div className="absolute -left-3.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="ml-2">
                    <div className="text-sm text-gray-700 font-semibold">{item.time}</div>
                    <div className="text-gray-500">{item.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
        <div className="w-full text-center mt-8 mb-4">
          <span className="text-large italic text-gray-400">
            * The data above is for demonstration purposes only and does not reflect real records.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 