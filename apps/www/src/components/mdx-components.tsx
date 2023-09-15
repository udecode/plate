'use client';

import * as React from 'react';
import { ReactNode } from 'react';
import Image from 'next/image';
import { Provider } from 'jotai';
import { useMDXComponent } from 'next-contentlayer/hooks';

import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/use-config';
import { packageInfoAtom } from '@/hooks/use-package-info';

import {
  APIAttributes,
  APIItem,
  APIList,
  APIOptions,
  APIParameters,
  APIProps,
  APIReturns,
  APIState,
  APISubList,
  APISubListItem,
} from './api-list';
import { BadgeList, BadgePopover } from './badge-popover';
import { Callout } from './callout';
import { Code } from './code';
import { CodeBlockWrapper } from './code-block-wrapper';
import { ComponentExample } from './component-example';
import { ComponentPreview } from './component-preview';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  h1: Typography.H1,
  h2: Typography.H2,
  h3: Typography.H3,
  h4: Typography.H4,
  h5: Typography.H5,
  h6: Typography.H6,
  a: Typography.A,
  p: Typography.P,
  ul: Typography.UL,
  ol: Typography.OL,
  li: Typography.LI,
  blockquote: Typography.Blockquote,
  img: Typography.Image,
  hr: Typography.HR,
  table: Typography.Table,
  tr: Typography.TR,
  th: Typography.TH,
  td: Typography.TD,
  pre: Typography.Pre,
  code: Code,
  Image,
  Callout,
  ComponentExample,
  ComponentPreview,
  ComponentSource,
  AspectRatio,
  CodeBlockWrapper: ({ ...props }) => (
    <CodeBlockWrapper className="rounded-md border" {...props} />
  ),
  Step: Typography.Step,
  Steps: Typography.Steps,
  KeyTableItem: ({
    hotkey,
    children,
  }: {
    hotkey: string;
    children: ReactNode;
  }) => {
    return (
      <TableRow>
        <TableCell>
          <kbd className="inline-flex min-w-[8px] items-center justify-center whitespace-nowrap rounded bg-muted px-2 shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(248,_249,_250)_0px_1px_5px_0px_inset,_rgb(193,_200,_205)_0px_0px_0px_0.5px,_rgb(193,_200,_205)_0px_2px_1px_-1px,_rgb(193,_200,_205)_0px_1px_0px_0px] dark:shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(26,_29,_30)_0px_1px_5px_0px_inset,_rgb(76,_81,_85)_0px_0px_0px_0.5px,_rgb(76,_81,_85)_0px_2px_1px_-1px,_rgb(76,_81,_85)_0px_1px_0px_0px]">
            {hotkey}
          </kbd>
        </TableCell>
        <TableCell>{children}</TableCell>
      </TableRow>
    );
  },
  KeyTable: ({
    className,
    children,
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
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs className={cn('relative mt-6 w-full', className)} {...props} />
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
        'relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none',
        className
      )}
      {...props}
    />
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
  FrameworkDocs: ({
    className,
    ...props
  }: React.ComponentProps<typeof FrameworkDocs>) => (
    <FrameworkDocs className={cn(className)} {...props} />
  ),
  Link,
  LinkedCard: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        'flex w-full flex-col items-center rounded-xl border bg-card p-6 text-card-foreground shadow transition-colors hover:bg-muted/50 sm:p-10',
        className
      )}
      {...props}
    />
  ),
  BadgeList,
  BadgePopover,
  APIParameters,
  APIAttributes,
  APIProps,
  APIState,
  APIReturns,
  APIOptions,
  APIList,
  APISubList,
  APISubListItem,
  APIItem,
  PackageInfo,
};

interface MdxProps {
  code: string;
  packageInfo?: {
    gzip: string | null;
  };
}

export function Mdx({ code, packageInfo }: MdxProps) {
  const [config] = useConfig();
  const Component = useMDXComponent(code, {
    style: config.style,
  });

  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className="typography">
      <Provider>
        <HydrateAtoms initialValues={[[packageInfoAtom, packageInfo]]}>
          <Component components={components as any} />
        </HydrateAtoms>
      </Provider>
    </div>
  );
}
