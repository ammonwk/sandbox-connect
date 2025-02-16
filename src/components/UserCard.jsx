// UserCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKILLS } from '../data/skills';

function UserCard({ user }) {
  const navigate = useNavigate();
  
  const statusStyles = {
    looking: "bg-green-100 text-green-800",
    open: "bg-yellow-100 text-yellow-800",
    closed: "bg-red-100 text-red-800"
  };
  
  const statusText = {
    looking: "Looking for a team",
    open: "Open to new teammates",
    closed: "Closed team"
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (percentage >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
    if (percentage >= 40) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  // Helper function to get first N items
  const getFirstN = (array, n) => array?.slice(0, n) || [];
  const hasMore = (array, shown) => array?.length > shown;

  const ideaStatusText = {
    one: "Set on an idea",
    few: "Has a few ideas",
    none: "Looking for ideas"
  };

  return (
    <div onClick={() => navigate(`/sandbox-headstart/profile/${user.id}`)} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
      <div className="p-6">
        {/* Top section with match & status */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[user.status]}`}>
            {statusText[user.status]}
          </span>
          <div className={`border rounded-full px-3 py-1 ${getMatchColor(user.matchPercentage)}`}>
            <span className="font-semibold text-sm">{user.matchPercentage}% Match</span>
          </div>
        </div>

        {/* Main profile section */}
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={user.photo} 
            alt={user.name} 
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-black">{user.name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{user.intro}</p>
          </div>
        </div>

        {/* Key details */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{user.hoursPerWeek}h/week</span>
          <span>{ideaStatusText[user.ideaStatus]}</span>
        </div>

        {/* Skills Preview - activeIdeaStatusFilters/Needs comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* activeIdeaStatusFilters */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Experienced with:</h4>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-1">
                {getFirstN(user.currentSkills, 2).map((skill) => (
                  <span
                    key={skill}
                    className={`px-2 py-1 text-sm rounded-full text-center
                      ${SKILLS.dev.includes(skill) 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-emerald-100 text-emerald-700'
                      }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {hasMore(user.currentSkills, 2) && (
                <span className="text-xs text-gray-500">+{user.currentSkills.length - 2} more...</span>
              )}
            </div>
          </div>
          
          {/* Needs */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Looking for:</h4>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap gap-1">
                {getFirstN(user.desiredTeammateSkills, 2).map((skill) => (
                  <span
                    key={`desired-${skill}`}
                    className={`px-2 py-1 text-sm rounded-full border text-center
                      ${SKILLS.dev.includes(skill) 
                        ? 'border-indigo-200 text-indigo-700' 
                        : 'border-emerald-200 text-emerald-700'
                      }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {hasMore(user.desiredTeammateSkills, 2) && (
                <span className="text-xs text-gray-500">+{user.desiredTeammateSkills.length - 2} more...</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => navigate(`/sandbox-headstart/profile/${user.id}`)}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserCard;