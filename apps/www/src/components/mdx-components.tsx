import * as React from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { Card, Cards } from '@/components/cards';
import { CodeTabs } from '@/components/code-tabs';
import { ComponentInstallation } from '@/components/component-installation';
import { File, Files, Folder } from '@/components/docs-files';
import { TypeTable } from '@/components/docs-type-table';
import {
  type CalloutType,
  type CalloutVariant,
  getCalloutVariant,
  getCalloutVariantClassName,
} from '@/lib/callout-variants';
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
import { CodeBlockCommand } from './code-block-command';
import { CodeBlockWrapper } from './code-block-wrapper';
import { ComponentExample } from './component-example';
import { ComponentPreview } from './component-preview';
import { ComponentPreviewPro } from './component-preview-pro';
import { ComponentSource } from './component-source';
import { FrameworkDocs } from './framework-docs';
import { Link } from './link';
import { PackageInfo } from './package-info';
import { PlateUiChangelog } from './plate-ui-changelog';
import * as Typography from './typography';
import {
  AccordionContent,
  AccordionItem,
  Accordion as AccordionRoot,
  AccordionTrigger,
} from './ui/accordion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AspectRatio } from './ui/aspect-ratio';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const ReleaseIndex = dynamic(() =>
  import('./release-index').then((module) => module.ReleaseIndex)
);

export const mdxComponents = {
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
  Button,
  Callout,
  Card,
  Cards,
  code: Code,
  CodeBlockCommand,
  CodeTabs,
  ComponentExample,
  ComponentInstallation,
  ComponentPreview,
  ComponentPreviewPro,
  ComponentSource,
  File,
  Files,
  Folder,
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
  PlateUiChangelog,
  pre: Typography.Pre,
  ReleaseIndex,
  Step: Typography.Step,
  Steps: Typography.Steps,
  table: Typography.Table,
  td: Typography.TD,
  th: Typography.TH,
  tr: Typography.TR,
  TypeTable,
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
        'flex w-full flex-col items-center rounded-xl bg-surface p-6 text-surface-foreground transition-colors hover:bg-surface/80 sm:p-10',
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

// Fumadocs
function Accordions({
  children,
  className,
  disabled: _disabled = false,
  orientation: _orientation = 'vertical',
  type: _type = 'single',
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
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
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
    <AccordionRoot type="single" collapsible>
      <AccordionItem value={value ?? title} {...props}>
        <AccordionTrigger disabled={disabled}>{title}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  );
}

function Callout({
  children,
  className,
  icon,
  title,
  type,
  variant = 'default',
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, 'icon' | 'title' | 'type'> & {
  icon?: ReactNode;
  title?: ReactNode;
  type?: CalloutType;
  variant?: CalloutVariant;
}) {
  const resolvedVariant = getCalloutVariant({ type, variant });

  return (
    <Alert
      data-variant={resolvedVariant}
      className={cn(
        'md:-mx-1 mt-6 w-auto rounded-xl border-surface bg-surface text-surface-foreground **:[code]:border',
        getCalloutVariantClassName(resolvedVariant),
        className
      )}
      {...props}
    >
      {icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className="text-card-foreground/80">
        {children}
      </AlertDescription>
    </Alert>
  );
}
