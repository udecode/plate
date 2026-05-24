'use client';

import {
  Bot,
  Check,
  ChevronDown,
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

const getMarkdownUrl = (url: string) => `${url}.md`;

const getGitHubDiscussionUrl = (url: string) =>
  `https://github.com/udecode/plate/discussions/new?${new URLSearchParams({
    body: `I have a question about the Plate documentation at ${url}.`,
    category: 'q-a',
    title: '',
  })}`;

const menuItems = [
  {
    getHref: getMarkdownUrl,
    icon: FileText,
    key: 'markdown',
    label: 'View as Markdown',
  },
  {
    getHref: (url: string) =>
      getPlateLLMPromptUrl({
        baseUrl: 'https://chatgpt.com',
        docUrl: url,
      }),
    icon: Bot,
    key: 'chatgpt',
    label: 'Ask in ChatGPT',
  },
  {
    getHref: (url: string) =>
      getPlateLLMPromptUrl({
        baseUrl: 'https://claude.ai/new',
        docUrl: url,
      }),
    icon: Sparkles,
    key: 'claude',
    label: 'Ask in Claude',
  },
  {
    getHref: getGitHubDiscussionUrl,
    icon: Github,
    key: 'github',
    label: 'Ask in GitHub',
  },
] as const;

function DocsCopyPageItem({
  item,
  url,
}: {
  item: (typeof menuItems)[number];
  url: string;
}) {
  const Icon = item.icon;

  return (
    <a href={item.getHref(url)} target="_blank" rel="noopener noreferrer">
      <Icon />
      {item.label}
    </a>
  );
}

export function DocsCopyPage({ page, url }: { page: string; url: string }) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const trigger = (
    <Button
      size="sm"
      variant="secondary"
      className="peer -ml-0.5 size-8 shadow-none md:size-7 md:text-[0.8rem]"
    >
      <ChevronDown className="rotate-180 sm:rotate-0" />
      <span className="sr-only">Open page options</span>
    </Button>
  );

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
            {trigger}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="animate-none! rounded-lg shadow-none"
          >
            {menuItems.map((item) => (
              <DropdownMenuItem key={item.key} asChild>
                <DocsCopyPageItem item={item} url={url} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator
          orientation="vertical"
          className="absolute top-1 right-8 z-0 h-6! bg-foreground/5! peer-focus-visible:opacity-0 sm:right-7 sm:h-5!"
        />
        <PopoverTrigger asChild className="flex sm:hidden">
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-52 origin-center! rounded-lg bg-background/70 p-1 shadow-none backdrop-blur-sm dark:bg-background/60"
        >
          {menuItems.map((item) => (
            <Button
              key={item.key}
              asChild
              size="lg"
              variant="ghost"
              className="w-full justify-start font-normal text-base *:[svg]:text-muted-foreground"
            >
              <DocsCopyPageItem item={item} url={url} />
            </Button>
          ))}
        </PopoverContent>
      </div>
    </Popover>
  );
}
