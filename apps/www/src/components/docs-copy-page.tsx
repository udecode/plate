'use client';

import type { ComponentPropsWithoutRef, Ref } from 'react';

import {
  Bot,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  Github,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getPlateLLMPromptUrl } from '@/lib/llm';
import { cn } from '@/lib/utils';

const getMarkdownUrl = (url: string) => `${url}.md`;

const getGitHubSourceUrl = (sourcePath: string | undefined) =>
  sourcePath
    ? `https://github.com/udecode/plate/blob/main/content/docs/${sourcePath
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`
    : undefined;

const getGitHubDiscussionUrl = (url: string) =>
  `https://github.com/udecode/plate/discussions/new?${new URLSearchParams({
    body: `I have a question about the Plate documentation at ${url}.`,
    category: 'q-a',
    title: '',
  })}`;

const menuItems = [
  {
    getHref: ({ url }: DocsCopyPageItemContext) => getMarkdownUrl(url),
    icon: FileText,
    key: 'markdown',
    label: 'View as Markdown',
  },
  {
    getHref: ({ sourcePath }: DocsCopyPageItemContext) =>
      getGitHubSourceUrl(sourcePath),
    icon: Code2,
    key: 'source',
    label: 'View Source',
  },
  {
    getHref: ({ url }: DocsCopyPageItemContext) =>
      getPlateLLMPromptUrl({
        baseUrl: 'https://chatgpt.com',
        docUrl: getMarkdownUrl(url),
      }),
    icon: Bot,
    key: 'chatgpt',
    label: 'Ask in ChatGPT',
  },
  {
    getHref: ({ url }: DocsCopyPageItemContext) =>
      getPlateLLMPromptUrl({
        baseUrl: 'https://claude.ai/new',
        docUrl: getMarkdownUrl(url),
      }),
    icon: Sparkles,
    key: 'claude',
    label: 'Ask in Claude',
  },
  {
    getHref: ({ url }: DocsCopyPageItemContext) => getGitHubDiscussionUrl(url),
    icon: Github,
    key: 'github',
    label: 'Ask in GitHub',
  },
] as const;

type DocsCopyPageItemContext = {
  sourcePath?: string;
  url: string;
};

function DocsCopyPageItem({
  context,
  item,
  ref,
  ...props
}: ComponentPropsWithoutRef<'a'> & {
  context: DocsCopyPageItemContext;
  item: (typeof menuItems)[number];
  ref?: Ref<HTMLAnchorElement>;
}) {
  const Icon = item.icon;
  const href = item.getHref(context);

  if (!href) return null;

  return (
    <a
      {...props}
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon />
      <span>{item.label}</span>
    </a>
  );
}

function DocsCopyPageTrigger({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button
      {...props}
      size="sm"
      variant="secondary"
      className={cn(
        'peer -ml-0.5 size-8 shadow-none md:size-7 md:text-[0.8rem]',
        className
      )}
    >
      <ChevronDown className="rotate-180 sm:rotate-0" />
      <span className="sr-only">Open page options</span>
    </Button>
  );
}

export function DocsCopyPage({
  page,
  sourcePath,
  url,
}: {
  page: string;
  sourcePath?: string;
  url: string;
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const context = { sourcePath, url };
  const visibleMenuItems = menuItems.filter((item) => item.getHref(context));

  return (
    <Popover>
      <div className="group/buttons relative flex rounded-lg bg-secondary *:[[data-slot=button]]:focus-visible:relative *:[[data-slot=button]]:focus-visible:z-10">
        <PopoverAnchor />
        <Button
          size="sm"
          variant="secondary"
          className="h-8 shadow-none md:h-7 md:text-[0.8rem]"
          onClick={() => copyToClipboard(page)}
        >
          {isCopied ? <Check /> : <Copy />}
          Copy Page
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="hidden sm:flex">
            <DocsCopyPageTrigger />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="animate-none! rounded-lg shadow-none"
          >
            {visibleMenuItems.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <DocsCopyPageItem context={context} item={item} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator
          orientation="vertical"
          className="absolute top-1 right-8 z-0 h-6! bg-foreground/5! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!"
        />
        <PopoverTrigger asChild className="flex sm:hidden">
          <DocsCopyPageTrigger />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-52 origin-center! rounded-lg bg-background/70 p-1 shadow-none backdrop-blur-sm dark:bg-background/60"
        >
          {visibleMenuItems.map((item) => (
            <Button
              key={item.key}
              asChild
              size="lg"
              variant="ghost"
              className="w-full justify-start font-normal text-base *:[svg]:text-muted-foreground"
            >
              <DocsCopyPageItem context={context} item={item} />
            </Button>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  );
}
