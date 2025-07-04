import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/SideBar';
import type { Activity } from '../../src/types/types';

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

const PaymentPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Fetch real activities from backend
  useEffect(() => {
    fetch('http://localhost:3000/getAllSports')
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

  // Fetch real students from backend
  const fetchStudents = () => {
    setStudentsLoading(true);
    fetch('http://localhost:3000/getAllUsers')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          // Filter only students (assuming students have role 'student' or similar)
          const studentUsers = result.data.filter((user: Student) =>
            user.position.toLowerCase() === 'student' && !!user.isEnrolledInAfterSchool
          );
          setStudents(studentUsers);
        } else {
          setStudents([]);
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch today's attendance from backend
  const fetchAttendance = () => {
    setAttendanceLoading(true);
    fetch('http://localhost:3000/getTodayAttendance')
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

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentId.trim() || !selectedActivity) {
      setErrorMessage('Please enter a student ID and select an activity');
      return;
    }

    const student = students.find(s => s.id.toString() === studentId.trim());
    if (!student) {
      setErrorMessage('Student ID not found');
      return;
    }

    const activity = activities.find(a => a.id.toString() === selectedActivity);
    if (!activity) {
      setErrorMessage('Activity not found');
      return;
    }

    // Call backend to mark attendance and deduct balance
    const response = await fetch('http://localhost:3000/markAttendanceAndDeduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    setSelectedActivity('');
    setErrorMessage(null);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
    fetchStudents(); // Refresh students after marking attendance
    fetchAttendance(); // Refresh attendance after marking attendance
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
    <div className="min-h-screen flex">
      <Sidebar onCollapsedChange={handleSidebarToggle} />
      <div className={`flex-1 bg-transparent min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Header */}
        <header className="border-b border-gray-100 py-4 px-4 md:py-8 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl md:text-2xl font-light text-gray-900">Payment & Attendance</h1>
              <p className="text-gray-500 text-sm mt-1">
                Track student attendance and manage payments
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Attendance Input */}
            <div className="space-y-6">
              {/* Attendance Form */}
              <div className="border border-gray-100 rounded-lg p-6 bg-transparent">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mark Attendance</h2>
                
                {showSuccess && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    Attendance recorded successfully!
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Student
                    </label>
                    {studentsLoading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                        Loading students...
                      </div>
                    ) : (
                      <select
                        id="studentId"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Choose a student</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {`${student.fname} ${student.mname} ${student.lname} (RFID: ${student.rfid})`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Activity
                    </label>
                    {loading ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                        Loading activities...
                      </div>
                    ) : (
                      <select
                        id="activity"
                        value={selectedActivity}
                        onChange={(e) => setSelectedActivity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Choose an activity</option>
                        {activities.map(activity => (
                          <option key={activity.id} value={activity.id}>
                            {activity.name} - {activity.dayOfWeek} {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || studentsLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading || studentsLoading ? 'Loading...' : 'Mark Attendance'}
                  </button>
                </form>
              </div>

              {/* Student Reference */}
              <div className="border border-gray-100 rounded-lg p-6 bg-transparent">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Reference</h3>
                {studentsLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading students...</div>
                ) : students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map(student => (
                      <div key={student.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{`${student.fname} ${student.mname} ${student.lname} (RFID: ${student.rfid})`}</span>
                        </div>
                        <span className="text-xs text-gray-500">{student.email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No students found</div>
                )}
              </div>
            </div>

            {/* Right Column - Today's Attendance & Payment Status */}
            <div className="space-y-6">
              {/* Today's Attendance */}
              <div className="border border-gray-100 rounded-lg p-6 bg-transparent">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h3>
                {attendanceLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading attendance...</div>
                ) : attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-sm text-gray-600">{record.activity}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{record.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance recorded today
                  </div>
                )}
              </div>

              {/* Available Activities */}
              <div className="border border-gray-100 rounded-lg p-6 bg-transparent">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Activities</h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading activities...</div>
                  ) : activities.length > 0 ? (
                    activities.map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{activity.name}</p>
                          <p className="text-sm text-gray-600">
                            {activity.dayOfWeek} • {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                          </p>
                          {activity.location && (
                            <p className="text-xs text-gray-500">{activity.location}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Active
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No activities available</div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="border border-gray-100 rounded-lg p-6 bg-transparent">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  Payment Status
                  <span className="ml-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-100 border border-green-400 mr-1"></span> Paid
                    <span className="inline-block w-3 h-3 rounded-full bg-red-100 border border-red-400 mx-1"></span> Not Paid
                  </span>
                </h3>
                {studentsLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading students...</div>
                ) : students.filter(student => !!student.isEnrolledInAfterSchool).length > 0 ? (
                  <div className="space-y-3">
                    {students
                      .filter(student => !!student.isEnrolledInAfterSchool)
                      .map(student => {
                        // Find the most recent date in attendanceRecords
                        const allDates = attendanceRecords.map(r => r.date);
                        const mostRecentDate = allDates.sort().reverse()[0]; // latest date string
                        const paidRecord = attendanceRecords.find(
                          record =>
                            record.rfid &&
                            String(record.rfid).trim() === String(student.rfid).trim() &&
                            String(record.date).slice(0, 10) === String(mostRecentDate).slice(0, 10)
                        );
                        return {
                          student,
                          hasPaidToday: !!paidRecord,
                          paidActivity: paidRecord?.activity || null,
                        };
                      })
                      .sort((a, b) => Number(a.hasPaidToday) - Number(b.hasPaidToday))
                      .map(({ student, hasPaidToday, paidActivity }) => (
                        <div key={student.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                          <div>
                            <p className="font-medium text-gray-900">
                              {`${student.fname.trim()}${student.mname ? ' ' + student.mname.trim() : ''} ${student.lname.trim()} (RFID: ${student.rfid})`}
                            </p>
                            {hasPaidToday && paidActivity && (
                              <p className="text-xs text-green-700 mt-1">Paid for: {paidActivity}</p>
                            )}
                          </div>
                          {hasPaidToday ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Student has paid for today">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Student has not paid for today">
                              Not Paid
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No enrolled students found</div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6 px-8 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} School Sports Program. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PaymentPage; 