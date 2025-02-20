// UserCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKILLS } from '../data/skills';

function UserCard({ user }) {
  const navigate = useNavigate();
  
  const roleColors = {
    "Developer": "text-role-technical bg-tag-bg",
    "Designer": "text-role-design bg-tag-bg",
    "Project Manager": "text-role-management bg-tag-bg",
    "Technical Project Manager": "text-role-technicalmanagement bg-tag-bg",
    "Undecided": "text-gray-600 bg-gray-100"
  };

  const getTeamNeedsDisplay = (teamNeeds) => {
    if (!teamNeeds.needsPM && !teamNeeds.needsDev) {
      return {
        text: "Team Full",
        style: "text-status-full bg-tag-bg"
      };
    }
    
    const needs = [];
    if (teamNeeds.needsPM) needs.push("PM");
    if (teamNeeds.needsDev) needs.push("Dev");
    
    return {
      text: `Looking for ${needs.join(" & ")}`,
      style: "text-status-looking bg-tag-bg"
    };
  };

  const getCommitmentStyle = (hours) => {
    if (hours <= 30) {
      return "text-gray-700 font-normal";
    }
    if (hours <= 40) {
      return "text-gray-900 font-medium";
    }
    return "text-gray-900 font-bold";
  };

  const getCommitmentLevel = (hours) => {
    if (hours <= 30) return "Part-time:";
    if (hours <= 45) return "Full-time:";
    return "Over-time:";
  };

  const needsInfo = getTeamNeedsDisplay(user.teamNeeds);

  return (
    <div 
      onClick={() => navigate(`/sandbox-headstart/profile/${user.id}`)} 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`pl-2 py-1 rounded-full text-sm ${getCommitmentStyle(user.hoursPerWeek)}`}>
              {getCommitmentLevel(user.hoursPerWeek)}
            </span>
            <span className="text-gray-600 text-sm">
              {user.hoursPerWeek}h/week
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${needsInfo.style}`}>
            {needsInfo.text}
          </span>
        </div>

        <div className="flex items-center space-x-4">
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

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm rounded-full px-2 ${roleColors[user.role]}`}>
            {user.role}
          </span>
          <div className="text-gray-600 font-medium">
            {user.matchPercentage}% Match
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;