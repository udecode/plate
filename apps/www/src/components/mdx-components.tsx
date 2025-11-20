'use client';

import * as React from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cva } from 'class-variance-authority';
import { Provider } from 'jotai';
import { CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react';
import { useMDXComponent } from 'next-contentlayer2/hooks';
import Image from 'next/image';

import { Card, Cards } from '@/components/cards';
import { CodeTabs } from '@/components/code-tabs';
import { ComponentInstallation } from '@/components/component-installation';
import { packageInfoAtom } from '@/hooks/use-package-info';
import { cn } from '@/lib/utils';

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
  AccordionContent,
  AccordionItem,
  Accordion as AccordionPrimitive,
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
  Accordions,
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
  Card,
  Cards,
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
  }: React.ComponentProps<typeof Table>) => (
    <Table className={cn('my-4', className)} {...props}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Key</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  ),
  KeyTableItem: ({
    children,
    hotkey,
  }: {
    children: ReactNode;
    hotkey: string;
  }) => (
    <TableRow>
      <TableCell>
        <kbd className="inline-flex min-w-[8px] items-center justify-center whitespace-nowrap rounded bg-muted px-2 shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(248,_249,_250)_0px_1px_5px_0px_inset,_rgb(193,_200,_205)_0px_0px_0px_0.5px,_rgb(193,_200,_205)_0px_2px_1px_-1px,_rgb(193,_200,_205)_0px_1px_0px_0px] dark:shadow-[rgba(255,_255,_255,_0.1)_0px_0.5px_0px_0px_inset,_rgb(26,_29,_30)_0px_1px_5px_0px_inset,_rgb(76,_81,_85)_0px_0px_0px_0.5px,_rgb(76,_81,_85)_0px_2px_1px_-1px,_rgb(76,_81,_85)_0px_1px_0px_0px]">
          {hotkey}
        </kbd>
      </TableCell>
      <TableCell>{children}</TableCell>
    </TableRow>
  ),
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
        'relative [&_h3.font-heading]:font-semibold [&_h3.font-heading]:text-base',
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
  const Component = useMDXComponent(code);

  return (
    <div className="typography">
      <Provider>
        <HydrateAtoms initialValues={[[packageInfoAtom, packageInfo]]}>
          {/* eslint-disable-next-line react-hooks/static-components -- useMDXComponent is designed to return dynamic MDX components */}
          <Component components={components as any} />
        </HydrateAtoms>
      </Provider>
    </div>
  );
}

// Fumadocs
function Accordions({
  children,
  disabled = false,
  orientation = 'vertical',
  type = 'single',
  ...props
}: {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  type?: 'multiple' | 'single';
}) {
  return (
    <AccordionPrimitive
      orientation={orientation}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </AccordionPrimitive>
  );
}

// Fumadocs
function Accordion({
  children,
  disabled = false,
  title,
  value,
  ...props
}: {
  children: ReactNode;
  title: string;
  asChild?: boolean;
  className?: string;
  disabled?: boolean;
  value?: string;
}) {
  return (
    <AccordionItem value={value ?? title} {...props}>
      <AccordionTrigger disabled={disabled}>{title}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

const calloutVariants = cva(
  cn(
    'my-4 flex gap-2 rounded-lg border border-s-2 bg-neutral-50 p-3 text-sm shadow-md first:mt-0 dark:bg-neutral-900',
    '*:[svg]:text-neutral-50 dark:*:[svg]:text-neutral-900',
    '**:[[data-slot="mdx-link"]]:hover:after:bottom-0'
  ),
  {
    variants: {
      type: {
        error: 'border-s-red-500/50',
        info: 'border-s-blue-500/50',
        success: 'border-s-green-500/50',
        warn: 'border-s-orange-500/50',
      },
    },
  }
);

// Fumadocs
function Callout({
  children,
  className,
  icon,
  title,
  type = 'info',
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, 'icon' | 'title' | 'type'> & {
  /** Force an icon */
  icon?: ReactNode;
  title?: ReactNode;
  /** @defaultValue info */
  type?:
    | 'destructive'
    | 'error'
    | 'info'
    | 'note'
    | 'success'
    | 'warn'
    | 'warning';
}) {
  if (type === 'warning') type = 'warn';
  if (type === 'note') type = 'info';
  if (type === 'destructive') type = 'error';

  return (
    <div
      className={cn(
        calloutVariants({
          type,
        }),
        className
      )}
      {...props}
    >
      {icon ??
        {
          error: <CircleX className="size-5 fill-red-500" />,
          info: <Info className="size-5 fill-blue-500" />,
          success: <CircleCheck className="size-5 fill-green-500" />,
          warn: <TriangleAlert className="size-5 fill-orange-500" />,
        }[type]}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {title ? <p className="!my-0 font-medium">{title}</p> : null}
        <div className="prose-no-margin text-neutral-600 **:leading-[calc(1.25/.875)] empty:hidden dark:text-neutral-400">
          {children}
        </div>
      </div>
    </div>
  );
}
