import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function CodeDrawingElementStatic({
  children,
  ...props
}: PliteElementProps<typeof BaseCodeDrawingPlugin>) {
  const { code, language, view } = props.element;

  return (
    <PliteElement className="my-4 flex w-full items-stretch" {...props}>
      <div
        className={cn(
          'flex w-full flex-col',
          view === 'split' && 'md:flex-row'
        )}
      >
        {view !== 'preview' && (
          <div className="relative h-full min-w-0 flex-1 rounded-md bg-muted/50 p-8 pr-4">
            <pre className="m-0 overflow-x-auto font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
              <code className="block w-full">
                {code || 'Enter your code here...'}
              </code>
            </pre>
          </div>
        )}
        {view !== 'code' && (
          <div className="relative flex min-w-0 flex-1 items-center justify-center rounded-md border bg-muted/30 p-4">
            {view === 'preview' ? (
              <pre className="m-0 w-full overflow-x-auto font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
                <code className="block w-full">
                  {code || 'Enter your code here...'}
                </code>
              </pre>
            ) : (
              <div className="text-muted-foreground">{language}</div>
            )}
          </div>
        )}
      </div>
      {children}
    </PliteElement>
  );
}

export const BaseCodeDrawingKit = [
  BaseCodeDrawingPlugin.configure({
    component: CodeDrawingElementStatic,
  }),
];
