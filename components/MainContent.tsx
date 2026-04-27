import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CreateSportModal from "../modals/CreateSportModal";
import EditSportModal from "../modals/EditSportModal";
import type { Activity } from "../src/types/types";
import { API_BASE_URL } from "../src/types/types";

// ✅ Import your actual image
import defaultSportImage from "../src/assets/deh54s1-25929919-c63d-4834-ba80-c3a00fe2fbcc.png";  

// ✅ Helper function to get sport image with fallback
const getSportImage = (sport: Activity | null): string => {
  if (sport?.photo) return `${API_BASE_URL}${sport.photo}`;
  return defaultSportImage;
};

const FALLBACK_SPORT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='none'%3E%3Crect width='400' height='300' fill='%2366746f'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%23ffffff' opacity='0.15'/%3E%3Ctext x='200' y='155' text-anchor='middle' fill='white' font-size='16' opacity='0.5' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

// Helper function to get a random gradient color based on sport name
const getSportGradient = (name: string) => {
  const gradients = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-emerald-500 to-emerald-600",
    "from-red-500 to-red-600",
    "from-orange-500 to-orange-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600",
  ];
  const index = name.length % gradients.length;
  return gradients[index];
};

interface ActivityCardProps {
  activity: Activity;
  onOpen: (activity: Activity) => void;
  onEdit: (e: React.MouseEvent, activity: Activity) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = memo(({ activity, onOpen, onEdit }) => {
  const gradient = getSportGradient(activity.name);

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
      onClick={() => onOpen(activity)}
    >
      <button
        onClick={(e) => onEdit(e, activity)}
        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-md hover:shadow-lg backdrop-blur-sm"
        aria-label={`Edit ${activity.name}`}
        title="Edit sport"
      >
        <svg
          className="w-4 h-4 text-gray-600 hover:text-blue-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>

      <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="aspect-[4/3] relative">
          <img
            src={getSportImage(activity)}
            alt={activity.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_SPORT_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r ${gradient} text-white text-xs font-medium rounded-lg shadow-md`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Sport
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {activity.name}
        </h3>

        <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
          {activity.description || "No description available"}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 truncate">
              {activity.coachName || "No coach assigned"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-medium">Details</span>
            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});
ActivityCard.displayName = "ActivityCard";

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

      {/* Activities Grid */}
      <main className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-white min-h-[60vh]">
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onOpen={handleActivityClick}
                onEdit={handleEditClick}
              />
            ))}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500 text-center mb-6">
              Get started by creating your first sport activity.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Sport
            </button>
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