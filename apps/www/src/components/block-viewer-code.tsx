'use client';

import * as React from 'react';

import type { FileTree } from '@/lib/rehype-utils';

import {
  Check,
  ChevronRight,
  Clipboard,
  File,
  Folder,
  Package,
} from 'lucide-react';

import { CopyNpmCommandButton } from '@/components/copy-button';
import { getIconForLanguageExtension } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

import { useBlockViewer } from './block-viewer';

export function BlockViewerCode({ size }: { size?: 'default' | 'sm' }) {
  const { activeFile, dependencies, highlightedFiles, isLoading } =
    useBlockViewer();
  const deps = dependencies.join(' ');

  const file = highlightedFiles?.find((file) => file.target === activeFile);

  if (!file?.content && isLoading) {
    return (
      <div className="mr-[14px] flex overflow-hidden rounded-xl border bg-code text-code-foreground group-data-[view=preview]/block-view-wrapper:hidden md:h-(--height)">
        <BlockViewerFileTree size={size} />
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }
  if (!file) {
    return null;
  }

  const language = file.path.split('.').pop() ?? 'tsx';

  return (
    <div className="mr-[14px] flex overflow-hidden rounded-xl border bg-code text-code-foreground group-data-[view=preview]/block-view-wrapper:hidden md:h-(--height)">
      <BlockViewerFileTree size={size} />
      <figure
        className="mx-0! mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none"
        data-rehype-pretty-code-figure=""
      >
        <figcaption
          className="flex h-12 shrink-0 items-center gap-2 border-b px-4 py-2 text-code-foreground [&_svg]:size-4 [&_svg]:text-code-foreground [&_svg]:opacity-70"
          data-language={language}
        >
          {getIconForLanguageExtension(language)}
          {file.target}
          <div className="ml-auto flex items-center gap-2">
            {dependencies.length > 0 && (
              <CopyNpmCommandButton
                className="size-7 rounded-lg bg-transparent p-0 text-code-foreground shadow-none hover:bg-muted-foreground/15 hover:text-code-foreground focus:bg-muted-foreground/15 focus:text-code-foreground focus-visible:bg-muted-foreground/15 focus-visible:text-code-foreground active:bg-muted-foreground/15 active:text-code-foreground [&>svg]:size-3"
                commands={{
                  __bunCommand__: `bun add ${deps}`,
                  __npmCommand__: `npm install ${deps}`,
                  __pnpmCommand__: `pnpm add ${deps}`,
                  __yarnCommand__: `yarn add ${deps}`,
                }}
                icon={<Package />}
              />
            )}

            <BlockCopyCodeButton />
          </div>
        </figcaption>
        <div
          key={file?.path}
          className="no-scrollbar overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: file?.highlightedContent ?? '' }}
        />
      </figure>
    </div>
  );
}

function BlockViewerFileTree({ size }: { size?: 'default' | 'sm' }) {
  const { highlightedFiles, tree } = useBlockViewer();

  if (!tree || highlightedFiles?.length === 1) {
    return null;
  }

  return (
    <div className={cn('w-72 shrink-0', size === 'sm' && 'w-60')}>
      <SidebarProvider className="flex min-h-full! flex-col border-r">
        <Sidebar
          className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden"
          collapsible="none"
        >
          <SidebarGroupLabel className="h-12 rounded-none border-b px-4 text-sm">
            Files
          </SidebarGroupLabel>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="translate-x-0 gap-1.5">
                {tree.map((file, index) => (
                  <Tree key={index} index={1} item={file} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    </div>
  );
}

function Tree({ index, item }: { index: number; item: FileTree }) {
  const { activeFile, setActiveFile } = useBlockViewer();

  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className={cn(
            'whitespace-nowrap rounded-none pl-(--index) hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15'
          )}
          style={
            {
              '--index': `${index * (index === 2 ? 1.2 : 1.3)}rem`,
            } as React.CSSProperties
          }
          onClick={() => item.path && setActiveFile(item.path)}
          data-index={index}
          isActive={item.path === activeFile}
        >
          <ChevronRight className="invisible shrink-0" />
          <File className="size-4 shrink-0" />
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              'whitespace-nowrap rounded-none pl-(--index) hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15 data-[state=open]:hover:bg-muted-foreground/15'
            )}
            style={
              {
                '--index': `${index * (index === 1 ? 1 : 1.2)}rem`,
              } as React.CSSProperties
            }
          >
            <ChevronRight className="size-4 shrink-0 transition-transform" />
            <Folder className="size-4 shrink-0" />
            <span className="truncate">{item.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="m-0 w-full translate-x-0 border-none p-0">
            {item.children.map((subItem, key) => (
              <Tree key={key} index={index + 1} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function BlockCopyCodeButton() {
  const { activeFile, highlightedFiles } = useBlockViewer();
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const file = highlightedFiles?.find((file) => file.target === activeFile);

  const content = file?.content;

  if (!content) {
    return null;
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-7 shrink-0 rounded-lg p-0 hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15 [&>svg]:size-3"
      onClick={() => {
        copyToClipboard(content);
      }}
    >
      {isCopied ? <Check /> : <Clipboard />}
    </Button>
  );
}
