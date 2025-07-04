import React, { useState } from 'react';
// Import the Activity type from your App file
import type { Activity } from '../src/types/types';

interface CreateSportModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (newSport: Activity) => void;
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
    rate: 0,
  });

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
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('photo', file);
        
        // Upload photo to backend
        const response = await fetch('http://localhost:3000/uploadPhoto', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        if (result.success) {
          setNewSport(prev => ({ ...prev, photo: result.data.photoUrl }));
        } else {
          alert('Failed to upload photo: ' + result.error);
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error uploading photo');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ ...newSport, id: Date.now(), location: 'Westfields International School' });
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
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-blur bg-opacity-20 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto border-r-1 border-black-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-light text-gray-900">Create New Sport</h3>
              <p className="text-gray-500 text-sm mt-1">Add details for the new sports activity</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">Activity Name</label>
              <input
                type="text"
                name="name"
                value={newSport.name}
                onChange={handleInputChange}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={newSport.description}
                onChange={handleInputChange}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-1">Day of Week</label>
                <input
                  type="text"
                  name="dayOfWeek"
                  value={newSport.dayOfWeek}
                  onChange={handleInputChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={newSport.startTime}
                  onChange={handleInputChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={newSport.endTime}
                  onChange={handleInputChange}
                  className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">Coach Name</label>
              <input
                type="text"
                name="coachName"
                value={newSport.coachName}
                onChange={handleInputChange}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">Rate (₱)</label>
              <input
                type="number"
                name="rate"
                value={newSport.rate}
                onChange={handleInputChange}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-1">Activity Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-900 focus:ring-0 rounded-none"
              />
              {newSport.photo && (
                <div className="mt-2">
                  <img 
                    src={newSport.photo} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
              >
                Create Sport Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSportModal;