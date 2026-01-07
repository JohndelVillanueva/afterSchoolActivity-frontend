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

  const MobileTopBar = (
    <div className="md:hidden flex items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
      <button
        className="mr-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-lg font-semibold text-gray-800">Coaches</span>
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
      // Check ALL users with this RFID
      const response = await fetch(`${API_BASE_URL}/checkRfid/${form.rfid}`);
      
      if (!response.ok) {
        throw new Error('Failed to check RFID');
      }

      const result = await response.json();

      if (result.success) {
        const existingUser = result.data;
        
        if (existingUser) {
          // Check user type
          const userType = existingUser.type || existingUser.position || 'unknown';
          
          if (userType === 'coach') {
            // RFID belongs to existing coach
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
            // RFID belongs to non-coach (student, staff, etc.)
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
            
            // Still set as existing user but mark as non-coach
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
          // RFID doesn't exist - new user
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

  const GenderBadge = ({ gender }: { gender: string }) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
        gender === 'Male' 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : gender === 'Female'
          ? 'bg-pink-100 text-pink-700 border border-pink-200'
          : 'bg-purple-100 text-purple-700 border border-purple-200'
      }`}
    >
      {gender || 'Not specified'}
    </span>
  );

  // Add ActivityBadge component
  const ActivityBadge = ({ activity }: { activity: Activity }) => {
    // Format time from "2024-01-01T14:00:00.000Z" to "2:00 PM"
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
      return day.substring(0, 3); // "Monday" -> "Mon"
    };

    return (
      <div className="inline-flex flex-col items-start gap-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <div className="text-sm font-semibold text-blue-800">{activity.name}</div>
        <div className="text-xs text-blue-600">
          {activity.dayOfWeek && (
            <span className="mr-2">
              📅 {formatDay(activity.dayOfWeek)}
            </span>
          )}
          {activity.startTime && (
            <span>
              ⏰ {formatTime(activity.startTime)}
              {activity.endTime && ` - ${formatTime(activity.endTime)}`}
            </span>
          )}
        </div>
        {activity.location && (
          <div className="text-xs text-blue-500">
            📍 {activity.location}
          </div>
        )}
      </div>
    );
  };

  const getInitials = (fname: string, lname: string) => {
    return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase();
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
        
        <header className="border-b border-gray-200 py-6 px-4 md:py-8 md:px-8 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coaches Roster 👨‍🏫</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your afterschool program coaches and their details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 text-sm w-full md:w-48 transition-colors"
            />
           <button
              className="px-5 py-2 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={() => setShowModal(true)}
            >
              <span className='hidden md:inline'>+ Create Coach</span>
              <span className='md:hidden'>+ Add</span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500 text-lg">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-12 text-lg p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">{error}</div>
          ) : filteredCoaches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-dashed border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No coaches found</h2>
              <p className="text-gray-500 mb-4">Try adjusting your search or add a new coach.</p>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold"
                onClick={() => setShowModal(true)}
              >
                Create Coach
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Coach</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">RFID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCoaches.map(coach => (
                      <tr key={coach.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                              {getInitials(coach.fname, coach.lname)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{coach.fname} {coach.lname}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          <span className="cursor-pointer underline decoration-dotted" title={coach.rfid}>
                            {coach.rfid.slice(0, 6)}...{coach.rfid.slice(-2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <a href={`mailto:${coach.email}`} className="hover:underline text-blue-500">{coach.email}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <GenderBadge gender={coach.gender} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {coach.activities && coach.activities.length > 0 ? (
                              coach.activities.map((activity) => (
                                <ActivityBadge key={activity.id} activity={activity} />
                              ))
                            ) : (
                              <span className="text-sm text-gray-400 italic">No activity assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {coach.mobile || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-gray-100"
                            title="View/Edit Coach Details"
                          >
                            View/Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Create Coach Modal with Two-Step Flow */}
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
      </div>
    </div>
  );
};

export default CoachesPage;