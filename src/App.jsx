import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import Profile from './components/Profile';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <FilterProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/me" element={<Profile />} /> {/* Current user */}
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </div>
        </FilterProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;