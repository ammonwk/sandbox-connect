import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import { FilterProvider } from './context/FilterContext';

function App() {
  return (
    <Router>
      <FilterProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <Routes>
            <Route path="sandbox-headstart/" element={<LandingPage />} />
            <Route path="sandbox-headstart/onboarding" element={<Onboarding />} />
            <Route path="sandbox-headstart/dashboard" element={<Dashboard />} />
            <Route path="sandbox-headstart/profile/:id" element={<UserProfile />} />
          </Routes>
        </div>
      </FilterProvider>
    </Router>
  );
}

export default App;