import * as React from 'react';

import type { SlateLeafProps } from '@udecode/plate';
import type { TSuggestionText } from '@udecode/plate-suggestion';

import { SlateLeaf } from '@udecode/plate';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';
import { useEditorPlugin } from '@udecode/plate/react';

import { cn } from '@/lib/utils';

export function SuggestionLeafStatic(props: SlateLeafProps<TSuggestionText>) {
  const { api } = useEditorPlugin(BaseSuggestionPlugin);
  const leaf = props.leaf;

  const dataList = api.suggestion.dataList(leaf);
  const hasRemove = dataList.some((data) => data.type === 'remove');
  const diffOperation = { type: hasRemove ? 'delete' : 'insert' } as const;

  const Component = ({ delete: 'del', insert: 'ins', update: 'span' } as const)[
    diffOperation.type
  ];

  return (
    <SlateLeaf
      {...props}
      as={Component}
      className={cn(
        'border-b-2 border-b-brand/[.24] bg-brand/[.08] text-brand/80 no-underline transition-colors duration-200',
        hasRemove &&
          'border-b-gray-300 bg-gray-300/25 text-gray-400 line-through'
      )}
    >
      {props.children}
    </SlateLeaf>
  );
}
