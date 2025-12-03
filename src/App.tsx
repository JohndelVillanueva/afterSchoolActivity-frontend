import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SportsPage from '../pages/sports/SportPages';
import SportDetailPage from '../pages/sports/SportDetailPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import ReportsPage from '../pages/reports/ReportsPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import StudentsPage from '../pages/students/StudentsPage';
import CoachesPage from '../pages/coaches/CoachesPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LandingPage from '../components/landingpage/LandingPage';
import LoginPage from '../components/landingpage/LoginPage';
import RegisterPage from '../components/landingpage/RegistrationPage';
import { ToastProvider } from '../components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/coaches" element={<CoachesPage />} />
            <Route path="/sports/:name" element={<SportDetailPage />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;