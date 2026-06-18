import { notFound } from 'next/navigation';

import { SlateExampleClient } from '../slate-example-client';
import type { SlateExampleId } from '../slate-example-loaders';
import { EXAMPLE_NAMES_AND_PATHS } from '../slate-example-registry';
import { SlateExamplesShell } from '../slate-examples-shell';

const exampleLabels = new Map(
  EXAMPLE_NAMES_AND_PATHS.map(([name, slug]) => [slug, name])
);
const exampleIds = new Set<string>(
  EXAMPLE_NAMES_AND_PATHS.map(([, slug]) => slug)
);

export function generateStaticParams() {
  return EXAMPLE_NAMES_AND_PATHS.map(([, example]) => ({ example }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ example: string }>;
}) {
  const { example: exampleParam } = await params;
  const example = exampleParam as SlateExampleId;
  return { title: `${exampleLabels.get(example) ?? exampleParam} - Slate` };
}

export default async function SlateExamplePage({
  params,
}: {
  params: Promise<{ example: string }>;
}) {
  const { example } = await params;
  if (!exampleIds.has(example)) {
    notFound();
  }

  return (
    <SlateExamplesShell activeExample={example}>
      <SlateExampleClient exampleId={example as SlateExampleId} />
    </SlateExamplesShell>
  );
}
