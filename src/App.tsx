import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsPage from '../pages/sports/SportPages';
import SportDetailPage from '../pages/sports/SportDetailPage';
import PaymentPage from '../pages/sports/PaymentPage';
import ReportsPage from '../pages/reports/ReportsPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import StudentsPage from '../pages/students/StudentsPage';
import CoachesPage from '../pages/coaches/CoachesPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

function App() {
  return (
      <Router>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/coaches" element={<CoachesPage />} />
            <Route path="/sports/:name" element={<SportDetailPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
      </Router>
  );
}

export default App;