import type { HTMLAttributes, ReactNode } from 'react';

import { ChevronRight, FileIcon, FolderIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Files({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'my-6 overflow-hidden rounded-lg border bg-muted/30 py-2 font-mono text-sm',
        className
      )}
      {...props}
    />
  );
}

export function File({
  className,
  icon,
  name,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  name: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-7 items-center gap-2 px-3 text-foreground',
        className
      )}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
        {icon ?? <FileIcon className="size-3.5" />}
      </span>
      <span className="truncate">{name}</span>
    </div>
  );
}

export function Folder({
  children,
  className,
  defaultOpen,
  disabled,
  name,
  ...props
}: HTMLAttributes<HTMLDetailsElement> & {
  defaultOpen?: boolean;
  disabled?: boolean;
  name: string;
}) {
  return (
    <details
      className={cn('group/details', disabled && 'opacity-50', className)}
      open={defaultOpen || undefined}
      {...props}
    >
      <summary className="flex min-h-7 cursor-pointer list-none items-center gap-2 px-3 text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-open/details:rotate-90" />
        <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{name}</span>
      </summary>
      <div className="ml-5 border-border/70 border-l pl-1">{children}</div>
    </details>
  );
}
