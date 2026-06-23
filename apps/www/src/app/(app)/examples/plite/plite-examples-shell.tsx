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
  isNewPliteExamplePath,
  NON_HIDDEN_EXAMPLES,
} from './plite-example-registry';

type PliteExamplesShellProps = {
  activeExample?: string;
  children: React.ReactNode;
};

type PliteExamplesNavLinksProps = {
  activeExample?: string;
  backHref?: string;
  backLabel?: string;
  indexActive?: boolean;
  indexHref?: string;
  indexLabel?: string;
  showIndex?: boolean;
};

export function PliteExamplesShell({
  activeExample,
  children,
}: PliteExamplesShellProps) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <SidebarProvider
        className="3xl:fixed:container min-h-min flex-1 items-start 3xl:fixed:px-3 px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
          } as CSSProperties
        }
        data-plite-examples-shell
      >
        <PliteExamplesMobileNav activeExample={activeExample} />
        <PliteExamplesSidebar activeExample={activeExample} />
        <main className="h-full w-full min-w-0 py-12 pr-4">{children}</main>
      </SidebarProvider>
    </div>
  );
}

export function PliteExamplesSidebarNav({
  activeExample,
  backHref,
  backLabel,
  indexActive,
  indexHref,
  indexLabel,
  showIndex,
}: PliteExamplesNavLinksProps) {
  return (
    <nav
      className="flex min-w-0 flex-col gap-5"
      aria-label="Plite examples"
      data-plite-example-sidebar
    >
      <PliteExamplesNavLinks
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

function PliteExamplesSidebar({ activeExample }: { activeExample?: string }) {
  return (
    <Sidebar
      aria-label="Plite examples navigation"
      className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:mt-2.5 lg:flex"
      collapsible="none"
    >
      <div className="h-9" />
      <SidebarContent className="no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2.5">
        <PliteExamplesSidebarNav activeExample={activeExample} />
        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
}

function PliteExamplesMobileNav({ activeExample }: { activeExample?: string }) {
  const currentLabel =
    getExampleLabel(activeExample) ??
    (activeExample ? activeExample : 'Examples');

  return (
    <details
      className="group rounded-md border bg-background p-2 lg:hidden"
      data-plite-example-mobile-nav
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
        aria-label="Plite examples"
      >
        <PliteExamplesNavLinks activeExample={activeExample} />
      </nav>
    </details>
  );
}

function PliteExamplesNavLinks({
  activeExample,
  backHref = '/docs/plite',
  backLabel = 'Back to docs',
  indexActive,
  indexHref = '/examples/plite',
  indexLabel = 'Examples',
  showIndex = false,
}: PliteExamplesNavLinksProps) {
  const isIndexActive = indexActive ?? activeExample === undefined;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Link
          className="flex h-8 items-center gap-2 rounded-md px-2 font-medium text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
          data-plite-example-back
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
            data-plite-example-index
            href={indexHref}
          >
            {indexLabel}
          </Link>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {NON_HIDDEN_EXAMPLES.map(([name, slug]) => {
          const isActive = activeExample === slug;
          const isNewExample = isNewPliteExamplePath(slug);

          return (
            <Link
              className={cn(
                'flex min-h-8 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm leading-tight hover:bg-muted',
                isActive
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              data-active={isActive}
              data-plite-example-nav-link={slug}
              href={`/examples/plite/${slug}`}
              key={slug}
            >
              <span className="min-w-0 flex-1 truncate">{name}</span>
              {isNewExample ? (
                <span
                  className="flex size-2 shrink-0 rounded-full bg-blue-500"
                  data-plite-example-new-dot={slug}
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
