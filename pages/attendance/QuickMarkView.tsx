import React from "react";
import type { Activity } from "../../src/types/types";

interface Student {
  id: number;
  rfid: number;
  fname: string;
  mname: string;
  lname: string;
  position: string;
  email: string;
  isEnrolledInAfterSchool?: number; // 0 = not enrolled, 1 = student, 2 = coach
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  activity: string;
  date: string;
  time: string;
  status: "present" | "absent" | "late";
  studentId?: number | string;
  rfid?: number | string;
}

interface QuickMarkViewProps {
  activities: Activity[];
  selectedActivity: string;
  onActivityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  students: Student[];
  studentsLoading: boolean;
  loading: boolean;
  attendanceRecords: AttendanceRecord[];
  attendanceLoading: boolean;
  onMarkAttendance: (student: Student, status: "present" | "absent") => void;
  showSuccess: boolean;
  errorMessage: string | null;
  formatTime: (timeString: string) => string;
}

const QuickMarkView: React.FC<QuickMarkViewProps> = ({
  activities,
  selectedActivity,
  onActivityChange,
  students,
  studentsLoading,
  loading,
  attendanceRecords,
  attendanceLoading,
  onMarkAttendance,
  showSuccess,
  errorMessage,
  formatTime,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6 lg:col-span-2">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Select Activity
          </h2>
          {showSuccess && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-sm font-medium">
              ✅ Attendance marked successfully.
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-sm font-medium">
              🛑 Error: {errorMessage}
            </div>
          )}
          {loading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
              Loading activities...
            </div>
          ) : (
            <select
              value={selectedActivity}
              onChange={onActivityChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white transition-colors"
            >
              <option value="">-- Choose Activity --</option>
              {activities.map((activity: Activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} ({activity.dayOfWeek},{" "}
                  {formatTime(activity.startTime)} -{" "}
                  {formatTime(activity.endTime)})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Mark Attendance
          </h2>
          {studentsLoading ? (
            <div className="text-center py-6 text-gray-500">
              {selectedActivity
                ? "Loading students..."
                : "Select an activity to view students."}
            </div>
          ) : !selectedActivity || students.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {selectedActivity
                ? "No students found in this activity."
                : "Please select an activity."}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">
                        RFID
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student: Student) => {
                      const today = new Date().toISOString().split("T")[0];
                      const hasAttendanceToday = attendanceRecords.find(
                        (record) =>
                          String(record.rfid).trim() ===
                            String(student.rfid).trim() &&
                          record.date.slice(0, 10) === today
                      );
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {`${student.fname} ${student.mname || ""} ${
                                student.lname
                              }`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-blue-600 font-mono">
                              {student.rfid}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  onMarkAttendance(student, "present")
                                }
                                disabled={!!hasAttendanceToday}
                                className="px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                              >
                                {hasAttendanceToday?.status === "present"
                                  ? "PRESENT"
                                  : "Present"}
                              </button>
                              <button
                                onClick={() =>
                                  onMarkAttendance(student, "absent")
                                }
                                disabled={!!hasAttendanceToday}
                                className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                              >
                                {hasAttendanceToday?.status === "absent"
                                  ? "ABSENT"
                                  : "Absent"}
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
      </div>
      <div className="space-y-6 lg:col-span-1">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Today's Attendance Log 📅
          </h3>
          {attendanceLoading ? (
            <div className="text-center py-4 text-gray-500">Loading...</div>
          ) : attendanceRecords.length > 0 ? (
            <div className="space-y-3">
              {attendanceRecords.map((record, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 border-l-4 rounded-md ${
                    record.status === "absent"
                      ? "bg-red-50 border-red-400"
                      : "bg-green-50 border-green-400"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {record.studentName}
                    </p>
                    <p className="text-xs text-gray-600">{record.activity}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === "absent"
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {record.status.charAt(0).toUpperCase() +
                        record.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{record.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No attendance recorded today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMarkView;