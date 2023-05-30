import React, { ReactNode } from 'react';
import { SuggestionProvider as SuggestionProviderPrimitive } from '@udecode/plate';

import {
  suggestionsData,
  usersData,
} from '@/plate/demo/values/suggestionValue';

export function SuggestionProvider({ children }: { children: ReactNode }) {
  return (
    <SuggestionProviderPrimitive
      suggestions={suggestionsData}
      users={usersData}
      currentUserId="1"
    >
      {children}
    </SuggestionProviderPrimitive>
  );
}
