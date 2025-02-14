import React, { useRef } from 'react';

import { cn } from '@udecode/cn';
import {
  type SuggestionConfig,
  type TSuggestionLineBreak,
  SUGGESTION_KEYS,
} from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import {
  type RenderNodeWrapperProps,
  usePluginOption,
} from '@udecode/plate/react';
import { CornerDownLeftIcon } from 'lucide-react';

export const SuggestionBelowNodes = ({
  element,
}: RenderNodeWrapperProps<SuggestionConfig>) => {
  const lineBreakData = element[SUGGESTION_KEYS.lineBreak] as
    | TSuggestionLineBreak
    | undefined;

  if (!lineBreakData?.isLineBreak) return;

  return function Component({ children }: { children: React.ReactNode }) {
    return (
      <React.Fragment>
        {children}
        <SuggestionLineBreak lineBreakData={lineBreakData} />
      </React.Fragment>
    );
  };
};

function SuggestionLineBreak({
  lineBreakData,
}: {
  lineBreakData: TSuggestionLineBreak;
}) {
  const { type } = lineBreakData;
  const isRemove = type === 'remove';
  const isInsert = type === 'insert';

  const activeSuggestionId = usePluginOption(
    SuggestionPlugin,
    'activeSuggestionId'
  );
  const hoverSuggestionId = usePluginOption(
    SuggestionPlugin,
    'hoverSuggestionId'
  );

  const isActive = activeSuggestionId === lineBreakData.id;
  const isHover = hoverSuggestionId === lineBreakData.id;

  const spanRef = useRef<HTMLSpanElement>(null);

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
