'use client';

import { cva } from 'class-variance-authority';
import { CornerDownLeftIcon } from 'lucide-react';
import type { TSuggestionData, TSuggestionText } from 'platejs';
import type { PlateLeafProps, RenderNodeWrapper } from 'platejs/react';
import { PlateLeaf, useEditorPlugin, usePluginOption } from 'platejs/react';
import * as React from 'react';
import {
  type SuggestionConfig,
  suggestionPlugin,
} from '@/components/editor/plugins/suggestion-kit';
import { cn } from '@/lib/utils';

const suggestionVariants = cva(
  cn(
    'bg-emerald-100 text-emerald-700 no-underline transition-colors duration-200'
  ),
  {
    defaultVariants: {
      insertActive: false,
      remove: false,
      removeActive: false,
    },
    variants: {
      insertActive: {
        false: '',
        true: 'bg-emerald-200/80',
      },
      remove: {
        false: '',
        true: 'bg-red-100 text-red-700',
      },
      removeActive: {
        false: '',
        true: 'bg-red-200/80 no-underline',
      },
    },
  }
);

export function SuggestionLeaf(props: PlateLeafProps<TSuggestionText>) {
  const { api, setOption } = useEditorPlugin(suggestionPlugin);
  const leaf = props.leaf;

  const leafId: string = api.suggestion.nodeId(leaf) ?? '';
  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginOption(suggestionPlugin, 'hoverId');
  const dataList = api.suggestion.dataList(leaf);

  const hasRemove = dataList.some((data) => data.type === 'remove');
  const hasActive = dataList.some((data) => data.id === activeSuggestionId);
  const hasHover = dataList.some((data) => data.id === hoverSuggestionId);

  const diffOperation = { type: hasRemove ? 'delete' : 'insert' } as const;

  const Component = ({ delete: 'del', insert: 'ins', update: 'span' } as const)[
    diffOperation.type
  ];

  return (
    <PlateLeaf
      {...props}
      as={Component}
      attributes={{
        ...props.attributes,
        onMouseEnter: () => setOption('hoverId', leafId),
        onMouseLeave: () => setOption('hoverId', null),
      }}
      className={cn(
        suggestionVariants({
          insertActive: hasActive || hasHover,
          remove: hasRemove,
          removeActive: (hasActive || hasHover) && hasRemove,
        })
      )}
    >
      {props.children}
    </PlateLeaf>
  );
}
export const SuggestionLineBreak: RenderNodeWrapper<SuggestionConfig> = ({
  api,
  element,
}) => {
  if (!api.suggestion.isBlockSuggestion(element)) return;

  const suggestionData = element.suggestion;

  return function Component({ children }) {
    return (
      <SuggestionLineBreakContent suggestionData={suggestionData}>
        {children}
      </SuggestionLineBreakContent>
    );
  };
};

function SuggestionLineBreakContent({
  children,
  suggestionData,
}: {
  children: React.ReactNode;
  suggestionData: TSuggestionData;
}) {
  const { isLineBreak, type } = suggestionData;
  const isRemove = type === 'remove';
  const isInsert = type === 'insert';

  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginOption(suggestionPlugin, 'hoverId');

  const isActive = activeSuggestionId === suggestionData.id;
  const isHover = hoverSuggestionId === suggestionData.id;

  const spanRef = React.useRef<HTMLSpanElement>(null);
  const { setOption } = useEditorPlugin(suggestionPlugin);

  return (
    <>
      {isLineBreak ? (
        <>
          {children}
          <span
            className={cn(
              'absolute text-justify',
              suggestionVariants({
                insertActive: isInsert && (isActive || isHover),
                remove: isRemove,
                removeActive: (isActive || isHover) && isRemove,
              })
            )}
            contentEditable={false}
            ref={spanRef}
            style={{
              bottom: 3.5,
              height: 21,
            }}
          >
            <CornerDownLeftIcon className="mt-0.5 size-4" />
          </span>
        </>
      ) : (
        <div
          className={cn(
            suggestionVariants({
              insertActive: isInsert && (isActive || isHover),
              remove: isRemove,
              removeActive: (isActive || isHover) && isRemove,
            })
          )}
          data-block-suggestion="true"
          onMouseEnter={() => setOption('hoverId', suggestionData.id)}
          onMouseLeave={() => setOption('hoverId', null)}
        >
          {children}
        </div>
      )}
    </>
  );
}
