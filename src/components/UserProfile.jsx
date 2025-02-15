// UserProfile.jsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { FaSlack } from 'react-icons/fa';
import { SKILLS } from '../data/skills';
import userData from '../data/users.json';

function UserProfile() {
  const { id } = useParams();
  const user = userData.users.find(u => u.id === parseInt(id));

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <Link to="/sandbox-headstart/dashboard" className="mt-4 inline-flex items-center text-black hover:underline">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/sandbox-headstart/dashboard" className="inline-flex items-center text-gray-600 hover:text-black">
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              <img
                src={user.photo}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover mb-4 md:mb-0"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black">{user.name}</h1>
                <p className="text-xl text-gray-600 mt-2">{user.intro}</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm mt-4 ${statusStyles[user.status]}`}>
                  {statusText[user.status]}
                </span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`mailto:${user.contact.email}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FiMail className="w-5 h-5 mr-2" />
                {user.contact.email}
              </a>
              <a
                href={`tel:${user.contact.phone}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FiPhone className="w-5 h-5 mr-2" />
                {user.contact.phone}
              </a>
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                <FaSlack className="w-5 h-5 mr-2" />
                {user.contact.slack}
              </div>
            </div>
          </div>

          {/* Skills Sections */}
          <div className="border-t border-gray-200 p-8">
            <div className="space-y-8">
              {/* Current & Learning Skills */}
              <div>
                <h2 className="text-xl font-semibold text-black mb-4">Their Skills</h2>
                <div className="space-y-6">
                  {/* Development Skills */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Development</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.currentSkills
                        .filter(skill => SKILLS.dev.includes(skill))
                        .map((skill) => (
                          <span
                            key={skill}
                            className="group relative px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                          >
                            {skill}
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                              Has experience
                            </span>
                          </span>
                        ))}
                      {user.learningSkills
                        ?.filter(skill => SKILLS.dev.includes(skill))
                        .map((skill) => (
                          <span
                            key={`learning-${skill}`}
                            className="group relative px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm border-2 border-dashed border-indigo-300"
                          >
                            {skill}
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                              Willing to learn
                            </span>
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Business Skills */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Business</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.currentSkills
                        .filter(skill => SKILLS.business.includes(skill))
                        .map((skill) => (
                          <span
                            key={skill}
                            className="group relative px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                          >
                            {skill}
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                              Has experience
                            </span>
                          </span>
                        ))}
                      {user.learningSkills
                        ?.filter(skill => SKILLS.business.includes(skill))
                        .map((skill) => (
                          <span
                            key={`learning-${skill}`}
                            className="group relative px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm border-2 border-dashed border-emerald-300"
                          >
                            {skill}
                            <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                              Willing to learn
                            </span>
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desired Teammate Skills */}
              <div>
                <h2 className="text-xl font-semibold text-black mb-4">Looking for Teammates With</h2>
                <div className="space-y-6">
                  {/* Development Skills */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Development</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.desiredTeammateSkills
                        ?.filter(skill => SKILLS.dev.includes(skill))
                        .map((skill) => (
                          <span
                            key={`teammate-${skill}`}
                            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Business Skills */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Business</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.desiredTeammateSkills
                        ?.filter(skill => SKILLS.business.includes(skill))
                        .map((skill) => (
                          <span
                            key={`teammate-${skill}`}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm border border-emerald-200"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors duration-200">
                Send Message via Slack
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;