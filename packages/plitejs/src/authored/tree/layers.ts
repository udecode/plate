import { jsonEqual } from '../../core/change/json';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';

/** A property value, with `undefined` for an absent property; `null` counts as absent. */
export type LayerValue = EditorJsonValue | undefined;

/**
 * One property write a pending suggestion made. Nothing edits a tag after it
 * is written: recording, decisions and Editing takeover only add or remove
 * whole tags.
 */
export type FormatTag = Readonly<{
  at: number;
  author: string;
  /** The value this write replaced; absent when the property was absent. */
  before?: EditorJsonValue;
  change: string;
  id: string;
  inc?: string;
  key: string;
  kind: 'format';
  /** The key's tips when this was written; absent over the accepted value. */
  over?: readonly string[];
  write:
    | Readonly<{ kind: 'remove' }>
    | Readonly<{ kind: 'set'; value: EditorJsonValue }>;
}>;

export type LayerOutcome = (tag: FormatTag) => 'accept' | 'keep' | 'reject';

export type KeyDecision = Readonly<{
  /** The tags left on the key, each the same object as an input tag. */
  kept: readonly FormatTag[];
  value:
    | Readonly<{ kind: 'set'; value: LayerValue }>
    | Readonly<{ kind: 'unchanged' }>;
  /** Pending changes the decision waits on; non-empty means nothing changed. */
  waits: readonly string[];
}>;

/** One tag, or a fork: tags written concurrently from one point, decided as one. */
type Step = Readonly<{ below: LayerValue; tags: readonly FormatTag[] }>;

const absent = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

const sameValue = (left: LayerValue, right: LayerValue) =>
  absent(left) ? absent(right) : !absent(right) && jsonEqual(left, right);

// The bottom tag of a step whose roots differ, the same on every client. A
// malformed cycle leaves no root, so its tags all compete.
const smallestId = (roots: readonly FormatTag[], all: readonly FormatTag[]) =>
  getDefined(
    [...(roots.length > 0 ? roots : all)].sort((left, right) =>
      left.id < right.id ? -1 : 1
    )[0]
  );

const parentsOf = (tag: FormatTag, present: ReadonlySet<string>) =>
  (tag.over ?? []).filter((id) => id !== tag.id && present.has(id));

/**
 * The key's tags as a chain of steps, bottom first. `over` is read against the
 * tags present, so an id a decision removed means the accepted value. A tag
 * every other tag descends from or leads to is a step of its own; the tags
 * between two such tags, which some concurrent write left incomparable, form
 * one fork step.
 */
export const keySteps = (tags: readonly FormatTag[]): readonly Step[] => {
  const count = tags.length;
  const positions = new Map<string, number>();

  tags.forEach((tag, index) => positions.set(tag.id, index));
  const writtenOver: number[][] = [];
  const writtenUnder: number[][] = tags.map(() => []);

  tags.forEach((tag, index) => {
    const below: number[] = [];

    for (const id of tag.over ?? []) {
      const other = positions.get(id);

      if (other !== undefined && id !== tag.id && !below.includes(other)) {
        below.push(other);
        writtenUnder[other].push(index);
      }
    }
    writtenOver.push(below);
  });

  const waiting = writtenOver.map((below) => below.length);
  const order: number[] = [];

  for (let index = 0; index < count; index++) {
    if (waiting[index] === 0) order.push(index);
  }
  // The order grows while this walks it, which an array iterator allows.
  for (const index of order) {
    for (const next of writtenUnder[index]) {
      waiting[next] -= 1;
      if (waiting[next] === 0) order.push(next);
    }
  }
  // Only a malformed document has a cycle; its tags still count, after the rest.
  for (let index = 0; order.length < count && index < count; index++) {
    if (waiting[index] > 0) order.push(index);
  }

  // Walking the order one way, the passed tags no other passed tag links to
  // are the frontier, and a tag reaches every passed tag exactly when it
  // links to the whole frontier.
  const reachesPassed = (links: readonly number[][], reverse: boolean) => {
    const open = new Uint8Array(count);
    const found = new Uint8Array(count);
    let opened = 0;

    for (let at = 0; at < count; at++) {
      const index = order[reverse ? count - 1 - at : at];
      let reached = 0;

      for (const other of links[index]) reached += open[other];
      if (reached === opened) found[index] = 1;
      for (const other of links[index]) {
        opened -= open[other];
        open[other] = 0;
      }
      open[index] = 1;
      opened += 1;
    }

    return found;
  };
  const fromBelow = reachesPassed(writtenOver, false);
  const fromAbove = reachesPassed(writtenUnder, true);
  const steps: Step[] = [];
  let fork: number[] = [];
  const closeFork = () => {
    if (fork.length === 0) return;
    const members = new Set(fork);
    // A correction on one client can leave the bottom tags with different
    // values; the smallest id decides, the same on every client.
    const bottom = smallestId(
      fork
        .filter((index) =>
          writtenOver[index].every((other) => !members.has(other))
        )
        .map((index) => tags[index]),
      fork.map((index) => tags[index])
    );

    steps.push({
      below: bottom.before,
      tags: fork
        .sort((left, right) => left - right)
        .map((index) => tags[index]),
    });
    fork = [];
  };

  for (const index of order) {
    if (fromBelow[index] === 0 || fromAbove[index] === 0) {
      fork.push(index);
      continue;
    }
    closeFork();
    steps.push({ below: tags[index].before, tags: [tags[index]] });
  }
  closeFork();

  return steps;
};

/** The ids of the key's tips: the tags no other present tag was written over. */
export const keyTips = (tags: readonly FormatTag[]): readonly string[] => {
  const present = new Set(tags.map((tag) => tag.id));
  const covered = new Set(tags.flatMap((tag) => parentsOf(tag, present)));

  return tags.filter((tag) => !covered.has(tag.id)).map((tag) => tag.id);
};

export const tipsWrittenValue = (tags: readonly FormatTag[]): LayerValue => {
  const tipIds = new Set(keyTips(tags));
  const tips = tags.filter((tag) => tipIds.has(tag.id));
  if (tips.some((tag) => tag.write.kind === 'remove')) return undefined;
  const top = smallestId(tips, tags);
  return top.write.kind === 'set' ? top.write.value : undefined;
};

/**
 * Decide one key. A suggestion built on another depends on it: accepting a
 * step waits on every pending step below it, rejecting one waits on every
 * pending step above it, and a decision on one tag of a fork waits on the
 * fork's other tags. The value comes from the highest step not rejected: the
 * live value when it is the top step, otherwise the value the step above it
 * replaced; with every step rejected, the value the bottom step replaced. It
 * never compares the live value with a tag, so a correction that rewrote the
 * live value changes no decision.
 */
export const decideKey = (
  live: LayerValue,
  tags: readonly FormatTag[],
  outcome: LayerOutcome
): KeyDecision => {
  const outcomes = new Set(tags.map(outcome));

  // One outcome for every tag needs no steps: keeping changes nothing,
  // accepting keeps the live value, and rejecting restores what the bottom
  // step replaced.
  if (outcomes.size <= 1) {
    if (!outcomes.has('reject')) {
      return {
        kept: outcomes.has('keep') ? tags : [],
        value: { kind: 'unchanged' },
        waits: [],
      };
    }

    const present = new Set(tags.map((tag) => tag.id));
    const bottom = smallestId(
      tags.filter((tag) => parentsOf(tag, present).length === 0),
      tags
    );

    return {
      kept: [],
      value: {
        kind: 'set',
        value: absent(bottom.before) ? undefined : bottom.before,
      },
      waits: [],
    };
  }

  const steps = keySteps(tags);
  const waits = new Set<string>();
  const statuses = steps.map((step) => {
    const pending = step.tags.filter((tag) => outcome(tag) === 'keep');

    if (pending.length === step.tags.length) return 'keep';
    if (pending.length > 0) {
      for (const tag of pending) waits.add(tag.change);

      return 'keep';
    }

    return step.tags.some((tag) => outcome(tag) === 'reject')
      ? 'reject'
      : 'accept';
  });

  const firstReject = statuses.indexOf('reject');
  const lastAccept = statuses.lastIndexOf('accept');

  steps.forEach((step, index) => {
    const buried = firstReject !== -1 && index > firstReject;

    if (statuses[index] === 'keep' && (buried || index < lastAccept)) {
      for (const tag of step.tags) waits.add(tag.change);
    }
  });

  if (waits.size > 0) {
    return { kept: tags, value: { kind: 'unchanged' }, waits: [...waits] };
  }

  const kept = steps.flatMap((step, index) =>
    statuses[index] === 'keep' ? step.tags : []
  );

  if (statuses.every((status) => status === 'keep')) {
    return { kept, value: { kind: 'unchanged' }, waits: [] };
  }

  const highest = statuses.findLastIndex((status) => status !== 'reject');

  if (highest === steps.length - 1) {
    return { kept, value: { kind: 'unchanged' }, waits: [] };
  }

  const value = getDefined(steps[highest + 1]).below;

  return {
    kept,
    value: { kind: 'set', value: absent(value) ? undefined : value },
    waits: [],
  };
};

/** Each tagged key's value with every tag on it rejected. */
export const acceptedValues = (
  tags: readonly FormatTag[]
): Readonly<Record<string, LayerValue>> => {
  const byKey = Map.groupBy(tags, (tag) => tag.key);

  return Object.fromEntries(
    [...byKey].map(([key, written]) => {
      const decided = decideKey(undefined, written, () => 'reject');

      return [
        key,
        decided.value.kind === 'set' ? decided.value.value : undefined,
      ];
    })
  );
};

/**
 * Record one property write. Editing commands take the key over, Editing
 * corrections keep every tag, and Suggesting adds a tag over the key's tips,
 * except on the writer's own pending insertion when no other change holds the
 * key, or over the writer's own run of tags at the top: a value that returns
 * to what the run replaced withdraws the run, and any other value replaces it
 * with one tag from that value, so a reviewer sees each writer's change to a
 * key once.
 */
export const writeLayer = (
  input: Readonly<{
    intent: 'edit' | 'propose';
    isOwn: (tag: FormatTag) => boolean;
    next: LayerValue;
    ownInsertion: boolean;
    previous: LayerValue;
    source: 'command' | 'correction';
    tag: (fields: Pick<FormatTag, 'before' | 'over' | 'write'>) => FormatTag;
    tags: readonly FormatTag[];
  }>
): readonly FormatTag[] => {
  const { tags } = input;

  if (input.intent === 'edit') {
    return input.source === 'correction' ? tags : [];
  }
  const steps = keySteps(tags);
  const run: FormatTag[] = [];

  for (const step of [...steps].reverse()) {
    const [tag] = step.tags;

    if (step.tags.length !== 1 || !tag || !input.isOwn(tag)) break;
    run.push(tag);
  }
  const first = run.at(-1);

  if (first && sameValue(input.next, first.before)) {
    return tags.filter((tag) => !run.includes(tag));
  }
  if (input.ownInsertion && tags.every(input.isOwn)) return tags;
  if (first) {
    return [
      ...tags.filter((tag) => !run.includes(tag)),
      input.tag({
        write: absent(input.next)
          ? { kind: 'remove' }
          : { kind: 'set', value: input.next },
        ...(first.over ? { over: first.over } : {}),
        ...(absent(first.before) ? {} : { before: first.before }),
      }),
    ];
  }

  const tips = keyTips(tags);

  return [
    ...tags,
    input.tag({
      write: absent(input.next)
        ? { kind: 'remove' }
        : { kind: 'set', value: input.next },
      ...(tips.length > 0 ? { over: tips } : {}),
      ...(absent(input.previous) ? {} : { before: input.previous }),
    }),
  ];
};
