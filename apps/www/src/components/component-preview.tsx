'use client';

import * as React from 'react';
import { Index } from '@/__registry__';

import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/use-config';
import { styles } from '@/registry/styles';

import { CopyButton, CopyWithClassNames } from './copy-button';
import { Icons } from './icons';
import { StyleSwitcher } from './style-switcher';
import { ThemeWrapper } from './theme-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  extractClassname?: boolean;
  extractedClassNames?: string;
  align?: 'center' | 'start' | 'end';
  padding?: 'md';
}

export function ComponentPreview({
  name,
  children,
  className,
  extractClassname,
  extractedClassNames,
  align = 'start',
  padding,
  ...props
}: ComponentPreviewProps) {
  const [config] = useConfig();
  const index = styles.findIndex((style) => style.name === config.style);

  const Codes = React.Children.toArray(children) as React.ReactElement[];
  const Code = Codes[index];

  const Preview = React.useMemo(() => {
    const Component = Index[config.style][name]?.component;

    if (!Component) {
      return (
        <p className="text-sm text-muted-foreground">
          Component{' '}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{' '}
          not found in registry.
        </p>
      );
    }

    return <Component {...props} />;
  }, [config.style, name, props]);

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
      <Tabs defaultValue="preview" className="relative mr-auto w-full">
        <div className="flex items-center justify-between pb-3">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="preview"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="relative rounded-md border">
          {styles.length > 1 && (
            <div className="flex items-center justify-between p-4">
              <StyleSwitcher />
              {extractedClassNames ? (
                <CopyWithClassNames
                  value={codeString}
                  classNames={extractedClassNames}
                />
              ) : (
                codeString && <CopyButton value={codeString} />
              )}
            </div>
          )}
          <ThemeWrapper>
            <React.Suspense
              fallback={
                // eslint-disable-next-line tailwindcss/no-custom-classname
                <div className="preview flex min-h-[350px] w-full items-center justify-center p-0 text-sm text-muted-foreground">
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              }
            >
              <div
                // eslint-disable-next-line tailwindcss/no-custom-classname
                className={cn(
                  'preview relative flex h-full min-h-[350px] w-full flex-col p-0',
                  padding === 'md' && 'p-4',
                  {
                    'items-center': align === 'center',
                    'items-start': align === 'start',
                    'items-end': align === 'end',
                  }
                )}
              >
                <div className="h-full w-full grow">{Preview}</div>
              </div>
            </React.Suspense>
          </ThemeWrapper>
        </TabsContent>
        <TabsContent value="code">
          <div className="flex flex-col space-y-4">
            <div className="w-full rounded-md [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto">
              {Code}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
