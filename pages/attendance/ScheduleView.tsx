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
  position: string;
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
  // ✅ FIX: Use local date instead of UTC
  const today = new Date().toLocaleDateString("en-CA");
  const isToday = selectedDate === today;
  const isFutureDate = new Date(selectedDate + "T00:00:00") > new Date(today + "T00:00:00");

  return (
    <div className="space-y-5">
      {/* Success / Error Messages */}
      {showSuccess && (
        <div className="p-3.5 bg-green-50 border border-green-200/60 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-800">Attendance marked successfully.</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Activity & Date Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Activity
            </label>
            {loading ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading activities...
              </div>
            ) : (
              <select
                value={selectedActivity}
                onChange={onActivityChange}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                required
              >
                <option value="">Choose activity</option>
                {activities.map((activity: Activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} 
                    {/* (
                      {activity.dayOfWeek}, {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                      ) */}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date
            </label>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousDay}
                className="px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                title="Previous Day"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={onDateChange}
                className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
              />
              <button
                onClick={goToToday}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isToday
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                title="Go to Today"
              >
                Today
              </button>
              <button
                onClick={goToNextDay}
                className="px-3 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                title="Next Day"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-400">{formatDate(selectedDate)}</span>
              {isFutureDate && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium border border-amber-100">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Future date
                </span>
              )}
              {!isToday && !isFutureDate && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-100">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Past date
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      {selectedActivity &&
        (scheduleLoading ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-200/60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
              <span className="text-sm text-gray-400">Loading schedule...</span>
            </div>
          </div>
        ) : scheduleData ? (
          <>
            {/* Info Banner */}
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">Attendance rules</p>
                  <ul className="space-y-0.5">
                    <li>Each date is independent — mark attendance for any past or present date</li>
                    <li>Future dates are view-only</li>
                    <li>Cannot mark twice for the same date</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-200/60 p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Total Enrolled</div>
                <div className="text-2xl font-bold text-gray-900">{scheduleData.summary.totalEnrolled}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/60 p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Present</div>
                <div className="text-2xl font-bold text-emerald-600">{scheduleData.summary.presentOnDate}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/60 p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Absent</div>
                <div className="text-2xl font-bold text-red-500">{scheduleData.summary.absentOnDate}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200/60 p-4">
                <div className="text-xs text-gray-400 font-medium mb-1">Not Marked</div>
                <div className="text-2xl font-bold text-gray-400">{scheduleData.summary.notMarked}</div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Student Session Schedule</h2>
              </div>

              {scheduleData.students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No students enrolled in this activity.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Sessions
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {scheduleData.students.map((student: StudentWithSession) => {
                        const hasAttendanceOnThisDate = student.hasAttendanceOnDate;
                        const progressPercent = student.sessionsPurchased
                          ? Math.min((student.sessionsAttended / student.sessionsPurchased) * 100, 100)
                          : 0;

                        // ✅ FIX: Safe status text formatting
                        const statusText = student.dateAttendanceStatus
                          ? student.dateAttendanceStatus.charAt(0).toUpperCase() + student.dateAttendanceStatus.slice(1)
                          : "";

                        return (
                          <tr key={student.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                            {/* Student Name */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${
                                  hasAttendanceOnThisDate
                                    ? student.dateAttendanceStatus === "present"
                                      ? "bg-emerald-500"
                                      : "bg-red-500"
                                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                                }`}>
                                  {hasAttendanceOnThisDate ? (
                                    student.dateAttendanceStatus === "present" ? (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )
                                  ) : (
                                    `${student.fname?.[0] || ""}${student.lname?.[0] || ""}`.toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">
                                    {student.fname} {student.mname ? `${student.mname[0]}. ` : ""}{student.lname}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">{student.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Grade */}
                            <td className="px-4 py-3.5 text-center hidden md:table-cell">
                              <span className="text-sm text-gray-500">{student.grade || "—"}</span>
                            </td>

                            {/* Sessions - Combined */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-full max-w-[80px]">
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        progressPercent >= 80 ? 'bg-emerald-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                                    {student.sessionsAttended}/{student.sessionsPurchased}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    student.sessionsRemaining > 0
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-red-50 text-red-600'
                                  }`}>
                                    {student.sessionsRemaining} left
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 text-center">
                              {hasAttendanceOnThisDate ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                      student.dateAttendanceStatus === "present"
                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200/60"
                                        : "bg-red-100 text-red-700 border border-red-200/60"
                                    }`}
                                  >
                                    {student.dateAttendanceStatus === "present" ? (
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                    {/* ✅ FIX: Use pre-computed statusText instead of optional chaining */}
                                    {statusText}
                                  </span>
                                  {student.dateAttendanceTime && (
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(student.dateAttendanceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {student.processedBy && ` · ${student.processedBy.split(' ')[0]}`}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onMarkAttendance(student, "present")}
                                  disabled={hasAttendanceOnThisDate || isFutureDate}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm disabled:shadow-none"
                                  title={
                                    isFutureDate
                                      ? "Cannot mark for future dates"
                                      : hasAttendanceOnThisDate
                                      ? "Already marked"
                                      : "Mark present"
                                  }
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Present
                                </button>
                                <button
                                  onClick={() => onMarkAttendance(student, "absent")}
                                  disabled={hasAttendanceOnThisDate || isFutureDate}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 active:bg-red-700 disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm disabled:shadow-none"
                                  title={
                                    isFutureDate
                                      ? "Cannot mark for future dates"
                                      : hasAttendanceOnThisDate
                                      ? "Already marked"
                                      : "Mark absent"
                                  }
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer */}
              {scheduleData.students.length > 0 && (
                <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {scheduleData.students.length} student{scheduleData.students.length !== 1 ? 's' : ''} enrolled
                    {isFutureDate && (
                      <span className="ml-2 text-amber-500 font-medium">
                        View only — future date
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200/60">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Failed to load schedule data.</p>
          </div>
        ))}
    </div>
  );
};

export default ScheduleView;