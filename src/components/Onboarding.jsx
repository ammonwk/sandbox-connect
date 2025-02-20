import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKILLS, ROLES, determineRole } from '../data/skills';

function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState({
    current: []
  });
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [ideaStatus, setIdeaStatus] = useState('a few of them');
  const [openSection, setOpenSection] = useState('current');
  const [needsPM, setNeedsPM] = useState(false);
  const [needsDev, setNeedsDev] = useState(false);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isEditingRole, setIsEditingRole] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleSkillSelection = (skill) => {
    const current = selectedSkills.current;
    const MAX_SKILLS = 5;
  
    const newSkills = current.includes(skill)
      ? current.filter(s => s !== skill)
      : current.length < MAX_SKILLS 
        ? [...current, skill]
        : current;

    setSelectedSkills(prev => ({
      ...prev,
      current: newSkills
    }));

    // Determine and set the suggested role whenever skills change
    const determinedRole = determineRole(newSkills);
    setSuggestedRole(determinedRole);
    setSelectedRole(determinedRole);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-12">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 3) * 100 + 20}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Start</span>
          <span>Profile</span>
          <span>Complete</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <h2 className="text-4xl font-bold text-black">Welcome, Chris</h2>
            <p className="text-xl text-gray-700">
              Let's get your profile filled out...
            </p>
            <div className="inline-block bg-gray-100 text-black px-4 py-2 rounded-full text-sm">
              This will take about: 3 minutes
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-black mb-8">
              Let's find your perfect team match
            </h2>
            
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === 'current' ? null : 'current')}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
              >
                <span className="text-xl font-semibold text-black">
                  Skills you already have
                </span>
                <span className="text-sm text-gray-600">
                  {selectedSkills.current.length}/5 selected
                </span>
                <svg
                  className={`w-6 h-6 transform transition-transform ${
                    openSection === 'current' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'current' && (
                <div>
                  <div className="p-6 bg-white">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-black mb-4">Development Skills</h4>
                        <div className="flex flex-wrap gap-3">
                          {SKILLS.dev.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => handleSkillSelection(skill)}
                              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                                selectedSkills.current.includes(skill)
                                    ? 'bg-role-technical text-white'
                                    : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-medium text-black mb-4">Business Skills</h4>
                        <div className="flex flex-wrap gap-3">
                          {SKILLS.business.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => handleSkillSelection(skill)}
                              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                                selectedSkills.current.includes(skill)
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700">Based on your skills:</span>
                        {!isEditingRole ? (
                          <span className="font-semibold text-black">
                            You're a {selectedRole}
                          </span>
                        ) : (
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="ml-2 px-3 py-1 border border-gray-300 rounded-md bg-white"
                          >
                            {Object.values(ROLES).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <button
                        onClick={() => setIsEditingRole(!isEditingRole)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        {isEditingRole ? 'Save' : 'Change Role'}
                      </button>
                    </div>
                    {selectedSkills.current.length === 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        Select some skills above to get a role suggestion
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-semibold text-black mb-6">
                Realistically how many hours a week do you plan on dedicating to your start up?
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>15 hours</span>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-black font-bold text-lg">
                    {hoursPerWeek}{hoursPerWeek == 65 && '+'} hours 
                  </div>
                  <span>65 hours</span>
                </div>
                <p className="text-gray-700 italic text-center">
                  This helps match you with teammates who share similar commitment levels
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black mb-6">
                Do you already have a startup idea in mind?
              </h3>
              <div className="flex justify-center w-full overflow-x-visible">
                <div className="inline-flex rounded-full bg-gray-100 p-1 relative" 
                    style={{"--min-button-width": "clamp(5.5rem, 28vw, 8rem)"}}>
                  <div 
                    className="absolute h-[calc(100%-8px)] top-1 transition-all duration-150 ease-in-out bg-black rounded-full"
                    style={{
                      width: 'var(--min-button-width)',
                      left: `calc(${
                        ideaStatus === 'one, set in stone' ? '0' :
                        ideaStatus === 'a few of them' ? '1' :
                        '2'
                      } * var(--min-button-width) + 4px)`
                    }}
                  />
                  {[
                    'One, set in stone', 
                    'A few of them', 
                    'No, open to ideas'
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => setIdeaStatus(status.toLowerCase())}
                      className={`px-4 sm:px-4 py-2 sm:py-3 rounded-full text-s sm:text-sm font-medium 
                        transition-all duration-200 w-[var(--min-button-width)] text-center relative z-10 
                        leading-tight ${
                        ideaStatus === status.toLowerCase()
                          ? 'text-white'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black mb-6">
                What are you looking for in your team?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setNeedsPM(!needsPM)}
                  className={`flex items-center px-6 py-4 rounded-xl transition-all duration-200 ${
                    needsPM 
                      ? 'bg-gray-50 border-2 border-black' 
                      : 'bg-white border border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className={`h-5 w-5 rounded flex items-center justify-center border transition-colors duration-200 ${
                    needsPM 
                      ? 'bg-black border-black' 
                      : 'border-gray-300'
                  }`}>
                    {needsPM && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`ml-3 ${needsPM ? 'text-black' : 'text-gray-700'}`}>
                    I'm looking for a Project Manager
                  </span>
                </button>

                <button
                  onClick={() => setNeedsDev(!needsDev)}
                  className={`flex items-center px-6 py-4 rounded-xl transition-all duration-200 ${
                    needsDev 
                      ? 'bg-gray-50 border-2 border-black' 
                      : 'bg-white border border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className={`h-5 w-5 rounded flex items-center justify-center border transition-colors duration-200 ${
                    needsDev 
                      ? 'bg-black border-black' 
                      : 'border-gray-300'
                  }`}>
                    {needsDev && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`ml-3 ${needsDev ? 'text-black' : 'text-gray-700'}`}>
                    I'm looking for a Developer
                  </span>
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-600 bg-gray-50 px-6 py-4 rounded-xl">
                Status: {!needsPM && !needsDev ? "My team is full" : 
                        [
                          needsPM && "I'm looking for a PM",
                          needsDev && "I'm looking for a dev"
                        ].filter(Boolean).join(" and ")}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        {step > 1 && (
          <button
            onClick={() => {
              setStep(step - 1);
              scrollToTop();
            }}
            className="w-1/3 bg-gray-100 text-black py-4 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-lg font-medium"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (step < 3) {
              setStep(step + 1);
              scrollToTop();
            } else {
              navigate('/sandbox-headstart/dashboard');
            }
          }}
          className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-black hover:bg-gray-900 text-white py-4 rounded-xl transition-colors duration-200 text-lg font-medium`}
        >
          {step === 3 ? 'Complete Profile' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;