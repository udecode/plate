'use client';

import * as React from 'react';

import { IconMenu3 } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    for (const id of itemIds ?? []) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      for (const id of itemIds ?? []) {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      }
    };
  }, [itemIds]);

  return activeId;
}

export function DocsTableOfContents({
  className,
  toc,
  variant = 'list',
}: {
  toc: {
    depth: number;
    url: string;
    title?: React.ReactNode;
  }[];
  className?: string;
  variant?: 'dropdown' | 'list';
}) {
  const [open, setOpen] = React.useState(false);
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace('#', '')),
    [toc]
  );
  const activeHeading = useActiveItem(itemIds);

  if (!toc?.length) {
    return null;
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className={cn('h-8 md:h-7', className)}
          >
            <IconMenu3 /> On This Page
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="no-scrollbar max-h-[70svh]"
          align="start"
        >
          {toc.map((item) => (
            <DropdownMenuItem
              key={item.url}
              asChild
              className="data-[depth=3]:pl-6 data-[depth=4]:pl-8"
              onClick={() => {
                setOpen(false);
              }}
              data-depth={item.depth}
            >
              <a href={item.url}>{item.title}</a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2 p-4 pt-0 text-sm', className)}>
      <p className="sticky top-0 h-6 bg-background text-muted-foreground text-xs">
        On This Page
      </p>
      {toc.map((item) => (
        <a
          key={item.url}
          className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[depth=3]:pl-4 data-[depth=4]:pl-6 data-[active=true]:text-foreground"
          data-active={item.url === `#${activeHeading}`}
          data-depth={item.depth}
          href={item.url}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}
