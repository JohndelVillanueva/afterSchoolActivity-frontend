import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/SideBar';
import { API_BASE_URL } from '../../src/types/types';

// --- PROFESSIONAL DESIGN CONSTANTS ---
const PRIMARY_COLOR = 'blue-600'; // Primary accent color
const PRIMARY_LIGHT = 'blue-50'; // Light background accent
const TEXT_COLOR = 'gray-800'; // Dark text for readability
const BG_COLOR = 'gray-50'; // Soft background

interface Coach {
  id: number;
  fname: string;
  lname: string;
  email: string;
  rfid: string;
  gender: string;
  mobile: string;
}

const initialFormState = {
  fname: '',
  lname: '',
  email: '',
  rfid: '',
  gender: '',
  mobile: '',
};

const CoachesPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const fetchCoaches = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/getAllCoaches`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setCoaches(result.data);
        } else {
          setError('Failed to load coaches.');
        }
      })
      .catch(() => setError('Failed to load coaches.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const filteredCoaches = useMemo(() => {
    return coaches.filter(coach => 
      `${coach.fname} ${coach.lname}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [coaches, search]);

  // Updated Mobile Top Bar with professional styling
  const MobileTopBar = (
    <div className="md:hidden flex items-center bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
      <button
        className="mr-3 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-lg font-semibold text-gray-800">Coaches</span>
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.fname || !form.lname || !form.email || !form.rfid) {
      setFormError('Please provide all required fields: first name, last name, email, and RFID.');
      return;
    }

    setFormLoading(true);
    try {
      const coachPayload = {
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        rfid: form.rfid.trim(),
        gender: form.gender,
        mobile: form.mobile.trim(),
      };

      const createRes = await fetch(`${API_BASE_URL}/createCoach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachPayload),
      });

      const createData = await createRes.json();
      
      if (createRes.ok && createData.success) {
        console.log('Coach created successfully:', createData.message);
        setShowModal(false);
        setForm(initialFormState);
        fetchCoaches();
        setFormLoading(false);
        return;
      }
      
      setFormError(createData.error || 'Failed to create coach');
      setFormLoading(false);
      
    } catch (err) {
      console.error('Error in coach creation process:', err);
      setFormError('An unexpected error occurred during the process.');
      setFormLoading(false);
    }
  };

  // Gender Badge styling
  const GenderBadge = ({ gender }: { gender: string }) => (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
        gender === 'Male' 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : gender === 'Female'
          ? 'bg-pink-100 text-pink-700 border border-pink-200'
          : 'bg-purple-100 text-purple-700 border border-purple-200'
      }`}
    >
      {gender || 'Not specified'}
    </span>
  );

  // Helper for avatar initials
  const getInitials = (fname: string, lname: string) => {
    return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar onCollapsedChange={handleSidebarToggle} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} flex flex-col`}>
        {MobileTopBar}
        
        {/* Header with Search and Actions */}
        <header className="border-b border-gray-200 py-6 px-4 md:py-8 md:px-8 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coaches Roster 👨‍🏫</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your afterschool program coaches and their details.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 text-sm w-full md:w-48 transition-colors"
            />
           <button
              className="px-5 py-2 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors text-base font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={() => setShowModal(true)}
            >
              <span className='hidden md:inline'>+ Create Coach</span>
              <span className='md:hidden'>+ Add</span>
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500 text-lg">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-12 text-lg p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">{error}</div>
          ) : filteredCoaches.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md border border-dashed border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No coaches found</h2>
              <p className="text-gray-500 mb-4">Try adjusting your search or add a new coach.</p>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold"
                onClick={() => setShowModal(true)}
              >
                Create Coach
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Coach</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">RFID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-800 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCoaches.map(coach => (
                      <tr key={coach.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                              {getInitials(coach.fname, coach.lname)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{coach.fname} {coach.lname}</div>
                              {/* <div className="text-xs text-gray-500">ID: {coach.id}</div> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          <span className="cursor-pointer underline decoration-dotted" title={coach.rfid}>
                            {coach.rfid.slice(0, 6)}...{coach.rfid.slice(-2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          <a href={`mailto:${coach.email}`} className="hover:underline text-blue-500">{coach.email}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <GenderBadge gender={coach.gender} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {coach.mobile || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-gray-100"
                            title="View/Edit Coach Details"
                          >
                            View/Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Create Coach Modal (Styled) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
              <div className="bg-blue-600 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Coach</h2>
                  <p className="text-blue-200 text-sm">Add a new coach to the system</p>
                </div>
                <button className="text-blue-200 hover:text-white p-1 rounded-full" onClick={() => setShowModal(false)} aria-label="Close">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateCoach} className="p-6 md:p-8 space-y-5">
                
                {formError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm font-medium">
                    🛑 {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="fname"
                      value={form.fname}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-colors"
                      required
                    />
                  </div>
                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lname"
                      value={form.lname}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                {/* Email and RFID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RFID *</label>
                    <input
                      type="text"
                      name="rfid"
                      value={form.rfid}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Gender and Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 bg-white transition-colors"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 transition-colors"
                      placeholder="e.g., +1234567890"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Create Coach'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachesPage;