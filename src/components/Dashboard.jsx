// components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userData from '../data/users.json';
import UserCard from './UserCard';
import Navbar from './Navbar';
import FilterBar from './FilterBar';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState({
    id: 'match',
    direction: 'desc'
  });
  const [activeStatusFilters, setActiveStatusFilters] = useState(['looking', 'open', 'closed']);
  const [activeHoursFilter, setActiveHoursFilter] = useState(null);
  const [activeIdeaStatusFilter, setActiveIdeaStatusFilter] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const handleLogout = () => {
    // Here you would typically clear any auth state/tokens
    navigate('/sandbox-headstart/');
  };

  const sortUsers = (users) => {
    return [...users].sort((a, b) => {
      let comparison = 0;
      
      switch (sortState.id) {
        case 'match':
          comparison = b.matchPercentage - a.matchPercentage;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'hours':
          comparison = b.hoursPerWeek - a.hoursPerWeek;
          break;
        case 'recent':
          comparison = new Date(b.lastActive) - new Date(a.lastActive);
          break;
        default:
          return 0;
      }

      return sortState.direction === 'desc' ? comparison : -comparison;
    });
  };

  const filteredUsers = sortUsers(userData.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.intro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.currentSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         user.desiredTeammateSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = activeStatusFilters.includes(user.status);
    
    const matchesHours = !activeHoursFilter ? true : 
      (activeHoursFilter === '20-30' && user.hoursPerWeek >= 20 && user.hoursPerWeek <= 30) ||
      (activeHoursFilter === '31-40' && user.hoursPerWeek >= 31 && user.hoursPerWeek <= 40) ||
      (activeHoursFilter === '41-50' && user.hoursPerWeek >= 41 && user.hoursPerWeek <= 50) ||
      (activeHoursFilter === '50+' && user.hoursPerWeek > 50);
      
    const matchesIdeaStatus = !activeIdeaStatusFilter ? true :
      user.ideaStatus === activeIdeaStatusFilter;
    
    return matchesSearch && matchesStatus && matchesHours && matchesIdeaStatus;
  }));

  const handleStatusFilterChange = (status) => {
    setActiveStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleHoursFilterChange = (hoursRange) => {
    setActiveHoursFilter(prev => prev === hoursRange ? null : hoursRange);
  };

  const handleIdeaStatusFilterChange = (ideaStatus) => {
    setActiveIdeaStatusFilter(prev => prev === ideaStatus ? null : ideaStatus);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeHoursFilter) count++;
    if (activeIdeaStatusFilter) count++;
    if (activeStatusFilters.length < 3) count++;
    return count;
  };

  const handleReset = () => {
    setSortState({ id: 'match', direction: 'desc' });
    setActiveStatusFilters(['looking', 'open', 'closed']);
    setActiveHoursFilter(null);
    setActiveIdeaStatusFilter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
          <div className="mb-4 w-full">
            <div className="flex items-baseline justify-between">
              <h1 className="text-3xl font-bold text-black">Find Your Team</h1>
              <p className="text-gray-600 text-right">
                Connect with potential teammates who complement your skills
              </p>
            </div>
          </div>
            {getActiveFiltersCount() > 0 && (
              <span className="text-sm text-gray-600">
                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <FilterBar
          onSortChange={setSortState}
          onStatusFilterChange={handleStatusFilterChange}
          onHoursFilterChange={handleHoursFilterChange}
          onIdeaStatusFilterChange={handleIdeaStatusFilterChange}
          onReset={handleReset}
          activeStatusFilters={activeStatusFilters}
          activeSortOption={sortState.id}
          activeSortDirection={sortState.direction}
          activeHoursFilter={activeHoursFilter}           
          activeIdeaStatusFilter={activeIdeaStatusFilter} 
        />

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
            <p className="text-gray-600 mt-2">
              Try adjusting your search or filters to find more teammates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;