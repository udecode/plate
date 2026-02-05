'use client';

import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { getPlateCopyMarkdown } from '@/lib/llm-context';
import { cn } from '@/lib/utils';

type LLMCopyButtonProps = {
  content: string;
  docUrl: string;
  title: string;
};

export function LLMCopyButton({ content, docUrl, title }: LLMCopyButtonProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 2000 });

  const handleCopy = () => {
    const enrichedContent = getPlateCopyMarkdown({ content, docUrl, title });

    copyToClipboard(enrichedContent);
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className={cn('h-8 gap-2')}
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      Copy Markdown
    </Button>
  );
}
