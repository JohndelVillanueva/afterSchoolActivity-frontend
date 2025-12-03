import Header from './Header';
import Hero from './Hero';
import SportsSection from './SportsSection';
import Features from './Features';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';
import './styling/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <SportsSection />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;