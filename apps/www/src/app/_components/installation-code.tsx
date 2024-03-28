// Pre is deeply coupled to Contentlayer, so we need a wrapper to make it work
import * as React from 'react';
import { ReactNode } from 'react';
import { cn } from '@udecode/cn';
import { Prism, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { vscDarkPlus as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { CopyButton, CopyNpmCommandButton } from '@/components/copy-button';
import * as Typography from '@/components/typography';

const SyntaxHighlighter =
  Prism as typeof React.Component<SyntaxHighlighterProps>;

export function InstallationCode({
  code,
  children,
  bash,
}: {
  code: string;
  children?: ReactNode;
  bash?: boolean;
}) {
  const npmCommand = code.startsWith('npm install');

  return (
    <div>
      {!!children && <Typography.P className="mt-6">{children}</Typography.P>}

      <div className="relative">
        <SyntaxHighlighter
          language={bash ? 'bash' : 'typescript'}
          style={theme}
          className="rounded-lg border !py-4"
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>

        {npmCommand ? (
          <CopyNpmCommandButton
            commands={{
              __npmCommand__: code,
              __pnpmCommand__: code.replaceAll('npm install', 'pnpm add'),
              __yarnCommand__: code.replaceAll('npm install', 'yarn add'),
              __bunCommand__: code.replaceAll('npm install', 'bun add'),
            }}
            className={cn('absolute right-4 top-4')}
          />
        ) : (
          <CopyButton value={code} className={cn('absolute right-4 top-4')} />
        )}
      </div>
    </div>
  );
}
