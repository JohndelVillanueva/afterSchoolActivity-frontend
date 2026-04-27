import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/SideBar';
import { API_BASE_URL } from '../../src/types/types';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import ViewEditCoachModal from '../../modals/ViewEditCoachModal';

// --- PROFESSIONAL DESIGN CONSTANTS ---
// const PRIMARY_COLOR = 'blue-600';
// const PRIMARY_LIGHT = 'blue-50';
// const TEXT_COLOR = 'gray-800';
// const BG_COLOR = 'gray-50';

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
  
  // View/Edit Modal State
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);

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

  // View/Edit Modal Handlers
  const handleViewEditCoach = (id: number) => {
    setSelectedCoachId(id);
    setShowViewEditModal(true);
  };

  const handleViewEditModalClose = () => {
    setShowViewEditModal(false);
    setSelectedCoachId(null);
  };

  const handleCoachUpdateSuccess = () => {
    fetchCoaches(); // Refresh the coaches list
    handleViewEditModalClose();
  };

  // Mobile Top Bar
  const MobileTopBar = (
    <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <div className="flex items-center px-4 py-3">
        <button
          className="mr-3 p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Coaches</span>
        </div>
        {!loading && coaches.length > 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
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
          ? 'User converted to coach successfully!'
          : 'Coach created successfully!';

        toast.success(successMessage, {
          duration: 4000,
          position: 'top-center',
          icon: '✅',
          style: {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
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
    <div className="min-h-screen flex bg-gray-50/80">
      <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />

      {/* View/Edit Coach Modal */}
      {showViewEditModal && selectedCoachId && (
        <ViewEditCoachModal
          isOpen={showViewEditModal}
          onClose={handleViewEditModalClose}
          coachId={selectedCoachId}
          onUpdateSuccess={handleCoachUpdateSuccess}
        />
      )}

      <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} flex flex-col`}>
        {MobileTopBar}

        {/* Page Header */}
        <div className="px-4 md:px-8 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Coaches</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? 'Loading...' : `${coaches.length} coaches registered`}
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              onClick={() => setShowModal(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Coach</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-8 py-4">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search coaches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-14 h-14 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading coaches...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/60 rounded-2xl p-6 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Coaches</h3>
                <p className="text-sm text-red-600">{error}</p>
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
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Coaches Found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-sm text-sm">
                {search
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first coach to the roster'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add First Coach</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Coach
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Contact
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Gender
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                        Activities
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        RFID
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCoaches.map((coach) => (
                      <tr key={coach.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        {/* Coach Name with Avatar */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
                                {getInitials(coach.fname, coach.lname)}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {coach.fname} {coach.lname}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">#{coach.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="space-y-1">
                            <span className="text-sm text-gray-600 truncate block max-w-[200px]">
                              {coach.email}
                            </span>
                            {coach.mobile && (
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {coach.mobile}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Gender Badge */}
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg ${
                              coach.gender === 'Male'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : coach.gender === 'Female'
                                ? 'bg-pink-50 text-pink-700 border border-pink-100'
                                : 'bg-purple-50 text-purple-700 border border-purple-100'
                            }`}
                          >
                            {coach.gender === 'Male' ? '♂' : coach.gender === 'Female' ? '♀' : '⚧'}
                            {coach.gender || 'N/A'}
                          </span>
                        </td>

                        {/* Activities */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {coach.activities && coach.activities.length > 0 ? (
                              coach.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200/60 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-150"
                                >
                                  <div className="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-gray-800 truncate">
                                      {activity.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                                      {activity.dayOfWeek && <span>{formatDay(activity.dayOfWeek)}</span>}
                                      {activity.startTime && <span>{formatTime(activity.startTime)}</span>}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-300 italic">No activities</span>
                            )}
                          </div>
                        </td>

                        {/* RFID Badge */}
                        <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-gray-50 text-gray-600 border border-gray-200/60">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            {coach.rfid.slice(0, 6)}...{coach.rfid.slice(-2)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewEditCoach(coach.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm"
                            title="View/Edit Coach Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
              <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filteredCoaches.length}</span> of{' '}
                  <span className="font-semibold text-gray-600">{coaches.length}</span> coaches
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="ml-2 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear search
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Create Coach Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={handleModalClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {formStep === 'rfid'
                        ? 'Scan RFID Card'
                        : existingCoach?.isNotCoach
                        ? 'Convert to Coach'
                        : existingCoach
                        ? 'Update Existing Coach'
                        : 'Create New Coach'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
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
                    className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={handleModalClose}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      formStep === 'rfid' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {formStep === 'details' ? '✓' : '1'}
                    </div>
                    <span className={`text-xs font-medium ${formStep === 'rfid' ? 'text-gray-900' : 'text-gray-500'}`}>
                      RFID
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      formStep === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <span className={`text-xs font-medium ${formStep === 'details' ? 'text-gray-900' : 'text-gray-400'}`}>
                      Details
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {formStep === 'rfid' ? (
                  <div className="space-y-5">
                    {formError && (
                      <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">{formError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RFID Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rfid"
                        value={form.rfid}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-base font-mono placeholder:text-gray-400"
                        placeholder="Scan or enter RFID..."
                        autoFocus
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Scan the coach's RFID card or enter it manually
                      </p>
                    </div>

                    <button
                      onClick={handleRfidCheck}
                      className="w-full py-3 px-6 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm rounded-xl disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      disabled={checkingRfid}
                    >
                      {checkingRfid ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking...
                        </>
                      ) : (
                        <>
                          Continue
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {formError && (
                      <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">{formError}</p>
                      </div>
                    )}

                    {existingCoach && (
                      <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {getInitials(existingCoach.fname, existingCoach.lname)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {existingCoach.fname} {existingCoach.lname}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{existingCoach.email || 'No email'}</p>
                            {existingCoach.isNotCoach && (
                              <div className="mt-1.5 px-2 py-1 bg-amber-50 border border-amber-200/60 rounded-lg inline-flex items-center gap-1">
                                <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-[11px] text-amber-700 font-medium">
                                  Converting from <span className="font-bold">{existingCoach.originalType}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fname"
                          value={form.fname}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                          disabled={!!existingCoach}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lname"
                          value={form.lname}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                          disabled={!!existingCoach}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
                        placeholder="coach@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
                        <input
                          type="text"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Activity / Sport <span className="text-red-500">*</span>
                      </label>
                      {loadingActivities ? (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50">
                          No activities
                        </div>
                      ) : (
                        <select
                          name="activityId"
                          value={form.activityId}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                          required
                        >
                          <option value="">Select activity</option>
                          {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                              {activity.name} ({activity.dayOfWeek} - {activity.startTime?.substring(11, 16)})
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-xs text-gray-400 mt-1.5">
                        Choose which sport or activity this coach will be assigned to
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleBackToRfid}
                        className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Back
                      </button>

                      <button
                        onClick={handleCreateCoach}
                        className="flex-1 py-2.5 px-6 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm rounded-xl disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        disabled={formLoading || loadingActivities}
                      >
                        {formLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {existingCoach?.isNotCoach ? 'Converting...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {existingCoach?.isNotCoach
                              ? 'Convert to Coach'
                              : existingCoach
                              ? 'Update Coach'
                              : 'Create Coach'}
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
      </div>
    </div>
  );
};

export default CoachesPage;