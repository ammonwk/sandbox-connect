export const SKILLS = {
    dev: [
      'Web Development', 
      'Mobile Development', 
      'UI/UX Design', 
      'Server-side Architecture',
      'API Development', 
      'Cloud Infrastructure'
    ],
    business: [
      'Data Analytics', 
      'Finances', 
      'Market Research', 
      'Sales/Marketing',
      'Product Strategy', 
      'Operations Management'
    ]
  };

export const ROLES = {
    DEVELOPER: 'Developer',
    PROJECT_MANAGER: 'Project Manager',
    TECHNICAL_PM: 'Technical Project Manager',
    DESIGNER: 'Designer',
    UNDECIDED: 'Undecided'
  };


export const determineRole = (skills) => {
    const devSkills = skills.filter(skill => SKILLS.dev.includes(skill)).length;
    const businessSkills = skills.filter(skill => SKILLS.business.includes(skill)).length;
    const hasDesignSkill = skills.includes('UI/UX Design');
    
    // Technical PM: Balance of dev and business skills
    if (devSkills >= 2 && businessSkills >= 2) {
      return ROLES.TECHNICAL_PM;
    }
    // Developer: Mostly dev skills
    else if (devSkills >= 2 && hasDesignSkill && devSkills <= 3) {
      return ROLES.DESIGNER;
    }
    // Developer: Mostly dev skills
    else if (devSkills > businessSkills) {
      return ROLES.DEVELOPER;
    }
    // PM: Mostly business skills
    else if (businessSkills >= 1) {
      return ROLES.PROJECT_MANAGER;
    }
    // Default to Undecided if no clear pattern
    return ROLES.UNDECIDED;
  };