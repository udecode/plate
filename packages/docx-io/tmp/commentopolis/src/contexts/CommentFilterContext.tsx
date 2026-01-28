import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import { useCommentFilters } from '../hooks/useCommentFilters';
import type { CommentFilterState } from '../types';

const CommentFilterContext = createContext<CommentFilterState | undefined>(undefined);

interface CommentFilterProviderProps {
  children: ReactNode;
}

export const CommentFilterProvider: React.FC<CommentFilterProviderProps> = ({ children }) => {
  const filterState = useCommentFilters();

  return (
    <CommentFilterContext.Provider value={filterState}>
      {children}
    </CommentFilterContext.Provider>
  );
};

// Export context for use in separate hook file
export { CommentFilterContext };