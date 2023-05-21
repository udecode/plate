import React, { ReactNode } from 'react';
import { SuggestionProvider } from '@udecode/plate';
import { suggestionsData, usersData } from './constants';

export function MySuggestionProvider({ children }: { children: ReactNode }) {
  return (
    <SuggestionProvider
      suggestions={suggestionsData}
      users={usersData}
      myUserId="1"
    >
      {children}
    </SuggestionProvider>
  );
}
