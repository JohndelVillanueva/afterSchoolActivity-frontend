import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../src/types/types';
import toast from 'react-hot-toast';

interface Activity {
  id: number;
  name: string;
  description?: string;
  startTime?: string;
  dayOfWeek?: string;
  endTime?: string;
  location?: string;
}

interface Coach {
  id: number;
  fname: string;
  lname: string;
  email: string;
  rfid: string;
  gender: string;
  mobile: string;
  activities: Activity[];
}

interface ViewEditCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: number | null;
  onUpdateSuccess: () => void;
}

const ViewEditCoachModal: React.FC<ViewEditCoachModalProps> = ({
  isOpen,
  onClose,
  coachId,
  onUpdateSuccess,
}) => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    mobile: '',
    gender: '',
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch coach details
  useEffect(() => {
    if (isOpen && coachId) {
      fetchCoachDetails();
      fetchActivities();
    }
  }, [isOpen, coachId]);

  const fetchCoachDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/getCoachById/${coachId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setCoach(result.data);
        setFormData({
          fname: result.data.fname || '',
          lname: result.data.lname || '',
          email: result.data.email || '',
          mobile: result.data.mobile || '',
          gender: result.data.gender || '',
        });
      } else {
        setError('Failed to load coach details');
      }
    } catch (err) {
      console.error('Error fetching coach:', err);
      setError('Failed to load coach details');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getAllActivities`);
      const result = await response.json();
      if (result.success) {
        setActivities(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCoach = async () => {
    if (!coachId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/updateCoach/${coachId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Coach updated successfully!', {
          duration: 3000,
          position: 'top-center',
          icon: '✅',
          style: {
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontWeight: '500',
          },
        });
        onUpdateSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to update coach');
        toast.error(result.error || 'Failed to update coach');
      }
    } catch (err) {
      console.error('Error updating coach:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to update coach');
    } finally {
      setSaving(false);
    }
  };

  const handleAddActivity = async () => {
    if (!coachId || !selectedActivityId) {
      toast.error('Please select an activity');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assignActivityToCoach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          activityId: Number(selectedActivityId),
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Activity assigned successfully!');
        fetchCoachDetails(); // Refresh coach details
        setSelectedActivityId('');
      } else {
        toast.error(result.error || 'Failed to assign activity');
      }
    } catch (err) {
      console.error('Error assigning activity:', err);
      toast.error('Failed to assign activity');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveActivity = async (activityId: number) => {
    if (!coachId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/removeActivityFromCoach`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          activityId,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Activity removed successfully!');
        fetchCoachDetails(); // Refresh coach details
      } else {
        toast.error(result.error || 'Failed to remove activity');
      }
    } catch (err) {
      console.error('Error removing activity:', err);
      toast.error('Failed to remove activity');
    } finally {
      setSaving(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Loading...' : 'Coach Details'}
              </h2>
              {!loading && coach && (
                <p className="text-sm text-gray-500 mt-1">
                  View and manage coach information
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading coach details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/60 rounded-xl p-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button
                onClick={fetchCoachDetails}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : coach ? (
            <div className="space-y-6">
              {/* Coach Info Card */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100/50">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                  {getInitials(coach.fname, coach.lname)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {coach.fname} {coach.lname}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">ID: #{coach.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg ${
                      coach.gender === 'Male'
                        ? 'bg-blue-50 text-blue-700'
                        : coach.gender === 'Female'
                        ? 'bg-pink-50 text-pink-700'
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {coach.gender || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-mono font-medium bg-gray-100 text-gray-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      {coach.rfid}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="fname"
                      value={formData.fname}
                      onChange={handleInputChange}
                      className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lname"
                      value={formData.lname}
                      onChange={handleInputChange}
                      className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Activities Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Assigned Activities
                </h4>
                
                {/* Current Activities */}
                <div className="space-y-2 mb-4">
                  {coach.activities && coach.activities.length > 0 ? (
                    coach.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200/60 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {activity.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              {activity.dayOfWeek && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatDay(activity.dayOfWeek)}
                                </span>
                              )}
                              {activity.startTime && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatTime(activity.startTime)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveActivity(activity.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove activity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200/60">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-400">No activities assigned yet</p>
                    </div>
                  )}
                </div>

                {/* Add Activity */}
                <div className="flex gap-3">
                  <select
                    value={selectedActivityId}
                    onChange={(e) => setSelectedActivityId(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                    disabled={loadingActivities || saving}
                  >
                    <option value="">Select activity to assign...</option>
                    {activities
                      .filter(activity => !coach.activities?.some(a => a.id === activity.id))
                      .map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name} ({activity.dayOfWeek} - {formatTime(activity.startTime)})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAddActivity}
                    disabled={!selectedActivityId || saving}
                    className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCoach}
                  disabled={saving}
                  className="flex-1 py-2.5 px-6 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm rounded-xl disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewEditCoachModal;