'use client';

import * as React from 'react';

import type {
  AnyPluginConfig,
  TElement,
  TSuggestionData,
  TSuggestionText,
  WithRequiredKey,
} from 'platejs';
import type {
  PlateEditor,
  PlateLeafProps,
  RenderNodeWrapper,
} from 'platejs/react';

import { SuggestionPlugin } from '@platejs/suggestion/react';
import { PlateLeaf, useEditorPlugin, usePluginOption } from 'platejs/react';

import { cn } from '@/lib/utils';
import type { SuggestionConfig } from '@/registry/components/editor/plugins/suggestion-kit';
import { SuggestionLineBreakAnchor } from '@/registry/ui/suggestion-line-break-anchor';
import {
  getBlockSuggestionWrapperClassName,
  suggestionVariants,
} from '@/registry/ui/suggestion-styles';

const suggestionPlugin = SuggestionPlugin as WithRequiredKey<SuggestionConfig>;

export const voidRemoveSuggestionClass =
  'relative overflow-hidden before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-20 before:flex before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:items-center before:justify-center before:rounded-full before:bg-red-500/90 before:text-2xl before:font-semibold before:text-white before:shadow-lg before:content-["X"] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-red-300/80 after:bg-zinc-950/35 after:content-[""]';

export function getElementSuggestionData(
  editor: PlateEditor,
  element: TElement
) {
  return editor.getApi(SuggestionPlugin).suggestion.suggestionData(element) as
    | TSuggestionData
    | undefined;
}

export function getStaticElementSuggestionData(element: TElement) {
  return (element as TElement & { suggestion?: TSuggestionData }).suggestion;
}

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
      className={cn(
        suggestionVariants({
          insertActive: hasActive || hasHover,
          remove: hasRemove,
          removeActive: (hasActive || hasHover) && hasRemove,
        })
      )}
      attributes={{
        ...props.attributes,
        onMouseEnter: () => setOption('hoverId', leafId),
        onMouseLeave: () => setOption('hoverId', null),
      }}
    >
      {props.children}
    </PlateLeaf>
  );
}
export const SuggestionLineBreak: RenderNodeWrapper<AnyPluginConfig> = ({
  api,
  element,
}) => {
  if (!api.suggestion.isBlockSuggestion(element)) return;

  const suggestionData = element.suggestion as TSuggestionData;

  return function Component({ children }) {
    return (
      <SuggestionLineBreakContent
        elementType={element.type}
        suggestionData={suggestionData}
      >
        {children}
      </SuggestionLineBreakContent>
    );
  };
};

export function SuggestionLineBreakContent({
  children,
  elementType,
  suggestionData,
}: {
  children: React.ReactNode;
  elementType?: string;
  suggestionData: TSuggestionData;
}) {
  const { isLineBreak, type } = suggestionData;
  const isRemove = type === 'remove';
  const isInsert = type === 'insert';

  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginOption(suggestionPlugin, 'hoverId');

  const isActive = activeSuggestionId === suggestionData.id;
  const isHover = hoverSuggestionId === suggestionData.id;

  const { setOption } = useEditorPlugin(suggestionPlugin);

  return (
    <>
      {isLineBreak ? (
        <SuggestionLineBreakAnchor
          badgeProps={{
            onClick: (event) => {
              event.stopPropagation();
              setOption('activeId', suggestionData.id);
            },
            onMouseDown: (event) => {
              event.preventDefault();
            },
          }}
          className={cn(
            suggestionVariants({
              insertActive: isInsert && (isActive || isHover),
              remove: isRemove,
              removeActive: (isActive || isHover) && isRemove,
            })
          )}
        >
          {children}
        </SuggestionLineBreakAnchor>
      ) : (
        <div
          className={getBlockSuggestionWrapperClassName({
            elementType,
            isActive,
            isHover,
            isInsert,
            isRemove,
          })}
          onMouseEnter={() => setOption('hoverId', suggestionData.id)}
          onMouseLeave={() => setOption('hoverId', null)}
          data-block-suggestion="true"
        >
          {children}
        </div>
      )}
    </>
  );
}
