'use client';

import Link from 'next/link';

import type { SlateExampleId } from '../../../../../../www/src/app/(app)/examples/slate/slate-example-loaders';
import { slateExampleComponents } from '../../../../../../www/src/app/(app)/examples/slate/slate-example-loaders';
import {
  EXAMPLE_NAMES_AND_PATHS,
  isNewSlateExamplePath,
  NON_HIDDEN_EXAMPLES,
} from '../../../../../../www/src/app/(app)/examples/slate/slate-example-registry';

const exampleLabels = new Map(
  EXAMPLE_NAMES_AND_PATHS.map(([name, slug]) => [slug, name])
);

export function SlateExampleClient({
  exampleId,
}: {
  exampleId: SlateExampleId;
}) {
  const Example = slateExampleComponents[exampleId];
  const title = exampleLabels.get(exampleId) ?? exampleId;

  return (
    <main
      className="mx-auto flex min-w-0 max-w-5xl flex-col gap-6 px-6 py-8"
      data-slate-example={exampleId}
      data-slate-scope="proof-route"
    >
      <h1 className="example-page-title text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <Example />
      <SlateExampleNavigation activeExample={exampleId} />
    </main>
  );
}

function SlateExampleNavigation({
  activeExample,
}: {
  activeExample: SlateExampleId;
}) {
  return (
    <>
      <details data-slate-example-mobile-nav>
        <summary>Examples</summary>
        <SlateExampleLinks activeExample={activeExample} />
      </details>
      <nav
        aria-label="Slate examples"
        data-slate-example-sidebar
        data-slate-desktop-nav
      >
        <SlateExampleLinks activeExample={activeExample} />
      </nav>
    </>
  );
}

function SlateExampleLinks({
  activeExample,
}: {
  activeExample: SlateExampleId;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {NON_HIDDEN_EXAMPLES.map(([name, slug]) => {
        const isNewExample = isNewSlateExamplePath(slug);

        return (
          <Link
            data-active={activeExample === slug}
            data-slate-example-nav-link={slug}
            href={`/examples/slate/${slug}`}
            key={slug}
            prefetch={false}
          >
            <span>{name}</span>
            {isNewExample ? (
              <span
                data-slate-example-new-dot={slug}
                title="New"
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
