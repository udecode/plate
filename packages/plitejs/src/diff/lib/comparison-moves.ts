import type { ComparisonDocumentIndex } from './comparison-index';
import { disjointSets } from './comparison-internal';
import type { PlanWindow } from './comparison-plan';
import type { ComparedChange, ComparisonEffect } from './comparison-types';

type Side = 'after' | 'before';

type TieWindow = Pick<PlanWindow, 'after' | 'before' | 'owners' | 'root'>;

const WORD = /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu;
const LETTER = /\p{L}/u;
const NO_WINDOW = -1;
const MIN_RUN_LENGTH = 3;

const changesCovered = ({ kind }: ComparisonEffect, side: Side) => {
  switch (kind) {
    case 'delete':
    case 'root-delete': {
      return side === 'before';
    }
    case 'insert':
    case 'root-create': {
      return side === 'after';
    }
    case 'text': {
      return true;
    }
    default: {
      return false;
    }
  }
};

const clearCopiedText = (
  changed: ReadonlyMap<string | null, Uint8Array>,
  groups: readonly ComparedChange[]
) => {
  for (const { correspondence } of groups) {
    for (const { after, kind } of correspondence) {
      if (kind !== 'copy') continue;
      for (const { from, root, to } of after) {
        changed.get(root)?.fill(0, from, to);
      }
    }
  }
};

const changedText = (
  groups: readonly ComparedChange[],
  index: ComparisonDocumentIndex,
  side: Side
) => {
  const changed = new Map<string | null, Uint8Array>();

  for (const [root, { length }] of index.roots) {
    changed.set(root, new Uint8Array(length));
  }
  for (const { effects } of groups) {
    for (const effect of effects) {
      if (!changesCovered(effect, side)) continue;
      for (const { from, root, to } of effect[side]) {
        changed.get(root)?.fill(1, from, to);
      }
    }
  }
  if (side === 'after') clearCopiedText(changed, groups);

  return changed;
};

const sideWords = (
  windows: readonly TieWindow[],
  groups: readonly ComparedChange[],
  index: ComparisonDocumentIndex,
  side: Side
) => {
  const within = new Map<string | null, Int32Array>();

  for (const [root, { length }] of index.roots) {
    within.set(root, new Int32Array(length).fill(NO_WINDOW));
  }
  windows.forEach((window, at) => {
    within.get(window.root)?.fill(at, window[side].from, window[side].to);
  });
  const changed = changedText(groups, index, side);
  const blocks = new Map<
    number,
    { held: number[]; text: string; writers: number[] }
  >();

  for (const node of index.nodes) {
    if (node.kind !== 'text') continue;
    const holds = within.get(node.root);
    const changes = changed.get(node.root);

    if (!holds || !changes) continue;
    let block = node.parentIndex;

    while (block !== null && index.nodes[block].inline) {
      block = index.nodes[block].parentIndex;
    }
    const key = block ?? -1 - node.index;
    const entry = blocks.get(key) ?? { held: [], text: '', writers: [] };

    for (const segment of node.textSegments) {
      entry.text += segment.text;
      for (let at = segment.from; at < segment.to; at++) {
        entry.held.push(holds[at]);
        entry.writers.push(changes[at] ? holds[at] : NO_WINDOW);
      }
    }
    blocks.set(key, entry);
  }

  const runWriters = new Map<string, Set<number>>();
  const wholeWords = new Set<string>();
  const counts = new Map<string, number>();
  const holders = new Map<string, ReadonlySet<number>>();
  const addRun = (run: string, writer: number) => {
    if (!LETTER.test(run)) return;
    const set = runWriters.get(run) ?? new Set<number>();

    set.add(writer);
    runWriters.set(run, set);
  };

  for (const { held, text, writers } of blocks.values()) {
    for (const match of text.matchAll(WORD)) {
      const word = match[0];

      if (!LETTER.test(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
      const end = match.index + word.length;
      const own = writers.slice(match.index, end);

      for (let at = 0, next = 1; at < own.length; at = next, next += 1) {
        while (next < own.length && own[next] === own[at]) next += 1;
        if (own[at] === NO_WINDOW) continue;
        addRun(word.slice(at, next), own[at]);
        if (at === 0 && next === own.length) wholeWords.add(word);
      }
      holders.set(
        word,
        new Set(held.slice(match.index, end).filter((at) => at !== NO_WINDOW))
      );
    }
  }

  const uniqueHolders = new Map<string, ReadonlySet<number>>();

  for (const [word, count] of counts) {
    const held = holders.get(word);

    if (count === 1 && held) uniqueHolders.set(word, held);
  }

  return { runWriters, uniqueHolders, wholeWords };
};

const mutuallyRequired = (
  groups: readonly ComparedChange[],
  indexOf: ReadonlyMap<string, number>
) => {
  const together = disjointSets(groups.length);

  groups.forEach(({ id, requiredChangeIds }, index) => {
    for (const required of requiredChangeIds) {
      const other = indexOf.get(required);

      if (other !== undefined && groups[other].requiredChangeIds.includes(id)) {
        together.join(index, other);
      }
    }
  });

  return together;
};

export const movedWordTies = (
  windows: readonly TieWindow[],
  groups: readonly ComparedChange[],
  before: ComparisonDocumentIndex,
  after: ComparisonDocumentIndex
): ReadonlyArray<readonly string[]> => {
  const indexOf = new Map(groups.map(({ id }, index) => [id, index]));
  const together = mutuallyRequired(groups, indexOf);
  const { find, join } = disjointSets(windows.length);
  const firstTogether = new Map<number, number>();

  windows.forEach(({ owners }, at) => {
    for (const owner of owners) {
      const group = indexOf.get(owner);

      if (group === undefined) continue;
      const root = together.find(group);
      const first = firstTogether.get(root);

      if (first === undefined) firstTogether.set(root, at);
      else join(first, at);
    }
  });
  const ties: number[][] = [];
  const tie = (members: readonly number[]) => {
    const roots = new Set(members.map(find));

    if (roots.size < 2) return;
    ties.push([...members]);
    for (const member of members) join(members[0], member);
  };
  const removed = sideWords(windows, groups, before, 'before');
  const added = sideWords(windows, groups, after, 'after');

  for (const [word, holders] of removed.uniqueHolders) {
    const adders = added.uniqueHolders.get(word);

    if (adders) tie([...holders, ...adders]);
  }
  for (const [run, removers] of removed.runWriters) {
    const adders = added.runWriters.get(run);

    if (
      adders &&
      run.length >= MIN_RUN_LENGTH &&
      (removed.wholeWords.has(run) || added.wholeWords.has(run)) &&
      new Set([...removers].map(find)).size === 1 &&
      new Set([...adders].map(find)).size === 1
    ) {
      tie([...removers, ...adders]);
    }
  }

  return ties
    .map((members) => {
      const lowest = new Map<number, number>();

      for (const owner of members.flatMap((at) => windows[at].owners)) {
        const group = indexOf.get(owner);

        if (group === undefined) continue;
        const root = together.find(group);

        lowest.set(root, Math.min(lowest.get(root) ?? group, group));
      }

      return [...lowest.values()].map((group) => groups[group].id);
    })
    .filter((owners) => owners.length > 1);
};
