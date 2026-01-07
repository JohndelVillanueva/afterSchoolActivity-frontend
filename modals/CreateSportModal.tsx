import React, { useState, useRef, useEffect } from 'react';
// Import the Activity type from your App file
import { API_BASE_URL } from '../src/types/types';
import { useToast } from '../components/ToastProvider';

interface CreateSportModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: () => void;
}

const CreateSportModal: React.FC<CreateSportModalProps> = ({ show, onClose, onCreate }) => {
  const [newSport, setNewSport] = useState({
    name: '',
    description: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    location: 'Westfields International School',
    coachName: '',
    photo: '',
    rate: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coaches, setCoaches] = useState([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    setCoachesLoading(true);
    fetch(`${API_BASE_URL}/getAllUsers`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCoaches(data.data.filter((u: any) => u.position && u.position.toLowerCase() === 'coach'));
        } else {
          setCoachesError('Failed to fetch coaches');
        }
      })
      .catch(() => setCoachesError('Failed to fetch coaches'))
      .finally(() => setCoachesLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewSport(prev => ({
      ...prev,
      [name]: name === 'rate' ? Number(value) : value,
      location: 'Westfields International School',
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        setUploading(true);
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('photo', file);
        
        // Upload photo to backend
        const response = await fetch(`${API_BASE_URL}/uploadPhoto`, {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        if (result.success) {
          setNewSport(prev => ({ ...prev, photo: result.data.photoUrl }));
        } else {
          setError('Failed to upload photo: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        setError('Error uploading photo');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/createSport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSport, rate: Number(newSport.rate) }),
      });
      const result = await response.json();
      if (result.success) {
        success('Sport created successfully!');
        onCreate(); // No argument needed
        onClose();
        // Reset form
        setNewSport({
          name: '',
          description: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          location: 'Westfields International School',
          coachName: '',
          photo: '',
          rate: 0,
        });
      } else {
        setError(result.error || 'Failed to create sport. Please try again.');
      }
    } catch (err) {
      setError('Failed to create sport. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Drag and drop handlers for photo
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900 mb-1">Create New Sport</h3>
              <p className="text-sm text-gray-600">Add details for the new sports activity</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 border border-gray-900 bg-gray-50">
              <p className="text-sm text-gray-900 font-medium">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Activity Name <span className="text-gray-900">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={newSport.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Coach Name</label>
              <select
                name="coachName"
                value={newSport.coachName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 bg-white transition-colors"
              >
                <option value="">Select a coach</option>
                {coachesLoading ? (
                  <option disabled>Loading...</option>
                ) : coachesError ? (
                  <option disabled>{coachesError}</option>
                ) : (
                  coaches.map((coach: any) => (
                    <option key={coach.id} value={`${coach.fname} ${coach.lname}`}>
                      {coach.fname} {coach.lname} ({coach.email})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Description <span className="text-gray-900">*</span>
              </label>
              <textarea
                name="description"
                value={newSport.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Day of Week <span className="text-gray-900">*</span>
              </label>
              <input
                type="text"
                name="dayOfWeek"
                value={newSport.dayOfWeek}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Rate (₱) <span className="text-gray-900">*</span>
              </label>
              <input
                type="number"
                name="rate"
                value={newSport.rate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Start Time <span className="text-gray-900">*</span>
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={newSport.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                End Time <span className="text-gray-900">*</span>
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={newSport.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Photo</label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div
                className="w-full md:w-1/2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-gray-900 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                tabIndex={0}
                aria-label="Upload photo"
              >
                {uploading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </div>
                ) : newSport.photo ? (
                  <img src={`${API_BASE_URL}${newSport.photo}`} alt="Sport" className="w-32 h-24 object-cover mb-2 border border-gray-300" />
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">Click or drag a photo here</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {newSport.photo && (
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                  onClick={() => setNewSport(prev => ({ ...prev, photo: '' }))}
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={uploading || creating}
            >
              {creating ? 'Creating...' : 'Create Sport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSportModal;