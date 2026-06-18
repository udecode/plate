'use client';

import Link from 'next/link';

import {
  slateExampleComponents,
  type SlateExampleId,
} from './slate-example-loaders';
import { EXAMPLE_NAMES_AND_PATHS } from './slate-example-registry';

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
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8"
      data-slate-example={exampleId}
      data-slate-proof-scope="donor-route"
    >
      <div className="flex flex-col gap-2">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/examples/slate"
        >
          Slate examples
        </Link>
        <h1 className="example-page-title text-3xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <Example />
    </main>
  );
}
