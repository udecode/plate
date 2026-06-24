import { notFound } from 'next/navigation';

import type { PliteExampleId } from '../../../../../../www/src/app/(app)/examples/plite/plite-example-loaders';
import { EXAMPLE_NAMES_AND_PATHS } from '../../../../../../www/src/app/(app)/examples/plite/plite-example-registry';
import { PliteExampleClient } from './client';

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
  const example = exampleParam as PliteExampleId;

  return { title: `${exampleLabels.get(example) ?? exampleParam} - Plite` };
}

export default async function PliteExamplePage({
  params,
}: {
  params: Promise<{ example: string }>;
}) {
  const { example } = await params;

  if (!exampleIds.has(example)) {
    notFound();
  }

  return <PliteExampleClient exampleId={example as PliteExampleId} />;
}
