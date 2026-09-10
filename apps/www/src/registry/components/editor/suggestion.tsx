'use client';

import { cva } from 'class-variance-authority';
import { CornerDownLeftIcon } from 'lucide-react';
import {
  type Element,
  type Range,
  NodeApi,
  PLUGINS,
  type BasePluginOverride,
  type TrailingBlockDefinition,
  TextApi,
} from 'platejs';
import {
  type Editor,
  type PlateLeafProps,
  type RenderNodeWrapper,
  PlateLeaf,
  useEditorPlugin,
  usePluginStore,
} from 'platejs/react';
import {
  type SuggestionReview,
  type SuggestionData,
  BaseSuggestionPlugin,
} from 'platejs/suggestion';
import {
  SuggestionPlugin,
  useSuggestionReviews as useSemanticSuggestionReviews,
} from 'platejs/suggestion/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const getSuggestionTarget = (target: EventTarget | null, selector: string) => {
  const element =
    target instanceof globalThis.Element
      ? target
      : target instanceof globalThis.Node
        ? target.parentElement
        : null;

  return element?.closest(selector) ?? null;
};

const getSuggestionApi = (editor: Editor) =>
  editor.plugin(SuggestionPlugin).api;

export const suggestionVariants = cva(
  cn(
    'bg-emerald-100 text-emerald-700 no-underline transition-colors duration-200 hover:bg-emerald-200/80'
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
        true: 'bg-red-100 text-red-700 hover:bg-red-200/80',
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
  isInsert,
  isRemove,
}: {
  isActive: boolean;
  isColumnGroup: boolean;
  isInsert: boolean;
  isRemove: boolean;
}) {
  return cn(
    isColumnGroup && 'flex size-full rounded',
    suggestionVariants({
      insertActive: isInsert && isActive,
      remove: isRemove,
      removeActive: isActive && isRemove,
    })
  );
}

export function isVoidRemoveSuggestion(editor: Editor, element: Element) {
  return getSuggestionApi(editor).suggestionData(element)?.type === 'remove';
}

export function VoidRemoveSuggestionOverlay({
  editor,
  element,
}: {
  editor: Editor;
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
  const { api } = useEditorPlugin(SuggestionPlugin);
  const { leaf } = props;

  const activeSuggestionId = usePluginStore(suggestionPlugin, 'activeId');
  const dataList = api.dataList(leaf);

  const hasRemove = dataList.some((data) => data.type === 'remove');
  const hasActive = dataList.some((data) => data.id === activeSuggestionId);

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
          insertActive: hasActive,
          remove: hasRemove,
          removeActive: hasActive && hasRemove,
        })
      )}
    >
      {props.children}
    </PlateLeaf>
  );
}

export const SuggestionLineBreak: RenderNodeWrapper = ({ editor, element }) => {
  if (!getSuggestionApi(editor).isBlockSuggestion(element)) {
    return undefined;
  }

  const suggestionData = element.suggestion;
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

  const activeSuggestionId = usePluginStore(suggestionPlugin, 'activeId');

  const isActive = activeSuggestionId === suggestionData.id;

  const { store } = useEditorPlugin(suggestionPlugin);
  const lineBreakBadgeClassName = cn(
    isInsert &&
      'bg-transparent! text-emerald-700! transition-colors duration-200',
    isInsert && isActive && 'bg-transparent! text-emerald-700!',
    isRemove && 'bg-transparent! text-red-700! transition-colors duration-200',
    isRemove && isActive && 'bg-transparent! text-red-700!'
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
            isInsert,
            isRemove,
          })}
          data-block-suggestion="true"
        >
          {children}
        </div>
      )}
    </>
  );
}

export type SuggestionDiscussionReview = {
  createdAt: Date;
  suggestionId: string;
  type: SuggestionReview['type'];
  userId: string;
  blockIndices: readonly number[];
  range: Range;
  newProperties?: Record<string, unknown>;
  newText?: string;
  properties?: Record<string, unknown>;
  text?: string;
};

const getSuggestionElementText = (node: Element) => {
  for (const key of ['label', 'ref', 'value', 'latex'] as const) {
    const value = node[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return NodeApi.string(node);
};
const getBlockLabel = (node: Element) =>
  node.type
    .replaceAll('-', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (value) => value.toUpperCase());

const projectSuggestionReview = (
  review: SuggestionReview
): SuggestionDiscussionReview => {
  let insertedText = '';
  let removedText = '';
  const properties: Record<string, unknown> = {};
  const newProperties: Record<string, unknown> = {};
  for (const { node, data } of review.changes) {
    if (data.type === 'update') {
      Object.assign(properties, data.properties);
      Object.assign(newProperties, data.newProperties);
      insertedText += TextApi.isText(node)
        ? node.text
        : getSuggestionElementText(node);
      continue;
    }
    const text = TextApi.isText(node)
      ? node.text
      : 'isLineBreak' in data && data.isLineBreak
        ? '\n'
        : getSuggestionElementText(node) ||
          (typeof node.suggestion === 'object' ? getBlockLabel(node) : '');
    if (data.type === 'insert') insertedText += text;
    if (data.type === 'remove') removedText += text;
  }
  const base = {
    blockIndices: [...new Set(review.changes.map(({ path }) => path[0] ?? 0))],
    createdAt: new Date(review.createdAt),
    range: review.range,
    suggestionId: review.id,
    type: review.type,
    userId: review.userId,
  };
  if (review.type === 'update') {
    return { ...base, newProperties, newText: insertedText, properties };
  }
  if (review.type === 'replace') {
    return { ...base, newText: insertedText, text: removedText };
  }
  if (review.type === 'insert') return { ...base, newText: insertedText };
  return { ...base, text: removedText };
};

export function useSuggestionDiscussionReviews() {
  const reviews = useSemanticSuggestionReviews();
  return React.useMemo(() => reviews.map(projectSuggestionReview), [reviews]);
}

const INLINE_SUGGESTION_RENDER_TARGETS = [
  PLUGINS.date,
  PLUGINS.inlineEquation,
  PLUGINS.link,
  PLUGINS.mention,
];

export type SuggestionKitPluginState = {
  activeId: string | null;
  currentUserId: string | null;
};

const createInitialState = (
  currentUserId: string | null
): SuggestionKitPluginState => ({ activeId: null, currentUserId });

export const suggestionPlugin = SuggestionPlugin.extend(({ api, editor }) => ({
  initialState: createInitialState(editor.runtime.userId ?? 'alice'),
  override: {
    [PLUGINS.trailingBlock]: {
      initialState: {
        insert: (insert) => {
          api.untracked(insert);
        },
      },
    } satisfies BasePluginOverride<TrailingBlockDefinition>,
  },
})).configure({
  component: SuggestionLeaf,
  on: {
    // unset active suggestion when clicking outside of suggestion
    click: ({ api, editor, event, name, read, store }) => {
      const markTarget = getSuggestionTarget(event.target, `.plite-${name}`);
      const blockTarget = markTarget
        ? null
        : getSuggestionTarget(event.target, '[data-block-suggestion="true"]');

      if (!markTarget && !blockTarget) {
        store.set({ activeId: null });
        return;
      }

      const at = editor.api.dom.resolveEventRange(event);
      const suggestionEntry = read.node({
        ...(at ? { at } : {}),
        isText: !blockTarget,
      });

      store.set({
        activeId: suggestionEntry ? (api.id(suggestionEntry[0]) ?? null) : null,
      });
    },
  },
  inject: {
    isElement: true,
    nodeProps: {
      nodeKey: '',
      styleKey: 'cssText',
      transformProps: ({ editor, element, props }) => {
        if (!element) return props;

        const { api } = editor.plugin(BaseSuggestionPlugin);
        const suggestionData = api.suggestionData(element);

        if (!suggestionData) return props;

        return {
          ...props,
          'data-inline-suggestion': suggestionData.type,
        };
      },
      transformStyle: () => ({}) as CSSStyleDeclaration,
    },
  },
  slots: {
    afterNodeChildren: VoidRemoveSuggestionOverlay,
    wrapNodeChildren: SuggestionLineBreak,
  },
  targetPlugins: INLINE_SUGGESTION_RENDER_TARGETS,
});

export const SuggestionKit = [suggestionPlugin];
