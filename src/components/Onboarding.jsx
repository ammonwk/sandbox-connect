import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKILLS } from '../data/skills';

function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState({
    current: [],
    toLearn: [],
    teammates: []
  });
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [ideaStatus, setIdeaStatus] = useState('a few of them');
  const [openSection, setOpenSection] = useState('current');
  const [teamStatus, setTeamStatus] = useState('looking');
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { // Scroll to top on load
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  const scrollToTop = () => { // Scroll to top on step change
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const validateSkills = () => {
    const hasCurrentSkill = selectedSkills.current.length >= 1;
    const hasTeammateSkill = selectedSkills.teammates.length >= 1;
    setIsValid(hasCurrentSkill && hasTeammateSkill);
  };

  const handleSkillSelection = (category, skill) => {
    const current = selectedSkills[category];
    const MAX_SKILLS = 5;
  
    setSelectedSkills(prev => {
      const updated = {
        ...prev,
        [category]: current.includes(skill)
          ? current.filter(s => s !== skill)
          : current.length < MAX_SKILLS 
            ? [...current, skill]
            : current
      };
      // Validate after updating
      setTimeout(() => {
        const hasCurrentSkill = updated.current.length >= 1;
        const hasTeammateSkill = updated.teammates.length >= 1;
        setIsValid(hasCurrentSkill && hasTeammateSkill);
      }, 0);
      return updated;
    });
  };

  const getSituationText = (value) => {
    if (value < 33) return "I have a specific startup idea that I'm pretty set on.";
    if (value < 66) return "I have some ideas, but I'm not committed to any specific one yet.";
    return "I don't really have any ideas yet.";
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
            
            {['current', 'toLearn', 'teammates'].map((category) => (
              <div className="border border-gray-200 rounded-xl overflow-hidden" key={category}>
                <button
                  onClick={() => setOpenSection(openSection === category ? null : category)}
                  className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                >
                  <span className="text-xl font-semibold text-black">
                    {category === 'current' && "Skills you already have"}
                    {category === 'toLearn' && "Skills you want to learn"}
                    {category === 'teammates' && "Skills you want in teammates"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {selectedSkills[category].length}/5 selected
                  </span>
                  <svg
                    className={`w-6 h-6 transform transition-transform ${
                      openSection === category ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openSection === category && (
                  <div className="p-6 bg-white">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-black mb-4">Development Skills</h4>
                        <div className="flex flex-wrap gap-3">
                          {SKILLS.dev.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => handleSkillSelection(category, skill)}
                              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                                selectedSkills[category].includes(skill)
                                  ? 'bg-indigo-600 text-white'
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
                              onClick={() => handleSkillSelection(category, skill)}
                              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                                selectedSkills[category].includes(skill)
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
                )}
              </div>
            ))}
            
            {!isValid && (
              <p className="text-red-600 text-sm">
                Please select at least one current skill and one desired teammate skill to continue
              </p>
            )}
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
                What's your team situation?
              </h3>
              <div className="flex justify-center w-full overflow-x-visible">
                <div className="inline-flex rounded-full bg-gray-100 p-1 relative" 
                    style={{"--min-button-width": "clamp(5.5rem, 28vw, 8rem)"}}>
                  <div 
                    className="absolute h-[calc(100%-8px)] top-1 transition-all duration-150 ease-in-out bg-black rounded-full"
                    style={{
                      width: 'var(--min-button-width)',
                      left: `calc(${
                        teamStatus === 'looking' ? '0' :
                        teamStatus === 'found some' ? '1' :
                        '2'
                      } * var(--min-button-width) + 4px)`
                    }}
                  />
                  {['Looking', 'Found Some', 'Complete'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setTeamStatus(status.toLowerCase())}
                      className={`px-4 sm:px-4 py-2 sm:py-3 rounded-full text-s sm:text-sm font-medium 
                        transition-all duration-200 w-[var(--min-button-width)] text-center relative z-10 
                        leading-tight ${
                        teamStatus === status.toLowerCase()
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
              if (step === 2 && !isValid) return;
              setStep(step + 1);
              scrollToTop();
            } else {
              navigate('/sandbox-headstart/dashboard');
            }
          }}
          className={`${step > 1 ? 'w-2/3' : 'w-full'} ${
            step === 2 && !isValid 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-black hover:bg-gray-900'
          } text-white py-4 rounded-xl transition-colors duration-200 text-lg font-medium`}
          disabled={step === 2 && !isValid}
        >
          {step === 3 ? 'Complete Profile' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;