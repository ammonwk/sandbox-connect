import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import MobileDropdown from './MobileDropdown';

function FilterBar({ 
  onSortChange, 
  onStatusFilterChange, 
  onHoursFilterChange,
  onIdeaStatusFilterChange,
  onReset,
  activeStatusFilters,
  activeSortOption,
  activeSortDirection,
  activeHoursFilter, 
  activeIdeaStatusFilter
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [layout, setLayout] = useState('desktop');
  const dropdownRefs = useRef({});

  useEffect(() => {
    const checkLayout = () => {
      if (window.innerWidth < 640) {
        setLayout('mobile');
        setIsMobile(true);
      } else if (window.innerWidth < 1024) {
        setLayout('tablet');
        setIsMobile(true);
      } else {
        setLayout('desktop');
        setIsMobile(false);
      }
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event) => {
        if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(event.target)) {
          setOpenDropdown(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown, isMobile]);

  const sortOptions = [
    { id: 'match', label: 'Match', icon: '％' },
    { id: 'name', label: 'Name', icon: 'A' },
    { id: 'hours', label: 'Hours Available', icon: '⏱' },
    { id: 'recent', label: 'Recently Active', icon: '⌚' }
  ];

  const statusFilters = [
    { id: 'looking', label: 'Looking for Team' },
    { id: 'open', label: 'Open to Join' },
    { id: 'closed', label: 'Closed Teams' }
  ];

  const hoursFilters = [
    { id: '20-30', label: '20-30 hours/week' },
    { id: '31-40', label: '31-40 hours/week' },
    { id: '41-50', label: '41-50 hours/week' },
    { id: '50+', label: '50+ hours/week' }
  ];

  const ideaStatusFilters = [
    { id: 'one', label: 'Has Specific Idea' },
    { id: 'few', label: 'Has Multiple Ideas' },
    { id: 'none', label: 'Open to Ideas' }
  ];

  const getHoursLabel = () => {
    if (!activeHoursFilter || activeHoursFilter.length === hoursFilters.length) return "All";
    return `${activeHoursFilter.length} selected`;
  };

  const getIdeaStatusLabel = () => {
    if (!activeIdeaStatusFilter || activeIdeaStatusFilter.length === ideaStatusFilters.length) return "All";
    return `${activeIdeaStatusFilter.length} selected`;
  };

  const handleDropdownClick = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeSortOption !== 'match') count++;
    if (activeStatusFilters.length < statusFilters.length) count++;
    if (activeHoursFilter && activeHoursFilter.length < hoursFilters.length) count++;
    if (activeIdeaStatusFilter && activeIdeaStatusFilter.length < ideaStatusFilters.length) count++;
    return count;
  };

  const hasActiveFilters = activeStatusFilters.length > 0 || 
    (activeHoursFilter && activeHoursFilter.length < hoursFilters.length) || 
    (activeIdeaStatusFilter && activeIdeaStatusFilter.length < ideaStatusFilters.length) || 
    activeSortOption !== 'match';

  const SortDropdown = () => (
    <div 
      className="relative w-full"
      ref={el => dropdownRefs.current['sort'] = el}
    >
      <div className="flex items-center space-x-2 px-2 py-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort:</span>
        <div className="flex flex-1 items-center space-x-2">
          <button
            onClick={() => handleDropdownClick('sort')}
            className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20 min-w-0"
          >
            <span className="text-sm text-gray-900 dark:text-white">
              {sortOptions.find(opt => opt.id === activeSortOption)?.label}
            </span>
            <FiChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ml-2 ${
              openDropdown === 'sort' ? 'transform rotate-180' : ''
            }`} />
          </button>
          
          <button
            onClick={() => onSortChange({ 
              id: activeSortOption, 
              direction: activeSortDirection === 'asc' ? 'desc' : 'asc' 
            })}
            className="px-2 py-1.5 bg-white dark:bg-gray-700 text-black dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20"
            aria-label="Toggle sort direction"
          >
            {activeSortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {!isMobile && openDropdown === 'sort' && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onSortChange({ 
                  id: option.id, 
                  direction: activeSortDirection 
                });
                setOpenDropdown(null);
              }}
              className={`flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 ${
                activeSortOption === option.id 
                  ? 'text-black dark:text-white font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <span className="w-6 text-center text-gray-400 dark:text-gray-500">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {isMobile && (
        <MobileDropdown
          isOpen={openDropdown === 'sort'}
          onClose={() => setOpenDropdown(null)}
          title="Sort By"
        >
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSortChange({ 
                    id: option.id, 
                    direction: activeSortDirection 
                  });
                  setOpenDropdown(null);
                }}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 ${
                  activeSortOption === option.id 
                    ? 'text-black dark:text-white font-medium bg-gray-50 dark:bg-gray-600' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="w-6 text-center text-gray-400 dark:text-gray-500">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </MobileDropdown>
      )}
    </div>
  );

  const Dropdown = ({ id, label, selection, content, isOpen, onClick }) => (
    <div 
      className="relative w-full"
      ref={el => dropdownRefs.current[id] = el}
    >
      <div className="flex items-center space-x-2 px-2 py-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{label}:</span>
        <button
          onClick={onClick}
          className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-20 min-w-0"
        >
          <span className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{selection}</span>
          <FiChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
      </div>
      
      {!isMobile && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {content}
        </div>
      )}
      {isMobile && (
        <MobileDropdown
          isOpen={isOpen}
          onClose={() => setOpenDropdown(null)}
          title={label}
        >
          {content}
        </MobileDropdown>
      )}
    </div>
  );

  return (
    <div className={`
      bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-4
      ${layout === 'desktop' ? 'overflow-visible' : 'overflow-hidden'}
    `}>
      {layout !== 'desktop' && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-black dark:bg-white text-white dark:text-black text-sm px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <FiChevronDown 
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
          />
        </button>
      )}

      <div className={`
        lg:p-4
        ${layout === 'desktop' ? 'max-h-none' : isExpanded ? 'max-h-[1000px] p-4' : 'max-h-0'}
        transition-all duration-300 ease-in-out
        overflow-visible
      `}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-visible">
            <div className="w-full min-w-[200px]">
              <SortDropdown />
            </div>
            
            <div className="w-full min-w-[200px]">
              <Dropdown
                id="status"
                label="Status"
                selection={activeStatusFilters.length === statusFilters.length 
                  ? "All" 
                  : `${activeStatusFilters.length} selected`}
                isOpen={openDropdown === 'status'}
                onClick={() => handleDropdownClick('status')}
                content={
                  <div className="p-2 space-y-1">
                    {statusFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeStatusFilters.includes(filter.id)}
                          onChange={() => onStatusFilterChange(filter.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                }
              />
            </div>
            
            <div className="w-full min-w-[200px]">
              <Dropdown
                id="hours"
                label="Hours"
                selection={getHoursLabel()}
                isOpen={openDropdown === 'hours'}
                onClick={() => handleDropdownClick('hours')}
                content={
                  <div className="p-2 space-y-1">
                    {hoursFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!activeHoursFilter || activeHoursFilter.includes(filter.id)}
                          onChange={() => onHoursFilterChange(filter.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                }
              />
            </div>
            
            <div className="w-full min-w-[200px]">
              <Dropdown
                id="idea"
                label="Project"
                selection={getIdeaStatusLabel()}
                isOpen={openDropdown === 'idea'}
                onClick={() => handleDropdownClick('idea')}
                content={
                  <div className="p-2 space-y-1">
                    {ideaStatusFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!activeIdeaStatusFilter || activeIdeaStatusFilter.includes(filter.id)}
                          onChange={() => onIdeaStatusFilterChange(filter.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                }
              />
            </div>
          </div>
      
          {hasActiveFilters && (
            <div className="flex lg:flex-none">
              <button
                onClick={onReset}
                className="text-m text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;