export const mySuggestionsProviderCode = `import React, { ReactNode } from 'react';
import { SuggestionProvider } from '@udecode/plate';
import { suggestionsData, usersData } from './constants';

export const MySuggestionProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SuggestionProvider
      suggestions={suggestionsData}
      users={usersData}
      myUserId="1"
    >
      {children}
    </SuggestionProvider>
  );
};
`;

export const mySuggestionsProviderFile = {
  '/suggestion/MySuggestionsProvider.tsx': mySuggestionsProviderCode,
};
