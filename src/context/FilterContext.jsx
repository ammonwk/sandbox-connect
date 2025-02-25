import { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState({
    id: 'match',
    direction: 'desc'
  });
  const [activeStatusFilters, setActiveStatusFilters] = useState(['needsPM', 'needsDev', 'noNeeds']);
  const [activeHoursFilter, setActiveHoursFilter] = useState(['20-30', '31-40', '41-50', '50+']);
  const [activeIdeaStatusFilter, setActiveIdeaStatusFilter] = useState(['one', 'few', 'none']);

  return (
    <FilterContext.Provider value={{
      searchTerm,
      setSearchTerm,
      sortState,
      setSortState,
      activeStatusFilters,
      setActiveStatusFilters,
      activeHoursFilter,
      setActiveHoursFilter,
      activeIdeaStatusFilter,
      setActiveIdeaStatusFilter,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  return useContext(FilterContext);
}