// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

'use client';

import { type FC, memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { cn } from '@udecode/cn';

import { CopyButton, CopyNpmCommandButton } from './copy-button';

const CodeBlock: FC<{
  language: string;
  value: string;
  className?: string;
  fixedHeight?: boolean;
  name?: string;
  npm?: boolean;
}> = memo(({ className, fixedHeight, language, npm, value }) => {
  return (
    <div className={cn('relative', className)}>
      {npm ? (
        <CopyNpmCommandButton
          className="absolute right-4 top-4"
          commands={{
            __bunCommand__: 'bun add ' + value,
            __npmCommand__: 'npm install ' + value,
            __pnpmCommand__: 'pnpm add ' + value,
            __yarnCommand__: 'yarn add ' + value,
          }}
        />
      ) : (
        <CopyButton className="absolute right-4 top-4" value={value} />
      )}

      <SyntaxHighlighter
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={cn(
          'codeblock relative max-h-[650px] w-full overflow-auto rounded-lg border !bg-zinc-950 font-sans dark:!bg-zinc-900',
          fixedHeight && 'h-[650px]'
        )}
        style={customSyntaxHighlighterTheme as any}
        PreTag="div"
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '0.9rem',
            textShadow: 'none',
          },
        }}
        language={npm ? 'bash' : language}
        showLineNumbers={false}
      >
        {npm ? 'npm install ' + value : value}
      </SyntaxHighlighter>
    </div>
  );
});
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

export const customSyntaxHighlighterTheme = {
  '.language-css .token.string': {
    color: '#9ecbff',
  },
  '.line-highlight': {
    background: '#2b3036',
    left: '0',
    lineHeight: 'inherit',
    marginTop: '1em',
    padding: 'inherit 0',
    pointerEvents: 'none',
    position: 'absolute',
    right: '0',
    whiteSpace: 'pre',
  },
  '.line-highlight:before': {
    backgroundColor: '#444d56',
    borderRadius: '999px',
    boxShadow: '0 1px white',
    color: '#e1e4e8',
    content: 'attr(data-start)',
    font: 'bold 65%/1.5 sans-serif',
    left: '.6em',
    minWidth: '1em',
    padding: '0 .5em',
    position: 'absolute',
    textAlign: 'center',
    textShadow: 'none',
    top: '.4em',
    verticalAlign: '.3em',
  },
  '.line-highlight[data-end]:after': {
    backgroundColor: '#444d56',
    borderRadius: '999px',
    boxShadow: '0 1px white',
    color: '#e1e4e8',
    content: 'attr(data-end)',
    font: 'bold 65%/1.5 sans-serif',
    left: '.6em',
    minWidth: '1em',
    padding: '0 .5em',
    position: 'absolute',
    textAlign: 'center',
    textShadow: 'none',
    top: 'auto',
    verticalAlign: '.3em',
  },
  '.maybe-class-name': {
    color: '#ffab70',
  },
  '.namespace': {
    opacity: 0.7,
  },
  '.style .token.string': {
    color: '#9ecbff',
  },
  atrule: {
    color: '#f97583',
  },
  'attr-name': {
    color: '#b392f0',
  },
  'attr-value': {
    color: '#9ecbff',
  },
  bold: {
    fontWeight: 'bold',
  },
  boolean: {
    color: '#79b8ff',
  },
  builtin: {
    color: '#79b8ff',
  },
  cdata: {
    color: '#6a737d',
  },
  char: {
    color: '#9ecbff',
  },
  'class-name': {
    color: '#79b8ff',
  },
  'code[class*="language-"]': {
    MozHyphens: 'none',
    MozTabSize: '4',
    OTabSize: '4',
    WebkitHyphens: 'none',
    background: 'none',
    color: '#e1e4e8',
    fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    hyphens: 'none',
    lineHeight: '1.5',
    msHyphens: 'none',
    tabSize: '4',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordBreak: 'normal',
    wordSpacing: 'normal',
    wordWrap: 'normal',
  },
  comment: {
    color: '#6a737d',
  },
  constant: {
    color: '#79b8ff',
  },
  deleted: {
    backgroundColor: '#86181d',
    color: '#fdaeb7',
  },
  doctype: {
    color: '#6a737d',
  },
  entity: {
    color: '#b392f0',
    cursor: 'help',
  },
  function: {
    color: '#b392f0',
  },
  important: {
    color: '#f97583',
    fontWeight: 'bold',
  },
  inserted: {
    backgroundColor: '#144620',
    color: '#85e89d',
  },
  italic: {
    fontStyle: 'italic',
  },
  keyword: {
    color: '#f97583',
  },
  number: {
    color: '#79b8ff',
  },
  operator: {
    color: '#e1e4e8',
  },
  parameter: {
    color: '#ffab70',
  },
  'pre[class*="language-"]': {
    MozHyphens: 'none',
    MozTabSize: '4',
    OTabSize: '4',
    WebkitHyphens: 'none',
    background: '#24292e',
    color: '#e1e4e8',
    fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
    hyphens: 'none',
    lineHeight: '1.5',
    margin: '0.5em 0',
    msHyphens: 'none',
    overflow: 'auto',
    padding: '1em',
    tabSize: '4',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordBreak: 'normal',
    wordSpacing: 'normal',
    wordWrap: 'normal',
  },
  'pre[data-line]': {
    padding: '1em 0 1em 3em',
    position: 'relative',
  },
  prolog: {
    color: '#6a737d',
  },
  property: {
    color: '#79b8ff',
  },
  punctuation: {
    color: '#e1e4e8',
  },
  regex: {
    color: '#dbedff',
  },
  selector: {
    color: '#85e89d',
  },
  string: {
    color: '#9ecbff',
  },
  symbol: {
    color: '#79b8ff',
  },
  tag: {
    color: '#e1e4e8',
  },
  url: {
    color: '#79b8ff',
  },
  variable: {
    color: '#ffab70',
  },
};
