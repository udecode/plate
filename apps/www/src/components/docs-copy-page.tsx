'use client';

import { Check, ChevronDown, Copy, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getPlateLLMPromptUrl } from '@/lib/llm';

const getMarkdownUrl = (url: string) => `${url}.md`;

export function DocsCopyPage({ page, url }: { page: string; url: string }) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <div className="relative flex rounded-md bg-secondary">
      <Button
        size="sm"
        variant="secondary"
        className="h-8 shadow-none md:h-7"
        onClick={() => copyToClipboard(page)}
      >
        {isCopied ? <Check /> : <Copy />}
        Copy Page
      </Button>
      <Separator
        orientation="vertical"
        className="my-1 h-auto bg-foreground/5"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="secondary"
            className="extend-touch-target size-8 shadow-none md:size-7"
          >
            <ChevronDown />
            <span className="sr-only">Open page options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={getMarkdownUrl(url)} target="_blank" rel="noreferrer">
              View as Markdown
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={getPlateLLMPromptUrl({
                baseUrl: 'https://chatgpt.com',
                docUrl: url,
              })}
              target="_blank"
              rel="noreferrer"
            >
              Ask in ChatGPT
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={getPlateLLMPromptUrl({
                baseUrl: 'https://claude.ai/new',
                docUrl: url,
              })}
              target="_blank"
              rel="noreferrer"
            >
              Ask in Claude
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://github.com/udecode/plate/discussions/new?${new URLSearchParams(
                {
                  body: `I have a question about the Plate documentation at ${url}.`,
                  category: 'q-a',
                  title: '',
                }
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <Github />
              Ask in GitHub
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
