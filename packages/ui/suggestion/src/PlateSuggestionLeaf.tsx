import React from 'react';
import { findNodePath, getBlockAbove, Value } from '@udecode/plate-common';
import { StyledLeaf, StyledLeafProps } from '@udecode/plate-styled-components';
import {
  getSuggestionId,
  MARK_SUGGESTION,
  TSuggestionText,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';
import tw from 'twin.macro';

export const PlateSuggestionLeaf = <V extends Value = Value>(
  props: StyledLeafProps<V, TSuggestionText>
) => {
  const { children, text, editor } = props;

  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const isActive = activeSuggestionId === getSuggestionId(text);
  const blockAbove = getBlockAbove(editor, {
    at: findNodePath(editor, text),
    match: (n) => n[MARK_SUGGESTION],
  });
  if (blockAbove) return <>{children}</>;

  return (
    <StyledLeaf
      {...props}
      styles={{
        root: [
          !isActive && tw`text-[#398a55]`,
          isActive && tw`border-x-0 border-y-2 border-[#147333] border-solid`,
          text.suggestionDeletion && tw`line-through decoration-[#398a55]`,
        ],
      }}
    >
      {children}
    </StyledLeaf>
  );
};
