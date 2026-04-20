import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/SideBar";
import { API_BASE_URL } from "../../src/types/types";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import ViewEditStudentModal from "../../modals/ViewEditStudentModal";

// --- PROFESSIONAL DESIGN CONSTANTS ---
const PRIMARY_COLOR = "blue-600";
const PRIMARY_LIGHT = "blue-50";
const TEXT_COLOR = "gray-800";
const BG_COLOR = "gray-50";

// Updated interface to include session details
interface UserSession {
  id: number;
  activityId: number;
  activityName: string;
  dayOfWeek: string;
  startTime: string;
  sessionsPurchased: number;
  sessionsAttended: number;
  sessionsRemaining: number;
}

interface Student {
  id: number;
  fname: string;
  lname: string;
  email?: string;
  rfid?: string;
  isEnrolledInAfterSchool?: boolean;
  sessionsPurchased?: number;
  sessionsAttended?: number;
  sessionsRemaining?: number;
  sessions?: UserSession[];
  sessionCount?: number;
}

interface Activity {
  id: number;
  name: string;
  description?: string;
  startTime?: string;
  dayOfWeek?: string;
}

const initialFormState = {
  fname: "",
  lname: "",
  email: "",
  rfid: "",
  sessions: "",
  activityId: "",
};

const StudentsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formStep, setFormStep] = useState<"rfid" | "details">("rfid");
  const [existingStudent, setExistingStudent] = useState<Student | null>(null);
  const [checkingRfid, setCheckingRfid] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const toggleSessionExpand = (studentId: number) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/getAllUsers`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const studentUsers = (result.data || []).filter((user: any) => {
            const position = user.position?.toLowerCase();
            const isStudent = !position || position === "student";
            return isStudent && user.isEnrolledInAfterSchool;
          });
          setStudents(studentUsers);
        } else {
          setError("Failed to load students.");
        }
      })
      .catch(() => setError("Failed to load students."))
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
          console.error("Failed to load activities");
        }
      })
      .catch((err) => console.error("Failed to load activities:", err))
      .finally(() => setLoadingActivities(false));
  };

  useEffect(() => {
    fetchStudents();
    fetchActivities();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = `${student.fname} ${student.lname}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [students, search]);

  const handleViewEditStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowViewEditModal(true);
  };

  const handleViewEditModalClose = () => {
    setShowViewEditModal(false);
    setSelectedStudentId(null);
  };

  const handleStudentUpdateSuccess = () => {
    fetchStudents();
    handleViewEditModalClose();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return timeString;
    }
  };

  const getDayColor = (day: string) => {
    const colors: Record<string, string> = {
      'Monday': 'bg-blue-100 text-blue-800',
      'Tuesday': 'bg-purple-100 text-purple-800',
      'Wednesday': 'bg-green-100 text-green-800',
      'Thursday': 'bg-orange-100 text-orange-800',
      'Friday': 'bg-pink-100 text-pink-800',
      'Saturday': 'bg-yellow-100 text-yellow-800',
      'Sunday': 'bg-red-100 text-red-800',
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  // Mobile Top Bar
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Students</span>
        </div>
        {!loading && students.length > 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            {students.length}
          </span>
        )}
      </div>
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "rfid" && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "sessions") {
      if (!/^\d{0,2}$/.test(value)) {
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRfidCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.rfid.trim()) {
      setFormError("Please enter an RFID.");
      return;
    }

    setCheckingRfid(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getAllUsers`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const existingUser = result.data.find(
          (user: any) => user.rfid && user.rfid.trim() === form.rfid.trim()
        );

        if (existingUser) {
          setExistingStudent(existingUser);
          setForm((prev) => ({
            ...prev,
            fname: existingUser.fname || "",
            lname: existingUser.lname || "",
            email: existingUser.email || "",
          }));
          toast(`Student found: ${existingUser.fname} ${existingUser.lname}`, {
            duration: 3000,
            position: "top-center",
            icon: "ℹ️",
            style: {
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
              fontWeight: "500",
            },
          });
          setFormStep("details");
        } else {
          setExistingStudent(null);
          toast("New RFID - Please fill in student details", {
            duration: 3000,
            position: "top-center",
            icon: "📝",
            style: {
              background: "#fef3c7",
              border: "1px solid #fde047",
              color: "#92400e",
              fontWeight: "500",
            },
          });
          setFormStep("details");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error checking RFID:", err);
      setFormError("Failed to check RFID. Please try again.");
      toast.error("Failed to check RFID", {
        duration: 3000,
        position: "top-center",
        icon: "❌",
      });
    } finally {
      setCheckingRfid(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.fname || !form.lname || !form.rfid || !form.activityId || !form.sessions) {
      setFormError("Please provide all required fields: first name, last name, RFID, Activity, and Sessions Purchased.");
      return;
    }

    if (Number(form.sessions) <= 0) {
      setFormError("Sessions purchased must be at least 1.");
      return;
    }

    setFormLoading(true);
    try {
      const selectedActivity = activities.find((act) => act.id === Number(form.activityId));

      const sessionDate = selectedActivity?.startTime
        ? new Date(selectedActivity.startTime).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const studentPayload = {
        rfid: form.rfid.trim(),
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        activityId: Number(form.activityId),
        sessionDate: sessionDate,
        sessionsPurchased: Number(form.sessions),
      };

      const createRes = await fetch(`${API_BASE_URL}/createStudent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload),
      });

      const createData = await createRes.json();

      if (createRes.ok) {
        console.log("Student created/enrolled successfully:", createData.message);
        toast.success("Student created and enrolled successfully!", {
          duration: 4000,
          position: "top-center",
          icon: "✅",
          style: {
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontWeight: "500",
          },
        });
        setShowModal(false);
        setForm(initialFormState);
        setFormStep("rfid");
        setExistingStudent(null);
        fetchStudents();
        setFormLoading(false);
        return;
      }

      if (createRes.status === 409) {
        const existingStudentInfo = createData.details?.existingStudent;
        const errorMessage = existingStudentInfo
          ? `${existingStudentInfo.name} (RFID: ${form.rfid}) is already enrolled in the after-school program.`
          : `Student with RFID ${form.rfid} is already enrolled in the after-school program.`;

        setFormError(errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-center",
          icon: "⚠️",
          style: {
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontWeight: "500",
          },
        });
        setFormLoading(false);
        return;
      }

      const apiErrorMessage = createData.error || "Failed to create student";
      setFormError(apiErrorMessage);
      toast.error(apiErrorMessage, {
        duration: 5000,
        position: "top-center",
        icon: "❌",
        style: {
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          fontWeight: "500",
        },
      });
      setFormLoading(false);
    } catch (err) {
      console.error("Error in student creation/enrollment process:", err);
      const unexpectedError = "An unexpected error occurred during the process.";
      setFormError(unexpectedError);
      toast.error(unexpectedError, {
        duration: 5000,
        position: "top-center",
        icon: "🚨",
        style: {
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          fontWeight: "500",
        },
      });
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setForm(initialFormState);
    setFormStep("rfid");
    setExistingStudent(null);
    setFormError(null);
  };

  const handleBackToRfid = () => {
    setFormStep("rfid");
    setExistingStudent(null);
    setForm((prev) => ({
      ...initialFormState,
      rfid: prev.rfid,
    }));
    setFormError(null);
  };

  // Session Display Component
  const SessionDisplay: React.FC<{ 
    student: Student; 
    isExpanded: boolean;
    onToggle: () => void;
  }> = ({ student, isExpanded, onToggle }) => {
    const hasMultipleSessions = (student.sessionCount ?? 0) > 1;
    const sessions = student.sessions || [];

    if (!hasMultipleSessions && sessions.length <= 1) {
      const progressPercent = student.sessionsPurchased
        ? Math.min(((student.sessionsAttended ?? 0) / student.sessionsPurchased) * 100, 100)
        : 0;

      return (
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-[140px]">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercent >= 80 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold border border-amber-100">
              {student.sessionsAttended ?? 0} attended
            </div>
            <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100">
              {student.sessionsPurchased ?? 0} total
            </div>
          </div>
        </div>
      );
    }

    const totalProgress = student.sessionsPurchased
      ? Math.min(((student.sessionsAttended ?? 0) / student.sessionsPurchased) * 100, 100)
      : 0;

    return (
      <div className="w-full">
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 group/summary hover:bg-blue-50/50 rounded-xl p-2.5 -m-2.5 transition-colors duration-200"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-gray-500 flex items-center gap-1.5">
                Total Progress
                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                  {student.sessionCount} activities
                </span>
              </span>
              <span className="text-gray-900 font-semibold text-xs">
                {student.sessionsAttended ?? 0}/{student.sessionsPurchased ?? 0}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalProgress >= 80 ? 'bg-green-500' : totalProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold border border-amber-100">
              {student.sessionsAttended ?? 0}
            </div>
            <div className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100">
              {student.sessionsPurchased ?? 0}
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-2">
            {sessions.map((session) => {
              const sessionProgress = session.sessionsPurchased
                ? Math.min((session.sessionsAttended / session.sessionsPurchased) * 100, 100)
                : 0;
              return (
                <div
                  key={session.id}
                  className="bg-gray-50/80 rounded-lg p-3 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {session.activityName}
                      </span>
                      {session.dayOfWeek && (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${getDayColor(session.dayOfWeek)}`}>
                          {session.dayOfWeek}
                        </span>
                      )}
                    </div>
                    {session.startTime && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(session.startTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            sessionProgress >= 80 ? 'bg-green-500' : sessionProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${sessionProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">
                        {session.sessionsAttended} attended
                      </span>
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                        {session.sessionsPurchased} total
                      </span>
                      <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold">
                        {session.sessionsRemaining} left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50/80">
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      {showViewEditModal && selectedStudentId && (
        <ViewEditStudentModal
          isOpen={showViewEditModal}
          onClose={handleViewEditModalClose}
          studentId={selectedStudentId}
          onUpdateSuccess={handleStudentUpdateSuccess}
        />
      )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? "Loading..." : `${students.length} students enrolled`}
                </p>
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              onClick={() => setShowModal(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-8 py-4">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-14 h-14 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading students...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/60 rounded-2xl p-6 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Students</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchStudents}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-sm text-sm">
                {search
                  ? "Try adjusting your search query"
                  : "Get started by adding your first student to the roster"}
              </p>
              {!search && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add First Student</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        RFID
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Contact
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[240px]">
                        Sessions
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className={`hover:bg-blue-50/30 transition-colors duration-150 ${
                          expandedSessions.has(student.id) ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
                                {`${student.fname?.[0] || ""}${student.lname?.[0] || ""}`.toUpperCase()}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                              {(student.sessionCount ?? 0) > 1 && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-[8px] text-white font-bold">{student.sessionCount}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {student.fname} {student.lname}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">#{student.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-gray-50 text-gray-600 border border-gray-200/60">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            {student.rfid || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {student.email ? (
                            <span className="text-sm text-gray-600 truncate block max-w-[200px]">
                              {student.email}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <SessionDisplay
                            student={student}
                            isExpanded={expandedSessions.has(student.id)}
                            onToggle={() => toggleSessionExpand(student.id)}
                          />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewEditStudent(student.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filteredStudents.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{students.length}</span> students
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="ml-2 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear search
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Create Student Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={handleModalClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {formStep === "rfid"
                        ? "Scan RFID Card"
                        : existingStudent
                        ? "Enroll Existing Student"
                        : "Create New Student"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {formStep === "rfid"
                        ? "Enter the student's RFID to get started"
                        : existingStudent
                        ? "Complete the enrollment details"
                        : "Fill in the student details"}
                    </p>
                  </div>
                  <button
                    className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={handleModalClose}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      formStep === "rfid" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"
                    }`}>
                      {formStep === "details" ? "✓" : "1"}
                    </div>
                    <span className={`text-xs font-medium ${formStep === "rfid" ? "text-gray-900" : "text-gray-500"}`}>
                      RFID
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      formStep === "details" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      2
                    </div>
                    <span className={`text-xs font-medium ${formStep === "details" ? "text-gray-900" : "text-gray-400"}`}>
                      Details
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {formStep === "rfid" ? (
                  <form onSubmit={handleRfidCheck} className="space-y-5">
                    {formError && (
                      <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">{formError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RFID Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rfid"
                        value={form.rfid}
                        onChange={handleInputChange}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-base font-mono placeholder:text-gray-400"
                        placeholder="Scan or enter RFID..."
                        required
                        autoFocus
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Scan the student's RFID card or enter it manually
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm rounded-xl disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      disabled={checkingRfid}
                    >
                      {checkingRfid ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking...
                        </>
                      ) : (
                        <>
                          Continue
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCreateStudent} className="space-y-5">
                    {formError && (
                      <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl">
                        <p className="text-sm text-red-700 font-medium">{formError}</p>
                      </div>
                    )}

                    {existingStudent && (
                      <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {`${existingStudent.fname?.[0] || ""}${existingStudent.lname?.[0] || ""}`.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {existingStudent.fname} {existingStudent.lname}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{existingStudent.email || "No email"}</p>
                            {existingStudent.sessions && existingStudent.sessions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {existingStudent.sessions.map(s => (
                                  <span key={s.id} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-semibold">
                                    {s.activityName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fname"
                          value={form.fname}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                          required
                          disabled={!!existingStudent}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lname"
                          value={form.lname}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
                          required
                          disabled={!!existingStudent}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400"
                        disabled={!!existingStudent}
                        placeholder="student@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Activity <span className="text-red-500">*</span>
                        </label>
                        {loadingActivities ? (
                          <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 bg-gray-50">
                            No activities
                          </div>
                        ) : (
                          <select
                            name="activityId"
                            value={form.activityId}
                            onChange={handleInputChange}
                            className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                            required
                          >
                            <option value="">Select activity</option>
                            {activities.map((activity) => (
                              <option key={activity.id} value={activity.id}>
                                {activity.name} ({activity.dayOfWeek} - {activity.startTime?.substring(11, 16)})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Sessions <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="sessions"
                          min="1"
                          max="99"
                          value={form.sessions}
                          onChange={handleInputChange}
                          className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleBackToRfid}
                        className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        Back
                      </button>

                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-6 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm rounded-xl disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        disabled={formLoading || loadingActivities}
                      >
                        {formLoading ? (
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
                            {existingStudent ? "Enroll Student" : "Create Student"}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;