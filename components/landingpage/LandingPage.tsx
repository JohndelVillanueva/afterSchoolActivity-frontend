import { useEffect, useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import SportsSection from './SportsSection';
import Features from './Features';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';
import { API_BASE_URL } from '../../src/types/types';
import type { Activity } from '../../src/types/types';
import './styling/LandingPage.css';

const LandingPage = () => {
  const [stats, setStats] = useState({
    students: 0,
    sports: 0,
    coaches: 0,
  });
  const [sports, setSports] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLandingData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [studentsRes, coachesRes, sportsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/getAllStudents`).then((res) => res.json()),
          fetch(`${API_BASE_URL}/getAllCoaches`).then((res) => res.json()),
          fetch(`${API_BASE_URL}/getAllSports`).then((res) => res.json()),
        ]);

        if (!studentsRes.success || !coachesRes.success || !sportsRes.success) {
          throw new Error('Failed to fetch landing page data.');
        }

        if (!isMounted) return;

        const sportsData = Array.isArray(sportsRes.data) ? sportsRes.data : [];
        setSports(sportsData);
        setStats({
          students: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
          sports: sportsData.length,
          coaches: Array.isArray(coachesRes.data) ? coachesRes.data.length : 0,
        });
      } catch {
        if (!isMounted) return;
        setError('Unable to load live data right now.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLandingData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <Header />
      <Hero stats={stats} loading={loading} error={error} />
      <SportsSection sports={sports} loading={loading} error={error} />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;