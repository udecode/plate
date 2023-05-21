import React, { ReactNode } from 'react';
// import { SuggestionProvider } from '@udecode/plate';

export function MySuggestionProvider({ children }: { children: ReactNode }) {
  return (
    <div>{children}</div>
    // <SuggestionProvider
    //   suggestions={suggestionsData}
    //   users={usersData}
    //   myUserId="1"
    // >
    //   {children}
    // </SuggestionProvider>
  );
}
