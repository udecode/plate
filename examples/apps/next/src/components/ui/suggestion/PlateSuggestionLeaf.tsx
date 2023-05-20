import React from 'react';
import { Value } from '@udecode/plate-common';
import {
  cn,
  PlateLeaf,
  PlateLeafProps,
} from '@udecode/plate-styled-components';
import {
  getSuggestionId,
  TSuggestionText,
  useSuggestionSelectors,
} from '@udecode/plate-suggestion';

export function PlateSuggestionLeaf<V extends Value = Value>({
  className,
  ...props
}: PlateLeafProps<V, TSuggestionText>) {
  const { children, leaf } = props;

  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const isActive = activeSuggestionId === getSuggestionId(leaf);

  return (
    <PlateLeaf
      className={cn(
        'text-[#398a55]',
        isActive && 'border border-x-0 border-y-2 border-[#147333]',
        leaf.suggestionDeletion && 'line-through',
        className
      )}
      {...props}
    >
      {children}
    </PlateLeaf>
  );
}
