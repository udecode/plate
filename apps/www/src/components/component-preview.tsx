'use client';

import * as React from 'react';

import { Index } from '@/__registry__';
import {
  BlockViewer,
  type BlockViewerContext,
} from '@/components/block-viewer';
import {
  generatedPropSchemas,
  parseGeneratedItem,
  parseGeneratedProp,
  parseRegistryItem,
} from '@/lib/generated-props';
import { cn } from '@/lib/utils';
import { useMounted } from '@/registry/hooks/use-mounted';

import { Icons } from './icons';

const BlockExamples = new Set(['markdown-streaming-demo']);

const loadingPreview = (
  <div className="preview flex size-full min-h-[350px] items-center justify-center p-0 text-sm text-muted-foreground">
    <Icons.spinner className="mr-2 size-4 animate-spin" />
    Loading&hellip;
  </div>
);

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  __dependencies__?: string;
  __highlightedFiles__?: string;
  __item__?: string;
  __tree__?: string;
  align?: 'center' | 'end' | 'start';
  dependencies?: string[];
  description?: string;
  extractClassname?: boolean;
  extractedClassNames?: string;
  height?: string;
  hideCode?: boolean;
  highlightedFiles?: BlockViewerContext['highlightedFiles'];
  item?: BlockViewerContext['item'];
  padding?: 'md';
  tree?: BlockViewerContext['tree'];
  type?: 'block' | 'component' | 'example';
}

export function ComponentPreview({
  align = 'start',
  children,
  className,
  description,
  extractClassname,
  extractedClassNames,
  height,
  name,
  padding,
  type,
  ...props
}: ComponentPreviewProps) {
  const registryEntry: unknown = Index[name];
  const Component = Index[name]?.component;

  const Preview = Component ? (
    <Component {...props} id={props.id ?? name.replace('-demo', '')} />
  ) : (
    <p className="text-sm text-muted-foreground">
      Component{' '}
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
        {name}
      </code>{' '}
      not found in registry.
    </p>
  );

  const mounted = useMounted();

  let item =
    props.item ??
    parseGeneratedItem(props.__item__) ??
    parseRegistryItem(registryEntry);

  if (!item) {
    return <div className="mt-4 mb-12">{Preview}</div>;
  }

  // Create new object instead of mutating
  if (name === 'potion-iframe-demo') {
    item = {
      ...item,
      meta: {
        ...item.meta,
        isPro: true,
      },
    };
  }

  return (
    <div className="mt-4 mb-12">
      <BlockViewer
        block={BlockExamples.has(item.name)}
        dependencies={
          props.dependencies ??
          parseGeneratedProp(
            props.__dependencies__ ?? '[]',
            generatedPropSchemas.dependencies
          )
        }
        height={height}
        highlightedFiles={
          props.highlightedFiles ??
          parseGeneratedProp(
            props.__highlightedFiles__ ?? '[]',
            generatedPropSchemas.highlightedFiles
          )
        }
        item={item}
        preview={
          <React.Suspense fallback={loadingPreview}>
            {mounted ? (
              <div
                className={cn(
                  'preview relative flex size-full min-h-[350px] flex-col p-0',
                  padding === 'md' && 'p-4',
                  {
                    'items-center': align === 'center',
                    'items-end': align === 'end',
                    'items-start': align === 'start',
                  }
                )}
              >
                <div className="size-full grow">{Preview}</div>
              </div>
            ) : (
              loadingPreview
            )}
          </React.Suspense>
        }
        tree={
          props.tree ??
          parseGeneratedProp(props.__tree__ ?? '[]', generatedPropSchemas.tree)
        }
      />
    </div>
  );
}
