import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../../components/SideBar";
import type { Activity } from "../../src/types/types";
import { API_BASE_URL } from "../../src/types/types";
import QuickMarkView from "./QuickMarkView";
import ScheduleView from "./ScheduleView";
import ScannerView from "./ScannerView";

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

interface StudentWithSession extends Student {
  sessionsPurchased: number;
  sessionsAttended: number;
  sessionsRemaining: number;
  hasAttendanceOnDate: boolean;
  dateAttendanceStatus: "present" | "absent" | null;
  dateAttendanceTime: string | null;
  enrolledDate: string;
  grade: string;
  processedBy: string | null;
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

interface ScanRecord {
  id: string;
  studentName: string;
  activity: string;
  rfid: string;
  time: string;
  status: "success" | "error" | "duplicate";
  message: string;
}

const AttendancePage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"quick" | "schedule" | "scanner">("quick");
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [rfidInput, setRfidInput] = useState("");
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [todayStats, setTodayStats] = useState({
    totalScans: 0,
    uniqueStudents: 0,
    duplicates: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Attendance</span>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetch(`${API_BASE_URL}/getAllSports`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setActivities(result.data);
        } else {
          setActivities([]);
        }
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  const fetchScheduleData = useCallback(
    async (activityId: string, date: string) => {
      if (!activityId) return;

      setScheduleLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/activities/${activityId}/students-with-sessions?date=${date}`
        );
        const result = await response.json();

        if (result.success) {
          setScheduleData(result.data);
        } else {
          console.error("[ERROR] Failed to fetch schedule data:", result.error);
          setScheduleData(null);
        }
      } catch (error) {
        console.error("[ERROR] Error fetching schedule data:", error);
        setScheduleData(null);
      } finally {
        setScheduleLoading(false);
      }
    },
    []
  );

  const fetchStudents = useCallback((activityId?: string) => {
    setStudentsLoading(true);

    const url = activityId
      ? `${API_BASE_URL}/getStudentsByActivity/${activityId}`
      : `${API_BASE_URL}/getAllUsers`;

    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          if (activityId) {
            setStudents(result.data);
          } else {
            const studentUsers = result.data.filter(
              (user: Student) =>
                user.position?.toLowerCase() === "student" &&
                user.isEnrolledInAfterSchool === 1
            );
            setStudents(studentUsers);
          }
        } else {
          setStudents([]);
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedActivity) {
      if (viewMode === "schedule") {
        fetchScheduleData(selectedActivity, selectedDate);
      } else {
        fetchStudents(selectedActivity);
      }
    } else {
      setStudents([]);
      setScheduleData(null);
      setStudentsLoading(false);
    }
  }, [
    selectedActivity,
    selectedDate,
    viewMode,
    fetchStudents,
    fetchScheduleData,
  ]);

  const fetchAttendance = () => {
    setAttendanceLoading(true);
    fetch(`${API_BASE_URL}/getTodayAttendance`)
      .then((res) => res.json())
      .then((result) => {
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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = scanRecords.filter(
      (record) => record.time.split("T")[0] === today
    );

    const uniqueRfids = new Set(
      todayRecords
        .filter((r) => r.status === "success")
        .map((r) => r.rfid)
    );

    const duplicateCount = todayRecords.filter(
      (r) => r.status === "duplicate"
    ).length;

    setTodayStats({
      totalScans: todayRecords.length,
      uniqueStudents: uniqueRfids.size,
      duplicates: duplicateCount,
    });
  }, [scanRecords]);

  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  const handleMarkAttendance = async (
    student: Student | StudentWithSession,
    status: "present" | "absent"
  ) => {
    setErrorMessage(null);

    if (!selectedActivity) {
      setErrorMessage("Please select an activity");
      return;
    }

    const activity = activities.find(
      (a) => a.id.toString() === selectedActivity
    );
    if (!activity) {
      setErrorMessage("Activity not found");
      return;
    }

    let processedBy = "System";

    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const firstName =
          user.firstName ||
          user.fname ||
          user.first_name ||
          user.name?.split(" ")[0] ||
          "";
        const lastName =
          user.lastName ||
          user.lname ||
          user.last_name ||
          user.name?.split(" ")[1] ||
          "";

        if (firstName || lastName) {
          processedBy = `${firstName} ${lastName}`.trim();
        } else if (user.username) {
          processedBy = user.username;
        } else if (user.email) {
          processedBy = user.email.split("@")[0];
        }
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

    const dateToMark = viewMode === "schedule" ? selectedDate : new Date().toLocaleDateString("en-CA");

    const response = await fetch(`${API_BASE_URL}/markAttendanceAndDeduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student.id,
        activityId: activity.id,
        status,
        processedBy,
        date: dateToMark,
      }),
    });

    const result = await response.json();

    if (result.success) {
      const displayDate = viewMode === "quick" ? new Date().toLocaleDateString("en-CA") : selectedDate;
      
      const newRecord: AttendanceRecord = {
        id: String(student.id),
        studentName: `${student.fname} ${student.mname} ${student.lname}`,
        activity: activity.name,
        date: displayDate,
        time: new Date().toLocaleTimeString(),
        status: status,
        rfid: student.rfid,
      };

      setAttendanceRecords((prev) => [...prev, newRecord]);
      setShowSuccess(true);
      setErrorMessage(null);

      if (viewMode === "schedule") {
        fetchScheduleData(selectedActivity, selectedDate);
      } else {
        fetchStudents(selectedActivity);
      }
      
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      // ✅ FIX: Even on error (like "already marked"), fetch the real records
      // so the UI can sync and disable buttons properly
      setErrorMessage(result.error || "Failed to mark attendance");
      fetchAttendance(); // This pulls the actual records from the DB
      
      if (viewMode === "schedule") {
        fetchScheduleData(selectedActivity, selectedDate);
      } else {
        fetchStudents(selectedActivity);
      }
    }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivityId = e.target.value;
    setSelectedActivity(newActivityId);
    setStudentId("");
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processRfidScan(rfidInput.trim());
  };

  const processRfidScan = async (rfid: string) => {
    if (!rfid || !selectedActivity) {
      return;
    }

    const student = students.find((s) => s.rfid.toString() === rfid);

    if (!student) {
      try {
        const allUsersResponse = await fetch(`${API_BASE_URL}/getAllUsers`);
        const allUsersResult = await allUsersResponse.json();

        if (allUsersResult.success) {
          const studentExists = allUsersResult.data.find(
            (user: Student) => user.rfid && user.rfid.toString() === rfid
          );

          if (studentExists) {
            const errorRecord: ScanRecord = {
              id: Date.now().toString(),
              studentName: `${studentExists.fname} ${studentExists.mname || ""} ${studentExists.lname}`,
              activity: activities.find((a) => a.id.toString() === selectedActivity)?.name || "",
              rfid: rfid,
              time: new Date().toISOString(),
              status: "error",
              message: "Not enrolled in this activity",
            };
            setScanRecords((prev) => [errorRecord, ...prev]);
            setRfidInput("");
            setTimeout(() => inputRef.current?.focus(), 100);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking student enrollment:", error);
      }

      const errorRecord: ScanRecord = {
        id: Date.now().toString(),
        studentName: "Unknown",
        activity: activities.find((a) => a.id.toString() === selectedActivity)?.name || "",
        rfid: rfid,
        time: new Date().toISOString(),
        status: "error",
        message: "RFID not found in system",
      };
      setScanRecords((prev) => [errorRecord, ...prev]);
      setRfidInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const alreadyMarkedInDatabase = attendanceRecords.some(
      (record) =>
        String(record.rfid).trim() === String(student.rfid).trim() &&
        record.date.slice(0, 10) === today
    );

    if (alreadyMarkedInDatabase) {
      const duplicateRecord: ScanRecord = {
        id: Date.now().toString(),
        studentName: `${student.fname} ${student.mname || ""} ${student.lname}`,
        activity: activities.find((a) => a.id.toString() === selectedActivity)?.name || "",
        rfid: rfid,
        time: new Date().toISOString(),
        status: "duplicate",
        message: "Already scanned today",
      };
      setScanRecords((prev) => [duplicateRecord, ...prev]);
      setRfidInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }

    try {
      const activity = activities.find((a) => a.id.toString() === selectedActivity);

      let processedBy = "RFID Scanner";
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          const firstName = user.firstName || user.fname || user.first_name || user.name?.split(" ")[0] || "";
          const lastName = user.lastName || user.lname || user.last_name || user.name?.split(" ")[1] || "";
          if (firstName || lastName) {
            processedBy = `${firstName} ${lastName}`.trim();
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }

      const response = await fetch(`${API_BASE_URL}/markAttendanceAndDeduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          activityId: activity?.id,
          status: "present",
          processedBy,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (result.success) {
        const successRecord: ScanRecord = {
          id: Date.now().toString(),
          studentName: `${student.fname} ${student.mname || ""} ${student.lname}`,
          activity: activity?.name || "",
          rfid: rfid,
          time: new Date().toISOString(),
          status: "success",
          message: `Marked present - ${result.data.currentSessionData?.sessionsRemaining || 0} sessions remaining`,
        };
        setScanRecords((prev) => [successRecord, ...prev]);

        const newAttendanceRecord: AttendanceRecord = {
          id: String(student.id),
          studentName: `${student.fname} ${student.mname || ""} ${student.lname}`,
          activity: activity?.name || "",
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString(),
          status: "present",
          rfid: student.rfid,
        };
        setAttendanceRecords((prev) => [...prev, newAttendanceRecord]);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorRecord: ScanRecord = {
          id: Date.now().toString(),
          studentName: `${student.fname} ${student.mname || ""} ${student.lname}`,
          activity: activity?.name || "",
          rfid: rfid,
          time: new Date().toISOString(),
          status: "error",
          message: result.error || "Failed to mark attendance",
        };
        setScanRecords((prev) => [errorRecord, ...prev]);
        
        // ✅ FIX: Sync attendance records even on error
        fetchAttendance();
      }
    } catch (error) {
      const errorRecord: ScanRecord = {
        id: Date.now().toString(),
        studentName: `${student.fname} ${student.mname || ""} ${student.lname}`,
        activity: activities.find((a) => a.id.toString() === selectedActivity)?.name || "",
        rfid: rfid,
        time: new Date().toISOString(),
        status: "error",
        message: "Network error",
      };
      setScanRecords((prev) => [errorRecord, ...prev]);
    }

    setRfidInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleScanning = () => {
    if (!selectedActivity) {
      alert("Please select an activity first");
      return;
    }
    setIsScanning(!isScanning);
    if (!isScanning) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    setErrorMessage(null);
  }, [studentId, selectedActivity]);

  useEffect(() => {
    if (!errorMessage) return;
    const timeoutId = window.setTimeout(() => {
      setErrorMessage(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [errorMessage]);

  const viewModes = [
    {
      id: "quick" as const,
      label: "Quick Mark",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: "schedule" as const,
      label: "Schedule",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "scanner" as const,
      label: "Scanner",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50/80">
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        } flex flex-col`}
      >
        {MobileTopBar}

        {/* Page Header */}
        <div className="px-4 md:px-8 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track student attendance and manage sessions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="px-4 md:px-8 py-4">
          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === mode.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {viewMode === "scanner" ? (
            <ScannerView
              activities={activities}
              selectedActivity={selectedActivity}
              onActivityChange={handleActivityChange}
              loading={loading}
              isScanning={isScanning}
              toggleScanning={toggleScanning}
              rfidInput={rfidInput}
              setRfidInput={setRfidInput}
              handleRfidSubmit={handleRfidSubmit}
              inputRef={inputRef}
              todayStats={todayStats}
              scanRecords={scanRecords}
              formatTime={formatTime}
              showSuccess={showSuccess}
            />
          ) : viewMode === "schedule" ? (
            <ScheduleView
              activities={activities}
              selectedActivity={selectedActivity}
              onActivityChange={handleActivityChange}
              scheduleData={scheduleData}
              scheduleLoading={scheduleLoading}
              loading={loading}
              onMarkAttendance={handleMarkAttendance}
              showSuccess={showSuccess}
              errorMessage={errorMessage}
              formatTime={formatTime}
              formatDate={formatDate}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              goToPreviousDay={goToPreviousDay}
              goToNextDay={goToNextDay}
              goToToday={goToToday}
            />
          ) : (
            <QuickMarkView
              activities={activities}
              selectedActivity={selectedActivity}
              onActivityChange={handleActivityChange}
              students={students}
              studentsLoading={studentsLoading}
              loading={loading}
              attendanceRecords={attendanceRecords}
              attendanceLoading={attendanceLoading}
              onMarkAttendance={handleMarkAttendance}
              showSuccess={showSuccess}
              errorMessage={errorMessage}
              formatTime={formatTime}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendancePage;