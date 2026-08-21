import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { cva } from 'class-variance-authority';
import {
  type ElementWith,
  type RenderStaticNodeWrapperProps,
  PLUGINS,
  TextApi,
} from 'platejs';
import { type PliteLeafProps, PliteLeaf } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export const voidRemoveSuggestionClass =
  'relative overflow-hidden before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:z-20 before:flex before:size-10 before:-translate-x-1/2 before:-translate-y-1/2 before:items-center before:justify-center before:rounded-full before:bg-red-500/90 before:text-2xl before:font-semibold before:text-white before:shadow-lg before:content-["X"] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-red-300/80 after:bg-zinc-950/35 after:content-[""]';

export const voidRemoveSuggestionOverlayVariants = cva(
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

export const voidRemoveSuggestionVariants = cva('', {
  defaultVariants: {
    active: false,
  },
  variants: {
    active: {
      false: '',
      true: voidRemoveSuggestionClass,
    },
  },
});

export function isStaticVoidRemoveSuggestion(
  element: ElementWith<typeof BaseSuggestionPlugin>
) {
  return element.suggestion?.type === 'remove';
}

export function VoidRemoveSuggestionOverlayStatic({
  editor,
  element,
}: RenderStaticNodeWrapperProps<typeof BaseSuggestionPlugin>) {
  const active =
    editor.read.schema.isVoid(element) &&
    !editor.read.schema.isInline(element) &&
    isStaticVoidRemoveSuggestion(element);

  if (!active) return null;

  return (
    <div
      className={voidRemoveSuggestionOverlayVariants({ active })}
      contentEditable={false}
      data-slot="void-remove-suggestion"
    />
  );
}

export function SuggestionLeafStatic(
  props: PliteLeafProps<typeof BaseSuggestionPlugin>
) {
  const { editor, leaf } = props;

  const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
  const dataList = suggestionApi.dataList(leaf);
  const hasRemove = dataList.some((data) => data.type === 'remove');
  const diffOperation = { type: hasRemove ? 'delete' : 'insert' } as const;

  const Component = ({ delete: 'del', insert: 'ins', update: 'span' } as const)[
    diffOperation.type
  ];

  return (
    <PliteLeaf
      {...props}
      as={Component}
      className={cn(
        'border-b-2 border-b-brand/[.24] bg-brand/[.08] text-brand/80 no-underline transition-colors duration-200',
        hasRemove &&
          'border-b-gray-300 bg-gray-300/25 text-gray-400 line-through'
      )}
    >
      {props.children}
    </PliteLeaf>
  );
}

const INLINE_SUGGESTION_RENDER_TARGETS = [
  PLUGINS.date,
  PLUGINS.inlineEquation,
  PLUGINS.link,
  PLUGINS.mention,
];

export const BaseSuggestionKit = [
  BaseSuggestionPlugin.configure({
    component: SuggestionLeafStatic,
    inject: {
      isElement: true,
      nodeProps: {
        nodeKey: '',
        styleKey: 'cssText',
        transformProps: ({ api, element, props }) => {
          if (!element) return props;

          let suggestionData = api.suggestionData(element);

          if (!suggestionData) {
            for (const child of element.children) {
              if (!TextApi.isText(child)) continue;

              suggestionData = api.dataList(child).at(-1);
              if (suggestionData) break;
            }
          }

          if (!suggestionData) return props;

          return {
            ...props,
            'data-inline-suggestion': suggestionData.type,
          };
        },
        transformStyle: () => ({}) as CSSStyleDeclaration,
      },
    },
    render: {
      belowRootNodes: VoidRemoveSuggestionOverlayStatic,
    },
    targetPlugins: INLINE_SUGGESTION_RENDER_TARGETS,
  }),
] as const;
