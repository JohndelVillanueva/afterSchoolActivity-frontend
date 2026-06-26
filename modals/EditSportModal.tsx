import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../src/types/types';
import { useToast } from '../components/ToastProvider';
import type { Activity } from '../src/types/types';

interface EditSportModalProps {
  show: boolean;
  onClose: () => void;
  sport: Activity | null;
  onUpdate: (updatedSport: Activity) => void;
}

const EditSportModal: React.FC<EditSportModalProps> = ({ show, onClose, sport, onUpdate }) => {
  const [editedSport, setEditedSport] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const [coachesError, setCoachesError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success } = useToast();

  useEffect(() => {
    if (!show) return;

    if (sport) {
      setEditedSport({
        ...sport,
        rate: Number(sport.rate) || 0,
      });
    }

    setCoachesLoading(true);
    setCoachesError(null);
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
  }, [show, sport]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editedSport) return;

    const { name, value } = e.target;
    setEditedSport(prev => ({
      ...prev!,
      [name]: name === 'rate' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (!editedSport) return;

    try {
      setError(null);
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_BASE_URL}/uploadPhoto`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setEditedSport(prev => ({ ...prev!, photo: result.data.photoUrl }));
      } else {
        setError('Failed to upload photo: ' + (result.error || 'Unknown error'));
      }
    } catch {
      setError('Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedSport) return;

    // Validate required fields
    if (!editedSport.name) {
      setError('Activity name is required');
      return;
    }

    setError(null);
    setUpdating(true);
    
    try {
      const payload = {
        id: editedSport.id,
        name: editedSport.name,
        description: editedSport.description || '',
        coachName: editedSport.coachName || '',
        photo: editedSport.photo || '',
        location: editedSport.location || '',
        rate: editedSport.rate ?? 0,
      };

      console.log('[DEBUG] Sending update payload:', payload);

      const response = await fetch(`${API_BASE_URL}/updateSport`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      console.log('[DEBUG] Update response:', result);
      
      if (result.success) {
        success('Sport updated successfully!');
        onUpdate(result.data);
        onClose();
      } else {
        setError(result.error || 'Failed to update sport. Please try again.');
      }
    } catch (err) {
      console.error('Error updating sport:', err);
      setError('Failed to update sport. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && editedSport) {
      await handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePhoto = () => {
    if (!editedSport) return;
    setEditedSport(prev => ({ ...prev!, photo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    if (updating || uploading) return;
    setError(null);
    onClose();
  };

  if (!show || !editedSport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={handleModalClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 truncate">Edit Activity</h2>
              </div>
              <p className="text-sm text-gray-500 truncate">{editedSport.name}</p>
            </div>
            <button
              className="p-2 -mr-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleModalClose}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Name & Coach */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Activity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={editedSport.name}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Coach</label>
              {coachesLoading ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : coachesError ? (
                <div className="px-3.5 py-2.5 border border-red-200 rounded-xl text-sm text-red-500 bg-red-50">
                  {coachesError}
                </div>
              ) : (
                <select
                  name="coachName"
                  value={editedSport.coachName || ''}
                  onChange={handleInputChange}
                  className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all text-sm"
                >
                  <option value="">Select coach</option>
                  {coaches.map((coach: any) => (
                    <option key={coach.id} value={`${coach.fname} ${coach.lname}`}>
                      {coach.fname} {coach.lname}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={editedSport.description || ''}
              onChange={handleInputChange}
              className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400 resize-none"
              rows={3}
            />
          </div>

          {/* Location & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input
                type="text"
                name="location"
                value={editedSport.location || ''}
                onChange={handleInputChange}
                placeholder="e.g. Gymnasium, Field A"
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rate (₱)</label>
              <input
                type="number"
                name="rate"
                min="0"
                step="0.01"
                value={editedSport.rate ?? 0}
                onChange={handleInputChange}
                className="block w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm"
              />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
            {editedSport.photo ? (
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                  <img
                    src={`${API_BASE_URL}${editedSport.photo}`}
                    alt="Sport preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              <div
                className={`relative w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50/50'
                    : 'border-gray-200 bg-gray-50/30 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                tabIndex={0}
                role="button"
                aria-label="Upload photo"
              >
                {uploading ? (
                  <div className="flex items-center gap-2.5">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {isDragging ? 'Drop image here' : 'Click or drag a photo'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={updating || uploading}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || updating}
              className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors font-semibold text-sm shadow-sm shadow-blue-600/25 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              {updating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSportModal;