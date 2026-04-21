import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/SideBar";
import { API_BASE_URL } from "../../src/types/types";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

// --- INTERFACE ---
interface User {
  id: number;
  rfid?: string;
  fname: string;
  lname: string;
  email?: string;
  type?: string; // 'student', 'coach', 'admin'
  position?: string;
  // Optional: Additional fields if your API returns them
}

const AllUsersPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    // Note: Ensure your backend route maps to the controller we created earlier
    fetch(`${API_BASE_URL}/getAllUsers`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          setUsers(result.data || []);
        } else {
          setError("Failed to load users.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Network error: Could not connect to server");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Filter by Role
      const matchesRole = roleFilter === "All" || user.type === roleFilter;
      
      // 2. Filter by Search
      const fullName = `${user.fname} ${user.lname}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) || 
                           (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
                           (user.rfid && user.rfid.includes(search));

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  // --- HELPERS ---
  const getRoleBadge = (type: string) => {
    switch (type) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'coach':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mobile Top Bar
  const MobileTopBar = (
    <div className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <div className="flex items-center px-4 py-3">
        <button
          className="mr-3 p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">All Users</span>
        </div>
        {!loading && users.length > 0 && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            {users.length}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50/80">
      <Sidebar
        onCollapsedChange={handleSidebarToggle}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }}
      />

      <div
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        } flex flex-col`}
      >
        {MobileTopBar}

        {/* Page Header */}
        <div className="px-4 md:px-8 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {loading ? "Loading..." : `${users.length} users in system`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or RFID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm placeholder:text-gray-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            {/* <div className="relative w-full md:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 appearance-none transition-all text-sm text-gray-700 cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="student">Student</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div> */}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-14 h-14 border-[3px] border-indigo-100 rounded-full animate-spin border-t-indigo-600"></div>
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium">Loading users...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/60 rounded-2xl p-6 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Users</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100/50">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-sm text-sm">
                {search || roleFilter !== 'All'
                  ? "Try adjusting your search or filter"
                  : "There are no users in the system yet."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        RFID
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Email
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-indigo-50/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20">
                                {`${user.fname?.[0] || ""}${user.lname?.[0] || ""}`.toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {user.fname} {user.lname}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">#{user.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-gray-50 text-gray-600 border border-gray-200/60">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            {user.rfid || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {user.email ? (
                            <span className="text-sm text-gray-600 truncate block max-w-[200px]">
                              {user.email}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-300">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getRoleBadge(user.type || 'user')}`}>
                            {(user.type || user.position || 'User').charAt(0).toUpperCase() + (user.type || user.position || 'User').slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Info */}
              <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{filteredUsers.length}</span> of{" "}
                  <span className="font-semibold text-gray-600">{users.length}</span> users
                  {(search || roleFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setRoleFilter("All");
                      }}
                      className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear filters
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllUsersPage;