import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/SideBar';

interface AttendanceRecord {
  id: string;
  studentName: string;
  activity: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  rfid?: string;
  credit: number;
  debit: number;
}

const RECORDS_PER_PAGE = 10;

const ReportsPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<keyof AttendanceRecord | 'date' | 'time'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('http://localhost:3000/getAllAttendanceTransactions')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setAttendanceRecords(result.data);
        } else {
          setAttendanceRecords([]);
        }
      })
      .catch(() => setAttendanceRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Filtered records
  const filteredRecords = attendanceRecords.filter(record => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchLower) ||
      (record.rfid && record.rfid.includes(search)) ||
      record.activity.toLowerCase().includes(searchLower);
    const matchesStart = !startDate || record.date >= startDate;
    const matchesEnd = !endDate || record.date <= endDate;
    return matchesSearch && matchesStart && matchesEnd;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aVal = a[sortBy] ?? '';
    let bVal = b[sortBy] ?? '';
    if (sortBy === 'date' || sortBy === 'time') {
      aVal = a[sortBy] || '';
      bVal = b[sortBy] || '';
    }
    if (sortDir === 'asc') {
      return String(aVal).localeCompare(String(bVal));
    } else {
      return String(bVal).localeCompare(String(aVal));
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedRecords.length / RECORDS_PER_PAGE) || 1;
  const paginatedRecords = sortedRecords.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);

  const handleExportCSV = () => {
    const headers = ['Student Name', 'RFID', 'Activity', 'Status', 'Date', 'Time', 'Credit', 'Debit'];
    const rows = sortedRecords.map(record => [
      record.studentName,
      record.rfid || '',
      record.activity,
      record.status,
      record.date,
      record.time ? formatTime(record.time) : '',
      record.credit,
      record.debit
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}` ).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, attendanceRecords]);

  const handleSort = (column: keyof AttendanceRecord | 'date' | 'time') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar onCollapsedChange={handleSidebarToggle} />
      <div className={`flex-1 bg-transparent min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <header className="border-b border-gray-100 py-4 px-4 md:py-8 md:px-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Afterschool Attendance Reports</h1>
          <div className="text-gray-600 text-sm">
            Showing <span className="font-semibold">{sortedRecords.length}</span> of <span className="font-semibold">{attendanceRecords.length}</span> records
          </div>
        </header>
        <main className="p-4 md:p-8">
          <div className="bg-transparent border border-gray-200 rounded-lg shadow p-6 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading attendance transactions...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse font-sans bg-transparent">
                  <thead>
                    {/* Toolbar Row */}
                    <tr>
                      <th colSpan={8} className="px-4 pb-2 pt-0 bg-transparent">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                          <div className="flex gap-2 items-center flex-wrap flex-1">
                            <div className="relative w-64">
                              <input
                                type="text"
                                placeholder="Search by name, RFID, or activity..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full pr-8"
                              />
                              {search && (
                                <button
                                  onClick={() => setSearch('')}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                                  aria-label="Clear search"
                                  type="button"
                                >
                                  &#10005;
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 items-center flex-wrap flex-1 justify-end">
                            <label className="text-sm text-gray-600">Start Date:</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={e => setStartDate(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                            <label className="text-sm text-gray-600">End Date:</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={e => setEndDate(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            />
                            {/* Export CSV */}
                            <button
                              onClick={handleExportCSV}
                              className="ml-2 p-2 bg-transparent border border-gray-300 text-black rounded-md hover:bg-gray-100 transition-colors text-sm font-medium flex items-center"
                              title="Export CSV"
                              aria-label="Export CSV"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                              </svg>
                            </button>
                            {/* Print/PDF */}
                            <button
                              onClick={() => window.print()}
                              className="p-2 bg-transparent border border-gray-300 text-black rounded-md hover:bg-gray-100 transition-colors text-sm font-medium flex items-center"
                              title="Export PDF / Print"
                              aria-label="Export PDF / Print"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5M6 18H5a2 2 0 01-2-2v-5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2h-1m-10 0v2a1 1 0 001 1h6a1 1 0 001-1v-2m-8 0h8" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </th>
                    </tr>
                    <tr className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <th className="px-2 py-3 text-left font-semibold text-gray-700 rounded-tl-lg cursor-pointer" onClick={() => handleSort('studentName')}>
                        Student Name {sortBy === 'studentName' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort('activity')}>
                        Activity {sortBy === 'activity' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort('status')}>
                        Status {sortBy === 'status' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 w-48 cursor-pointer" onClick={() => handleSort('date')}>
                        Date & Time {sortBy === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700 w-24">Credit</th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700 w-24">Debit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No user found.
                        </td>
                      </tr>
                    ) : paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          No user found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((record, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50'} hover:bg-blue-50`}
                        >
                          <td className="px-2 py-2 font-medium text-gray-900">
                            {record.studentName && record.rfid && !record.studentName.includes(record.rfid) ? (
                              <>
                                <span className="font-semibold">{record.studentName}</span>
                                <span className="text-gray-500 text-xs ml-1">- {record.rfid}</span>
                              </>
                            ) : record.studentName ? (
                              <span className="font-semibold">{record.studentName}</span>
                            ) : record.rfid ? (
                              <span className="text-gray-500">{record.rfid}</span>
                            ) : (
                              <span className="text-gray-400 italic">Unknown</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-gray-700">{record.activity}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-800'
                                  : record.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-700 w-48">{
                            (() => {
                              // Combine date and time in 'YYYY-MM-DD HH:mm' 24-hour format
                              const date = record.date;
                              let time = '';
                              if (record.time) {
                                const d = new Date(record.time);
                                const hours = d.getHours().toString().padStart(2, '0');
                                const minutes = d.getMinutes().toString().padStart(2, '0');
                                time = `${hours}:${minutes}`;
                              }
                              return `${date}${time ? ' ' + time : ''}`;
                            })()
                          }</td>
                          <td className="px-4 py-2 text-right text-gray-700 w-24">{record.credit}</td>
                          <td className="px-4 py-2 text-right text-gray-700 w-24">{record.debit}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-1 rounded font-medium ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-medium disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage; 