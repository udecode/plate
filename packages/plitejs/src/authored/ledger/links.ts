import type { BlockFacts } from './runs';

export type Span = readonly [first: number, last: number];

export type BlockLine = Readonly<{
  facts: (rank: number) => BlockFacts;
  headLength: number;
  keptBefore: (rank: number) => number;
  related: (key: string) => Readonly<{
    followers: readonly number[];
    joiners: readonly number[];
  }>;
}>;

export const spansOf = (line: BlockLine, rank: number): Span[] => {
  const facts = line.facts(rank);
  const spans: Span[] = [];

  if (rank < line.headLength && line.headLength > 1) {
    spans.push([0, line.headLength - 1]);
  }
  if (facts.opensWithStructure && rank > 0) {
    let at = line.keptBefore(rank);

    while (
      at >= 0 &&
      line.facts(at).follows.some((key) => facts.joins.includes(key))
    ) {
      at = line.keptBefore(at);
    }
    spans.push([Math.max(at, 0), rank]);
  }
  for (const key of new Set([...facts.follows, ...facts.joins])) {
    const { followers, joiners } = line.related(key);

    if (followers.length === 0 || joiners.length === 0) continue;

    const ranks = [...followers, ...joiners];

    spans.push([Math.min(...ranks), Math.max(...ranks)]);
  }

  return spans;
};
