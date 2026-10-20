const UNTRIAGED_FAILING_FIXTURES = [
  'normalization/block/remove-inline.tsx',
  'transforms/insertFragment/of-blocks/block-empty.tsx',
  'transforms/insertFragment/of-mixed/block-empty.tsx',
  'transforms/insertFragment/of-mixed/block-empty2.tsx',
  'transforms/insertFragment/of-mixed/block-empty3.tsx',
  'transforms/insertFragment/of-mixed/block-end.tsx',
  'transforms/insertFragment/of-mixed/block-end2.tsx',
  'transforms/insertFragment/of-mixed/block-middle.tsx',
  'transforms/insertFragment/of-mixed/block-start.tsx',
  'transforms/insertFragment/of-mixed/block-start2.tsx',
  'transforms/insertFragment/of-tables/merge-cells-with-nested-blocks.tsx',
  'transforms/insertFragment/of-texts/inline-empty.tsx',
  'transforms/insertNodes/void/block-nested.tsx',
  'transforms/setNodes/text/merge-across.tsx',
  'transforms/splitNodes/voids-true/block.tsx',
  'transforms/wrapNodes/voids-true/block.tsx',
] as const;

const UNTRIAGED_FAILING_FIXTURE_SET = new Set<string>(
  UNTRIAGED_FAILING_FIXTURES
);

export const isUntriagedFailingFixture = (fixturePathFromTestRoot: string) =>
  UNTRIAGED_FAILING_FIXTURE_SET.has(fixturePathFromTestRoot);
