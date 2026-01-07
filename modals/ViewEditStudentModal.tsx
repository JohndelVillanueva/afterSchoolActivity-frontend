import React, { useState, useEffect } from "react";

// Mock toast for demonstration
const toast = {
  error: (msg) => console.error(msg),
  success: (msg) => console.log(msg)
};

import { API_BASE_URL } from "../src/types/types";


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
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");
  const [formData, setFormData] = useState<any>({});
  const [originalSessionsPurchased, setOriginalSessionsPurchased] = useState(0);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/getStudentDetails/${studentId}`
      );
      const result = await response.json();

      if (result.success) {
        setStudentDetails(result.data);
        setFormData(result.data);
        setOriginalSessionsPurchased(result.data.sessionsPurchased);
      } else {
        toast.error("Failed to load student details");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
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
    
    // Just update the value without auto-calculation
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!studentDetails) return;

    setLoading(true);
    try {
      // Calculate the difference and update sessionsRemaining before saving
      const newSessionsPurchased = Number(formData.sessionsPurchased) || 0;
      const sessionDifference = newSessionsPurchased - originalSessionsPurchased;
      const newSessionsRemaining = (studentDetails.sessionsRemaining || 0) + sessionDifference;
      
      console.log('📊 Session Calculation on Save:');
      console.log('  Original Sessions Purchased:', originalSessionsPurchased);
      console.log('  New Sessions Purchased:', newSessionsPurchased);
      console.log('  Difference:', sessionDifference);
      console.log('  Original Sessions Remaining:', studentDetails.sessionsRemaining);
      console.log('  New Sessions Remaining:', newSessionsRemaining);
      console.log('---');

      // Update formData with calculated sessionsRemaining
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
        toast.error(result.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-blur bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {viewMode === "view" ? "Student Details" : "Edit Student"}
                </h2>
                {studentDetails && (
                  <p className="text-sm text-gray-600">
                    {studentDetails.fname} {studentDetails.lname}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (viewMode === "edit") {
                      setViewMode("view");
                      setFormData(studentDetails);
                      setOriginalSessionsPurchased(studentDetails?.sessionsPurchased || 0);
                    } else {
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {viewMode === "edit" ? "Cancel" : "Close"}
                </button>
                {viewMode === "view" ? (
                  <button
                    onClick={() => setViewMode("edit")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : studentDetails ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">{studentDetails.fname}</p>
                      ) : (
                        <input
                          type="text"
                          name="fname"
                          value={formData.fname || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">{studentDetails.lname}</p>
                      ) : (
                        <input
                          type="text"
                          name="lname"
                          value={formData.lname || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.email || "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RFID
                      </label>
                      <p className="text-gray-900 font-mono">
                        {studentDetails.rfid || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.grade || "Not specified"}
                        </p>
                      ) : (
                        <input
                          type="text"
                          name="grade"
                          value={formData.grade || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.dateOfBirth
                            ? formatDate(studentDetails.dateOfBirth)
                            : "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent/Guardian Name
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.parentName || "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="text"
                          name="parentName"
                          value={formData.parentName || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Phone
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.parentPhone || "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="tel"
                          name="parentPhone"
                          value={formData.parentPhone || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.address || "Not provided"}
                        </p>
                      ) : (
                        <textarea
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.emergencyContact || "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="text"
                          name="emergencyContact"
                          value={formData.emergencyContact || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Email
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.parentEmail || "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      {viewMode === "view" ? (
                        <p className="text-gray-900">
                          {studentDetails.username || "Not provided"}
                        </p>
                      ) : (
                        <input
                          type="text"
                          name="username"
                          value={formData.username || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Sessions Information
                  </h3>
                  {viewMode === "edit" && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800 font-semibold mb-2">
                        💡 How it works:
                      </p>
                      <div className="text-xs text-green-700 space-y-1">
                        <p><strong>Edit Sessions Purchased</strong> and when you click <strong>"Save Changes"</strong>, Sessions Remaining will automatically update based on the difference.</p>
                        <p><strong>Formula:</strong> New Remaining = Original Remaining + (New Purchased - Original Purchased)</p>
                        <p><strong>Example:</strong> If you change Purchased from 20 → 25, then Remaining will increase by +5 when you save.</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded border">
                      {viewMode === "view" ? (
                        <>
                          <div className="text-2xl font-bold text-green-600">
                            {studentDetails.sessionsPurchased}
                          </div>
                          <div className="text-sm text-gray-600">
                            Sessions Purchased
                          </div>
                        </>
                      ) : (
                        <>
                          <input
                            type="number"
                            name="sessionsPurchased"
                            value={formData.sessionsPurchased}
                            onChange={handleInputChange}
                            className="text-2xl font-bold text-green-600 w-full text-center border-2 border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                            min="0"
                          />
                          <div className="text-sm text-gray-600 mt-2">
                            Sessions Purchased
                          </div>
                          <div className="text-xs text-green-600 mt-1 font-semibold">
                            ✏️ Edit this field
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-2xl font-bold text-yellow-600">
                        {studentDetails.sessionsAttended}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sessions Attended
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        (Read-only)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded border">
                      <div className="text-2xl font-bold text-blue-600">
                        {studentDetails.sessionsRemaining}
                      </div>
                      <div className="text-sm text-gray-600">
                        Sessions Remaining
                      </div>
                      {viewMode === "edit" && (
                        <div className="text-xs text-blue-600 mt-1 font-semibold">
                          (Updates on save)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Medical Notes
                  </h3>
                  {viewMode === "view" ? (
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {studentDetails.medicalNotes || "No medical notes provided"}
                    </p>
                  ) : (
                    <textarea
                      name="medicalNotes"
                      value={formData.medicalNotes || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter any medical notes or allergies..."
                    />
                  )}
                </div>

                {studentDetails.activities &&
                  studentDetails.activities.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Enrolled Activities
                      </h3>
                      <div className="space-y-2">
                        {studentDetails.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex justify-between items-center p-3 bg-white rounded border"
                          >
                            <div>
                              <span className="font-medium text-gray-800">
                                {activity.name}
                              </span>
                              <span className="text-sm text-gray-600 ml-3">
                                {activity.dayOfWeek} at {activity.startTime}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              Enrolled: {formatDate(activity.enrolledDate)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    System Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created Date
                      </label>
                      <p className="text-gray-900">
                        {studentDetails.createdAt
                          ? formatDate(studentDetails.createdAt)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {studentDetails.updatedAt
                          ? formatDate(studentDetails.updatedAt)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No student data found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewEditStudentModal;