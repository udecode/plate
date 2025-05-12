'use client';

import * as React from 'react';

import type { TSuggestionData } from '@udecode/plate-suggestion';

import { type RenderNodeWrapper, usePluginOption } from '@udecode/plate/react';
import { CornerDownLeftIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  type SuggestionConfig,
  suggestionPlugin,
} from '@/components/editor/plugins/suggestion-plugin';

export const SuggestionBelowNodes: RenderNodeWrapper<SuggestionConfig> = ({
  api,
  element,
}) => {
  if (!api.suggestion.isBlockSuggestion(element)) return;

  const suggestionData = element.suggestion;

  if (!suggestionData?.isLineBreak) return;

  return function Component({ children }) {
    return (
      <React.Fragment>
        {children}
        <SuggestionLineBreak suggestionData={suggestionData} />
      </React.Fragment>
    );
  };
};

function SuggestionLineBreak({
  suggestionData,
}: {
  suggestionData: TSuggestionData;
}) {
  const { type } = suggestionData;
  const isRemove = type === 'remove';
  const isInsert = type === 'insert';

  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginOption(suggestionPlugin, 'hoverId');

  const isActive = activeSuggestionId === suggestionData.id;
  const isHover = hoverSuggestionId === suggestionData.id;

  const spanRef = React.useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={spanRef}
      className={cn(
        'absolute border-b-2 border-b-brand/[.24] bg-brand/[.08] text-justify text-brand/80 no-underline transition-colors duration-200',
        isInsert &&
          (isActive || isHover) &&
          'border-b-brand/[.60] bg-brand/[.13]',
        isRemove &&
          'border-b-gray-300 bg-gray-300/25 text-gray-400 line-through',
        isRemove &&
          (isActive || isHover) &&
          'border-b-gray-500 bg-gray-400/25 text-gray-500 no-underline'
      )}
      style={{
        bottom: 4.5,
        height: 21,
      }}
      contentEditable={false}
    >
      <CornerDownLeftIcon className="mt-0.5 size-4" />
    </span>
  );
}
