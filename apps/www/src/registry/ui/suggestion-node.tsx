'use client';

import * as React from 'react';

import { cva } from 'class-variance-authority';
import { CornerDownLeftIcon } from 'lucide-react';
import type {
  AnyPluginConfig,
  TElement,
  TSuggestionData,
  TSuggestionText,
  WithRequiredKey,
} from 'platejs';
import { KEYS } from 'platejs';
import type {
  PlateEditor,
  PlateLeafProps,
  RenderNodeWrapper,
} from 'platejs/react';

import { SuggestionPlugin } from '@platejs/suggestion/react';
import { PlateLeaf, useEditorPlugin, usePluginOption } from 'platejs/react';

import { cn } from '@/lib/utils';
import type { SuggestionConfig } from '@/registry/components/editor/plugins/suggestion-kit';

const suggestionPlugin = SuggestionPlugin as WithRequiredKey<SuggestionConfig>;

export const suggestionVariants = cva(
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

export function getBlockSuggestionWrapperClassName({
  elementType,
  isActive,
  isHover,
  isInsert,
  isRemove,
}: {
  elementType?: string;
  isActive: boolean;
  isHover: boolean;
  isInsert: boolean;
  isRemove: boolean;
}) {
  return cn(
    elementType === KEYS.columnGroup && 'flex size-full rounded',
    suggestionVariants({
      insertActive: isInsert && (isActive || isHover),
      remove: isRemove,
      removeActive: (isActive || isHover) && isRemove,
    })
  );
}

export function getElementSuggestionData(
  editor: PlateEditor,
  element: TElement
) {
  return editor.getApi(SuggestionPlugin).suggestion.suggestionData(element) as
    | TSuggestionData
    | undefined;
}

export function SuggestionLineBreakAnchor({
  badgeProps,
  children,
  className,
}: {
  badgeProps?: React.ComponentProps<'span'>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="inline-flex max-w-full items-center align-top">
      {children}
      <span
        {...badgeProps}
        className={cn(
          'inline-flex h-[calc(1lh+2px)] w-[1lh] shrink-0 items-center justify-center leading-none',
          badgeProps?.className,
          className
        )}
        contentEditable={false}
      >
        <CornerDownLeftIcon className="-top-px relative size-4" />
      </span>
    </div>
  );
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
