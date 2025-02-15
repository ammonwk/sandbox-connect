// src/context/FilterContext.jsx
import { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState({
    id: 'match',
    direction: 'desc'
  });
  const [activeStatusFilters, setActiveStatusFilters] = useState(['looking', 'open', 'closed']);
  const [activeHoursFilter, setActiveHoursFilter] = useState(null);
  const [activeIdeaStatusFilter, setActiveIdeaStatusFilter] = useState(null);

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