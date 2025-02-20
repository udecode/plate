'use client';

import * as React from 'react';
import type { ReactNode } from 'react';

import { cn } from '@udecode/cn';
import { Provider } from 'jotai';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Image from 'next/image';

import { CodeTabs } from '@/components/code-tabs';
import { ComponentInstallation } from '@/components/component-installation';
import { useConfig } from '@/hooks/use-config';
import { packageInfoAtom } from '@/hooks/use-package-info';

import {
  API,
  APIAttributes,
  APIItem,
  APIList,
  APIListAPI,
  APIMethods,
  APIOptions,
  APIParameters,
  APIProps,
  APIReturns,
  APIState,
  APISubList,
  APISubListItem,
  APITransforms,
} from './api-list';
import { BadgeList, BadgePopover } from './badge-popover';
import { Callout } from './callout';
import { Code } from './code';
import { CodeBlockWrapper } from './code-block-wrapper';
import { ComponentExample } from './component-example';
import { ComponentPreview } from './component-preview';
import { ComponentPreviewPro } from './component-preview-pro';
import { ComponentSource } from './component-source';
import { HydrateAtoms } from './context/hydrate-atoms';
import { FrameworkDocs } from './framework-docs';
import { Link } from './link';
import { PackageInfo } from './package-info';
import * as Typography from './typography';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AspectRatio } from './ui/aspect-ratio';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const components = {
  a: Link,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  API,
  APIAttributes,
  APIItem,
  APIList,
  APIListAPI,
  APIMethods,
  APIOptions,
  APIParameters,
  APIProps,
  APIReturns,
  APIState,
  APISubList,
  APISubListItem,
  APITransforms,
  AspectRatio,
  BadgeList,
  BadgePopover,
  blockquote: Typography.Blockquote,
  Callout,
  code: Code,
  CodeTabs,
  ComponentExample,
  ComponentInstallation,
  ComponentPreview,
  ComponentPreviewPro,
  ComponentSource,
  h1: Typography.H1,
  h2: Typography.H2,
  h3: Typography.H3,
  h4: Typography.H4,
  h5: Typography.H5,
  h6: Typography.H6,
  hr: Typography.HR,
  Image,
  img: Typography.Image,
  li: Typography.LI,
  ol: Typography.OL,
  p: Typography.P,
  PackageInfo,
  pre: Typography.Pre,
  Step: Typography.Step,
  Steps: Typography.Steps,
  table: Typography.Table,
  td: Typography.TD,
  th: Typography.TH,
  tr: Typography.TR,
  ul: Typography.UL,
  CodeBlockWrapper: ({ ...props }) => (
    <CodeBlockWrapper className="rounded-md border" {...props} />
  ),
  FrameworkDocs: ({
    className,
    ...props
  }: React.ComponentProps<typeof FrameworkDocs>) => (
    <FrameworkDocs className={className} {...props} />
  ),
  KeyTable: ({
    children,
    className,
    ...props
  }: React.ComponentProps<typeof Table>) => {
    return (
      <Table className={cn('my-4', className)} {...props}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Key</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    );
  },
  KeyTableItem: ({
    children,
    hotkey,
  }: {
    children: ReactNode;
    hotkey: string;
  }) => {
    return (
      <TableRow>
        <TableCell>
          <kbd className="inline-flex min-w-[8px] items-center justify-center rounded bg-muted px-2 whitespace-nowrap shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(248,_249,_250)_0px_1px_5px_0px_inset,_rgb(193,_200,_205)_0px_0px_0px_0.5px,_rgb(193,_200,_205)_0px_2px_1px_-1px,_rgb(193,_200,_205)_0px_1px_0px_0px] dark:shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(26,_29,_30)_0px_1px_5px_0px_inset,_rgb(76,_81,_85)_0px_0px_0px_0.5px,_rgb(76,_81,_85)_0px_2px_1px_-1px,_rgb(76,_81,_85)_0px_1px_0px_0px]">
            {hotkey}
          </kbd>
        </TableCell>
        <TableCell>{children}</TableCell>
      </TableRow>
    );
  },
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        'flex h-auto w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-colors *:shrink-0 hover:bg-muted/50 sm:p-10',
        className
      )}
      {...props}
    />
  ),
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs className={cn('relative mt-6 w-full', className)} {...props} />
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent
      className={cn(
        'relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-semibold',
        className
      )}
      {...props}
    />
  ),
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsList>) => (
    <TabsList
      className={cn(
        'w-full justify-start rounded-none border-b bg-transparent p-0',
        className
      )}
      {...props}
    />
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger
      className={cn(
        'relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pt-2 pb-3 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none',
        className
      )}
      {...props}
    />
  ),
};

export function Mdx({
  code,
  packageInfo,
}: {
  code: string;
  packageInfo?: {
    gzip: string | null;
  };
}) {
  const [config] = useConfig();
  const Component = useMDXComponent(code, {
    style: config.style,
  });

  return (
    <div className="typography">
      <Provider>
        <HydrateAtoms initialValues={[[packageInfoAtom, packageInfo]]}>
          <Component components={components as any} />
        </HydrateAtoms>
      </Provider>
    </div>
  );
}
