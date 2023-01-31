import React from 'react';
import { Value } from '@udecode/plate-core';
import { StyledLeaf, StyledLeafProps } from '@udecode/plate-styled-components';
import {
  getSuggestionId,
  TSuggestionText,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

export const PlateSuggestionLeaf = <V extends Value = Value>(
  props: StyledLeafProps<V, TSuggestionText>
) => {
  const { children, nodeProps, leaf } = props;

  console.log('www');
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const isActive = activeSuggestionId === getSuggestionId(leaf);

  return (
    <StyledLeaf
      {...props}
      nodeProps={{
        style: {
          color: '#398a55',
          borderTop: isActive ? '2px solid #147333' : undefined,
          borderBottom: isActive ? '2px solid #147333' : undefined,
        },
        ...nodeProps,
      }}
    >
      {children}
    </StyledLeaf>
  );
};
