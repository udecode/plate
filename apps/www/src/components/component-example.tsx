'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';

import { CopyButton, CopyWithClassNames } from './copy-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentExampleProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'center' | 'end' | 'start';
  extractClassname?: boolean;
  extractedClassNames?: string;
  src?: string;
}

export function ComponentExample({
  align = 'start',
  children,
  className,
  extractClassname,
  extractedClassNames,
  src: _,
  ...props
}: ComponentExampleProps) {
  const [Example, Code, ...Children] = React.Children.toArray(
    children
  ) as React.ReactElement[];

  const codeString = React.useMemo(() => {
    if (Code?.props['data-rehype-pretty-code-fragment'] !== undefined) {
      const [, Button] = React.Children.toArray(
        Code.props.children
      ) as React.ReactElement[];

      return Button?.props?.value || Button?.props?.__rawString__ || null;
    }
  }, [Code]);

  return (
    <div
      className={cn('relative my-4 flex flex-col space-y-2', className)}
      {...props}
    >
      <Tabs className="relative mr-auto w-full" defaultValue="preview">
        <div className="flex items-center justify-between pb-3">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              value="preview"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              className="relative rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              value="code"
            >
              Code
            </TabsTrigger>
          </TabsList>
          {extractedClassNames ? (
            <CopyWithClassNames
              className="absolute right-4 top-20"
              value={codeString}
              classNames={extractedClassNames}
            />
          ) : (
            codeString && (
              <CopyButton
                className="absolute right-4 top-20"
                value={codeString}
              />
            )
          )}
        </div>
        <TabsContent className="rounded-md border" value="preview">
          <div
            className={cn('flex min-h-[350px] justify-center p-10', {
              'items-center': align === 'center',
              'items-end': align === 'end',
              'items-start': align === 'start',
            })}
          >
            <div className="w-full">{Example}</div>
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="flex flex-col space-y-4">
            <div className="w-full rounded-md [&_button]:hidden [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto">
              {Code}
            </div>
            {Children?.length ? (
              <div className="rounded-md [&_button]:hidden [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto">
                {Children}
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
