import React, { useEffect, useState } from "react";
import Sidebar from "../../components/SideBar";
import { API_BASE_URL } from "../../src/types/types";

interface AttendanceRecord {
  id: string;
  studentName: string;
  activity: string;
  date: string;
  time: string;
  status: "present" | "absent";
  rfid?: string;
}

const RECORDS_PER_PAGE = 12;

const ReportsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<keyof AttendanceRecord>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/getAllAttendanceTransactions`);
      const result = await res.json();

      if (result.success) {
        setAttendanceRecords(result.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
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
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Hamburger button for mobile
  const MobileTopBar = (
    <div className="md:hidden flex items-center bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-500 px-4 py-3 sticky top-0 z-30 shadow-lg">
      <button
        className="mr-3 p-2 rounded-md bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg
          className="w-6 h-6 text-white"
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
      <span className="text-lg font-bold text-white">Attendance Reports</span>
    </div>
  );

  // Filtered records
  const filteredRecords = attendanceRecords.filter((record) => {
    const searchLower = search.toLowerCase();
    const recordDate = formatDate(record.date).toLowerCase();
    const recordTime = record.time ? formatTime(record.time).toLowerCase() : "";

    const matchesSearch =
      record.studentName.toLowerCase().includes(searchLower) ||
      (record.rfid && record.rfid.includes(search)) ||
      record.activity.toLowerCase().includes(searchLower) ||
      record.status.toLowerCase().includes(searchLower) ||
      recordDate.includes(searchLower) ||
      recordTime.includes(searchLower) ||
      record.date.includes(search); // Also search raw date format

    const matchesStart = !startDate || record.date >= startDate;
    const matchesEnd = !endDate || record.date <= endDate;
    return matchesSearch && matchesStart && matchesEnd;
  });

 const sortedRecords = [...filteredRecords].sort((a, b) => {
  let aVal: string | number = a[sortBy] ?? '';
  let bVal: string | number = b[sortBy] ?? '';
  
  // Special handling for status to sort by priority
  if (sortBy === 'status') {
    const statusOrder = { 'present': 1, 'absent': 2 };
    aVal = statusOrder[a.status as keyof typeof statusOrder] || 3;
    bVal = statusOrder[b.status as keyof typeof statusOrder] || 3;
  }
  
  if (sortDir === 'asc') {
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  } else {
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
  }
});

  // Pagination logic
  const totalPages = Math.ceil(sortedRecords.length / RECORDS_PER_PAGE) || 1;
  const paginatedRecords = sortedRecords.slice(
    (page - 1) * RECORDS_PER_PAGE,
    page * RECORDS_PER_PAGE
  );

  const handleExportCSV = () => {
    const headers = [
      "Student Name",
      "RFID",
      "Activity",
      "Status",
      "Date",
      "Time",
    ];
    const rows = sortedRecords.map((record) => [
      record.studentName,
      record.rfid || "",
      record.activity,
      record.status.charAt(0).toUpperCase() + record.status.slice(1),
      formatDate(record.date),
      record.time ? formatTime(record.time) : "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, attendanceRecords]);

  const handleSort = (column: keyof AttendanceRecord) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      // case "late":
      //   return (
      //     <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
      //       <path
      //         fillRule="evenodd"
      //         d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      //         clipRule="evenodd"
      //       />
      //     </svg>
      //   );
      case "absent":
        return (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSortIcon = (column: keyof AttendanceRecord) => {
    if (sortBy !== column) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDir === "asc" ? "↑" : "↓";
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        } w-full`}
      >
        {MobileTopBar}

        {/* Header Section */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 py-6 px-6 lg:px-8 shadow-sm w-full">
          <div className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Attendance Reports
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>
                      Present:{" "}
                      {
                        sortedRecords.filter((r) => r.status === "present")
                          .length
                      }
                    </span>
                  </div>
                  {/* <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span>
                      Late:{" "}
                      {sortedRecords.filter((r) => r.status === "late").length}
                    </span>
                  </div> */}
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span>
                      Absent:{" "}
                      {
                        sortedRecords.filter((r) => r.status === "absent")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {sortedRecords.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 w-full">
          <div className="w-full">
            {/* Controls Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search students, RFID, activities, status, date, time..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50 transition-all duration-200"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear search"
                      >
                        <svg
                          className="h-5 w-5"
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
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      From:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      To:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow hover:shadow-lg font-medium"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export CSV
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow hover:shadow-lg font-medium"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <div className="text-gray-600">
                    Loading attendance records...
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                          onClick={() => handleSort("studentName")}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Student</span>
                            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                              {getSortIcon("studentName")}
                            </span>
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                          onClick={() => handleSort("activity")}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Activity</span>
                            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                              {getSortIcon("activity")}
                            </span>
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Status</span>
                            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                              {getSortIcon("status")}
                            </span>
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100/50 transition-colors group"
                          onClick={() => handleSort("date")}
                        >
                          <div className="flex items-center space-x-2">
                            <span>Date & Time</span>
                            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                              {getSortIcon("date")}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <svg
                                className="w-16 h-16 mb-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <div className="text-lg font-medium text-gray-900 mb-2">
                                No attendance records found
                              </div>
                              <div className="text-sm">
                                Start by marking attendance for your activities
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : paginatedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <svg
                                className="w-16 h-16 mb-4 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                              <div className="text-lg font-medium text-gray-900 mb-2">
                                No matching records
                              </div>
                              <div className="text-sm">
                                Try adjusting your search or filters
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedRecords.map((record, idx) => (
                          <tr
                            key={record.id}
                            className="hover:bg-blue-50/30 transition-all duration-200 group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                  <span className="font-semibold text-blue-600 text-sm">
                                    {record.studentName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {record.studentName}
                                  </div>
                                  {record.rfid && (
                                    <div className="text-xs text-gray-500 font-mono">
                                      ID: {record.rfid}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="font-medium text-gray-700">
                                  {record.activity}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                  record.status === "present"
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {getStatusIcon(record.status)}
                                {record.status.charAt(0).toUpperCase() +
                                  record.status.slice(1)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-medium">
                                {formatDate(record.date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.time
                                  ? formatTime(record.time)
                                  : "No time recorded"}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!loading && paginatedRecords.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-semibold">
                        {(page - 1) * RECORDS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold">
                        {Math.min(
                          page * RECORDS_PER_PAGE,
                          sortedRecords.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold">
                        {sortedRecords.length}
                      </span>{" "}
                      results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>

                      <div className="flex space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                  page === pageNum
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
