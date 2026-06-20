import type { CSSProperties } from 'react';

import Link from 'next/link';

import { ArrowLeftIcon, ChevronDownIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import {
  getExampleDefinition,
  isNewSlateExamplePath,
  NON_HIDDEN_EXAMPLES,
} from './slate-example-registry';

type SlateExamplesShellProps = {
  activeExample?: string;
  children: React.ReactNode;
};

type SlateExamplesNavLinksProps = {
  activeExample?: string;
  backHref?: string;
  backLabel?: string;
  indexActive?: boolean;
  indexHref?: string;
  indexLabel?: string;
  showIndex?: boolean;
};

export function SlateExamplesShell({
  activeExample,
  children,
}: SlateExamplesShellProps) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <SidebarProvider
        className="3xl:fixed:container min-h-min flex-1 items-start 3xl:fixed:px-3 px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
          } as CSSProperties
        }
        data-slate-examples-shell
      >
        <SlateExamplesMobileNav activeExample={activeExample} />
        <SlateExamplesSidebar activeExample={activeExample} />
        <main className="h-full w-full min-w-0 py-12 pr-4">{children}</main>
      </SidebarProvider>
    </div>
  );
}

export function SlateExamplesSidebarNav({
  activeExample,
  backHref,
  backLabel,
  indexActive,
  indexHref,
  indexLabel,
  showIndex,
}: SlateExamplesNavLinksProps) {
  return (
    <nav
      className="flex min-w-0 flex-col gap-5"
      aria-label="Slate examples"
      data-slate-example-sidebar
    >
      <SlateExamplesNavLinks
        activeExample={activeExample}
        backHref={backHref}
        backLabel={backLabel}
        indexActive={indexActive}
        indexHref={indexHref}
        indexLabel={indexLabel}
        showIndex={showIndex}
      />
    </nav>
  );
}

function SlateExamplesSidebar({ activeExample }: { activeExample?: string }) {
  return (
    <Sidebar
      aria-label="Slate examples navigation"
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:mt-2.5 lg:flex"
      collapsible="none"
    >
      <div className="h-9" />
      <SidebarContent className="no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2.5">
        <SlateExamplesSidebarNav activeExample={activeExample} />
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
}

function SlateExamplesMobileNav({ activeExample }: { activeExample?: string }) {
  const currentLabel =
    getExampleLabel(activeExample) ??
    (activeExample ? activeExample : 'Examples');

  return (
    <details
      className="group rounded-md border bg-background p-2 lg:hidden"
      data-slate-example-mobile-nav
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 font-medium text-sm">
        <span>Examples</span>
        <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <span className="truncate">{currentLabel}</span>
          <ChevronDownIcon className="size-4 shrink-0 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <nav
        className="mt-2 flex max-h-96 flex-col gap-5 overflow-y-auto"
        aria-label="Slate examples"
      >
        <SlateExamplesNavLinks activeExample={activeExample} />
      </nav>
    </details>
  );
}

function SlateExamplesNavLinks({
  activeExample,
  backHref = '/docs/slate',
  backLabel = 'Back to docs',
  indexActive,
  indexHref = '/examples/slate',
  indexLabel = 'Examples',
  showIndex = false,
}: SlateExamplesNavLinksProps) {
  const isIndexActive = indexActive ?? activeExample === undefined;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Link
          className="flex h-8 items-center gap-2 rounded-md px-2 font-medium text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
          data-slate-example-back
          href={backHref}
        >
          <ArrowLeftIcon className="size-4" />
          {backLabel}
        </Link>
        {showIndex ? (
          <Link
            className={cn(
              'flex h-8 items-center rounded-md px-2 font-medium text-sm hover:bg-muted',
              isIndexActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            data-active={isIndexActive}
            data-slate-example-index
            href={indexHref}
          >
            {indexLabel}
          </Link>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {NON_HIDDEN_EXAMPLES.map(([name, slug]) => {
          const isActive = activeExample === slug;
          const isNewExample = isNewSlateExamplePath(slug);

          return (
            <Link
              className={cn(
                'flex min-h-8 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm leading-tight hover:bg-muted',
                isActive
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              data-active={isActive}
              data-slate-example-nav-link={slug}
              href={`/examples/slate/${slug}`}
              key={slug}
            >
              <span className="min-w-0 flex-1 truncate">{name}</span>
              {isNewExample ? (
                <span
                  className="flex size-2 shrink-0 rounded-full bg-blue-500"
                  data-slate-example-new-dot={slug}
                  title="New"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </>
  );
}

function getExampleLabel(examplePath: string | undefined) {
  if (!examplePath) {
    return;
  }

  return getExampleDefinition(examplePath)?.[0];
}
