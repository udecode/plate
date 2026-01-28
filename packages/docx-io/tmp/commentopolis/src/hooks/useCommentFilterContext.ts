import { useContext } from 'react';
import { CommentFilterContext } from '../contexts/CommentFilterContext';
import type { CommentFilterState } from '../types';

export const useCommentFilterContext = (): CommentFilterState => {
  const context = useContext(CommentFilterContext);
  if (context === undefined) {
    throw new Error('useCommentFilterContext must be used within a CommentFilterProvider');
  }
  return context;
};