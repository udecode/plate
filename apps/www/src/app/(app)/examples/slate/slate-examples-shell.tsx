import Link from "next/link";

import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  getExampleDefinition,
  NON_HIDDEN_EXAMPLES,
} from "./slate-example-registry";

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
};

export function SlateExamplesShell({
  activeExample,
  children,
}: SlateExamplesShellProps) {
  return (
    <main
      className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[17rem_minmax(0,1fr)]"
      data-slate-examples-shell
    >
      <SlateExamplesMobileNav activeExample={activeExample} />
      <SlateExamplesSidebar activeExample={activeExample} />
      <div className="min-w-0">{children}</div>
    </main>
  );
}

export function SlateExamplesSidebarNav({
  activeExample,
  backHref,
  backLabel,
  indexActive,
  indexHref,
  indexLabel,
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
      />
    </nav>
  );
}

function SlateExamplesSidebar({ activeExample }: { activeExample?: string }) {
  return (
    <aside className="hidden min-w-0 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto">
      <SlateExamplesSidebarNav activeExample={activeExample} />
    </aside>
  );
}

function SlateExamplesMobileNav({ activeExample }: { activeExample?: string }) {
  const currentLabel =
    getExampleLabel(activeExample) ??
    (activeExample ? activeExample : "Examples");

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
  backHref = "/docs/slate/examples",
  backLabel = "Back to docs",
  indexActive,
  indexHref = "/examples/slate",
  indexLabel = "Examples",
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
        <Link
          className={cn(
            "flex h-8 items-center rounded-md px-2 font-medium text-sm hover:bg-muted",
            isIndexActive
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          data-active={isIndexActive}
          data-slate-example-index
          href={indexHref}
        >
          {indexLabel}
        </Link>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        {NON_HIDDEN_EXAMPLES.map(([name, slug, metadata]) => {
          const isActive = activeExample === slug;

          return (
            <Link
              className={cn(
                "flex min-h-8 min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm leading-tight hover:bg-muted",
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-active={isActive}
              data-slate-example-nav-link={slug}
              href={`/examples/slate/${slug}`}
              key={slug}
            >
              <span className="min-w-0 flex-1 truncate">{name}</span>
              {metadata?.badge ? (
                <Badge className="h-5 px-1.5 text-[10px]" variant="secondary">
                  {metadata.badge}
                </Badge>
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
    return undefined;
  }

  return getExampleDefinition(examplePath)?.[0];
}
