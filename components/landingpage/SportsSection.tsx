import React, { useState } from 'react';

const SportsSection = () => {
  const [activeSport, setActiveSport] = useState('all');

  const sports = [
    { id: 1, name: 'Football', category: 'team', icon: '⚽' },
    { id: 2, name: 'Basketball', category: 'team', icon: '🏀' },
    { id: 3, name: 'Tennis', category: 'individual', icon: '🎾' },
    { id: 4, name: 'Swimming', category: 'individual', icon: '🏊' },
    { id: 5, name: 'Running', category: 'individual', icon: '🏃' },
    { id: 6, name: 'Cycling', category: 'individual', icon: '🚴' }
  ];

  const filteredSports = activeSport === 'all' 
    ? sports 
    : sports.filter(sport => sport.category === activeSport);

  return (
    <section id="sports" className="sports-section">
      <div className="container">
        <div className="section-header">
          <h2>Popular Sports</h2>
          <p>Discover and engage in your favorite sports activities</p>
        </div>

        <div className="sports-filter">
          <button 
            className={`filter-btn ${activeSport === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSport('all')}
          >
            All Sports
          </button>
          <button 
            className={`filter-btn ${activeSport === 'team' ? 'active' : ''}`}
            onClick={() => setActiveSport('team')}
          >
            Team Sports
          </button>
          <button 
            className={`filter-btn ${activeSport === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveSport('individual')}
          >
            Individual Sports
          </button>
        </div>

        <div className="sports-grid">
          {filteredSports.map(sport => (
            <div key={sport.id} className="sport-card">
              <div className="sport-icon">{sport.icon}</div>
              <h3 className="sport-name">{sport.name}</h3>
              <p className="sport-category">{sport.category} Sport</p>
              <button className="btn btn-outline">Explore</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsSection;