import { type JsonRecord, jsonEqual } from '../../core/change/json';
import { isSplitOutput, readsAt } from '../../core/default-storage';
import {
  type CompiledEditorSchema,
  getCompiledPropertyCandidates,
} from '../../core/schema-compiler';
import { getDefined } from '../../internal/get-defined';
import { elementContextAt, type Place, STRUCTURE } from './holds';
import { type AuthoredMark, isBetweenChange, isPlaceChange } from './marks';

type Node = JsonRecord & { children?: readonly Node[]; text?: string };

/** One side of a rejected cut as this run leaves it. */
export type Half = Readonly<{
  /** The element as stored, whose marks name the changes pending on it. */
  node: Node;
  /** Its properties with this run's format verdicts. */
  decided: Readonly<JsonRecord>;
  /** `decided` as its place holds them, which the comparison reads. */
  props: Readonly<JsonRecord>;
  /** Its marks whose changes this run leaves pending. */
  pending: readonly AuthoredMark[];
}>;

/** Whether a left half supplies `key` to its join: a decided value there, or a pending write of it. */
export const supplies = (half: Half, key: string) =>
  Object.hasOwn(half.decided, key) ||
  half.pending.some((mark) => mark.kind === 'format' && mark.key === key);

export type Halves = Readonly<{
  /** The cut's own change, which never counts as touching its halves. */
  change: string;
  /**
   * For a block cut whose right half has no type tag of the cut's change, as
   * a save from before such tags has none: the type Editing's split gives
   * that slot, which the right half's type then reads as the left's.
   */
  forced: string | null;
  left: Half;
  place: Place;
  right: Half;
}>;

/** What stands around the halves, as the touching rule reads it. */
export type Around = Readonly<{
  /** The nodes between the halves: siblings, or blocks for unmet halves. */
  between: readonly Node[];
  /** False when the halves stand in different blocks in this run. */
  met: boolean;
  /** The elements whose structure or type decides where the halves stand. */
  place: readonly Node[];
}>;

/**
 * What rejecting a cut does with its halves, relative to the left half the
 * deciding run found: the halves join, stay apart, or that left half is gone.
 */
export type Verdict = 'apart' | 'gone' | 'together';

export type Settled = Readonly<
  { verdict: Verdict } | { waits: readonly string[] }
>;

/** An accept or reject for each change a probe decides. */
export type Assignment = ReadonlyMap<string, 'accept' | 'reject'>;

const COMBINATION_CAP = 8;

const isText = (node: Node) => typeof node.text === 'string';

const typeOf = (props: Readonly<JsonRecord>) =>
  typeof props.type === 'string' ? props.type : null;

const compares = (schema: CompiledEditorSchema | null, key: string) =>
  !STRUCTURE.has(key) &&
  !(
    schema &&
    getCompiledPropertyCandidates(schema, 'element', key).some(
      (property) => property.role === 'metadata'
    )
  );

const dropsOnSplit = (schema: CompiledEditorSchema | null, key: string) =>
  !!schema &&
  getCompiledPropertyCandidates(schema, 'element', key).some(
    (property) => property.lifecycle.split === 'drop'
  );

/**
 * Whether the halves read differently where they stand, with the cut's own
 * change undone. A right half that holds a dropped key's split output reads
 * the left's value there.
 */
const halvesDiffer = (
  schema: CompiledEditorSchema | null,
  { forced, left, place, right }: Halves
) => {
  const type = typeOf(left.props);
  const rightType = typeOf(right.props);

  if (type !== rightType && rightType !== forced) return true;

  const context = schema && elementContextAt(schema, type, place);
  const reads = (props: Readonly<JsonRecord>, key: string) =>
    context && schema ? readsAt(schema, props, key, context) : props[key];

  for (const key of new Set([
    ...Object.keys(left.props),
    ...Object.keys(right.props),
  ])) {
    if (!compares(schema, key)) continue;
    const value = reads(left.props, key);
    const rightValue =
      dropsOnSplit(schema, key) && isSplitOutput(schema, right.props, key)
        ? value
        : reads(right.props, key);

    if (!jsonEqual(value, rightValue)) return true;
  }

  return false;
};

/** The pending changes whose decision could change the verdict, by id. */
const touchingOf = (
  schema: CompiledEditorSchema | null,
  halves: Halves,
  around: Around,
  pendingOf: ((node: Node) => readonly AuthoredMark[]) | null
) => {
  if (!pendingOf) return [];

  const changes = new Set<string>();
  const add = (marks: readonly AuthoredMark[]) => {
    for (const mark of marks) {
      if (mark.change !== halves.change) changes.add(mark.change);
    }
  };
  const addBetween = (node: Node) => {
    add(pendingOf(node).filter(isBetweenChange));
    for (const child of node.children ?? []) addBetween(child);
  };

  for (const half of [halves.left, halves.right]) {
    add(
      half.pending.filter((mark) =>
        mark.kind === 'format'
          ? mark.key === 'type' || compares(schema, mark.key)
          : mark.kind === 'insert' || mark.kind === 'delete'
      )
    );
  }
  for (const node of around.between) addBetween(node);
  for (const node of around.place) add(pendingOf(node).filter(isPlaceChange));

  return [...changes].sort();
};

/**
 * Every accept-or-reject combination of `touching`, each read by `probe`:
 * one verdict when all agree, otherwise a wait on `touching` and whatever a
 * probe still waits on. Stops at the first disagreement.
 */
const settleVerdict = (
  touching: readonly string[],
  probe: (decided: Assignment) => Settled
): Settled => {
  let first: Verdict | null = null;

  for (let mask = 0; mask < 2 ** touching.length; mask += 1) {
    const settled = probe(
      new Map(
        touching.map((change, bit) => [
          change,
          mask & (1 << bit) ? 'accept' : 'reject',
        ])
      )
    );

    if ('waits' in settled) {
      return { waits: [...new Set([...touching, ...settled.waits])] };
    }
    first ??= settled.verdict;
    if (settled.verdict !== first) return { waits: touching };
  }

  return { verdict: getDefined(first) };
};

/**
 * What rejecting this cut does with its halves. It decides at once when no
 * pending change touches them. Otherwise a deciding run reads each
 * combination of the touching changes through `probe`, up to the cap, and a
 * probe, whose `probe` is null, waits on them.
 */
export const verdictOf = (
  schema: CompiledEditorSchema | null,
  halves: Halves,
  around: Around,
  run: Readonly<{
    /** A node's marks whose changes this run leaves pending; null when the run decides every change. */
    pendingOf: ((node: Node) => readonly AuthoredMark[]) | null;
    probe: ((decided: Assignment) => Settled) | null;
    survives: (node: Node) => boolean;
  }>
): Settled => {
  const touching = touchingOf(schema, halves, around, run.pendingOf);

  if (touching.length > 0) {
    return run.probe && 2 ** touching.length <= COMBINATION_CAP
      ? settleVerdict(touching, run.probe)
      : { waits: touching };
  }

  return {
    verdict:
      !around.met ||
      around.between.some((node) => !isText(node) && run.survives(node)) ||
      halvesDiffer(schema, halves)
        ? 'apart'
        : 'together',
  };
};
