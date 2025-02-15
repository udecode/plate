import React from 'react';

import { cn } from '@udecode/cn';
import {
  getInlineSuggestionDataList,
  getInlineSuggestionId,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
  type PlateLeafProps,
  PlateLeaf,
  useEditorPlugin,
  usePluginOption,
} from '@udecode/plate/react';

export function SuggestionLeaf(props: PlateLeafProps) {
  const { children, className, leaf } = props;

  const { setOption } = useEditorPlugin(SuggestionPlugin);

  const leafId: string = getInlineSuggestionId(leaf) ?? '';
  const activeSuggestionId = usePluginOption(
    SuggestionPlugin,
    'activeSuggestionId'
  );
  const hoverSuggestionId = usePluginOption(
    SuggestionPlugin,
    'hoverSuggestionId'
  );
  const hasRemove = getInlineSuggestionDataList(leaf).some(
    (data) => data.type === 'remove'
  );
  const hasActive = getInlineSuggestionDataList(leaf).some(
    (data) => data.id === activeSuggestionId
  );
  const hasHover = getInlineSuggestionDataList(leaf).some(
    (data) => data.id === hoverSuggestionId
  );
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
      onMouseEnter={() => setOption('hoverSuggestionId', leafId)}
      onMouseLeave={() => setOption('hoverSuggestionId', null)}
    >
      {children}
    </PlateLeaf>
  );
}
