'use client';

import {
  pliteExampleComponents,
  type PliteExampleId,
} from './plite-example-loaders';
import { EXAMPLE_NAMES_AND_PATHS } from './plite-example-registry';

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
    <div
      className="flex min-w-0 flex-col gap-6"
      data-plite-example={exampleId}
      data-plite-scope="donor-route"
    >
      <div className="flex flex-col gap-2">
        <h1 className="example-page-title text-3xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <Example />
    </div>
  );
}
