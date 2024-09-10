// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

'use client';

import { type FC, memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { Icons } from '@/components/icons';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Button } from '@/registry/default/plate-ui/button';

interface Props {
  language: string;
  value: string;
}

type languageMap = Record<string, string | undefined>;

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

const CodeBlock: FC<Props> = memo(({ language, value }) => {
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
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className="codeblock relative w-full bg-zinc-950 font-sans">
      <div className="flex w-full items-center justify-between bg-zinc-800 px-6 py-1 pr-4 text-zinc-100">
        <span className="text-xs lowercase">{language}</span>

        <div className="flex items-center space-x-1">
          <Button
            className="hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 hover:[&_svg]:text-muted-foreground"
            onClick={downloadAsFile}
            size="sm"
            variant="ghost"
          >
            <Icons.download className="size-4" />

            <span className="sr-only">Download</span>
          </Button>

          <Button
            className="text-xs hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0 hover:[&_svg]:text-muted-foreground"
            onClick={onCopy}
            size="sm"
            variant="ghost"
          >
            {isCopied ? (
              <Icons.check className="size-4" />
            ) : (
              <Icons.copy className="size-4" />
            )}

            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </div>

      <SyntaxHighlighter
        PreTag="div"
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
          },
        }}
        customStyle={{
          background: 'transparent',
          margin: 0,
          padding: '1.5rem 1rem',
          width: '100%',
        }}
        language={language}
        lineNumberStyle={{
          userSelect: 'none',
        }}
        showLineNumbers
        style={coldarkDark}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';

export { CodeBlock };
