// components/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userData from '../data/users.json';
import UserCard from './UserCard';
import Navbar from './Navbar';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'looking', label: 'Looking for Team' },
    { id: 'open', label: 'Open to Join' },
    { id: 'closed', label: 'Closed Teams' }
  ];

  const filteredUsers = userData.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.intro.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.currentSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         user.desiredTeammateSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || user.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleLogout = () => {
    // Here you would typically clear any auth state/tokens
    navigate('/sandbox-headstart/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Find Your Team</h1>
          <p className="text-gray-600 mt-2">Connect with potential teammates who complement your skills</p>
        </div>

        {/* Filters and Results Count */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-4 overflow-x-auto pb-2 md:pb-0">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          
          <p className="text-gray-600 mt-2 md:mt-0">
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* User Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
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