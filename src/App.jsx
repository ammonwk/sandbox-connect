import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import Profile from './components/Profile';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <FilterProvider>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Routes>
              <Route path="sandbox-headstart/" element={<LandingPage />} />
              <Route path="sandbox-headstart/onboarding" element={<Onboarding />} />
              <Route path="sandbox-headstart/dashboard" element={<Dashboard />} />
              <Route path="/sandbox-headstart/profile/me" element={<Profile />} /> {/* Current user */}
              <Route path="sandbox-headstart/profile/:id" element={<UserProfile />} />
            </Routes>
          </div>
        </FilterProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;