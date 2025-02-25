import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../api/apiClient';
import UserCard from './UserCard';
import Navbar from './Navbar';
import FilterBar from './FilterBar';
import { useFilters } from '../context/FilterContext';

function Dashboard() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const {
    searchTerm,
    setSearchTerm,
    sortState,
    setSortState,
    activeStatusFilters,
    setActiveStatusFilters,
    activeHoursFilter,
    setActiveHoursFilter,
    activeIdeaStatusFilter,
    setActiveIdeaStatusFilter,
  } = useFilters();
  
  const navigate = useNavigate();

  // Fetch users from API
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.user.getProfile();
        if (response?.user?._id) {
          setCurrentUserId(response.user._id);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    
    fetchCurrentUser();

    const fetchUsers = async () => {
      try {
        const response = await api.user.getDashboardUsers();
        setUsers(response.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLogout = () => {
    api.auth.logout(); // Updated from auth.signoutRedirect
  };

  const sortUsers = (users) => {
    return [...users].sort((a, b) => {
      let comparison = 0;
      switch (sortState.id) {
        case 'match':
          comparison = (b.matchPercentage || 0) - (a.matchPercentage || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'hours':
          comparison = (b.hoursPerWeek || 0) - (a.hoursPerWeek || 0);
          break;
        case 'recent':
          comparison = new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
          break;
        default:
          return 0;
      }
      return sortState.direction === 'desc' ? comparison : -comparison;
    });
  };

  const filteredUsers = sortUsers(users
    .filter(user => user._id !== currentUserId)
    .filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.intro || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.skills || []).some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = activeStatusFilters.length >= 0 && activeStatusFilters.some(status => {
      if (status === 'needsPM') return user.teamNeeds?.needsPM;
      if (status === 'needsDev') return user.teamNeeds?.needsDev;
      if (status === 'noNeeds') return !user.teamNeeds?.needsPM && !user.teamNeeds?.needsDev;
      return false;
    });
    
    const matchesHours = !activeHoursFilter || activeHoursFilter.length === 0 ? false :
      activeHoursFilter.some(range => {
        const hours = user.hoursPerWeek || 0;
        if (range === '20-30') return hours >= 20 && hours <= 30;
        if (range === '31-40') return hours >= 31 && hours <= 40;
        if (range === '41-50') return hours >= 41 && hours <= 50;
        if (range === '50+') return hours > 50;
        return false;
      });

    const matchesIdeaStatus = !activeIdeaStatusFilter || activeIdeaStatusFilter.length === 0 ? false :
      activeIdeaStatusFilter.includes(user.ideaStatus || '');
    
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
    setActiveHoursFilter(prev => {
      if (!prev) return [hoursRange];
      if (prev.includes(hoursRange)) {
        return prev.filter(h => h !== hoursRange);
      }
      return [...prev, hoursRange];
    });
  };
  
  const handleIdeaStatusFilterChange = (ideaStatus) => {
    setActiveIdeaStatusFilter(prev => {
      if (!prev) return [ideaStatus];
      if (prev.includes(ideaStatus)) {
        return prev.filter(s => s !== ideaStatus);
      }
      return [...prev, ideaStatus];
    });
  };

  const handleReset = () => {
    setSortState({ id: 'match', direction: 'desc' });
    setActiveStatusFilters(['needsPM', 'needsDev', 'noNeeds']);
    setActiveHoursFilter(null);
    setActiveIdeaStatusFilter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar handleLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <div className="mb-4 w-full">
              <div className="flex items-baseline justify-between">
                <h1 className="text-3xl font-bold text-black dark:text-gray-300">
                  Find Your Team
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-right">
                  Connect with potential teammates who complement your skills
                </p>
              </div>
            </div>
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
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user._id || user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No matches found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Try adjusting your search or filters to find more teammates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;