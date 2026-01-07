import React from "react";
import type { Activity } from "../../src/types/types";

interface StudentWithSession {
  id: number;
  rfid: number;
  fname: string;
  mname: string;
  lname: string;
  email: string;
  grade: string;
  enrolledDate: string;
  sessionsPurchased: number;
  sessionsAttended: number;
  sessionsRemaining: number;
  hasAttendanceOnDate: boolean;
  dateAttendanceStatus: "present" | "absent" | null;
  dateAttendanceTime: string | null;
  processedBy: string | null;
}

interface ScheduleData {
  activity: Activity;
  students: StudentWithSession[];
  selectedDate: string;
  isCorrectDay: boolean;
  selectedDayName: string;
  summary: {
    totalEnrolled: number;
    presentOnDate: number;
    absentOnDate: number;
    notMarked: number;
  };
}

interface ScheduleViewProps {
  activities: Activity[];
  selectedActivity: string;
  onActivityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  scheduleData: ScheduleData | null;
  scheduleLoading: boolean;
  loading: boolean;
  onMarkAttendance: (student: StudentWithSession, status: "present" | "absent") => void;
  showSuccess: boolean;
  errorMessage: string | null;
  formatTime: (timeString: string) => string;
  formatDate: (dateString: string) => string;
  selectedDate: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  activities,
  selectedActivity,
  onActivityChange,
  scheduleData,
  scheduleLoading,
  loading,
  onMarkAttendance,
  showSuccess,
  errorMessage,
  formatTime,
  formatDate,
  selectedDate,
  onDateChange,
  goToPreviousDay,
  goToNextDay,
  goToToday,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;
  const isFutureDate = new Date(selectedDate) > new Date(today);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Select Activity & Date
        </h2>

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-sm font-medium">
            <span role="img" aria-label="success">
              ✅
            </span>{" "}
            Attendance marked successfully.
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-sm font-medium">
            <span role="img" aria-label="error">
              🛑
            </span>{" "}
            Error: {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                Loading activities...
              </div>
            ) : (
              <select
                value={selectedActivity}
                onChange={onActivityChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white transition-colors"
                required
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousDay}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Previous Day"
              >
                ◀
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={onDateChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <button
                onClick={goToToday}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isToday
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
                title="Go to Today"
              >
                Today
              </button>
              <button
                onClick={goToNextDay}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Next Day"
              >
                ▶
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(selectedDate)}
              {isFutureDate && (
                <span className="text-orange-600 ml-2">⚠️ Future date</span>
              )}
              {!isToday && !isFutureDate && (
                <span className="text-blue-600 ml-2">📅 Past date</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {selectedActivity &&
        (scheduleLoading ? (
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-md text-center text-gray-500">
            Loading schedule data...
          </div>
        ) : scheduleData ? (
          <>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">ℹ️</span>
                <div className="text-sm">
                  <p className="font-semibold text-blue-800">
                    Attendance Marking Rules:
                  </p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                    <li>
                      ✅ <strong>Each date is independent</strong> - You can
                      mark attendance for any past or present date
                    </li>
                    <li>
                      ✅ <strong>Today:</strong> Can mark attendance freely
                    </li>
                    <li>
                      ✅ <strong>Past dates:</strong> Can mark attendance even
                      if today's attendance exists
                    </li>
                    <li>
                      ❌ <strong>Future dates:</strong> Cannot mark attendance
                      (view only)
                    </li>
                    <li>
                      ❌ <strong>Same date:</strong> Cannot mark twice for the
                      same date
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">Total Enrolled</div>
                <div className="text-2xl font-bold text-blue-600">
                  {scheduleData.summary.totalEnrolled}
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">
                  Present {isToday ? "Today" : "on Date"}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {scheduleData.summary.presentOnDate}
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">
                  Absent {isToday ? "Today" : "on Date"}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {scheduleData.summary.absentOnDate}
                </div>
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">Not Marked</div>
                <div className="text-2xl font-bold text-gray-600">
                  {scheduleData.summary.notMarked}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Student Session Schedule
              </h2>

              {scheduleData.students.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No students enrolled in this activity.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-blue-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase">
                          Student
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                          Purchased
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                          Attended
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                          Remaining
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                          Status on {isToday ? "Today" : "This Date"}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-800 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scheduleData.students.map(
                        (student: StudentWithSession) => {
                          const hasAttendanceOnThisDate =
                            student.hasAttendanceOnDate;

                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">
                                  {`${student.fname} ${student.mname || ""} ${
                                    student.lname
                                  }`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.email}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-700">
                                {student.grade}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {student.sessionsPurchased}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {student.sessionsAttended}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    student.sessionsRemaining > 0
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {student.sessionsRemaining}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {hasAttendanceOnThisDate ? (
                                  <div>
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        student.dateAttendanceStatus ===
                                        "present"
                                          ? "bg-green-500 text-white"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {student.dateAttendanceStatus?.toUpperCase()}
                                    </span>
                                    {student.processedBy && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        by {student.processedBy}
                                      </p>
                                    )}
                                    {student.dateAttendanceTime && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(
                                          student.dateAttendanceTime
                                        ).toLocaleTimeString()}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    Not Marked
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      onMarkAttendance(student, "present")
                                    }
                                    disabled={
                                      hasAttendanceOnThisDate || isFutureDate
                                    }
                                    className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                                    title={
                                      isFutureDate
                                        ? "Cannot mark attendance for future dates"
                                        : hasAttendanceOnThisDate
                                        ? "Already marked for this date"
                                        : "Mark as present for this date"
                                    }
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() =>
                                      onMarkAttendance(student, "absent")
                                    }
                                    disabled={
                                      hasAttendanceOnThisDate || isFutureDate
                                    }
                                    className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                                    title={
                                      isFutureDate
                                        ? "Cannot mark attendance for future dates"
                                        : hasAttendanceOnThisDate
                                        ? "Already marked for this date"
                                        : "Mark as absent for this date"
                                    }
                                  >
                                    Absent
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-md text-center text-gray-500">
            Failed to load schedule data.
          </div>
        ))}
    </div>
  );
};

export default ScheduleView;