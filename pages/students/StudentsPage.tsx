import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/SideBar";
import { API_BASE_URL } from "../../src/types/types";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast"; // Add Toaster import
import ViewEditStudentModal from "../../modals/ViewEditStudentModal"; // Import the modal

// --- PROFESSIONAL DESIGN CONSTANTS ---
const PRIMARY_COLOR = "blue-600"; // Primary accent color
const PRIMARY_LIGHT = "blue-50"; // Light background accent
const TEXT_COLOR = "gray-800"; // Dark text for readability
const BG_COLOR = "gray-50"; // Soft background

interface Student {
  id: number;
  fname: string;
  lname: string;
  email?: string;
  rfid?: string;
  isEnrolledInAfterSchool?: boolean;
  sessionsPurchased?: number;
  sessionsAttended?: number; // Add this
  sessionsRemaining?: number; // Add this
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
  status: "enrolled",
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
  const [statusFilter, setStatusFilter] = useState<
    "all" | "enrolled" | "not_enrolled"
  >("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formStep, setFormStep] = useState<"rfid" | "details">("rfid");
  const [existingStudent, setExistingStudent] = useState<Student | null>(null);
  const [checkingRfid, setCheckingRfid] = useState(false);
  
  // Add state for View/Edit modal
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
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
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "enrolled"
          ? student.isEnrolledInAfterSchool
          : !student.isEnrolledInAfterSchool;
      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  // Add function to handle viewing/editing a student
  const handleViewEditStudent = (studentId: number) => {
    setSelectedStudentId(studentId);
    setShowViewEditModal(true);
  };

  // Add function to handle modal close
  const handleViewEditModalClose = () => {
    setShowViewEditModal(false);
    setSelectedStudentId(null);
  };

  // Add function to refresh students after update
  const handleStudentUpdateSuccess = () => {
    fetchStudents(); // Refresh the student list
    handleViewEditModalClose();
  };

  // Updated Mobile Top Bar with professional styling
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
        Students
      </span>
    </div>
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
      // Fetch all users and check if RFID exists
      const response = await fetch(`${API_BASE_URL}/getAllUsers`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Search for student with matching RFID
        const existingUser = result.data.find(
          (user: any) => user.rfid && user.rfid.trim() === form.rfid.trim()
        );

        if (existingUser) {
          // RFID exists - show student information
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
          // RFID doesn't exist - expand form for new student
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

    if (!form.fname || !form.lname || !form.rfid || !form.activityId) {
      setFormError(
        "Please provide all required fields: first name, last name, RFID, and Activity."
      );
      return;
    }

    setFormLoading(true);
    try {
      const selectedActivity = activities.find(
        (act) => act.id === Number(form.activityId)
      );

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
        sessionsPurchased: form.sessions ? Number(form.sessions) : 0, // Add this line ✅
      };

      const createRes = await fetch(`${API_BASE_URL}/createStudent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload),
      });

      const createData = await createRes.json();

      // Handle success cases (both 200 and 201)
      if (createRes.ok) {
        console.log(
          "Student created/enrolled successfully:",
          createData.message
        );
        // SUCCESS TOAST
        toast.success("Student created and enrolled successfully!", {
          duration: 4000,
          position: "top-center",
          icon: "✅",
          style: {
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            color: "#0369a1",
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

      // Handle RFID already exists and already enrolled (409)
      if (createRes.status === 409) {
        const existingStudentInfo = createData.details?.existingStudent;
        const errorMessage = existingStudentInfo
          ? `${existingStudentInfo.name} (RFID: ${form.rfid}) is already enrolled in the after-school program.`
          : `Student with RFID ${form.rfid} is already enrolled in the after-school program.`;

        setFormError(errorMessage);
        // ERROR TOAST for duplicate
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

      // Handle other errors
      const apiErrorMessage = createData.error || "Failed to create student";
      setFormError(apiErrorMessage);
      // ERROR TOAST for API errors
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
      const unexpectedError =
        "An unexpected error occurred during the process.";
      setFormError(unexpectedError);
      // ERROR TOAST for network/unexpected errors
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
      rfid: prev.rfid, // Keep the RFID
    }));
    setFormError(null);
  };

  return (
    <div className={`min-h-screen flex bg-${BG_COLOR}`}>
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Centered Toaster at top-center */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      {/* Add the ViewEditStudentModal component */}
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

        {/* Header with Search and Actions */}
        <header className="border-b border-gray-200 py-6 px-4 md:py-8 md:px-8 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold text-${TEXT_COLOR}`}>
              Students Roster 🧑‍🎓
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your afterschool student roster and enrollment status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 text-sm w-full md:w-48 transition-colors"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "enrolled" | "not_enrolled"
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 text-sm bg-white transition-colors"
            >
              <option value="all">All statuses</option>
              <option value="enrolled">Enrolled</option>
              <option value="not_enrolled">Pending</option>
            </select>
            <button
              className="px-5 py-2 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={() => setShowModal(true)}
            >
              <span className="hidden md:inline">+ Create Student</span>
              <span className="md:hidden">+ Add</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              Loading students...
            </div>
          ) : error ? (
            <div
              className={`text-center py-12 text-lg p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg`}
            >
              {error}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-dashed border-gray-200">
              <h2 className={`text-xl font-semibold text-${TEXT_COLOR} mb-2`}>
                No students found
              </h2>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or add a new student.
              </p>
              <button
                className={`px-5 py-2 bg-${PRIMARY_COLOR} text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold`}
                onClick={() => setShowModal(true)}
              >
                Create Student
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`bg-${PRIMARY_LIGHT} sticky top-0`}>
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}
                      >
                        Student
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}
                      >
                        RFID
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}
                      >
                        Email
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}
                      >
                        Sessions (A/P)
                      </th>
                      {/* Add Actions column */}
                      <th
                        className={`px-6 py-3 text-left text-xs font-semibold text-${TEXT_COLOR} uppercase tracking-wider`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-${PRIMARY_COLOR}`}
                            >
                              {`${student.fname?.[0] || ""}${
                                student.lname?.[0] || ""
                              }`.toUpperCase()}
                            </div>
                            <div>
                              <div
                                className={`text-sm font-semibold text-${TEXT_COLOR}`}
                              >
                                {student.fname} {student.lname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {student.rfid || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {student.email ? (
                            <a
                              href={`mailto:${student.email}`}
                              className="hover:underline text-blue-500"
                            >
                              {student.email}
                            </a>
                          ) : (
                            <span className="text-gray-400">No email</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className="text-yellow-600">
                            {" "}
                            {student.sessionsAttended ?? "0"}
                          </span>{" "}
                          /<span> </span>
                          <span className="text-green-600">
                            {student.sessionsPurchased ?? "0"}
                          </span>
                        </td>
                        {/* Add Actions cell with View/Edit button */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewEditStudent(student.id)}
                            className={`text-${PRIMARY_COLOR} hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-gray-100 flex items-center gap-1`}
                            title="View/Edit Student Details"
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                              />
                            </svg>
                            <span>View/Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Create Student Modal (Styled) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={handleModalClose}
            />

            {/* Modal */}
            <div className="relative bg-black rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-200 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                      {formStep === "rfid"
                        ? "Scan RFID Card"
                        : existingStudent
                        ? "Enroll Existing Student"
                        : "Create New Student"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {formStep === "rfid"
                        ? "Enter the student's RFID to get started"
                        : existingStudent
                        ? "Student found - Complete enrollment"
                        : "Fill in the details for the new student"}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                    onClick={handleModalClose}
                    aria-label="Close"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mt-6">
                  <div
                    className={`flex-1 h-0.5 transition-all duration-300 ${
                      formStep === "rfid" ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`flex-1 h-0.5 transition-all duration-300 ${
                      formStep === "details" ? "bg-gray-900" : "bg-gray-300"
                    }`}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="p-8">
                {formStep === "rfid" ? (
                  // STEP 1: RFID CHECK
                  <form onSubmit={handleRfidCheck} className="space-y-6">
                    {formError && (
                      <div className="p-4 border border-gray-900 bg-gray-50">
                        <p className="text-sm text-gray-900 font-medium">
                          {formError}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        RFID Card Number{" "}
                        <span className="text-gray-900">*</span>
                      </label>
                      <input
                        type="text"
                        name="rfid"
                        value={form.rfid}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-base font-mono"
                        placeholder="Scan or enter RFID..."
                        required
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Scan the student's RFID card or enter it manually
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-base disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      disabled={checkingRfid}
                    >
                      {checkingRfid ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Checking RFID...
                        </>
                      ) : (
                        <>
                          Continue
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  // STEP 2: STUDENT DETAILS FORM
                  <form onSubmit={handleCreateStudent} className="space-y-6">
                    {formError && (
                      <div className="p-4 border border-gray-900 bg-gray-50">
                        <p className="text-sm text-gray-900 font-medium">
                          {formError}
                        </p>
                      </div>
                    )}

                    {existingStudent && (
                      <div className="p-5 border-2 border-gray-900 bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 border-2 border-gray-900 bg-white flex items-center justify-center text-base font-bold text-gray-900 flex-shrink-0">
                            {`${existingStudent.fname?.[0] || ""}${
                              existingStudent.lname?.[0] || ""
                            }`.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base mb-1">
                              {existingStudent.fname} {existingStudent.lname}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {existingStudent.email || "No email"}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-2">
                              RFID: {existingStudent.rfid}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* First Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          First Name <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="fname"
                          value={form.fname}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                          required
                          disabled={!!existingStudent}
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Last Name <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="lname"
                          value={form.lname}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                          required
                          disabled={!!existingStudent}
                        />
                      </div>
                    </div>

                    {/* Email and RFID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                          disabled={!!existingStudent}
                          placeholder="student@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          RFID <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="rfid"
                          value={form.rfid}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 font-mono bg-gray-100 text-gray-700"
                          required
                          disabled
                        />
                      </div>
                    </div>

                    {/* Activity, Status, Sessions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Activity <span className="text-gray-900">*</span>
                        </label>
                        {loadingActivities ? (
                          <div className="block w-full px-4 py-3 border border-gray-300 text-gray-500 bg-gray-100 flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Loading activities...
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="block w-full px-4 py-3 border border-gray-300 text-gray-900 bg-gray-50">
                            No activities available
                          </div>
                        ) : (
                          <select
                            name="activityId"
                            value={form.activityId}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 bg-white transition-colors"
                            required
                          >
                            <option value="">Select an activity</option>
                            {activities.map((activity) => (
                              <option key={activity.id} value={activity.id}>
                                {activity.name} ({activity.dayOfWeek} -{" "}
                                {activity.startTime?.substring(11, 16)})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Enrollment Status
                        </label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 bg-white transition-colors"
                        >
                          <option value="enrolled">Enrolled</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Sessions Purchased
                      </label>
                      <input
                        type="number"
                        name="sessions"
                        min="0"
                        value={form.sessions}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleBackToRfid}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-base flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 17l-5-5m0 0l5-5m-5 5h12"
                          />
                        </svg>
                        Back
                      </button>

                      <button
                        type="submit"
                        className="flex-1 py-3 px-6 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium text-base disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        disabled={formLoading || loadingActivities}
                      >
                        {formLoading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {existingStudent
                              ? "Enroll Student"
                              : "Create Student"}
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