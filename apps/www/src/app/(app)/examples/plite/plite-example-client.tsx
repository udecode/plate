'use client';

import { ExperimentalBadge } from '@/components/experimental-badge';

import {
  pliteExampleComponents,
  type PliteExampleId,
} from './plite-example-loaders';
import {
  EXAMPLE_NAMES_AND_PATHS,
  getPliteExampleStatus,
} from './plite-example-registry';

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
      data-editor-example={exampleId}
      data-editor-scope="donor-route"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="example-page-title text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {getPliteExampleStatus(exampleId) === 'experimental' && (
          <ExperimentalBadge />
        )}
      </div>
      <Example />
    </div>
  );
}
