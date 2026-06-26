import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../src/types/types";
import toast from "react-hot-toast";

interface StudentDetails {
  id: number;
  fname: string;
  lname: string;
  email: string;
  username: string;
  rfid: string;
  grade: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  medicalNotes: string;
  isEnrolledInAfterSchool: boolean;
  sessionsPurchased: number;
  sessionsAttended: number;
  sessionsRemaining: number;
  createdAt: string;
  updatedAt: string;
  activities: Array<{
    id: number;
    name: string;
    dayOfWeek: string;
    startTime: string;
    enrolledDate: string;
  }>;
  attendanceHistory: Array<{
    date: string;
    activityName: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
  }>;
}

interface ViewEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  onUpdateSuccess?: () => void;
}

const ViewEditStudentModal: React.FC<ViewEditStudentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  onUpdateSuccess,
}) => {
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const [formData, setFormData] = useState<any>({});
  const [originalSessionsPurchased, setOriginalSessionsPurchased] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/getStudentDetails/${studentId}`
      );
      const result = await response.json();

      if (result.success) {
        setStudentDetails(result.data);
        setFormData(result.data); // Sync form data immediately
        setOriginalSessionsPurchased(result.data.sessionsPurchased);
      } else {
        setError('Failed to load student details');
        toast.error("Failed to load student details");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setError('Failed to load student details');
      toast.error("Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!studentDetails) return;

    setSaving(true);
    setError(null);
    
    try {
      const newSessionsPurchased = Number(formData.sessionsPurchased) || 0;
      const sessionDifference = newSessionsPurchased - originalSessionsPurchased;
      const newSessionsRemaining = (studentDetails.sessionsRemaining || 0) + sessionDifference;
      
      const dataToSave = {
        ...formData,
        sessionsPurchased: newSessionsPurchased,
        sessionsRemaining: newSessionsRemaining,
      };

      const response = await fetch(
        `${API_BASE_URL}/updateStudent/${studentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSave),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Student updated successfully!");
        setStudentDetails(dataToSave);
        setFormData(dataToSave);
        setOriginalSessionsPurchased(newSessionsPurchased);
        setViewMode("view");
        onUpdateSuccess?.();
      } else {
        setError(result.message || "Failed to update student");
        toast.error(result.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setError("An unexpected error occurred");
      toast.error("Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (fname: string, lname: string) => {
    return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDay = (day?: string) => {
    if (!day) return '';
    return day.substring(0, 3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Loading...' : 'Student Details'}
              </h2>
              {!loading && studentDetails && (
                <p className="text-sm text-gray-500 mt-1">
                  {viewMode === "view" ? "View student information" : "Edit student information"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {viewMode === "view" && (
                <button
                  onClick={() => setViewMode("edit")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Edit
                </button>
              )}
              {viewMode === "edit" && (
                <button
                  onClick={() => {
                    setViewMode("view");
                    setFormData(studentDetails);
                    setOriginalSessionsPurchased(studentDetails?.sessionsPurchased || 0);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-[3px] border-blue-100 rounded-full animate-spin border-t-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading student details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/60 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchStudentDetails}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : studentDetails ? (
            <div className="space-y-6">
              
              {/* Student Profile Card */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100/50">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                  {getInitials(formData.fname || studentDetails.fname, formData.lname || studentDetails.lname)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {formData.fname || studentDetails.fname} {formData.lname || studentDetails.lname}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">ID: #{studentDetails.id}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-mono font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      {studentDetails.rfid || "No RFID"}
                    </span>
                    {formData.grade && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        Grade: {formData.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.fname}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="fname"
                        value={formData.fname || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.lname}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="lname"
                        value={formData.lname || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.email || "Not provided"}
                      </div>
                    ) : (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.dateOfBirth ? formatDate(studentDetails.dateOfBirth) : "Not provided"}
                      </div>
                    ) : (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent/Guardian Name</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.parentName || "Not provided"}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Phone</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.parentPhone || "Not provided"}
                      </div>
                    ) : (
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.address || "Not provided"}
                      </div>
                    ) : (
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        rows={2}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Emergency Contact</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.emergencyContact || "Not provided"}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Email</label>
                    {viewMode === "view" ? (
                      <div className="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-transparent">
                        {studentDetails.parentEmail || "Not provided"}
                      </div>
                    ) : (
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail || ""}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Notes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical Notes
                </h4>
                {viewMode === "view" ? (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap min-h-[80px]">
                    {studentDetails.medicalNotes || "No medical notes provided"}
                  </div>
                ) : (
                  <textarea
                    name="medicalNotes"
                    value={formData.medicalNotes || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                    placeholder="Enter any medical notes or allergies..."
                  />
                )}
              </div>

              {/* Enrolled Activities */}
              {studentDetails.activities && studentDetails.activities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enrolled Activities
                  </h4>
                  <div className="space-y-2">
                    {studentDetails.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200/60 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">
                              {activity.name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDay(activity.dayOfWeek)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(activity.startTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          Since {formatDate(activity.enrolledDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                   <div className="flex justify-between">
                     <span className="text-gray-500">Username:</span>
                     <span className="font-medium text-gray-700">{studentDetails.username || '-'}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Created:</span>
                     <span className="font-medium text-gray-700">{formatDate(studentDetails.createdAt)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Last Updated:</span>
                     <span className="font-medium text-gray-700">{formatDate(studentDetails.updatedAt)}</span>
                   </div>
                </div>
              </div>

              {/* Action Buttons (Bottom Sticky) */}
              {viewMode === "edit" && (
                <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white/95 backdrop-blur z-20 pb-2">
                  <button
                    onClick={() => {
                      setViewMode("view");
                      setFormData(studentDetails);
                      setOriginalSessionsPurchased(studentDetails?.sessionsPurchased || 0);
                    }}
                    className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 px-6 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold text-sm rounded-xl disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                  >
                    {saving ? (
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
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewEditStudentModal;