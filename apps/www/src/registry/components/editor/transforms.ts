'use client';

import type { Element, PluginTransaction } from 'platejs';

type InsertBlockOptions = {
  replaceEmpty: boolean;
  select: true;
};

export function insertBlock(
  tx: PluginTransaction,
  recipe: {
    insert: (options: InsertBlockOptions) => undefined;
    matches: (block: Element) => boolean;
  },
  { upsert = false }: { upsert?: boolean } = {}
): void {
  const block = tx.nodes.block();

  if (!block) return;

  const matches = recipe.matches(block[0]);

  if (upsert && matches && tx.nodes.isEmpty(block[0])) return;

  recipe.insert({ replaceEmpty: !matches, select: true });
}
