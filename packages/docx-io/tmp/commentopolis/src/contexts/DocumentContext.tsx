import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import type { DocumentStateManager } from '../types';

const DocumentContext = createContext<DocumentStateManager | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const documentState = useDocuments();

  return (
    <DocumentContext.Provider value={documentState}>
      {children}
    </DocumentContext.Provider>
  );
};

// Export context for use in separate hook file
export { DocumentContext };