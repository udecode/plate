'use client';

import * as React from 'react';

import { Index } from '@/__registry__';
import { BlockViewer } from '@/components/block-viewer';
import { cn } from '@/lib/utils';
import { useMounted } from '@/registry/hooks/use-mounted';

import { Icons } from './icons';

const BlockExamples = new Set(['markdown-streaming-demo']);

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  __dependencies__?: string;
  __highlightedFiles__?: string;
  __item__?: string;
  __tree__?: string;
  align?: 'center' | 'end' | 'start';
  dependencies?: any;
  description?: string;
  extractClassname?: boolean;
  extractedClassNames?: string;
  height?: string;
  hideCode?: boolean;
  highlightedFiles?: any;
  item?: any;
  padding?: 'md';
  tree?: any;
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
  const Preview = React.useMemo(() => {
    const Component = Index[name]?.component;

    if (!Component) {
      return (
        <p className="text-muted-foreground text-sm">
          Component{' '}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{' '}
          not found in registry.
        </p>
      );
    }

    // DIFF
    return <Component {...props} id={props.id ?? name.replace('-demo', '')} />;
  }, [name, props]);

  const mounted = useMounted();

  const loadingPreview = (
    <div className="preview flex size-full min-h-[350px] items-center justify-center p-0 text-muted-foreground text-sm">
      <Icons.spinner className="mr-2 size-4 animate-spin" />
      Loading...
    </div>
  );

  let item = props.item ?? JSON.parse(props.__item__ ?? '[]');

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
          props.dependencies ?? JSON.parse(props.__dependencies__ ?? '[]')
        }
        height={height}
        highlightedFiles={
          props.highlightedFiles ??
          JSON.parse(props.__highlightedFiles__ ?? '[]')
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
        tree={props.tree ?? JSON.parse(props.__tree__ ?? '[]')}
      />
    </div>
  );
}
