// Pre expects MDX code metadata, so this wrapper keeps install snippets copyable.
import type { ReactNode } from 'react';

import { CopyButton, CopyNpmCommandButton } from '@/components/copy-button';
import { ThemedSyntaxHighlighter } from '@/components/themed-syntax-highlighter';
import * as Typography from '@/components/typography';
import { cn } from '@/lib/utils';

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

export function InstallationCode({
  bash,
  children,
  code,
}: {
  code: string;
  bash?: boolean;
  children?: ReactNode;
}) {
  const npmCommand = code.startsWith('npm install');

  return (
    <div>
      {!!children && <Typography.P className="mt-6">{children}</Typography.P>}

      <div className="relative overflow-hidden rounded-lg border bg-code text-code-foreground">
        <ThemedSyntaxHighlighter
          className="no-scrollbar"
          codeTagProps={{ style: codeTagStyle }}
          customStyle={codeCustomStyle}
          language={bash ? 'bash' : 'typescript'}
          showLineNumbers={false}
        >
          {code}
        </ThemedSyntaxHighlighter>

        {npmCommand ? (
          <CopyNpmCommandButton
            className={cn('absolute top-3 right-2 size-7')}
            commands={{
              __bunCommand__: code.replaceAll('npm install', 'bun add'),
              __npmCommand__: code,
              __pnpmCommand__: code.replaceAll('npm install', 'pnpm add'),
            }}
          />
        ) : (
          <CopyButton
            className={cn('absolute top-3 right-2 size-7')}
            value={code}
          />
        )}
      </div>
    </div>
  );
}
