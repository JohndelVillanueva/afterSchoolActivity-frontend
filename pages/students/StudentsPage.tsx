import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/SideBar";
import { API_BASE_URL } from "../../src/types/types";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import ViewEditStudentModal from "../../modals/ViewEditStudentModal";

// --- INTERFACES ---
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

interface FormState {
  fname: string;
  lname: string;
  email: string;
  rfid: string;
  sessions: string;
  activityId: string;
}

// --- STYLES & CONSTANTS ---
const STYLES = {
  container: "min-h-screen flex bg-gray-50/80",
  inputBase: "block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400",
  inputDisabled: "bg-gray-50 text-gray-500",
  btnPrimary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200",
  btnSecondary: "px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm",
  btnAction: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm",
  pageTitle: "text-2xl font-bold text-gray-900",
  label: "block text-sm font-medium text-gray-700 mb-1.5",
  meta: "text-xs text-gray-500",
  badgeBlue: "bg-blue-100 text-blue-700 rounded-md text-xs font-semibold border border-blue-100",
  badgeAmber: "bg-amber-50 text-amber-700 rounded-md text-xs font-semibold border border-amber-100",
};

const initialFormState: FormState = {
  fname: "", lname: "", email: "", rfid: "", sessions: "", activityId: "",
};
const PAGE_SIZE = 20;

// --- HELPER FUNCTIONS ---

// Helper to create an acronym from the activity name (e.g., "Basketball" -> "BAS")
const getAcronym = (name: string) => (name || "ACT").substring(0, 3).toUpperCase();

// --- HELPER COMPONENTS ---

// Session Display Component (Fixed Length & Clean Layout)
const SessionDisplay: React.FC<{ 
  student: Student; 
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ student, isExpanded, onToggle }) => {
  const hasMultipleSessions = (student.sessionCount ?? 0) > 1;
  const sessions = student.sessions || [];

  const getProgressColor = (percent: number) => 
    percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-blue-500' : 'bg-amber-500';

  // --- COMPACT VIEW (Top Summary) ---
  if (!hasMultipleSessions && sessions.length <= 1) {
    const progress = student.sessionsPurchased 
      ? Math.min(((student.sessionsAttended ?? 0) / student.sessionsPurchased) * 100, 100) 
      : 0;

    return (
      <div className="flex items-center w-full gap-3">
        {/* Progress Bar: Takes full available width (flex-1) */}
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`} style={{ width: `${progress}%` }} />
        </div>
        
        {/* Text: Fixed width to prevent shrinking the bar */}
        <div className="flex-shrink-0 text-right text-xs font-semibold text-gray-600 w-[85px]">
          {student.sessionsAttended ?? 0} / {student.sessionsPurchased ?? 0}
        </div>
      </div>
    );
  }

  // --- EXPANDED VIEW (Multiple Activities) ---
  const totalProgress = student.sessionsPurchased
    ? Math.min(((student.sessionsAttended ?? 0) / student.sessionsPurchased) * 100, 100) 
    : 0;

  const getDayColor = (day: string) => {
    const map: Record<string, string> = {
      'Monday': 'bg-blue-100 text-blue-800', 'Tuesday': 'bg-purple-100 text-purple-800',
      'Wednesday': 'bg-green-100 text-green-800', 'Thursday': 'bg-orange-100 text-orange-800',
      'Friday': 'bg-pink-100 text-pink-800', 'Saturday': 'bg-yellow-100 text-yellow-800',
      'Sunday': 'bg-red-100 text-red-800',
    };
    return map[day] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full">
      {/* Summary Header (Total Progress) */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 group/summary hover:bg-slate-50 rounded-xl p-2.5 -m-2.5 transition-colors duration-200"
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
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(totalProgress)}`} style={{ width: `${totalProgress}%` }} />
          </div>
        </div>
        {/* Chevron */}
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* List of Sessions */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {sessions.map((session) => {
            const sessionProgress = session.sessionsPurchased 
              ? Math.min((session.sessionsAttended / session.sessionsPurchased) * 100, 100) 
              : 0;
            
            return (
              <div
                key={session.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors duration-200"
              >
                {/* Acronym Badge: Fixed width (w-10) to ensure consistent bar lengths */}
                <div className="flex-shrink-0 w-10 h-8 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-xs font-bold border border-blue-200 shadow-sm">
                  {getAcronym(session.activityName)}
                </div>

                {/* Progress Bar: Takes remaining space (flex-1) */}
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(sessionProgress)}`}
                    style={{ width: `${sessionProgress}%` }}
                  />
                </div>

                {/* Stats Text: Fixed width (w-[75px]) */}
                <div className="flex-shrink-0 text-right text-xs font-semibold text-gray-600 w-[75px] leading-tight">
                  <div>{session.sessionsAttended} attended</div>
                  <div className="text-gray-400 font-normal text-[11px]">{session.sessionsPurchased} total</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 2. Create Student Modal Component
const CreateStudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onRfidCheck: (rfid: string) => void;
  onCreateStudent: () => void;
  formState: FormState;
  formStep: "rfid" | "details";
  existingStudent: Student | null;
  checkingRfid: boolean;
  loadingActivities: boolean;
  activities: Activity[];
  error: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBackToRfid: () => void;
}> = ({ isOpen, onClose, onRfidCheck, onCreateStudent, formState, formStep, existingStudent, checkingRfid, loadingActivities, activities, error, onInputChange, onBackToRfid }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {formStep === "rfid" ? "Scan RFID Card" : existingStudent ? "Enroll Existing Student" : "Create New Student"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {formStep === "rfid" ? "Enter student's RFID to get started" : existingStudent ? "Complete enrollment details" : "Fill in student details"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formStep === "rfid" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600"}`}>
                {formStep === "details" ? "✓" : "1"}
              </div>
              <span className={`text-xs font-medium ${formStep === "rfid" ? "text-gray-900" : "text-gray-500"}`}>RFID</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${formStep === "details" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
              <span className={`text-xs font-medium ${formStep === "details" ? "text-gray-900" : "text-gray-400"}`}>Details</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl mb-5"><p className="text-sm text-red-700 font-medium">{error}</p></div>}

          {formStep === "rfid" ? (
            <form onSubmit={(e) => { e.preventDefault(); onRfidCheck(formState.rfid); }} className="space-y-5">
              <div>
                <label className={`${STYLES.label}`}>RFID Card Number <span className="text-red-500">*</span></label>
                <input type="text" name="rfid" value={formState.rfid} onChange={onInputChange} inputMode="numeric" pattern="[0-9]*" className={`${STYLES.inputBase} text-base font-mono`} placeholder="Scan or enter RFID..." autoFocus />
                <p className="text-xs text-gray-400 mt-2">Scan student's RFID card or enter it manually</p>
              </div>
              <button type="submit" disabled={checkingRfid} className={`${STYLES.btnPrimary} w-full py-3 px-6 flex items-center justify-center gap-2`}>
                {checkingRfid ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Checking...</>
                ) : (
                  <>Continue<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); onCreateStudent(); }} className="space-y-5">
              {existingStudent && (
                <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {`${existingStudent.fname?.[0] || ""}${existingStudent.lname?.[0] || ""}`.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{existingStudent.fname} {existingStudent.lname}</h3>
                      <p className="text-xs text-gray-500 truncate">{existingStudent.email || "No email"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${STYLES.label}`}>First Name <span className="text-red-500">*</span></label>
                  <input type="text" name="fname" value={formState.fname} onChange={onInputChange} className={`${STYLES.inputBase} disabled:bg-gray-50 disabled:text-gray-500`} required disabled={!!existingStudent} />
                </div>
                <div>
                  <label className={`${STYLES.label}`}>Last Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lname" value={formState.lname} onChange={onInputChange} className={`${STYLES.inputBase} disabled:bg-gray-50 disabled:text-gray-500`} required disabled={!!existingStudent} />
                </div>
              </div>

              {/* EMAIL FIELD - NOW EDITABLE (removed the disabled prop) */}
              <div>
                <label className={`${STYLES.label}`}>Email</label>
                <input type="email" name="email" value={formState.email} onChange={onInputChange} className={`${STYLES.inputBase} placeholder:text-gray-400`} placeholder="student@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${STYLES.label}`}>Activity <span className="text-red-500">*</span></label>
                  {loadingActivities ? (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Loading...
                    </div>
                  ) : (
                    <select name="activityId" value={formState.activityId} onChange={onInputChange} className={`${STYLES.inputBase}`} required>
                      <option value="">Select activity</option>
                      {activities.map((act) => (<option key={act.id} value={act.id}>{act.name} ({act.dayOfWeek} - {act.startTime?.substring(11, 16)})</option>))}
                    </select>
                  )}
                </div>
                <div>
                  <label className={`${STYLES.label}`}>Sessions <span className="text-red-500">*</span></label>
                  <input type="number" name="sessions" min="1" max="99" value={formState.sessions} onChange={onInputChange} className={STYLES.inputBase} placeholder="e.g., 10" required />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onBackToRfid} className={`${STYLES.btnSecondary} flex items-center gap-1.5`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg> Back
                </button>
                <button type="submit" className={`${STYLES.btnPrimary} flex-1 py-2.5 px-6 flex items-center justify-center gap-2`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {existingStudent ? "Enroll Student" : "Create Student"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const StudentsPage: React.FC = () => {
  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formStep, setFormStep] = useState<"rfid" | "details">("rfid");
  const [existingStudent, setExistingStudent] = useState<Student | null>(null);
  const [checkingRfid, setCheckingRfid] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Handlers
  const handleSidebarToggle = (collapsed: boolean) => setSidebarCollapsed(collapsed);

  const toggleSessionExpand = (studentId: number) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      newSet.has(studentId) ? newSet.delete(studentId) : newSet.add(studentId);
      return newSet;
    });
  };

  // Data Fetching
  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    // Use the dedicated students endpoint
    fetch(`${API_BASE_URL}/getAllStudents`)
      .then(res => res.json())
      .then(result => {
        console.log('API Response:', result); // Debug log
        if (result.success) {
          // The backend now returns all the session data
          setStudents(result.data || []);
        } else {
          setError("Failed to load students.");
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError("Failed to load students.");
      })
      .finally(() => setLoading(false));
  };
  

  const fetchActivities = () => {
    setLoadingActivities(true);
    fetch(`${API_BASE_URL}/getAllActivities`)
      .then(res => res.json())
      .then(result => { if (result.success) setActivities(result.data || []); })
      .catch(console.error)
      .finally(() => setLoadingActivities(false));
  };

  useEffect(() => { fetchStudents(); fetchActivities(); }, []);

  // Computed
  const filteredStudents = useMemo(() => 
    students.filter(s => `${s.fname} ${s.lname}`.toLowerCase().includes(search.toLowerCase())),
  [students, search]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const startEntry = filteredStudents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(currentPage * PAGE_SIZE, filteredStudents.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Modal Handlers
  const handleViewEditStudent = (id: number) => { setSelectedStudentId(id); setShowViewEditModal(true); };
  const handleViewEditModalClose = () => { setShowViewEditModal(false); setSelectedStudentId(null); };
  const handleStudentUpdateSuccess = () => { fetchStudents(); handleViewEditModalClose(); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "rfid" && !/^\d*$/.test(value)) return;
    if (name === "sessions" && !/^\d{0,2}$/.test(value)) return;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRfidCheck = async (rfid: string) => {
    if (!rfid.trim()) return setFormError("Please enter an RFID.");
    setCheckingRfid(true);
    setFormError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getAllUsers`);
      const result = await res.json();
      if (result.success && result.data) {
        const existing = result.data.find((u: any) => u.rfid && u.rfid.trim() === rfid.trim());
        if (existing) {
          setExistingStudent(existing);
          setForm(prev => ({ ...prev, fname: existing.fname, lname: existing.lname, email: existing.email }));
          toast(`Student found: ${existing.fname} ${existing.lname}`, { icon: "ℹ️", style: { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", fontWeight: "500" } });
        } else {
          setExistingStudent(null);
          toast("New RFID - Please fill in student details", { icon: "📝", style: { background: "#fef3c7", border: "1px solid #fde047", color: "#92400e", fontWeight: "500" }});
        }
        setFormStep("details");
      }
    } catch (err) {
      setFormError("Failed to check RFID. Please try again.");
      toast.error("Failed to check RFID");
    } finally {
      setCheckingRfid(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!form.fname || !form.lname || !form.rfid || !form.activityId || !form.sessions) {
      return setFormError("Please provide all required fields.");
    }
    setFormLoading(true);
    try {
      const selectedActivity = activities.find(a => a.id === Number(form.activityId));
      const payload = {
        rfid: form.rfid.trim(),
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        activityId: Number(form.activityId),
        sessionDate: selectedActivity?.startTime ? new Date(selectedActivity.startTime).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        sessionsPurchased: Number(form.sessions),
      };

      const res = await fetch(`${API_BASE_URL}/createStudent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (res.ok) {
        toast.success("Student created and enrolled successfully!");
        setShowModal(false);
        setForm(initialFormState);
        setFormStep("rfid");
        setExistingStudent(null);
        fetchStudents();
      } else if (res.status === 409) {
        setFormError(data.details?.existingStudent ? `${data.details.existingStudent.name} is already enrolled.` : "Student is already enrolled.");
      } else {
        setFormError(data.error || "Failed to create student");
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
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
    setForm(prev => ({ ...initialFormState, rfid: prev.rfid }));
    setFormError(null);
  };

  // Render
  return (
    <div className={STYLES.container}>
      <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: "#fff", color: "#363636", boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)", borderRadius: "12px", fontSize: "14px", fontWeight: "500" } }} />
      
      {showViewEditModal && selectedStudentId && (
        <ViewEditStudentModal isOpen={showViewEditModal} onClose={handleViewEditModalClose} studentId={selectedStudentId} onUpdateSuccess={handleStudentUpdateSuccess} />
      )}

      <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"} flex flex-col`}>
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="flex items-center px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="mr-3 p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Students</span>
            </div>
            {!loading && students.length > 0 && <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">{students.length}</span>}
          </div>
        </div>

        {/* Page Header */}
        <div className="px-4 md:px-8 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h1 className={STYLES.pageTitle}>Students</h1>
                <p className="text-sm text-gray-500 mt-0.5">{loading ? "Loading..." : `${students.length} students enrolled`}</p>
              </div>
            </div>
            <button className={`${STYLES.btnPrimary} inline-flex items-center gap-2 px-5 py-2.5`} onClick={() => setShowModal(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add Student
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 md:px-8 py-4">
          <div className="relative max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400`} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative"><div className="w-14 h-14 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div></div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading students...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/60 rounded-2xl p-6 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Students</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button onClick={fetchStudents} className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200">Try Again</button>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-sm text-sm">{search ? "Try adjusting your search query" : "Get started by adding your first student to the roster"}</p>
              {!search && <button className={`${STYLES.btnPrimary} inline-flex items-center gap-2 px-5 py-2.5`} onClick={() => setShowModal(true)}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Add First Student</button>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead><tr className="bg-gray-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">RFID</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[240px]">Sessions</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedStudents.map((student) => (
                      <tr key={student.id} className={`hover:bg-blue-50/30 transition-colors duration-150 ${expandedSessions.has(student.id) ? 'bg-blue-50/20' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
                                {`${student.fname?.[0] || ""}${student.lname?.[0] || ""}`.toUpperCase()}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                              {(student.sessionCount ?? 0) > 1 && (
                                <div className="absolute -top-1 -left-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center"><span className="text-[8px] text-white font-bold">{student.sessionCount}</span></div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{student.fname} {student.lname}</div>
                              <div className="text-xs text-gray-400 font-mono">#{student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-gray-50 text-gray-600 border border-gray-200/60">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            {student.rfid || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {student.email ? <span className="text-sm text-gray-600 truncate block max-w-[200px]">{student.email}</span> : <span className="text-sm text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <SessionDisplay student={student} isExpanded={expandedSessions.has(student.id)} onToggle={() => toggleSessionExpand(student.id)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button onClick={() => handleViewEditStudent(student.id)} className={`${STYLES.btnAction}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-gray-400">
                    Showing <span className="font-semibold text-gray-600">{startEntry}-{endEntry}</span> of <span className="font-semibold text-gray-600">{filteredStudents.length}</span> students
                    {search && (
                      <button onClick={() => setSearch("")} className="ml-2 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Clear search
                      </button>
                    )}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                      .map((page, index, arr) => (
                        <React.Fragment key={page}>
                          {index > 0 && arr[index - 1] !== page - 1 && (
                            <span className="px-1 text-xs text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[32px] px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateStudentModal
        isOpen={showModal}
        onClose={handleModalClose}
        onRfidCheck={handleRfidCheck}
        onCreateStudent={handleCreateStudent}
        formState={form}
        formStep={formStep}
        existingStudent={existingStudent}
        checkingRfid={checkingRfid}
        loadingActivities={loadingActivities}
        activities={activities}
        error={formError}
        onInputChange={handleInputChange}
        onBackToRfid={handleBackToRfid}
      />
    </div>
  );
};

export default StudentsPage;