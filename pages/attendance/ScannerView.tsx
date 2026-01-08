import React, { type RefObject } from "react";
import type { Activity } from "../../src/types/types";

interface ScanRecord {
  id: string;
  studentName: string;
  activity: string;
  rfid: string;
  time: string;
  status: "success" | "error" | "duplicate";
  message: string;
}

interface TodayStats {
  totalScans: number;
  uniqueStudents: number;
  duplicates: number;
}

interface ScannerViewProps {
  activities: Activity[];
  selectedActivity: string;
  // onMarkAttendance: (ScanRecord: ScanRecord, status: "present" | "absent") => void;
  onActivityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loading: boolean;
  isScanning: boolean;
  toggleScanning: () => void;
  rfidInput: string;
  setRfidInput: (value: string) => void;
  handleRfidSubmit: (e: React.FormEvent) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  todayStats: TodayStats;
  scanRecords: ScanRecord[];
  formatTime: (isoString: string) => string;
  showSuccess: boolean;
}

const ScannerView: React.FC<ScannerViewProps> = ({
  activities,
  selectedActivity,
  onActivityChange,
  loading,
  isScanning,
  toggleScanning,
  rfidInput,
  setRfidInput,
  handleRfidSubmit,
  inputRef,
  todayStats,
  scanRecords,
  formatTime,
  showSuccess,
}) => {
  // Filter attendance records for selected activity
  const today = new Date().toISOString().split("T")[0];
  const activityName =
    activities.find((a) => a.id.toString() === selectedActivity)?.name || "";

  const presentStudents = scanRecords.filter(
    (record) =>
      record.status === "success" &&
      record.activity === activityName &&
      record.time.split("T")[0] === today
  );

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-sm font-medium">
          <span role="img" aria-label="success">
            ✅
          </span>{" "}
          Attendance marked successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Selection */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Select Activity
          </h2>
          {loading ? (
            <div className="text-gray-400">Loading activities...</div>
          ) : (
            <select
              value={selectedActivity}
              onChange={onActivityChange}
              className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-lg text-gray-800 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={isScanning}
            >
              <option value="">-- Choose Activity --</option>
              {activities.map((activity: Activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name} ({activity.dayOfWeek})
                </option>
              ))}
            </select>
          )}

          {selectedActivity && (
            <div className="mt-6">
              <button
                onClick={toggleScanning}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                  isScanning
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                }`}
              >
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">⏹</span> Stop Scanning
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>▶️</span> Start Scanning
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Present Students List */}
          {selectedActivity && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">✅</span>
                Present Today ({presentStudents.length})
              </h3>
              {presentStudents.length === 0 ? (
                <div className="text-center py-4 text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                  No students marked present yet
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200">
                  <div className="divide-y divide-gray-200">
                    {presentStudents.map((record) => (
                      <div
                        key={record.id}
                        className="px-4 py-3 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-green-500 text-xl">✓</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {record.studentName}
                              </div>
                              <div className="text-xs text-gray-500">
                                RFID: {record.rfid}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTime(record.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today's Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Today's Stats
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
              <div className="text-blue-700 text-sm font-semibold uppercase tracking-wide">
                Total Scans
              </div>
              <div className="text-gray-800 text-3xl font-black mt-1">
                {todayStats.totalScans}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg p-4 border border-green-500/30">
              <div className="text-green-700 text-sm font-semibold uppercase tracking-wide">
                Unique Students
              </div>
              <div className="text-gray-800 text-3xl font-black mt-1">
                {todayStats.uniqueStudents}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-yellow-700 text-sm font-semibold uppercase tracking-wide">
                Duplicates
              </div>
              <div className="text-gray-800 text-3xl font-black mt-1">
                {todayStats.duplicates}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Interface */}
      {isScanning && (
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl p-8 border-4 border-blue-400">
          <div className="text-center">
            <div className="text-white text-6xl mb-4 animate-bounce">📱</div>
            <h3 className="text-2xl font-black text-white mb-2">
              SCANNER ACTIVE
            </h3>
            <p className="text-blue-100 text-lg mb-6">
              Tap your RFID card or enter ID below
            </p>
            <form onSubmit={handleRfidSubmit} className="max-w-md mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Waiting for RFID scan..."
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white text-xl text-center font-bold placeholder-white/60 focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-white"
                autoFocus
              />
            </form>
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Scan History
        </h2>

        {scanRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">👋</div>
            <p className="text-xl font-medium">No scans yet today</p>
            <p className="text-sm mt-2">Start scanning to see records here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {scanRecords.map((record) => (
              <div
                key={record.id}
                className={`rounded-lg p-4 border-l-4 transition-all ${
                  record.status === "success"
                    ? "bg-green-50 border-green-500"
                    : record.status === "duplicate"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {record.status === "success"
                          ? "✅"
                          : record.status === "duplicate"
                          ? "⚠️"
                          : "❌"}
                      </span>
                      <div>
                        <div className="text-gray-800 font-bold text-lg">
                          {record.studentName}
                        </div>
                        <div className="text-gray-600 text-sm">
                          RFID: {record.rfid}
                        </div>
                      </div>
                    </div>
                    <div className="ml-11">
                      <div className="text-gray-700 text-sm mb-1">
                        {record.activity}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          record.status === "success"
                            ? "text-green-700"
                            : record.status === "duplicate"
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}
                      >
                        {record.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-xs">
                      {formatTime(record.time)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerView;