import * as React from 'react';

import type { TCodeDrawingElement } from '@platejs/code-drawing';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function CodeDrawingElementStatic({
  children,
  ...props
}: SlateElementProps<TCodeDrawingElement>) {
  return (
    <SlateElement className="my-4 flex w-full items-stretch" {...props}>
      <div className="flex w-full flex-col md:flex-row">
        <div className="relative h-full min-w-0 flex-1 rounded-md bg-muted/50 p-8 pr-4">
          <pre className="m-0 overflow-x-auto font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
            <code className="block w-full">
              {(props.element.data?.code as string) ||
                'Enter your code here...'}
            </code>
          </pre>
        </div>
        <div className="relative flex min-w-0 flex-1 items-center justify-center rounded-md border bg-muted/30 p-4">
          <div className="text-muted-foreground">
            {props.element.data?.drawingType || 'Mermaid'}
          </div>
        </div>
      </div>
      {children}
    </SlateElement>
  );
}
