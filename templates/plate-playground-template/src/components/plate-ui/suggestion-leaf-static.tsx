import React from 'react';

import { cn } from '@udecode/cn';
import { type SlateLeafProps, SlateLeaf } from '@udecode/plate';
import {
  type TSuggestionText,
  BaseSuggestionPlugin,
} from '@udecode/plate-suggestion';
import { useEditorPlugin } from '@udecode/plate/react';

export function SuggestionLeafStatic(props: SlateLeafProps) {
  const { children, className, leaf } = props;

  const { api } = useEditorPlugin(BaseSuggestionPlugin);

  const dataList = api.suggestion.dataList(leaf as TSuggestionText);

  const hasRemove = dataList.some((data) => data.type === 'remove');

  const diffOperation = {
    type: hasRemove ? 'delete' : 'insert',
  } as const;

  const Component = (
    {
      delete: 'del',
      insert: 'ins',
      update: 'span',
    } as const
  )[diffOperation.type];

  return (
    <SlateLeaf
      {...props}
      as={Component}
      className={cn(
        'border-b-2 border-b-brand/[.24] bg-brand/[.08] text-brand/80 no-underline transition-colors duration-200',
        hasRemove &&
          'border-b-gray-300 bg-gray-300/25 text-gray-400 line-through',
        className
      )}
    >
      {children}
    </SlateLeaf>
  );
}
