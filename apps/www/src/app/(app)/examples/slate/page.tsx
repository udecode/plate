import Link from 'next/link';

import { NON_HIDDEN_EXAMPLES } from './slate-example-registry';

export default function SlateExamplesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Slate examples
        </h1>
        <p className="text-muted-foreground">
          First-party Slate v2 examples running inside the Plate docs app.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NON_HIDDEN_EXAMPLES.map(([name, slug, metadata]) => (
          <Link
            className="rounded-md border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"
            data-slate-example-link={slug}
            href={`/examples/slate/${slug}`}
            key={slug}
          >
            <span>{name}</span>
            {metadata?.badge ? (
              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {metadata.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
