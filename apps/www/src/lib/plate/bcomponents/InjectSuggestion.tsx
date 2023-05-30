import React from 'react';
import {
  InjectComponentProps,
  InjectComponentReturnType,
} from '@udecode/plate-common';
import {
  getSuggestionId,
  MARK_SUGGESTION,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

import { cn } from '@/lib/utils';

export const InjectSuggestion = (
  props: InjectComponentProps
): InjectComponentReturnType => {
  const { element } = props;

  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const isActive = activeSuggestionId === getSuggestionId(element);

  if (element[MARK_SUGGESTION]) {
    return function Suggestion({ children }) {
      return (
        <div
          className={cn(
            !isActive && 'relative text-[#398a55]',
            'border-x-0 border-y-[1px] border-dashed border-[#147333]',
            (element.suggestionDeletion as boolean) &&
              'line-through decoration-[#398a55]'
          )}
        >
          {children}
        </div>
      );
    };
  }
};
