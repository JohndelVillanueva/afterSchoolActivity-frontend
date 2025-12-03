import React from "react";
import { useNavigate } from "react-router-dom";
import CreateSportModal from "../modals/CreateSportModal";
import type { Activity} from "../src/types/types";
import { API_BASE_URL } from "../src/types/types";
import EditSportModal from "../modals/EditSportModal";

interface MainContentProps {
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  filteredActivities: Activity[];
  showCreateModal: boolean;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateSport: () => void; // Changed to no arguments
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
  handleCreateSport, // Now this should work without arguments
  onActivityClick,
  // sidebarCollapsed = false,
  success,
  error,
  setSuccess,
  setError,
  handleEditSport,
  // These props are declared but not used in this component directly
  showEditModal,
  setShowEditModal,
  selectedSport,
  handleUpdateSport,
  setActiveCategory, // Add this since it's in the interface
}) => {
  const navigate = useNavigate();

  const handleActivityClick = (activity: Activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      navigate(`/sports/${activity.name}`, { state: { activity } });
    }
  };

  // Prevent event propagation for edit button clicks
  const handleEditClick = (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation(); // Prevent triggering the parent click
    handleEditSport(activity);
  };

  return (
    <div className="flex-1 bg-white min-h-screen transition-all duration-300 ease-in-out">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-gray-100 py-4 px-4 bg-white">
        <h1 className="text-xl font-light text-gray-900">Sports Programs</h1>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block border-b border-gray-100 py-8 px-8 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-gray-900">
              All Sports
            </h1>
            <p className="text-gray-500 mt-1">
              Fall 2025 Season • Registration Open
            </p>
          </div>
          <button
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Sport
          </button>
        </div>
      </header>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="px-8 pt-4">
          {success && (
            <div className="mb-2 flex items-center justify-between bg-green-100 border border-green-300 text-green-800 rounded p-2">
              <span>{success}</span>
              {setSuccess && (
                <button onClick={() => setSuccess(null)} className="ml-2 text-green-700 hover:text-green-900">&times;</button>
              )}
            </div>
          )}
          {error && (
            <div className="mb-2 flex items-center justify-between bg-red-100 border border-red-300 text-red-800 rounded p-2">
              <span>{error}</span>
              {setError && (
                <button onClick={() => setError(null)} className="ml-2 text-red-700 hover:text-red-900">&times;</button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Activities Grid */}
      <main className="p-3 md:p-6 bg-white min-h-[60vh]">
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="group cursor-pointer relative" // Added relative for positioning
                onClick={() => handleActivityClick(activity)}
              >
                {/* Edit Icon Button - positioned at top right of card */}
                <button
                  onClick={(e) => handleEditClick(e, activity)}
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 shadow-sm hover:shadow-md"
                  aria-label={`Edit ${activity.name}`}
                  title="Edit sport"
                >
                  <svg 
                    className="w-4 h-4 text-gray-600 hover:text-blue-600" 
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

                <div className="h-full flex flex-col border border-gray-100 hover:border-gray-200 p-3 transition-colors rounded-lg">
                  <div className="aspect-[4/3] bg-gray-50 mb-3 flex items-center justify-center overflow-hidden rounded">
                    {activity.photo ? (
                      (() => {
                        console.log('[DEBUG] Activity photo URL:', activity.photo);
                        return (
                          <img 
                            src={`${API_BASE_URL}${activity.photo}`} 
                            alt={activity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => console.error('[DEBUG] Image failed to load:', activity.photo, e)}
                            onLoad={() => console.log('[DEBUG] Image loaded successfully:', activity.photo)}
                          />
                        );
                      })()
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-300 group-hover:text-gray-400 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                        />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {activity.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="mt-auto space-y-1 text-xs">
                    <p className="text-gray-400">
                      {activity.dayOfWeek} • {new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(activity.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <div className="flex justify-between">
                      <span className="text-gray-400 truncate">{activity.location || 'No location'}</span>
                      <span className="text-gray-400 truncate ml-1">{activity.coachName || 'No coach'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new sport activity.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-8 text-center md:text-left bg-white">
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