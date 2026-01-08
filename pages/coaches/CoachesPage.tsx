import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/SideBar';
import { API_BASE_URL } from '../../src/types/types';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

// --- PROFESSIONAL DESIGN CONSTANTS ---
const PRIMARY_COLOR = 'blue-600';
const PRIMARY_LIGHT = 'blue-50';
const TEXT_COLOR = 'gray-800';
const BG_COLOR = 'gray-50';

interface Coach {
  id: number;
  fname: string;
  lname: string;
  email: string;
  rfid: string;
  gender: string;
  mobile: string;
  activities: Activity[];
  type?: string;
  position?: string;
  isNotCoach?: boolean;
  originalType?: string;
}

interface Activity {
  id: number;
  name: string;
  description?: string;
  startTime?: string;
  dayOfWeek?: string;
  endTime?: string;
  location?: string;
}

const initialFormState = {
  fname: '',
  lname: '',
  email: '',
  rfid: '',
  gender: '',
  mobile: '',
  activityId: '',
};

const CoachesPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formStep, setFormStep] = useState<'rfid' | 'details'>('rfid');
  const [existingCoach, setExistingCoach] = useState<Coach | null>(null);
  const [checkingRfid, setCheckingRfid] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const fetchCoaches = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/getAllCoaches`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setCoaches(result.data);
        } else {
          setError('Failed to load coaches.');
        }
      })
      .catch(() => setError('Failed to load coaches.'))
      .finally(() => setLoading(false));
  };

  const fetchActivities = () => {
    setLoadingActivities(true);
    fetch(`${API_BASE_URL}/getAllActivities`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setActivities(result.data || []);
        } else {
          console.error('Failed to load activities');
        }
      })
      .catch((err) => console.error('Failed to load activities:', err))
      .finally(() => setLoadingActivities(false));
  };

  useEffect(() => {
    fetchCoaches();
    fetchActivities();
  }, []);

  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach => 
      `${coach.fname} ${coach.lname}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [coaches, search]);

  // Mobile Top Bar
  const MobileTopBar = (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center px-4 py-3">
        <button
          className="mr-3 p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex items-center">
          <span className="text-2xl mr-2">🏃</span>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Coaches
          </span>
        </div>
        {!loading && (
          <span className="ml-2 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
            {coaches.length}
          </span>
        )}
      </div>
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRfidCheck = async () => {
    setFormError(null);

    if (!form.rfid.trim()) {
      setFormError('Please enter an RFID.');
      return;
    }

    setCheckingRfid(true);
    try {
      const response = await fetch(`${API_BASE_URL}/checkRfid/${form.rfid}`);
      
      if (!response.ok) {
        throw new Error('Failed to check RFID');
      }

      const result = await response.json();

      if (result.success) {
        const existingUser = result.data;
        
        if (existingUser) {
          const userType = existingUser.type || existingUser.position || 'unknown';
          
          if (userType === 'coach') {
            setExistingCoach({
              ...existingUser,
              activities: existingUser.activities || []
            });
            setForm(prev => ({
              ...prev,
              fname: existingUser.fname || '',
              lname: existingUser.lname || '',
              email: existingUser.email || '',
              mobile: existingUser.mobile || '',
              gender: existingUser.gender || '',
            }));
            
            toast(`Coach found: ${existingUser.fname} ${existingUser.lname}`, {
              duration: 3000,
              position: 'top-center',
              icon: 'ℹ️',
              style: {
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                fontWeight: '500',
              },
            });
          } else {
            toast(`RFID belongs to ${userType}: ${existingUser.fname} ${existingUser.lname}. They will be converted to coach.`, {
              duration: 4000,
              position: 'top-center',
              icon: '🔄',
              style: {
                background: '#fef3c7',
                border: '1px solid #fde047',
                color: '#92400e',
                fontWeight: '500',
              },
            });
            
            setExistingCoach({
              ...existingUser,
              activities: [],
              isNotCoach: true,
              originalType: userType
            });
            
            setForm(prev => ({
              ...prev,
              fname: existingUser.fname || '',
              lname: existingUser.lname || '',
              email: existingUser.email || '',
              mobile: existingUser.mobile || '',
              gender: existingUser.gender || '',
            }));
          }
          
          setFormStep('details');
        } else {
          setExistingCoach(null);
          toast('New RFID - Please fill in coach details', {
            duration: 3000,
            position: 'top-center',
            icon: '📝',
            style: {
              background: '#fef3c7',
              border: '1px solid #fde047',
              color: '#92400e',
              fontWeight: '500',
            },
          });
          setFormStep('details');
        }
      } else {
        throw new Error(result.error || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Error checking RFID:', err);
      setFormError('Failed to check RFID. Please try again.');
      toast.error('Failed to check RFID', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
      });
    } finally {
      setCheckingRfid(false);
    }
  };

  const handleCreateCoach = async () => {
    setFormError(null);

    if (!form.fname || !form.lname || !form.email || !form.rfid || !form.activityId) {
      setFormError('Please provide all required fields: first name, last name, email, RFID, and Activity.');
      return;
    }

    setFormLoading(true);
    try {
      const coachPayload = {
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        rfid: form.rfid.trim(),
        gender: form.gender,
        mobile: form.mobile.trim(),
        activityId: Number(form.activityId),
      };

      const createRes = await fetch(`${API_BASE_URL}/createCoach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachPayload),
      });

      const createData = await createRes.json();
      
      if (createRes.ok && createData.success) {
        console.log('Coach created successfully:', createData.message);
        const successMessage = existingCoach?.isNotCoach 
          ? `User converted to coach successfully!`
          : 'Coach created successfully!';
        
        toast.success(successMessage, {
          duration: 4000,
          position: 'top-center',
          icon: '✅',
          style: {
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            color: '#0369a1',
            fontWeight: '500',
          },
        });
        setShowModal(false);
        setForm(initialFormState);
        setFormStep('rfid');
        setExistingCoach(null);
        fetchCoaches();
        setFormLoading(false);
        return;
      }

      if (createRes.status === 409) {
        const existingUserInfo = createData.details?.existingUser;
        const errorMessage = createData.error || 
          (existingUserInfo
            ? `${existingUserInfo.name} (RFID: ${form.rfid}) ${existingUserInfo.type === 'coach' ? 'is already a coach' : 'already exists in the system'}.`
            : `User with RFID ${form.rfid} already exists in the system.`);

        setFormError(errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
          position: 'top-center',
          icon: '⚠️',
          style: {
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontWeight: '500',
          },
        });
        setFormLoading(false);
        return;
      }
      
      const apiErrorMessage = createData.error || 'Failed to create coach';
      setFormError(apiErrorMessage);
      toast.error(apiErrorMessage, {
        duration: 5000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontWeight: '500',
        },
      });
      setFormLoading(false);
      
    } catch (err) {
      console.error('Error in coach creation process:', err);
      const unexpectedError = 'An unexpected error occurred during the process.';
      setFormError(unexpectedError);
      toast.error(unexpectedError, {
        duration: 5000,
        position: 'top-center',
        icon: '🚨',
        style: {
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontWeight: '500',
        },
      });
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setForm(initialFormState);
    setFormStep('rfid');
    setExistingCoach(null);
    setFormError(null);
  };

  const handleBackToRfid = () => {
    setFormStep('rfid');
    setExistingCoach(null);
    setForm(prev => ({
      ...initialFormState,
      rfid: prev.rfid,
    }));
    setFormError(null);
  };

  const getInitials = (fname: string, lname: string) => {
    return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase();
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDay = (day?: string) => {
    if (!day) return '';
    return day.substring(0, 3);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />

      <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} flex flex-col`}>
        {MobileTopBar}
        
        {/* Desktop Header with Gradient */}
        {/* <div className="hidden md:block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-4xl mr-3 drop-shadow-lg">🏃</span>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Coaches Roster</h1>
              </div>
              <p className="text-white/90 text-sm">
                Manage your afterschool program coaches and their activities
              </p>
            </div>
            {!loading && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                <div className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">
                  Total Coaches
                </div>
                <div className="text-3xl font-bold text-white">{coaches.length}</div>
              </div>
            )}
          </div>
        </div> */}

        {/* Search and Filter Bar */}
        <div className="px-4 md:px-8 mb-6 mt-13">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search coaches by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Coach</span>
              </button>
            </div>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="text-2xl">🏃</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading coaches...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Coaches</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchCoaches}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredCoaches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <span className="text-6xl">🏃</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Coaches Found</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {search
                  ? "Try adjusting your search query"
                  : "Get started by adding your first coach to the roster"}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add First Coach</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Coach</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Activities</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RFID</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCoaches.map((coach) => (
                      <tr key={coach.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
                        {/* Coach Name with Avatar */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                                {getInitials(coach.fname, coach.lname)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {coach.fname} {coach.lname}
                              </div>
                              <div className="text-xs text-gray-500">ID: {coach.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <a
                              href={`mailto:${coach.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group/email"
                            >
                              <svg className="w-4 h-4 opacity-0 group-hover/email:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate max-w-[180px]">{coach.email}</span>
                            </a>
                            {coach.mobile && (
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {coach.mobile}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Gender Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              coach.gender === 'Male' 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : coach.gender === 'Female'
                                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {coach.gender === 'Male' ? '♂' : coach.gender === 'Female' ? '♀' : '⚧'}
                            <span className="ml-1">{coach.gender || 'N/A'}</span>
                          </span>
                        </td>

                        {/* Activities */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-md">
                            {coach.activities && coach.activities.length > 0 ? (
                              coach.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="inline-flex flex-col gap-1 px-3 py-2 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group/activity"
                                >
                                  <div className="text-sm font-semibold text-blue-800 flex items-center gap-1">
                                    <span className="text-base">⚽</span>
                                    {activity.name}
                                  </div>
                                  <div className="text-xs text-blue-600 flex items-center gap-2">
                                    {activity.dayOfWeek && (
                                      <span className="flex items-center gap-1">
                                        📅 {formatDay(activity.dayOfWeek)}
                                      </span>
                                    )}
                                    {activity.startTime && (
                                      <span className="flex items-center gap-1">
                                        ⏰ {formatTime(activity.startTime)}
                                      </span>
                                    )}
                                  </div>
                                  {activity.location && (
                                    <div className="text-xs text-blue-500 flex items-center gap-1">
                                      📍 {activity.location}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400 italic">No activities assigned</span>
                            )}
                          </div>
                        </td>

                        {/* RFID Badge */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-300 group-hover:bg-gray-200 transition-colors">
                            <svg className="w-3 h-3 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <span title={coach.rfid}>
                              {coach.rfid.slice(0, 6)}...{coach.rfid.slice(-2)}
                            </span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                            title="View/Edit Coach Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredCoaches.length}</span> of{" "}
                    <span className="font-semibold text-gray-900">{coaches.length}</span> coaches
                  </span>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal - keeping your existing modal code */}
                {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={handleModalClose} />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              <div className="border-b border-gray-200 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                      {formStep === 'rfid'
                        ? 'Scan RFID Card'
                        : existingCoach?.isNotCoach
                        ? 'Convert to Coach'
                        : existingCoach
                        ? 'Update Existing Coach'
                        : 'Create New Coach'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {formStep === 'rfid'
                        ? "Enter the coach's RFID to get started"
                        : existingCoach?.isNotCoach
                        ? `${existingCoach.fname} ${existingCoach.lname} will be converted from ${existingCoach.originalType} to coach`
                        : existingCoach
                        ? 'Coach found - Update details if needed'
                        : 'Fill in the details for the new coach'}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                    onClick={handleModalClose}
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <div className={`flex-1 h-0.5 transition-all duration-300 ${formStep === 'rfid' ? 'bg-gray-900' : 'bg-gray-300'}`} />
                  <div className={`flex-1 h-0.5 transition-all duration-300 ${formStep === 'details' ? 'bg-gray-900' : 'bg-gray-300'}`} />
                </div>
              </div>

              <div className="p-8">
                {formStep === 'rfid' ? (
                  <div className="space-y-6">
                    {formError && (
                      <div className="p-4 border border-gray-900 bg-gray-50">
                        <p className="text-sm text-gray-900 font-medium">{formError}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        RFID Card Number <span className="text-gray-900">*</span>
                      </label>
                      <input
                        type="text"
                        name="rfid"
                        value={form.rfid}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-base font-mono"
                        placeholder="Scan or enter RFID..."
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Scan the coach's RFID card or enter it manually
                      </p>
                    </div>

                    <button
                      onClick={handleRfidCheck}
                      className="w-full py-3 px-6 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-base disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      disabled={checkingRfid}
                    >
                      {checkingRfid ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking RFID...
                        </>
                      ) : (
                        <>
                          Continue
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formError && (
                      <div className="p-4 border border-gray-900 bg-gray-50">
                        <p className="text-sm text-gray-900 font-medium">{formError}</p>
                      </div>
                    )}

                    {existingCoach && (
                      <div className="p-5 border-2 border-gray-900 bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 border-2 border-gray-900 bg-white flex items-center justify-center text-base font-bold text-gray-900 flex-shrink-0">
                            {getInitials(existingCoach.fname, existingCoach.lname)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base mb-1">
                              {existingCoach.fname} {existingCoach.lname}
                            </h3>
                            <p className="text-sm text-gray-600">{existingCoach.email || 'No email'}</p>
                            <p className="text-xs text-gray-500 font-mono mt-2">RFID: {existingCoach.rfid}</p>
                            
                            {/* Show user type if not a coach */}
                            {existingCoach.isNotCoach && (
                              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                <p className="text-xs text-yellow-800 font-medium">
                                  ⚠️ This RFID belongs to a <span className="font-bold">{existingCoach.originalType}</span>.
                                  They will be converted to a coach.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          First Name <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="fname"
                          value={form.fname}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                          disabled={!!existingCoach}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Last Name <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="lname"
                          value={form.lname}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                          disabled={!!existingCoach}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                          disabled={!!existingCoach}
                          placeholder="coach@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          RFID <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="rfid"
                          value={form.rfid}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 font-mono bg-gray-100 text-gray-700"
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">Gender</label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 bg-white transition-colors"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">Mobile</label>
                        <input
                          type="text"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                          placeholder="e.g., +1234567890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Activity / Sport <span className="text-gray-900">*</span>
                      </label>
                      {loadingActivities ? (
                        <div className="block w-full px-4 py-3 border border-gray-300 text-gray-500 bg-gray-100 flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading activities...
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="block w-full px-4 py-3 border border-gray-300 text-gray-900 bg-gray-50">
                          No activities available
                        </div>
                      ) : (
                        <select
                          name="activityId"
                          value={form.activityId}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 bg-white transition-colors"
                          required
                        >
                          <option value="">Select a sport/activity</option>
                          {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                              {activity.name} ({activity.dayOfWeek} - {activity.startTime?.substring(11, 16)})
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Choose which sport or activity this coach will be assigned to
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleBackToRfid}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-base flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Back
                      </button>

                      <button
                        onClick={handleCreateCoach}
                        className="flex-1 py-3 px-6 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-base disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        disabled={formLoading || loadingActivities}
                      >
                        {formLoading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {existingCoach?.isNotCoach ? 'Converting...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {existingCoach?.isNotCoach 
                              ? `Convert to Coach` 
                              : existingCoach 
                              ? 'Update Coach' 
                              : 'Create Coach'
                            }
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Animations */}
        <style>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CoachesPage;