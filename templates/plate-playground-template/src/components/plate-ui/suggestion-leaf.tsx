'use client';
import React from 'react';

import type { TSuggestionText } from '@udecode/plate-suggestion';

import { cn } from '@udecode/cn';
import {
  type PlateLeafProps,
  PlateLeaf,
  useEditorPlugin,
  usePluginOption,
} from '@udecode/plate/react';

import { suggestionPlugin } from '@/components/editor/plugins/suggestion-plugin';

export function SuggestionLeaf(props: PlateLeafProps) {
  const { children, className, leaf } = props;

  const { api, setOption } = useEditorPlugin(suggestionPlugin);

  const leafId: string = api.suggestion.nodeId(leaf as TSuggestionText) ?? '';
  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginOption(suggestionPlugin, 'hoverId');
  const dataList = api.suggestion.dataList(leaf as TSuggestionText);

  const hasRemove = dataList.some((data) => data.type === 'remove');
  const hasActive = dataList.some((data) => data.id === activeSuggestionId);
  const hasHover = dataList.some((data) => data.id === hoverSuggestionId);

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
    <PlateLeaf
      {...props}
      as={Component}
      className={cn(
        'border-b-2 border-b-brand/[.24] bg-brand/[.08] text-brand/80 no-underline transition-colors duration-200',
        (hasActive || hasHover) && 'border-b-brand/[.60] bg-brand/[.13]',
        hasRemove &&
          'border-b-gray-300 bg-gray-300/25 text-gray-400 line-through',
        (hasActive || hasHover) &&
          hasRemove &&
          'border-b-gray-500 bg-gray-400/25 text-gray-500 no-underline',
        className
      )}
      onMouseEnter={() => setOption('hoverId', leafId)}
      onMouseLeave={() => setOption('hoverId', null)}
    >
      {children}
    </PlateLeaf>
  );
}
