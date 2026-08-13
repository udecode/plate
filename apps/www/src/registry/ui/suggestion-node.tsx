'use client';

import * as React from 'react';

import type { Element } from '@platejs/plite';
import type { SuggestionData } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { cva } from 'class-variance-authority';
import { CornerDownLeftIcon } from 'lucide-react';
import { PLUGINS } from 'platejs';
import type {
  PlateEditor,
  PlateLeafProps,
  RenderNodeWrapper,
} from 'platejs/react';
import { PlateLeaf, useEditorPlugin, usePluginStore } from 'platejs/react';

import { cn } from '@/lib/utils';

const getSuggestionApi = (editor: PlateEditor) =>
  editor.plugin(SuggestionPlugin).api;

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

const voidRemoveSuggestionOverlayVariants = cva(
  'pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]',
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: 'hidden',
        true: 'before:-translate-x-1/2 before:-translate-y-1/2 before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-20 before:flex before:size-10 before:items-center before:justify-center before:rounded-full before:bg-red-500/90 before:font-semibold before:text-2xl before:text-white before:shadow-lg before:content-["X"] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-red-300/80 after:bg-zinc-950/35 after:content-[""]',
      },
    },
  }
);

export function getBlockSuggestionWrapperClassName({
  isActive,
  isColumnGroup,
  isHover,
  isInsert,
  isRemove,
}: {
  isActive: boolean;
  isColumnGroup: boolean;
  isHover: boolean;
  isInsert: boolean;
  isRemove: boolean;
}) {
  return cn(
    isColumnGroup && 'flex size-full rounded',
    suggestionVariants({
      insertActive: isInsert && (isActive || isHover),
      remove: isRemove,
      removeActive: (isActive || isHover) && isRemove,
    })
  );
}

export function isVoidRemoveSuggestion(editor: PlateEditor, element: Element) {
  return getSuggestionApi(editor).suggestionData(element)?.type === 'remove';
}

export function VoidRemoveSuggestionOverlay({
  editor,
  element,
}: {
  editor: PlateEditor;
  element: Element;
}) {
  const active =
    editor.read.schema.isVoid(element) &&
    !editor.read.schema.isInline(element) &&
    isVoidRemoveSuggestion(editor, element);

  if (!active) return null;

  return (
    <div
      className={voidRemoveSuggestionOverlayVariants({ active })}
      contentEditable={false}
      data-slot="void-remove-suggestion"
    />
  );
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
  const badge = (
    <span
      {...badgeProps}
      className={cn(
        'inline-flex h-[calc(1lh+2px)] w-[1lh] shrink-0 items-center justify-center leading-none',
        badgeProps?.className,
        className
      )}
      contentEditable={false}
    >
      <CornerDownLeftIcon className="relative top-px size-4" />
    </span>
  );

  return (
    <>
      {children}
      {badge}
    </>
  );
}

function SuggestionLineBreakElementAnchor({
  badgeProps,
  children,
  className,
}: {
  badgeProps?: React.ComponentProps<'span'>;
  children: React.ReactElement;
  className?: string;
}) {
  if (!React.isValidElement(children)) return children;
  const badge = (
    <span
      {...badgeProps}
      className={cn(
        'inline-flex h-[calc(1lh+2px)] w-[1lh] shrink-0 items-center justify-center leading-none',
        badgeProps?.className,
        className
      )}
      contentEditable={false}
    >
      <CornerDownLeftIcon className="relative top-px size-4" />
    </span>
  );

  if (children.type === 'ol' || children.type === 'ul') {
    const childNodes = React.Children.toArray(
      (children.props as { children?: React.ReactNode }).children
    );
    const lastIndex = childNodes.length - 1;
    const lastChild = childNodes[lastIndex];

    if (!React.isValidElement(lastChild) || lastChild.type !== 'li') {
      return children;
    }

    const nextLastChild = React.cloneElement(
      lastChild as React.ReactElement<{ children?: React.ReactNode }>,
      {
        children: (
          <>
            {(lastChild.props as { children?: React.ReactNode }).children}
            {badge}
          </>
        ),
      }
    );

    return React.cloneElement(
      children as React.ReactElement<{ children?: React.ReactNode }>,
      {
        children: [...childNodes.slice(0, lastIndex), nextLastChild],
      }
    );
  }

  if (typeof children.type === 'string') {
    return (
      <>
        {children}
        {badge}
      </>
    );
  }

  return React.cloneElement(
    children as React.ReactElement<{ lineBreakBadge?: React.ReactNode }>,
    { lineBreakBadge: badge }
  );
}

export function SuggestionLeaf(props: PlateLeafProps<typeof SuggestionPlugin>) {
  const { api, store } = useEditorPlugin(SuggestionPlugin);
  const leaf = props.leaf;

  const leafId: string = api.id(leaf) ?? '';
  const activeSuggestionId = usePluginStore(SuggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginStore(SuggestionPlugin, 'hoverId');
  const dataList = api.dataList(leaf);

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
        onMouseEnter: () => store.set({ hoverId: leafId }),
        onMouseLeave: () => store.set({ hoverId: null }),
      }}
    >
      {props.children}
    </PlateLeaf>
  );
}
export const SuggestionLineBreak: RenderNodeWrapper = ({ editor, element }) => {
  if (!getSuggestionApi(editor).isBlockSuggestion(element)) {
    return;
  }

  const suggestionData = element.suggestion as SuggestionData;
  const columnGroup = editor.plugin(PLUGINS.columnGroup);
  const isColumnGroup =
    columnGroup.installed && element.type === columnGroup.schema.type;

  return function Component({ children }) {
    return (
      <SuggestionLineBreakContent
        isColumnGroup={isColumnGroup}
        suggestionData={suggestionData}
      >
        {children}
      </SuggestionLineBreakContent>
    );
  };
};

export function SuggestionLineBreakContent({
  children,
  isColumnGroup,
  suggestionData,
}: {
  children: React.ReactNode;
  isColumnGroup: boolean;
  suggestionData: SuggestionData;
}) {
  const { isLineBreak, type } = suggestionData;
  const isRemove = type === 'remove';
  const isInsert = type === 'insert';

  const activeSuggestionId = usePluginStore(SuggestionPlugin, 'activeId');
  const hoverSuggestionId = usePluginStore(SuggestionPlugin, 'hoverId');

  const isActive = activeSuggestionId === suggestionData.id;
  const isHover = hoverSuggestionId === suggestionData.id;

  const { store } = useEditorPlugin(SuggestionPlugin);
  const lineBreakBadgeClassName = cn(
    isInsert &&
      'bg-transparent! text-emerald-700! transition-colors duration-200',
    isInsert && (isActive || isHover) && 'bg-transparent! text-emerald-700!',
    isRemove && 'bg-transparent! text-red-700! transition-colors duration-200',
    isRemove && (isActive || isHover) && 'bg-transparent! text-red-700!'
  );

  return (
    <>
      {isLineBreak ? (
        React.isValidElement(children) && typeof children.type !== 'string' ? (
          <SuggestionLineBreakElementAnchor
            badgeProps={{
              onClick: (event) => {
                event.stopPropagation();
                store.set({ activeId: suggestionData.id });
              },
              onMouseDown: (event) => {
                event.preventDefault();
              },
            }}
            className={lineBreakBadgeClassName}
          >
            {children}
          </SuggestionLineBreakElementAnchor>
        ) : React.isValidElement(children) &&
          (children.type === 'ol' || children.type === 'ul') ? (
          <SuggestionLineBreakElementAnchor
            badgeProps={{
              onClick: (event) => {
                event.stopPropagation();
                store.set({ activeId: suggestionData.id });
              },
              onMouseDown: (event) => {
                event.preventDefault();
              },
            }}
            className={lineBreakBadgeClassName}
          >
            {children}
          </SuggestionLineBreakElementAnchor>
        ) : (
          <SuggestionLineBreakAnchor
            badgeProps={{
              onClick: (event) => {
                event.stopPropagation();
                store.set({ activeId: suggestionData.id });
              },
              onMouseDown: (event) => {
                event.preventDefault();
              },
            }}
            className={lineBreakBadgeClassName}
          >
            {children}
          </SuggestionLineBreakAnchor>
        )
      ) : (
        <div
          className={getBlockSuggestionWrapperClassName({
            isActive,
            isColumnGroup,
            isHover,
            isInsert,
            isRemove,
          })}
          onMouseEnter={() => store.set({ hoverId: suggestionData.id })}
          onMouseLeave={() => store.set({ hoverId: null })}
          data-block-suggestion="true"
        >
          {children}
        </div>
      )}
    </>
  );
}
