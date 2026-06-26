import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CreateSportModal from "../modals/CreateSportModal";
import EditSportModal from "../modals/EditSportModal";
import type { Activity } from "../src/types/types";
import { API_BASE_URL } from "../src/types/types";

const FALLBACK_SPORT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%2366746f'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%23ffffff' opacity='0.15'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='white' font-size='16' opacity='0.5' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const getSportImage = (sport: Activity | null): string => {
  if (sport?.photo) return `${API_BASE_URL}${sport.photo}`;
  return FALLBACK_SPORT_IMAGE;
};

interface MainContentProps {
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  filteredActivities: Activity[];
  showCreateModal: boolean;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateSport: () => void;
  onActivityClick?: (activity: Activity) => void;
  sidebarCollapsed?: boolean;
  success?: string | null;
  error?: string | null;
  setSuccess?: React.Dispatch<React.SetStateAction<string | null>>;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  selectedSport: Activity | null;
  handleEditSport: (sport: Activity) => void;
  handleUpdateSport: (updatedSport: Activity) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  filteredActivities,
  showCreateModal,
  setShowCreateModal,
  handleCreateSport,
  onActivityClick,
  success,
  error,
  setSuccess,
  setError,
  handleEditSport,
  showEditModal,
  setShowEditModal,
  selectedSport,
  handleUpdateSport,
  search = "",
  onSearchChange,
}) => {
  const navigate = useNavigate();

  const handleActivityClick = useCallback((activity: Activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      navigate(`/sports/${activity.name}`, { state: { activity } });
    }
  }, [navigate, onActivityClick]);

  const handleEditClick = useCallback((e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    handleEditSport(activity);
  }, [handleEditSport]);

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-white min-h-screen transition-all duration-300 ease-in-out">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-gray-100 py-4 px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <h1 className="text-xl font-semibold text-gray-900">Sports Programs</h1>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    All Sports
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-semibold text-sm shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                onClick={() => setShowCreateModal(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="relative z-10">Create New Sport</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      {onSearchChange && (
        <div className="px-4 md:px-8 py-4 bg-white/80 border-b border-gray-100">
          <div className="relative max-w-xl">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, coach, or location..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="px-8 pt-4">
          {success && (
            <div className="mb-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{success}</span>
              </div>
              {setSuccess && (
                <button onClick={() => setSuccess(null)} className="text-emerald-700 hover:text-emerald-900">&times;</button>
              )}
            </div>
          )}
          {error && (
            <div className="mb-2 flex items-center justify-between bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
              {setError && (
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">&times;</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Activities List */}
      <main className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-white min-h-[60vh]">
        {filteredActivities.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Location
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Coach
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Rate
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-blue-50/30 transition-colors duration-150 cursor-pointer group"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200/60">
                            <img
                              src={getSportImage(activity)}
                              alt={activity.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = FALLBACK_SPORT_IMAGE;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {activity.name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {activity.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {activity.location || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {activity.coachName || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                        <span className="text-sm font-medium text-gray-900">
                          {activity.rate != null ? `₱${Number(activity.rate).toLocaleString()}` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityClick(activity);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={(e) => handleEditClick(e, activity)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Edit ${activity.name}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filteredActivities.length}</span> sport{filteredActivities.length !== 1 ? "s" : ""}
                {search && onSearchChange && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear search
                  </button>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sports found</h3>
            <p className="text-gray-500 text-center mb-6">
              {search
                ? "Try adjusting your search query"
                : "Get started by creating your first sport activity."}
            </p>
            {search && onSearchChange ? (
              <button
                onClick={() => onSearchChange("")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear search
              </button>
            ) : (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Sport
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-8 text-center md:text-left bg-white/80 backdrop-blur-sm">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} School Sports Program. All rights reserved.
        </p>
      </footer>

      {/* Edit Sport Modal */}
      {showEditModal && selectedSport && (
        <EditSportModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          sport={selectedSport}
          onUpdate={handleUpdateSport}
        />
      )}
      
      {/* Create Sport Modal */}
      <CreateSportModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateSport}
      />
    </div>
  );
};

export default MainContent;