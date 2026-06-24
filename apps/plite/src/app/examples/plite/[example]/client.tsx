'use client';

import Link from 'next/link';

import type { PliteExampleId } from '../../../../../../www/src/app/(app)/examples/plite/plite-example-loaders';
import { pliteExampleComponents } from '../../../../../../www/src/app/(app)/examples/plite/plite-example-loaders';
import {
  EXAMPLE_NAMES_AND_PATHS,
  isNewPliteExamplePath,
  NON_HIDDEN_EXAMPLES,
} from '../../../../../../www/src/app/(app)/examples/plite/plite-example-registry';

const exampleLabels = new Map(
  EXAMPLE_NAMES_AND_PATHS.map(([name, slug]) => [slug, name])
);

export function PliteExampleClient({
  exampleId,
}: {
  exampleId: PliteExampleId;
}) {
  const Example = pliteExampleComponents[exampleId];
  const title = exampleLabels.get(exampleId) ?? exampleId;

  return (
    <main
      className="mx-auto flex min-w-0 max-w-5xl flex-col gap-6 px-6 py-8"
      data-plite-example={exampleId}
      data-plite-scope="proof-route"
    >
      <h1 className="example-page-title text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <Example />
      <PliteExampleNavigation activeExample={exampleId} />
    </main>
  );
}

function PliteExampleNavigation({
  activeExample,
}: {
  activeExample: PliteExampleId;
}) {
  return (
    <>
      <details data-plite-example-mobile-nav>
        <summary>Examples</summary>
        <PliteExampleLinks activeExample={activeExample} />
      </details>
      <nav
        aria-label="Plite examples"
        data-plite-example-sidebar
        data-plite-desktop-nav
      >
        <PliteExampleLinks activeExample={activeExample} />
      </nav>
    </>
  );
}

function PliteExampleLinks({
  activeExample,
}: {
  activeExample: PliteExampleId;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {NON_HIDDEN_EXAMPLES.map(([name, slug]) => {
        const isNewExample = isNewPliteExamplePath(slug);

        return (
          <Link
            data-active={activeExample === slug}
            data-plite-example-nav-link={slug}
            href={`/examples/plite/${slug}`}
            key={slug}
            prefetch={false}
          >
            <span>{name}</span>
            {isNewExample ? (
              <span
                data-plite-example-new-dot={slug}
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
