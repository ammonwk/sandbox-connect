import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

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
    const dropdownRefs = useRef({});
   
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(event.target)) {
          setOpenDropdown(null);
        }
      };
   
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);
   
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
   
    const hasActiveFilters = activeStatusFilters.length > 0 || 
      (activeHoursFilter && activeHoursFilter.length < hoursFilters.length) || 
      (activeIdeaStatusFilter && activeIdeaStatusFilter.length < ideaStatusFilters.length) || 
      activeSortOption !== 'match';
   
    const SortDropdown = () => (
      <div 
        className="relative"
        ref={el => dropdownRefs.current['sort'] = el}
      >
        <div className="flex items-center space-x-2 px-2 py-1">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort:</span>
          <div className="flex flex-1 items-center space-x-2">
            <button
              onClick={() => handleDropdownClick('sort')}
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 min-w-0"
            >
              <span className="text-sm text-gray-900">
                {sortOptions.find(opt => opt.id === activeSortOption)?.label}
              </span>
              <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
                openDropdown === 'sort' ? 'transform rotate-180' : ''
              }`} />
            </button>
            
            <button
              onClick={() => onSortChange({ 
                id: activeSortOption, 
                direction: activeSortDirection === 'asc' ? 'desc' : 'asc' 
              })}
              className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
              aria-label="Toggle sort direction"
            >
              {activeSortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        {openDropdown === 'sort' && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
                className={`flex items-center space-x-2 w-full px-3 py-2 hover:bg-gray-50 ${
                  activeSortOption === option.id ? 'text-black font-medium' : 'text-gray-600'
                }`}
              >
                <span className="w-6 text-center text-gray-400">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
   
    const Dropdown = ({ id, label, selection, content, isOpen, onClick }) => (
      <div 
        className="relative"
        ref={el => dropdownRefs.current[id] = el}
      >
        <div className="flex items-center space-x-2 px-2 py-1">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{label}:</span>
          <button
            onClick={onClick}
            className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20 min-w-0"
          >
            <span className="text-sm text-gray-900 truncate">{selection}</span>
            <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {content}
          </div>
        )}
      </div>
    );
   
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-[240px]">
              <SortDropdown />
            </div>
   
            <div className="w-full sm:w-[240px]">
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
                      <label key={filter.id} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeStatusFilters.includes(filter.id)}
                          onChange={() => onStatusFilterChange(filter.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                }
              />
            </div>
   
            <div className="w-full sm:w-[240px]">
              <Dropdown
                id="hours"
                label="Hours"
                selection={getHoursLabel()}
                isOpen={openDropdown === 'hours'}
                onClick={() => handleDropdownClick('hours')}
                content={
                  <div className="p-2 space-y-1">
                    {hoursFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!activeHoursFilter || activeHoursFilter.includes(filter.id)}
                          onChange={() => onHoursFilterChange(filter.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                }
              />
            </div>
   
            <div className="w-full sm:w-[240px]">
              <Dropdown
                id="idea"
                label="Project"
                selection={getIdeaStatusLabel()}
                isOpen={openDropdown === 'idea'}
                onClick={() => handleDropdownClick('idea')}
                content={
                  <div className="p-2 space-y-1">
                    {ideaStatusFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!activeIdeaStatusFilter || activeIdeaStatusFilter.includes(filter.id)}
                          onChange={() => onIdeaStatusFilterChange(filter.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                }
              />
            </div>
          </div>
   
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    );
   }
   
   export default FilterBar;