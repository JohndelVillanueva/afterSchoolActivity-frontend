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
  position: string;
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

const PRIMARY_COLOR = "blue-600";
const PRIMARY_LIGHT = "blue-50";
const TEXT_COLOR = "gray-800";
const BG_COLOR = "gray-50";

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

  // Scanner specific states
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
    <div className="md:hidden flex items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
      <button
        className={`mr-3 p-2 rounded-full hover:bg-${PRIMARY_LIGHT} focus:outline-none focus:ring-2 focus:ring-${PRIMARY_COLOR}`}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <span className={`text-lg font-semibold text-${TEXT_COLOR}`}>
        Payment & Attendance
      </span>
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
        // When fetching by activity, the data is already filtered correctly
        if (activityId) {
          setStudents(result.data);
        } else {
          // When fetching all users, filter for students enrolled in afterschool
          const studentUsers = result.data.filter(
            (user: Student) =>
              user.position?.toLowerCase() === "student" &&
              user.isEnrolledInAfterSchool === 1  // Changed from !! to === 1
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

  // Calculate scanner stats
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

  // Keep input focused for continuous scanning
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

    const dateToMark = viewMode === "schedule" ? selectedDate : new Date().toISOString().split("T")[0];

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
    if (!result.success) {
      setErrorMessage(result.error || "Failed to mark attendance");
      return;
    }

    const displayDate = viewMode === "quick" ? new Date().toISOString().split("T")[0] : selectedDate;
    
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

    if (viewMode === "schedule") {
      fetchScheduleData(selectedActivity, selectedDate);
    } else {
      fetchStudents(selectedActivity);
    }

    fetchAttendance();
    setErrorMessage(null);

    setTimeout(() => setShowSuccess(false), 3000);
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

  // Scanner functions
  const handleRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processRfidScan(rfidInput.trim());
  };

  const processRfidScan = async (rfid: string) => {
    if (!rfid || !selectedActivity) {
      return;
    }

    // Find student by RFID in the students list (which already filters by activity enrollment)
    const student = students.find((s) => s.rfid.toString() === rfid);

    if (!student) {
      // Check if student exists in general but not enrolled in this activity
      try {
        const allUsersResponse = await fetch(`${API_BASE_URL}/getAllUsers`);
        const allUsersResult = await allUsersResponse.json();
        
        if (allUsersResult.success) {
          const studentExists = allUsersResult.data.find(
            (user: Student) => user.rfid && user.rfid.toString() === rfid
          );
          
          if (studentExists) {
            // Student exists but not enrolled in this activity
            const errorRecord: ScanRecord = {
              id: Date.now().toString(),
              studentName: `${studentExists.fname} ${studentExists.mname || ""} ${studentExists.lname}`,
              activity: activities.find((a) => a.id.toString() === selectedActivity)?.name || "",
              rfid: rfid,
              time: new Date().toISOString(),
              status: "error",
              message: "❌ Not enrolled in this activity",
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
      
      // Student doesn't exist at all
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

    // Check actual database records (attendanceRecords) instead of just local scanRecords
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

    // Mark attendance
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
          message: `✓ Marked present - ${result.data.currentSessionData?.sessionsRemaining || 0} sessions remaining`,
        };
        setScanRecords((prev) => [successRecord, ...prev]);
        
        // Update attendance records to reflect the new scan
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

  return (
    <div className={`min-h-screen flex bg-${BG_COLOR}`}>
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {MobileTopBar}

        <header className="border-b border-gray-200 py-6 px-4 md:py-8 md:px-8 bg-white shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold text-${TEXT_COLOR}`}
              >
                Attendance & Payment Management 💳
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Select an activity and track student status for daily billing.
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <div className="mb-6 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setViewMode("quick")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === "quick"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              📝 Quick Mark
            </button>
            <button
              onClick={() => setViewMode("schedule")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === "schedule"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              📅 Schedule View
            </button>
            <button
              onClick={() => setViewMode("scanner")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                viewMode === "scanner"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              📱 Scanner
            </button>
          </div>

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
          ) 
          : (
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

        <footer className="border-t border-gray-200 py-6 px-8 text-center md:text-left bg-white mt-8">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} School Sports Program. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AttendancePage;