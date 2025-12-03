import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/SideBar';
import type { Activity } from '../../src/types/types';
import { API_BASE_URL } from '../../src/types/types';

interface Student {
  id: number;
  rfid: number;
  fname: string;
  mname: string;
  lname: string;
  position: string; // user role
  email: string;
  isEnrolledInAfterSchool?: boolean;
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  activity: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  studentId?: number | string;
  rfid?: number | string;
}

// --- PROFESSIONAL DESIGN CONSTANTS ---
const PRIMARY_COLOR = 'blue-600'; // Primary accent color
const PRIMARY_LIGHT = 'blue-50'; // Light background accent
const TEXT_COLOR = 'gray-800'; // Dark text for readability
const BG_COLOR = 'gray-50'; // Soft background

const PaymentPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // New: mobile sidebar state
  const [studentId, setStudentId] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Hamburger button for mobile
  const MobileTopBar = (
    <div className="md:hidden flex items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
      <button
        className={`mr-3 p-2 rounded-full hover:bg-${PRIMARY_LIGHT} focus:outline-none focus:ring-2 focus:ring-${PRIMARY_COLOR}`}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className={`text-lg font-semibold text-${TEXT_COLOR}`}>Payment & Attendance</span>
    </div>
  );

  // Fetch real activities from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/getAllSports`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setActivities(result.data);
        } else {
          setActivities([]);
        }
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch students based on selected activity
  const fetchStudents = useCallback((activityId?: string) => {
    setStudentsLoading(true);
    
    // Updated URL: Uses the new endpoint if an activity is selected
    const url = activityId 
        ? `${API_BASE_URL}/getStudentsByActivity/${activityId}` 
        : `${API_BASE_URL}/getAllUsers`; // Fallback to all users if no activity is selected

    fetch(url)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // --- BEGIN FIX: Apply filter consistently & add debugging ---
          // Filter users to ensure only enrolled students with the 'student' position are shown.
          // This acts as a safety net if the new backend endpoint is not strictly filtering by position/enrollment status.
          const studentUsers = result.data.filter((user: Student) =>
            user.position.toLowerCase() === 'student' && !!user.isEnrolledInAfterSchool
          );
          
          console.log(`[DEBUG] Fetched ${result.data.length} users from URL: ${url}`);
          console.log('[DEBUG] Raw data from server:', result.data);
          console.log(`[DEBUG] Filtered to ${studentUsers.length} students. If this is 0, check your backend endpoint.`);

          setStudents(studentUsers);
          // --- END FIX ---
        } else {
          console.error(`[ERROR] Backend call failed for URL: ${url}`, result.error);
          setStudents([]);
        }
      })
      .catch((e) => {
          console.error('[FETCH ERROR] Error fetching students:', e);
          setStudents([]);
      })
      .finally(() => setStudentsLoading(false));
  }, []);

  // Effect to trigger student fetch when activity selection changes
  useEffect(() => {
    if (selectedActivity) {
        fetchStudents(selectedActivity);
    } else {
        // Clear students when activity is deselected
        setStudents([]);
        setStudentsLoading(false);
    }
  }, [selectedActivity, fetchStudents]);

  // Fetch today's attendance from backend
  const fetchAttendance = () => {
    setAttendanceLoading(true);
    fetch(`${API_BASE_URL}/getTodayAttendance`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setAttendanceRecords(result.data);
        } else {
          setAttendanceRecords([]);
        }
      })
      .catch(() => setAttendanceRecords([]))
      .finally(() => setAttendanceLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkAttendance = async (student: Student, status: 'present' | 'absent') => {
    setErrorMessage(null);

    if (!selectedActivity) {
      setErrorMessage('Please select an activity');
      return;
    }

    const activity = activities.find(a => a.id.toString() === selectedActivity);
    if (!activity) {
      setErrorMessage('Activity not found');
      return;
    }

    // Call backend to mark attendance and deduct balance
    const response = await fetch(`${API_BASE_URL}/markAttendanceAndDeduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id, activityId: activity.id, status }), 
    });
    const result = await response.json();
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to mark attendance');
      return;
    }

    // Add new attendance record to local state
    const today = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: String(student.id),
      studentName: `${student.fname} ${student.mname} ${student.lname}`,
      activity: activity.name,
      date: today,
      time: new Date().toLocaleTimeString(),
      status: status,
      rfid: student.rfid
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
    setShowSuccess(true);
    fetchStudents(selectedActivity); 
    fetchAttendance();
    setErrorMessage(null);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivityId = e.target.value;
    setSelectedActivity(newActivityId);
    setStudentId(''); // Reset student selection when activity changes
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentId.trim() || !selectedActivity) {
      setErrorMessage('Please enter a student ID and select an activity');
      return;
    }

    const student = students.find(s => s.id.toString() === studentId.trim());
    // The student check is now against the filtered list:
    if (!student) {
      setErrorMessage('Student not found in the selected activity.'); 
      return;
    }

    const activity = activities.find(a => a.id.toString() === selectedActivity);
    if (!activity) {
      setErrorMessage('Activity not found');
      return;
    }

    // Call backend to mark attendance and deduct balance
    const response = await fetch(`${API_BASE_URL}/markAttendanceAndDeduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Ensure activityId is passed as number if the backend expects it
      body: JSON.stringify({ studentId: student.id, activityId: activity.id }), 
    });
    const result = await response.json();
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to mark attendance and deduct payment');
      return;
    }

    // Check if attendance already exists for today
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = attendanceRecords.find(
      record => record.id === studentId && 
      record.activity === activity.name && 
      record.date === today
    );

    if (existingRecord) {
      setErrorMessage('Attendance already recorded for today');
      return;
    }

    // Add new attendance record
    const newRecord: AttendanceRecord = {
      id: studentId,
      studentName: `${student.fname} ${student.mname} ${student.lname}`,
      activity: activity.name,
      date: today,
      time: new Date().toLocaleTimeString(),
      status: 'present'
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
    setShowSuccess(true);
    setStudentId('');
    // Updated refresh call: Refresh only students for the current activity
    fetchStudents(selectedActivity); 
    fetchAttendance(); // Refresh attendance after marking attendance
    setErrorMessage(null);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  useEffect(() => {
    setErrorMessage(null);
  }, [studentId, selectedActivity]);

  console.log("attendanceRecords", attendanceRecords);
  console.log("students", students);

  return (
    <div className={`min-h-screen flex bg-${BG_COLOR}`}>
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {MobileTopBar}
        
        {/* Header */}
        <header className="border-b border-gray-200 py-6 px-4 md:py-8 md:px-8 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold text-${TEXT_COLOR}`}>Attendance & Payment Management 💳</h1>
              <p className="text-gray-500 text-sm mt-1">
                Select an activity and track student status for daily billing.
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> 
            {/* Column 1: Attendance Input (Expanded to 2/3 width on large screens) */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Activity Selection & Status Messages */}
              <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md`}>
                <h2 className={`text-lg font-semibold text-${TEXT_COLOR} mb-4 border-b pb-2`}>
                    1. Select Activity
                </h2>
                
                {showSuccess && (
                  <div className={`mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-sm font-medium`}>
                    <span role="img" aria-label="success">✅</span> Attendance marked successfully.
                  </div>
                )}

                {errorMessage && (
                  <div className={`mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-sm font-medium`}>
                    <span role="img" aria-label="error">🛑</span> Error: {errorMessage}
                  </div>
                )}
                
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {/* Activity Selection */}
                  <div>
                    <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                      Activity
                    </label>
                    {loading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                        Loading activities...
                      </div>
                    ) : (
                      <select
                        id="activity"
                        value={selectedActivity}
                        onChange={handleActivityChange} 
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${PRIMARY_COLOR} focus:border-${PRIMARY_COLOR} bg-white transition-colors`}
                        required
                      >
                        <option value="">-- Choose Activity --</option>
                        {activities.map(activity => (
                          <option key={activity.id} value={activity.id}>
                            {activity.name} ({activity.dayOfWeek}, {formatTime(activity.startTime)} - {formatTime(activity.endTime)})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </form>
              </div>
              
              {/* Student Table (Mark Attendance) */}
              <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md`}>
                <h2 className={`text-lg font-semibold text-${TEXT_COLOR} mb-4 border-b pb-2`}>
                    2. Mark Attendance for Enrolled Students
                </h2>
                
                {studentsLoading ? (
                  <div className="text-center py-6 text-gray-500">
                    {selectedActivity ? 'Loading students...' : 'Select an activity to view students.'}
                  </div>
                ) : !selectedActivity || students.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    {selectedActivity ? 'No students found in this activity.' : 'Please select an activity.'}
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full text-sm">
                        <thead className={`bg-${PRIMARY_LIGHT} sticky top-0`}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}>
                              Name / Email
                            </th>
                            <th className={`px-4 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}>
                              RFID
                            </th>
                            <th className={`px-4 py-3 text-center text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map(student => {
                            const today = new Date().toISOString().split('T')[0];
                            const hasAttendanceToday = attendanceRecords.find(
                              record => 
                                String(record.rfid).trim() === String(student.rfid).trim() &&
                                record.date.slice(0, 10) === today
                            );
                            
                            return (
                              <tr 
                                key={student.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className={`text-sm font-medium text-gray-900`}>
                                    {`${student.fname} ${student.mname || ''} ${student.lname}`}
                                  </div>
                                  <div className="text-xs text-gray-500">{student.email}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className={`text-sm text-${PRIMARY_COLOR} font-mono`}>{student.rfid}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleMarkAttendance(student, 'present')}
                                      disabled={!!hasAttendanceToday}
                                      className={`px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs shadow-md`}
                                      title="Mark as Present and Deduct Payment"
                                    >
                                      {hasAttendanceToday?.status === 'present' ? 'PRESENT (PAID)' : 'Present'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMarkAttendance(student, 'absent')}
                                      disabled={!!hasAttendanceToday}
                                      className={`px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs shadow-md`}
                                      title="Mark as Absent"
                                    >
                                      {hasAttendanceToday?.status === 'absent' ? 'ABSENT' : 'Absent'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Reference - Retained and styled */}
              <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md`}>
                <h3 className={`text-lg font-semibold text-${TEXT_COLOR} mb-4 border-b pb-2`}>
                  Student Reference List
                  {selectedActivity && 
                      <span className="text-sm text-gray-500 font-normal"> 
                          &nbsp; (for {activities.find(a => String(a.id) === selectedActivity)?.name})
                      </span>
                  }
                </h3>
                {studentsLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    {selectedActivity ? 'Loading students...' : 'Select an activity to view students.'}
                  </div>
                ) : students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map(student => (
                      <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <div>
                          <span className="font-medium text-gray-900">{`${student.fname} ${student.mname || ''} ${student.lname}`}</span>
                          <span className="text-xs text-gray-500 block"> | RFID: {student.rfid}</span>
                        </div>
                        <span className="text-sm text-gray-600">{student.email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {selectedActivity ? 'No students enrolled in this activity.' : 'No enrolled students found'}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Today's Attendance & Activities (1/3 width on large screens) */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Today's Attendance Log */}
              <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md`}>
                <h3 className={`text-lg font-semibold text-${TEXT_COLOR} mb-4 border-b pb-2`}>
                  Today's Attendance Log 📅
                </h3>
                {attendanceLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading attendance...</div>
                ) : attendanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {attendanceRecords.map((record, index) => {
                      const isAbsent = record.status === 'absent';
                      const statusClass = isAbsent 
                          ? 'bg-red-50 border-red-400' 
                          : 'bg-green-50 border-green-400';
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex justify-between items-center p-3 border-l-4 rounded-md ${statusClass}`}
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{record.studentName}</p>
                            <p className="text-xs text-gray-600">{record.activity}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isAbsent 
                                ? 'bg-red-200 text-red-800' 
                                : 'bg-green-200 text-green-800'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{record.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance recorded today.
                  </div>
                )}
              </div>

              {/* Available Activities (Reference) */}
              <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md`}>
                <h3 className={`text-lg font-semibold text-${TEXT_COLOR} mb-4 border-b pb-2`}>
                  Active Activity Schedule ⏱️
                </h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading activities...</div>
                  ) : activities.length > 0 ? (
                    activities.map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 border-l-4 border-blue-400 bg-blue-50 rounded-md">
                        <div>
                          <p className="font-medium text-gray-900">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {activity.dayOfWeek} • {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                          </p>
                          {activity.location && (
                            <p className="text-xs text-gray-500">{activity.location}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${PRIMARY_COLOR} text-white shadow-sm`}>
                          Active
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No activities available</div>
                  )}
                </div>
              </div>

              {/* Payment Status (Uncommented and Styled) */}
              {/* Note: Logic for determining "Paid" status needs to be fully implemented on the backend/frontend for accurate display */}
              {/* <div className={`p-6 bg-white border border-gray-200 rounded-lg shadow-md`}>
                <h3 className={`text-lg font-semibold text-${TEXT_COLOR} mb-4 border-b pb-2 flex items-center gap-2`}>
                  Payment Status
                  <span className="ml-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1"></span> Paid
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mx-1"></span> Not Paid
                  </span>
                </h3>
                {studentsLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    {selectedActivity ? 'Loading payment status...' : 'Select an activity to view payment status.'}
                  </div>
                ) : students.filter(student => !!student.isEnrolledInAfterSchool).length > 0 ? (
                  <div className="space-y-3">
                    {students
                      .filter(student => !!student.isEnrolledInAfterSchool)
                      .map(student => {
                        // Logic based on attendanceRecords to determine if payment was deducted today
                        const today = new Date().toISOString().split('T')[0];
                        const paidRecord = attendanceRecords.find(
                          record =>
                            record.rfid &&
                            String(record.rfid).trim() === String(student.rfid).trim() &&
                            record.date.slice(0, 10) === today &&
                            record.status === 'present' // Assuming 'present' means payment deduction happened
                        );
                        const hasPaidToday = !!paidRecord;

                        return (
                          <div key={student.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md bg-gray-50">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {`${student.fname.trim()} ${student.lname.trim()}`}
                              </p>
                              {hasPaidToday && paidRecord && (
                                <p className="text-xs text-green-700 mt-1">Paid for: {paidRecord.activity}</p>
                              )}
                            </div>
                            {hasPaidToday ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm" title="Student has paid for today">
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm" title="Student has not paid/attended today">
                                Not Paid
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No enrolled students found</div>
                )}
              </div> */}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-6 px-8 text-center md:text-left bg-white mt-8">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} School Sports Program. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PaymentPage;