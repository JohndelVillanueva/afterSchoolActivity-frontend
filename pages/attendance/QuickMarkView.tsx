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
  isEnrolledInAfterSchool?: number;
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
  processedBy?: string;
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
  const today = new Date().toLocaleDateString("en-CA");

  // Get the name of the currently selected activity
  const selectedActivityName =
    activities.find((a) => a.id.toString() === selectedActivity)?.name || "";

  // ✅ FIX: Filter by today AND the selected activity
  const todayRecords = attendanceRecords.filter((record) => {
    const recordDate = record.date?.slice(0, 10);
    const matchesDate = recordDate === today;
    // If an activity is selected, only show records for that activity
    const matchesActivity = selectedActivityName
      ? record.activity === selectedActivityName
      : true;
    return matchesDate && matchesActivity;
  });

  const presentCount = todayRecords.filter((r) => r.status === "present").length;
  const absentCount = todayRecords.filter((r) => r.status === "absent").length;

  // const isStudentMarkedToday = (studentRfid: number | string) => {
  //   return attendanceRecords.some(
  //     (record) =>
  //       String(record.rfid).trim() === String(studentRfid).trim() &&
  //       record.date?.slice(0, 10) === today
  //   );
  // };

  const getStudentRecord = (studentRfid: number | string) => {
    return attendanceRecords.find(
      (record) =>
        String(record.rfid).trim() === String(studentRfid).trim() &&
        record.date?.slice(0, 10) === today
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column */}
      <div className="space-y-5 lg:col-span-2">
        {/* Activity Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Select Activity
          </h2>

          {showSuccess && (
            <div className="mb-3 p-3.5 bg-green-50 border border-green-200/60 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-800">Attendance marked successfully.</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-3 p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-amber-700">{errorMessage}</p>
            </div>
          )}

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
            >
              <option value="">Choose activity</option>
              {activities.map((activity: Activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} ({activity.dayOfWeek}, {formatTime(activity.startTime)} - {formatTime(activity.endTime)})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Mark Attendance
            </h2>
            {selectedActivity && students.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">
                {students.length}
              </span>
            )}
          </div>

          {studentsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
                <span className="text-sm text-gray-400">
                  {selectedActivity ? "Loading students..." : "Select an activity to view students"}
                </span>
              </div>
            </div>
          ) : !selectedActivity ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Please select an activity</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No students found in this activity</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      RFID
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((student: Student) => {
                    const studentRecord = getStudentRecord(student.rfid);
                    const isMarked = !!studentRecord;
                    const markedStatus = studentRecord?.status || null;

                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors duration-150 ${
                          isMarked
                            ? markedStatus === "present"
                              ? "bg-emerald-50/30"
                              : "bg-red-50/30"
                            : "hover:bg-blue-50/30"
                        }`}
                      >
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${
                              isMarked
                                ? markedStatus === "present"
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                                : "bg-gradient-to-br from-blue-500 to-purple-600"
                            }`}>
                              {isMarked ? (
                                markedStatus === "present" ? (
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
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {student.fname} {student.mname ? `${student.mname[0]}. ` : ""}{student.lname}
                              </div>
                              <div className="text-xs text-gray-400 truncate">{student.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap hidden sm:table-cell">
                          <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            {student.rfid}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          {isMarked ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                markedStatus === "present"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                  : "bg-red-50 text-red-700 border-red-200/60"
                              }`}>
                                {markedStatus === "present" ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                {markedStatus?.charAt(0).toUpperCase()}{markedStatus?.slice(1)}
                              </span>
                              {/* Show who marked it and when */}
                              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                {studentRecord?.time && <span>{studentRecord.time}</span>}
                                {studentRecord?.processedBy && (
                                  <>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-0.5">
                                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {studentRecord.processedBy}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onMarkAttendance(student, "present")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-colors duration-150 shadow-sm"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Present
                              </button>
                              <button
                                onClick={() => onMarkAttendance(student, "absent")}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 active:bg-red-700 transition-colors duration-150 shadow-sm"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Absent
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {selectedActivity && students.length > 0 && (
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {students.length} student{students.length !== 1 ? "s" : ""} enrolled
                {todayRecords.length > 0 && (
                  <span className="ml-2">
                    · <span className="text-emerald-500 font-medium">{presentCount} present</span>
                    {" "}<span className="text-red-400 font-medium">{absentCount} absent</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Attendance Log */}
      <div className="space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-200/60 p-4">
            <div className="text-xs text-gray-400 font-medium mb-1">Present</div>
            <div className="text-2xl font-bold text-emerald-600">{presentCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200/60 p-4">
            <div className="text-xs text-gray-400 font-medium mb-1">Absent</div>
            <div className="text-2xl font-bold text-red-500">{absentCount}</div>
          </div>
        </div>

        {/* Today's Log - Filtered by Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {selectedActivityName ? (
                <span className="truncate">{selectedActivityName}</span>
              ) : (
                <span>Today&apos;s Log</span>
              )}
            </h3>
            {todayRecords.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-bold flex-shrink-0 ml-2">
                {todayRecords.length}
              </span>
            )}
          </div>

          {!selectedActivity ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 border border-gray-100">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Select an activity to view log</p>
            </div>
          ) : attendanceLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
            </div>
          ) : todayRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 border border-gray-100">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">No attendance recorded for this activity</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {todayRecords.map((record, index) => (
                <div
                  key={index}
                  className={`px-5 py-3 hover:bg-gray-50/50 transition-colors duration-150 ${
                    record.status === "absent"
                      ? "border-l-2 border-l-red-400"
                      : "border-l-2 border-l-emerald-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{record.studentName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {record.processedBy && (
                          <span className="text-[10px] text-gray-400 inline-flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {record.processedBy}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{record.time}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        record.status === "absent"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}>
                        {record.status === "absent" ? (
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMarkView;