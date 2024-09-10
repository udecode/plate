'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import Link from 'next/link';

import { Index } from '@/__registry__';
import { useConfig } from '@/hooks/use-config';
import { buttonVariants } from '@/registry/default/plate-ui/button';
import { styles } from '@/registry/styles';

import { siteConfig } from '../config/site';
import { CopyButton } from './copy-button';
import { Icons } from './icons';
import { StyleSwitcher } from './style-switcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  align?: 'center' | 'end' | 'start';
  description?: string;
  extractClassname?: boolean;
  extractedClassNames?: string;
  hideCode?: boolean;
  padding?: 'md';
}

export function ComponentPreviewPro({
  align = 'start',
  children,
  className,
  description,
  extractClassname,
  extractedClassNames,
  hideCode = false,
  name,
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
      const [Button] = React.Children.toArray(
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
          {!hideCode && (
            <TabsList className="flex w-full items-center  justify-between  rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                value="preview"
              >
                Preview
              </TabsTrigger>
              <Link
                className={cn(
                  buttonVariants(),
                  'group relative flex justify-start gap-2 overflow-hidden whitespace-pre rounded-sm',
                  'dark:bg-muted dark:text-foreground',
                  'hover:ring-2 hover:ring-primary hover:ring-offset-2',
                  'transition-all duration-300 ease-out'
                )}
                href={`${siteConfig.links.potion}/pricing`}
                target="_blank"
              >
                <span
                  className={cn(
                    'absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12',
                    'bg-white opacity-10',
                    'transition-all duration-1000 ease-out '
                  )}
                />
                Get the code -&gt;
              </Link>
              {/* <Button className="mb-2 h-8"></Button> */}
            </TabsList>
          )}
        </div>
        <TabsContent className="relative rounded-md border" value="preview">
          {styles.length > 1 && (
            <div className="flex items-center justify-between p-4">
              <StyleSwitcher />

              <div className="flex items-center gap-2">
                {/* {config.style === "default" && description ? ( */}
                {/*  <V0Button */}
                {/*    block={{ */}
                {/*      code: codeString, */}
                {/*      name, */}
                {/*      style: config.style, */}
                {/*      description, */}
                {/*    }} */}
                {/*  /> */}
                {/* ) : null} */}
                <CopyButton
                  className="size-7 text-foreground opacity-100 hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
                  value={codeString}
                  variant="outline"
                />
              </div>
            </div>
          )}
          <React.Suspense
            fallback={
              <div className="preview flex min-h-[350px] w-full items-center justify-center p-0 text-sm text-muted-foreground">
                <Icons.spinner className="mr-2 size-4 animate-spin" />
                Loading...
              </div>
            }
          >
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
          </React.Suspense>
        </TabsContent>
        <TabsContent value="code">
          <div className="flex flex-col space-y-4">
            <div className="w-full rounded-md [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto">
              <div className="min-h-[350px] ">Upgrade to Pro</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
