import manifest from '@/generated/api-reference-manifest.json';

import { cn } from '@/lib/utils';

type ApiReferenceFact = {
  documentation: string;
  entrypoint: string;
  kind: string;
  name: string;
  route: string | null;
  signature: string;
  source: string | null;
};

export function APIReference({
  package: packageName,
  symbol,
}: {
  package: string;
  symbol: string;
}) {
  const packageFacts = (
    manifest.packages as Record<
      string,
      { symbols: Record<string, ApiReferenceFact> }
    >
  )[packageName];
  const fact = packageFacts?.symbols[`${packageName}:${symbol}`];

  if (!fact || fact.route === null) {
    throw new Error(
      `Missing curated API reference for ${packageName}:${symbol}.`
    );
  }

  const anchor = `api-${packageName}-${symbol}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  return (
    <section className="my-6 scroll-mt-20 rounded-lg border p-4" id={anchor}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <a className="font-mono font-semibold text-sm" href={`#${anchor}`}>
          {fact.name}
        </a>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs">
          {fact.kind}
        </span>
        <span className="font-mono text-muted-foreground text-xs">
          {fact.entrypoint}
        </span>
      </div>
      <pre
        className={cn(
          'overflow-x-auto rounded-md bg-muted/50 p-3 text-sm',
          'whitespace-pre-wrap break-words'
        )}
      >
        <code>{fact.signature}</code>
      </pre>
      {fact.documentation && (
        <p className="mt-3 text-muted-foreground text-sm">
          {fact.documentation}
        </p>
      )}
      {fact.source && (
        <a
          className="mt-3 inline-block text-muted-foreground text-xs underline"
          href={`https://github.com/udecode/plate/blob/main/${fact.source}`}
        >
          Source
        </a>
      )}
    </section>
  );
}
