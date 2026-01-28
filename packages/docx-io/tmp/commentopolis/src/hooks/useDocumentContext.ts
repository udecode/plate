import { useContext } from 'react';
import { DocumentContext } from '../contexts/DocumentContext';
import type { DocumentStateManager } from '../types';

export const useDocumentContext = (): DocumentStateManager => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};