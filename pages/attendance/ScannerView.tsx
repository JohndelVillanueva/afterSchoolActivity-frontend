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
    <div className="space-y-5">
      {/* Success Message */}
      {showSuccess && (
        <div className="p-3.5 bg-green-50 border border-green-200/60 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-800">Attendance marked successfully.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Panel - Activity & Scan Control */}
        <div className="lg:col-span-2 space-y-5">
          {/* Activity Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Select Activity
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading activities...
              </div>
            ) : (
              <select
                value={selectedActivity}
                onChange={onActivityChange}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                disabled={isScanning}
              >
                <option value="">Choose activity</option>
                {activities.map((activity: Activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} {/* ({activity.dayOfWeek}) */}
                  </option>
                ))}
              </select>
            )}

            {selectedActivity && (
              <button
                onClick={toggleScanning}
                className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  isScanning
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-sm"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {isScanning ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Start Scanning
                  </>
                )}
              </button>
            )}
          </div>

          {/* Present Students List */}
          {selectedActivity && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Present Today
                </h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-100">
                  {presentStudents.length}
                </span>
              </div>

              {presentStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 border border-gray-100">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">No students scanned yet</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {presentStudents.map((record) => (
                    <div key={record.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {record.studentName}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">RFID: {record.rfid}</div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-3">
                          {formatTime(record.time)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Stats */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Today&apos;s Stats
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-xs text-gray-400 font-medium">Total Scans</div>
                <div className="text-2xl font-bold text-gray-900 mt-0.5">{todayStats.totalScans}</div>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <div className="text-xs text-emerald-600 font-medium">Unique Students</div>
                <div className="text-2xl font-bold text-emerald-700 mt-0.5">{todayStats.uniqueStudents}</div>
              </div>
              <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <div className="text-xs text-amber-600 font-medium">Duplicates</div>
                <div className="text-2xl font-bold text-amber-700 mt-0.5">{todayStats.duplicates}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Active Interface */}
      {isScanning && (
        <div className="relative rounded-2xl shadow-lg border-2 border-blue-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50"></div>
          <div className="relative px-8 py-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <h3 className="text-xl font-bold text-white tracking-wide">SCANNER ACTIVE</h3>
            </div>
            <p className="text-blue-200 text-sm mb-6">
              Tap an RFID card or enter the ID below
            </p>
            <form onSubmit={handleRfidSubmit} className="max-w-sm mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Waiting for RFID scan..."
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white text-lg text-center font-mono font-medium placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                autoFocus
              />
            </form>
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Scan History
          </h2>
          {scanRecords.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">
              {scanRecords.length}
            </span>
          )}
        </div>

        {scanRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">No scans yet</p>
            <p className="text-xs text-gray-400 mt-1">Start scanning to see records here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {scanRecords.map((record) => (
              <div
                key={record.id}
                className={`px-5 py-3.5 hover:bg-gray-50/50 transition-colors duration-150 ${
                  record.status === "success"
                    ? "border-l-2 border-l-emerald-400"
                    : record.status === "duplicate"
                    ? "border-l-2 border-l-amber-400"
                    : "border-l-2 border-l-red-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    record.status === "success"
                      ? "bg-emerald-100"
                      : record.status === "duplicate"
                      ? "bg-amber-100"
                      : "bg-red-100"
                  }`}>
                    {record.status === "success" ? (
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : record.status === "duplicate" ? (
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{record.studentName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{record.activity} · RFID: {record.rfid}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(record.time)}</span>
                    </div>
                    <p className={`text-xs font-medium mt-1.5 ${
                      record.status === "success"
                        ? "text-emerald-600"
                        : record.status === "duplicate"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}>
                      {record.message}
                    </p>
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