import React, { useState } from "react";
import { type RegistrationModalProps } from "../src/types/types";
import { useToast } from '../components/ToastProvider';
import { API_BASE_URL } from '../src/types/types';

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  show,
  onClose,
  selectedActivity,
}) => {
  const [rfid, setRfid] = useState("");
  const { success, error } = useToast();

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfid || !selectedActivity?.id) {
      error("Please enter RFID and select an activity.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/registerStudent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfid, activityId: selectedActivity.id }),
      });
      const result = await response.json();
      if (result.success) {
        success("Registration successful!");
        onClose();
      } else {
        error(result.error || "Registration failed.");
      }
    } catch (e) {
      error("Network error. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-blur bg-opacity-30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Join {selectedActivity?.name}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              Complete the form to register
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
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
        <div className="p-8">
          {/* Activity Details Card */}
          <div className="mb-8 bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-3 text-sm flex flex-col">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span className="font-medium">Schedule:</span>
              <span className="text-gray-900 ml-1">
                {selectedActivity?.dayOfWeek}, {selectedActivity?.startTime ? new Date(selectedActivity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''} - {selectedActivity?.endTime ? new Date(selectedActivity.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="font-medium">Coach:</span>
              <span className="text-gray-900 ml-1">{selectedActivity?.coachName || 'No coach'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="font-medium">Location:</span>
              <span className="text-gray-900 ml-1">{selectedActivity?.location || 'No location'}</span>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="rfid"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                RFID
              </label>
              <input
                type="number"
                id="rfid"
                value={rfid}
                onChange={e => setRfid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                required
                autoFocus
              />
            </div>
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Register for {selectedActivity?.name}
              </button>
            </div>
          </form>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RegistrationModal;