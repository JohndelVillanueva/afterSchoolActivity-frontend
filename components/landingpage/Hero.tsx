import React from 'react';

interface HeroProps {
  stats: {
    students: number;
    sports: number;
    coaches: number;
  };
  loading: boolean;
  error: string | null;
}

const Hero: React.FC<HeroProps> = ({ stats, loading, error }) => {
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${Math.round(count / 1000)}K+`;
    }
    return `${count}+`;
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Unleash Your Athletic Potential
          </h1>
          <p className="hero-subtitle">
            Join thousands of athletes and sports enthusiasts in the ultimate sports community. 
            Track progress, connect with coaches, and achieve your fitness goals.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large">Get Started</button>
            <button className="btn btn-secondary btn-large">Watch Demo</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{loading ? '...' : formatCount(stats.students)}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat">
              <div className="stat-number">{loading ? '...' : formatCount(stats.sports)}</div>
              <div className="stat-label">Sports</div>
            </div>
            <div className="stat">
              <div className="stat-number">{loading ? '...' : formatCount(stats.coaches)}</div>
              <div className="stat-label">Coaches</div>
            </div>
          </div>
          {error ? <p className="hero-subtitle">Live stats unavailable at the moment.</p> : null}
        </div>
        <div className="hero-image">
          <div className="sports-illustration">
            <div className="athlete-silhouette"></div>
            <div className="floating-elements">
              <div className="floating-element">⚽</div>
              <div className="floating-element">🏀</div>
              <div className="floating-element">🎾</div>
              <div className="floating-element">🏃</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;