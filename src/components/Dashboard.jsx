import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiMessageSquare, FiUser } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';
import userData from '../data/users.json';
import UserCard from './UserCard';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
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
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/sandbox-headstart/dashboard" className="text-xl font-bold text-black">
                Sandbox Headstart
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link
                    to="/sandbox-headstart/dashboard"
                    className="text-black px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Discover
                  </Link>
                  <Link
                    // to="/messages"
                    to="/sandbox-headstart/dashboard"
                    className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/sandbox-headstart/profile/me"
                    className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Profile
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search teammates, skills, or keywords..."
                  className="w-96 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100">
                <FiMessageSquare className="h-6 w-6" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100">
                <IoNotificationsOutline className="h-6 w-6" />
              </button>
              
              {/* User menu dropdown */}
              <div className="relative">
                <button 
                  className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FiUser className="h-6 w-6" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/sandbox-headstart/profile/me"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/sandbox-headstart/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

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