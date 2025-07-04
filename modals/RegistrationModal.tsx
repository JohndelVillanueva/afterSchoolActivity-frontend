import React, { useState } from "react";
import { type RegistrationModalProps } from "../src/types/types";

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  show,
  onClose,
  selectedActivity,
}) => {
  const [rfid, setRfid] = useState("");

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfid || !selectedActivity?.id) {
      alert("Please enter RFID and select an activity.");
      return;
    }
    const response = await fetch("http://localhost:3000/registerStudent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfid, activityId: selectedActivity.id }),
    });
    const result = await response.json();
    if (result.success) {
      alert("Registration successful!");
      onClose();
    } else {
      alert(result.error || "Registration failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-blur bg-opacity-20 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto border border-black-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-light text-gray-900">
                Join {selectedActivity?.name}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Complete the form to register
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6 space-y-3 text-sm border-b border-gray-100 pb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Schedule:</span>
              <span className="text-gray-900">
                {selectedActivity?.dayOfWeek}, {new Date(selectedActivity?.startTime || '').toLocaleTimeString()} - {new Date(selectedActivity?.endTime || '').toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Coach:</span>
              <span className="text-gray-900">
                {selectedActivity?.coachName || 'No coach'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span className="text-gray-900">
                {selectedActivity?.location || 'No location'}
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="rfid"
                className="block text-sm font-normal text-gray-700 mb-1"
              >
                RFID
              </label>
              <input
                type="number"
                id="rfid"
                value={rfid}
                onChange={e => setRfid(e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                required
              />
            </div>
            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3 bg-gray-900 text-white hover:bg-gray-700 transition-colors text-sm"
              >
                Register for {selectedActivity?.name}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;