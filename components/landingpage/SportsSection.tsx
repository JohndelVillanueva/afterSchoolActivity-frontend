import React, { useState } from 'react';
import type { Activity } from '../../src/types/types';

interface SportsSectionProps {
  sports: Activity[];
  loading: boolean;
  error: string | null;
}

type SportFilter = 'all' | 'withCoach' | 'withoutCoach';

const getSportIcon = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('foot')) return '⚽';
  if (normalized.includes('basket')) return '🏀';
  if (normalized.includes('tennis')) return '🎾';
  if (normalized.includes('swim')) return '🏊';
  if (normalized.includes('run') || normalized.includes('track')) return '🏃';
  if (normalized.includes('cycle') || normalized.includes('bike')) return '🚴';
  if (normalized.includes('volley')) return '🏐';
  if (normalized.includes('badminton')) return '🏸';
  return '🏅';
};

const SportsSection: React.FC<SportsSectionProps> = ({ sports, loading, error }) => {
  const [activeSport, setActiveSport] = useState<SportFilter>('all');

  const filteredSports =
    activeSport === 'all'
      ? sports
      : sports.filter((sport) =>
          activeSport === 'withCoach'
            ? Boolean(sport.coachName && sport.coachName.trim())
            : !sport.coachName || !sport.coachName.trim()
        );

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
            className={`filter-btn ${activeSport === 'withCoach' ? 'active' : ''}`}
            onClick={() => setActiveSport('withCoach')}
          >
            With Coach
          </button>
          <button 
            className={`filter-btn ${activeSport === 'withoutCoach' ? 'active' : ''}`}
            onClick={() => setActiveSport('withoutCoach')}
          >
            No Coach Yet
          </button>
        </div>

        <div className="sports-grid">
          {loading ? (
            <div className="sport-card">
              <div className="sport-name">Loading sports...</div>
            </div>
          ) : error ? (
            <div className="sport-card">
              <div className="sport-name">Could not load sports right now.</div>
            </div>
          ) : filteredSports.length === 0 ? (
            <div className="sport-card">
              <div className="sport-name">No sports found for this filter.</div>
            </div>
          ) : (
            filteredSports.map((sport) => (
              <div key={sport.id} className="sport-card">
                <div className="sport-icon">{getSportIcon(sport.name)}</div>
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-category">
                  {sport.coachName?.trim() ? `Coach: ${sport.coachName}` : 'Coach assignment pending'}
                </p>
                <button className="btn btn-outline">Explore</button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SportsSection;