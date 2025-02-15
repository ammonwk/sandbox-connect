import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SKILLS = [
  'Web Development', 'Mobile Development', 'UI/UX Design', 'Server-side Architecture',
  'API Development', 'Cloud Infrastructure', 'Data Analytics', 'Finances', 'Market Research', 'Sales/Marketing',
  'Product Strategy', 'Operations Management'
];

function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState({
    current: [],
    toLearn: [],
    teammates: []
  });
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [situation, setSituation] = useState(50);
  const navigate = useNavigate();

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
              Est. time: 3 min
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-black mb-8">
              Let's find your perfect team match
            </h2>
            
            {['current', 'toLearn', 'teammates'].map((category) => (
              <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200" key={category}>
                <button 
                  className="w-full flex justify-between items-center text-left text-xl font-semibold text-black"
                  onClick={() => {/* Toggle logic */}}
                >
                  {category === 'current' && "What skills do you already have confidence in?"}
                  {category === 'toLearn' && "What skills do you hope to learn while in Sandbox?"}
                  {category === 'teammates' && "What skills do you hope your teammates will have?"}
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => {
                        const current = selectedSkills[category];
                        const updated = current.includes(skill)
                          ? current.filter(s => s !== skill)
                          : current.length < 5 ? [...current, skill] : current;
                        setSelectedSkills({...selectedSkills, [category]: updated});
                      }}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSkills[category].includes(skill)
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
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
                  min="20"
                  max="65"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>20 hours</span>
                  <div className="flex justify-between text-sm">
                    {/* <span className="text-gray-600">20 hours</span> */}
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-black font-bold text-lg">
                      {hoursPerWeek} hours
                    </span>
                    {/* <span className="text-gray-600">65 hours</span> */}
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
                Do you have ideas, or do you need ideas?
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
                />
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Laser Focused</span>
                  <span className="text-gray-900">Wide Open</span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  {getSituationText(situation)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-1/3 bg-gray-100 text-black py-4 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-lg font-medium"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else navigate('/sandbox-headstart/dashboard');
          }}
          className={`${step > 1 ? 'w-2/3' : 'w-full'} bg-black text-white py-4 rounded-xl hover:bg-gray-900 transition-colors duration-200 text-lg font-medium`}
        >
          {step === 3 ? 'Complete Profile' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;