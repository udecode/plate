'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import Link from 'next/link';

import { Markdown } from '@/components/markdown';
import ProIframeDemo from '@/registry/default/example/pro-iframe-demo';
import { buttonVariants } from '@/registry/default/plate-ui/button';

import { siteConfig } from '../config/site';
import { Icons } from './icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  description?: string;
  name?: string;
}

export function ComponentPreviewPro({
  id,
  children,
  className,
  description,
  name,
  ...props
}: ComponentPreviewProps) {
  if (!id && name) {
    id = name?.replace('-pro', '');
  }

  return (
    <div
      className={cn('relative mb-4 flex flex-col space-y-2', className)}
      {...props}
    >
      {description && <Markdown>{description}</Markdown>}
      <Tabs className="relative mr-auto mt-4 w-full" defaultValue="preview">
        <div className="flex items-center justify-between pb-3">
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
                'transition-all duration-300 ease-out',
                'mb-2 h-8'
              )}
              href={siteConfig.links.plateProExample(id)}
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
          </TabsList>
        </div>
        <TabsContent
          className="relative overflow-hidden rounded-md border"
          value="preview"
        >
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
                'preview relative flex size-full min-h-[350px] flex-col p-0'
              )}
            >
              <div className="size-full grow">
                <ProIframeDemo id={id} />
              </div>
            </div>
          </React.Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
