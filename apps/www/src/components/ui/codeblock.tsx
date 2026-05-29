// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

'use client';

import React, { type FC } from 'react';

import { Icons } from '@/components/icons';
import { ThemedSyntaxHighlighter } from '@/components/themed-syntax-highlighter';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

const codeActionButtonClassName =
  'size-7 rounded-lg bg-transparent p-0 text-code-foreground hover:bg-muted-foreground/15 hover:text-code-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 [&_svg]:size-3';

const codeCustomStyle = {
  background: 'transparent',
  margin: 0,
  padding: '1rem',
  width: '100%',
};

const codeTagStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.9rem',
};

const lineNumberStyle: React.CSSProperties = {
  color: 'var(--muted-foreground)',
  userSelect: 'none',
};

type languageMap = Record<string, string | undefined>;

type Props = {
  language: string;
  value: string;
};

export const programmingLanguages: languageMap = {
  c: '.c',
  'c#': '.cs',
  'c++': '.cpp',
  cpp: '.cpp',
  css: '.css',
  go: '.go',
  haskell: '.hs',
  html: '.html',
  java: '.java',
  javascript: '.js',
  kotlin: '.kt',
  lua: '.lua',
  'objective-c': '.m',
  perl: '.pl',
  php: '.php',
  python: '.py',
  ruby: '.rb',
  rust: '.rs',
  scala: '.scala',
  shell: '.sh',
  sql: '.sql',
  swift: '.swift',
  typescript: '.ts',
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'; // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return lowercase ? result.toLowerCase() : result;
};

const CodeBlock: FC<Props> = ({ language, value }) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 2000 });

  const downloadAsFile = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const fileExtension = programmingLanguages[language] || '.file';
    const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`;
    const fileName = window.prompt('Enter file name', suggestedFileName);

    if (!fileName) {
      // User pressed cancel on prompt.
      return;
    }

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const onCopy = () => {
    if (isCopied) return;

    copyToClipboard(value);
  };

  return (
    <div className="codeblock relative w-full overflow-hidden rounded-lg border bg-code font-sans text-code-foreground">
      <div className="flex w-full items-center justify-between border-b px-4 py-1 text-code-foreground">
        <span className="text-xs lowercase">{language}</span>

        <div className="flex items-center gap-x-1">
          <Button
            size="icon"
            variant="ghost"
            className={codeActionButtonClassName}
            onClick={downloadAsFile}
          >
            <Icons.download />

            <span className="sr-only">Download</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={codeActionButtonClassName}
            onClick={onCopy}
          >
            {isCopied ? <Icons.check /> : <Icons.copy />}

            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>

      <ThemedSyntaxHighlighter
        className="no-scrollbar"
        codeTagProps={{ style: codeTagStyle }}
        customStyle={codeCustomStyle}
        language={language}
        lineNumberStyle={lineNumberStyle}
        PreTag="div"
        showLineNumbers
      >
        {value}
      </ThemedSyntaxHighlighter>
    </div>
  );
};
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
