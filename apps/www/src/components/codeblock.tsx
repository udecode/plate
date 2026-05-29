// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

'use client';

import React, { type FC } from 'react';

import { cn } from '@/lib/utils';

import { CopyButton, CopyNpmCommandButton } from './copy-button';
import { ThemedSyntaxHighlighter } from './themed-syntax-highlighter';

const codeCopyButtonClassName =
  'absolute top-3 right-2 z-10 size-7 bg-code text-code-foreground opacity-70 hover:bg-muted-foreground/15 hover:text-code-foreground hover:opacity-100 focus-visible:opacity-100';

const codeSurfaceClassName =
  'codeblock no-scrollbar max-h-[650px] w-full overflow-auto font-sans';

const codeTagStyle = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '0.9rem',
  textShadow: 'none',
};

const lineNumberStyle: React.CSSProperties = {
  color: 'var(--color-code-number)',
  userSelect: 'none',
};

const codeCustomStyle = {
  background: 'transparent',
  margin: 0,
  padding: '1rem',
  width: '100%',
};

const CodeBlock: FC<{
  language: string;
  value: string;
  className?: string;
  fixedHeight?: boolean;
  name?: string;
  npm?: boolean;
}> = ({ className, fixedHeight, language, npm, value }) => {
  const code = npm ? `npm install ${value}` : value;
  const effectiveLanguage = npm ? 'text' : language;
  const showLineNumbers = !npm && code.includes('\n');

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-code text-code-foreground',
        className
      )}
    >
      {npm ? (
        <CopyNpmCommandButton
          className={codeCopyButtonClassName}
          commands={{
            __bunCommand__: `bun add ${value}`,
            __npmCommand__: `npm install ${value}`,
            __pnpmCommand__: `pnpm add ${value}`,
          }}
        />
      ) : (
        <CopyButton
          className={codeCopyButtonClassName}
          value={value}
          variant="ghost"
        />
      )}

      <ThemedSyntaxHighlighter
        className={cn(codeSurfaceClassName, fixedHeight && 'h-[650px]')}
        codeTagProps={{ style: codeTagStyle }}
        customStyle={codeCustomStyle}
        language={effectiveLanguage}
        lineNumberStyle={lineNumberStyle}
        PreTag="div"
        showLineNumbers={showLineNumbers}
      >
        {code}
      </ThemedSyntaxHighlighter>
    </div>
  );
};
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };

type languageMap = Record<string, string | undefined>;

export const programmingLanguages: languageMap = {
  bash: '.sh',
  css: '.css',
  html: '.html',
  javascript: '.js',
  tsx: '.tsx',
  typescript: '.ts',
};

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return lowercase ? result.toLowerCase() : result;
};
