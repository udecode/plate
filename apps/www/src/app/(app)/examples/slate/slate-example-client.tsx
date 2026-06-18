'use client';

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
    <div
      className="flex min-w-0 flex-col gap-6"
      data-slate-example={exampleId}
      data-slate-scope="donor-route"
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
