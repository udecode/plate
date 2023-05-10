import React from 'react';
import {
  InjectComponentProps,
  InjectComponentReturnType,
  Value,
} from '@udecode/plate-common';
import tw from 'twin.macro';
import { MARK_SUGGESTION } from './constants';
import { useSuggestionSelectors } from './store';
import { getSuggestionId } from './utils';

export const InjectSuggestionComponent = <V extends Value = Value>(
  props: InjectComponentProps<V>
): InjectComponentReturnType<V> => {
  const { element } = props;

  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const isActive = activeSuggestionId === getSuggestionId(element);

  if (element[MARK_SUGGESTION]) {
    return ({ children }) => (
      <div
        className="slate-suggestion"
        css={[
          !isActive && tw`relative text-[#398a55]`,
          tw`border-x-0 border-y-[1px] border-[#147333] border-dashed`,
          (element.suggestionDeletion as any) &&
            tw`line-through decoration-[#398a55]`,
        ]}
      >
        {children}
      </div>
    );
  }
};
