'use client';

import * as React from 'react';

import { Index } from '@/__registry__';
import { cn } from '@/lib/utils';

import { Icons } from './icons';

interface ThemeComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  align?: 'center' | 'end' | 'start';
  extractClassname?: boolean;
  extractedClassNames?: string;
}

export function ThemeComponent({ name, ...props }: ThemeComponentProps) {
  const Preview = React.useMemo(() => {
    const Component = Index[name]?.component;

    if (!Component) {
      return (
        <p className="text-muted-foreground text-sm">
          Component{' '}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{' '}
          not found in registry.
        </p>
      );
    }

    return <Component />;
  }, [name]);

  return (
    <div className={cn('relative')} {...props}>
      <React.Suspense
        fallback={
          <div className="flex items-center text-muted-foreground text-sm">
            <Icons.spinner className="mr-2 size-4 animate-spin" />
            Loading...
          </div>
        }
      >
        {Preview}
      </React.Suspense>
    </div>
  );
}
