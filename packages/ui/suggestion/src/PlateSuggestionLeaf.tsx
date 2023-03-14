import React from 'react';
import { Value } from '@udecode/plate-common';
import { StyledLeaf, StyledLeafProps } from '@udecode/plate-styled-components';
import {
  getSuggestionId,
  TSuggestionText,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';
import tw from 'twin.macro';

export const PlateSuggestionLeaf = <V extends Value = Value>(
  props: StyledLeafProps<V, TSuggestionText>
) => {
  const { children, leaf } = props;

  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const isActive = activeSuggestionId === getSuggestionId(leaf);

  return (
    <StyledLeaf
      {...props}
      styles={{
        root: [
          tw`text-[#398a55]`,
          isActive && tw`border-x-0 border-y-2 border-[#147333] border-solid`,
          leaf.suggestionDeletion && tw`line-through`,
        ],
      }}
    >
      {children}
    </StyledLeaf>
  );
};
