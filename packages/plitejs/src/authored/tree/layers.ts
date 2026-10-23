import { jsonEqual } from '../../core/change/json';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';
import { isEditingChange } from '../facts/editing';
import type { AuthoredMark } from './marks';

/** A property value, with `undefined` for an absent property; `null` counts as absent. */
export type LayerValue = EditorJsonValue | undefined;

export type FormatWrite =
  | Readonly<{ kind: 'remove' }>
  | Readonly<{ kind: 'set'; value: EditorJsonValue }>;

export type FormatLink = Readonly<{ id: string; write: FormatWrite }>;

/**
 * One property write of one change. Nothing edits a tag after it is written.
 * Every format tag one commit writes shares that commit's write id, so a tag's
 * id is unique only within its node and key.
 */
export type FormatTag = Readonly<{
  at: number;
  author: string;
  /**
   * The key's value with every tag in `over` undone, where a split's own tag
   * counts as its write, the split's output.
   */
  base?: FormatWrite;
  /** The value this write replaced; absent when the property was absent. */
  before?: EditorJsonValue;
  change: string;
  id: string;
  inc?: string;
  key: string;
  kind: 'format';
  /**
   * The key's steps, bottom first, each with the writes of its tags, when this
   * write or the first write of the run it replaced was made.
   */
  over?: ReadonlyArray<readonly FormatLink[]>;
  /**
   * The change whose proposed split wrote this tag on the split's second half,
   * over copies of the first half's tags on a key the split dropped. The
   * copies keep their own fields, and once the split is accepted they leave
   * without landing.
   */
  split?: string;
  write: FormatWrite;
}>;

export type IsAccepted = (
  member: Readonly<{ at: number; change: string; inc?: string }>
) => boolean;

/** Whether a write gone from the key still stands: its landed record names a member that is accepted. */
export type IsLanded = (write: string) => boolean;

export type Standing = Readonly<{ accepted: IsAccepted; landed: IsLanded }>;

export type LayerOutcome = (tag: FormatTag) => 'accept' | 'keep' | 'reject';

/** Whether `value` is what a split leaves on `key`: absent, a default some place fills, or a generated value. */
export type IsSplitOutput = (key: string, value: LayerValue) => boolean;

export type ValueReading = Standing & Readonly<{ output: IsSplitOutput }>;

export type KeyReading = ValueReading & Readonly<{ outcome: LayerOutcome }>;

export type KeyDecision = Readonly<{
  readsCopies: boolean;
  /** The tags left on the key, each the same object as an input tag. */
  kept: readonly FormatTag[];
  /**
   * The accepted Suggesting tags the decision removes, whose writes stand from
   * now on only through a landed record.
   */
  landed: readonly FormatTag[];
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

const valueOf = (write: FormatWrite | undefined): LayerValue =>
  write?.kind === 'set' ? write.value : undefined;

const writeOf = (value: LayerValue): FormatWrite =>
  absent(value) ? { kind: 'remove' } : { kind: 'set', value };

const linkOf = ({ id, write }: FormatTag): FormatLink => ({ id, write });

// The bottom tag of a step whose roots differ, the same on every client. A
// malformed cycle leaves no root, so its tags all compete.
const smallestId = (roots: readonly FormatTag[], all: readonly FormatTag[]) =>
  getDefined(
    [...(roots.length > 0 ? roots : all)].sort((left, right) =>
      left.id < right.id ? -1 : 1
    )[0]
  );

const linksOf = (tag: FormatTag) => (tag.over ?? []).flat();

const historyOnKey = (tags: readonly FormatTag[]) => {
  const byId = new Map(tags.map((tag) => [tag.id, tag]));
  const copies = new Set<FormatTag>();
  const open = tags.filter((tag) => tag.split !== undefined);

  for (let tag = open.pop(); tag; tag = open.pop()) {
    for (const { id } of linksOf(tag)) {
      const below = byId.get(id);

      if (below && below !== tag && !copies.has(below)) {
        copies.add(below);
        open.push(below);
      }
    }
  }

  return {
    copies,
    topSplits: tags.filter(
      (tag) => tag.split !== undefined && !copies.has(tag)
    ),
  };
};

export const splitHistoryOf = (
  marks: readonly AuthoredMark[]
): ReadonlySet<AuthoredMark> => {
  const history = new Set<AuthoredMark>();
  const formats = marks.filter(
    (mark): mark is FormatTag => mark.kind === 'format'
  );

  if (!formats.some((tag) => tag.split !== undefined)) return history;

  for (const onKey of Map.groupBy(formats, (tag) => tag.key).values()) {
    const { copies, topSplits } = historyOnKey(onKey);

    for (const tag of [...topSplits, ...copies]) history.add(tag);
  }

  return history;
};

const valueBelow = (
  tag: FormatTag,
  byId: ReadonlyMap<string, FormatTag>,
  landed: IsLanded
): LayerValue => {
  const steps = (tag.over ?? [])
    .map((step) => step.filter((link) => link.id !== tag.id))
    .filter((step) => step.length > 0);
  const stands = (link: FormatLink) => byId.has(link.id) || landed(link.id);
  const top = steps.at(-1);

  if (!top || top.every(stands)) {
    return absent(tag.before) ? undefined : tag.before;
  }
  for (const step of steps.toReversed()) {
    const [first] = step
      .filter(stands)
      .sort((left, right) => (left.id < right.id ? -1 : 1));

    if (first) return valueOf(first.write);
  }

  return valueOf(tag.base);
};

export const keySteps = (
  tags: readonly FormatTag[],
  landed: IsLanded
): readonly Step[] => {
  const count = tags.length;
  const positions = new Map<string, number>();
  const byId = new Map<string, FormatTag>();

  tags.forEach((tag, index) => {
    positions.set(tag.id, index);
    byId.set(tag.id, tag);
  });
  const writtenOver: number[][] = [];
  const writtenUnder: number[][] = tags.map(() => []);

  tags.forEach((tag, index) => {
    const below: number[] = [];

    for (const { id } of linksOf(tag)) {
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
      below: valueBelow(bottom, byId, landed),
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
    steps.push({
      below: valueBelow(tags[index], byId, landed),
      tags: [tags[index]],
    });
  }
  closeFork();

  return steps;
};

export const keyTips = (tags: readonly FormatTag[]): readonly string[] => {
  const present = new Set(tags.map((tag) => tag.id));
  const covered = new Set(
    tags.flatMap((tag) =>
      linksOf(tag).flatMap(({ id }) =>
        id !== tag.id && present.has(id) ? [id] : []
      )
    )
  );

  return tags.filter((tag) => !covered.has(tag.id)).map((tag) => tag.id);
};

export const tipsWrittenValue = (tags: readonly FormatTag[]): LayerValue => {
  const tipIds = new Set(keyTips(tags));
  const tips = tags.filter((tag) => tipIds.has(tag.id));
  if (tips.some((tag) => tag.write.kind === 'remove')) return undefined;
  return valueOf(smallestId(tips, tags).write);
};

type Status = 'accept' | 'keep' | 'reject' | 'replaced' | 'settled';

export const decideKey = (
  tags: readonly FormatTag[],
  reading: KeyReading,
  live: LayerValue
): KeyDecision => {
  const statusOf = new Map<FormatTag, Status>(
    tags.map((tag) => [
      tag,
      // An Editing commit lands with a record, so an Editing tag without one
      // was undone.
      isEditingChange(tag.change)
        ? reading.landed(tag.id)
          ? 'settled'
          : 'reject'
        : reading.accepted(tag)
          ? 'settled'
          : reading.outcome(tag),
    ])
  );
  const of = (tag: FormatTag) => getDefined(statusOf.get(tag));
  const stands = (tag: FormatTag) =>
    of(tag) === 'accept' || of(tag) === 'settled';
  const { copies, topSplits } = historyOnKey(tags);
  const inHistory = (tag: FormatTag) =>
    copies.has(tag) || topSplits.includes(tag);
  const splitRejected = topSplits.some((tag) => of(tag) === 'reject');
  // A rejected split's history reads as one until none of its tags is
  // pending, and every split's tag in it is what marks the copies under it
  // as history, so it stays stored whole until then.
  const keepsHistory =
    splitRejected && tags.some((tag) => inHistory(tag) && of(tag) === 'keep');
  // A copy the accepted split carried only stands for the first half's tag,
  // which decides there.
  const leaves = (tag: FormatTag) => copies.has(tag) && topSplits.some(stands);
  const byId = new Map(tags.map((tag) => [tag.id, tag]));
  const linkStays = ({ id }: FormatLink) => {
    const tag = byId.get(id);

    return tag ? of(tag) !== 'reject' : reading.landed(id);
  };
  // An undo of a standing tag reads the links under it, so the tag stays
  // stored while one of them neither stays nor landed. A split's tag links
  // only its copies, which leave with its accept without landing.
  const holds = (tag: FormatTag) =>
    tag.split === undefined &&
    stands(tag) &&
    linksOf(tag).some((link) => link.id !== tag.id && !linkStays(link));
  const decided = (
    stepsKept: readonly FormatTag[],
    value: KeyDecision['value'],
    goes: (tag: FormatTag) => boolean = leaves
  ): KeyDecision => {
    const held = [
      ...stepsKept,
      ...tags.filter((tag) => holds(tag) && !stepsKept.includes(tag)),
    ].filter((tag) => !goes(tag));
    const kept = keepsHistory
      ? [
          ...held,
          ...tags.filter((tag) => inHistory(tag) && !held.includes(tag)),
        ]
      : held;
    const keeps = new Set(kept);

    return {
      readsCopies: false,
      kept,
      landed: tags.filter(
        (tag) =>
          !keeps.has(tag) &&
          !leaves(tag) &&
          stands(tag) &&
          !isEditingChange(tag.change)
      ),
      value,
      waits: [],
    };
  };
  const kinds = new Set(statusOf.values());

  if (!kinds.has('keep') && !kinds.has('reject')) {
    return decided([], { kind: 'unchanged' });
  }
  if (kinds.size === 1 && kinds.has('keep')) {
    return decided(tags, { kind: 'unchanged' });
  }

  const steps = keySteps(tags, reading.landed);

  if (kinds.size === 1) {
    return {
      ...decided([], { kind: 'set', value: getDefined(steps[0]).below }),
      readsCopies: splitRejected,
    };
  }

  const waits = new Set<string>();
  const decides = (tag: FormatTag) =>
    of(tag) === 'accept' || of(tag) === 'reject';
  const statuses = steps.map((step): Status => {
    const pending = step.tags.filter((tag) => of(tag) === 'keep');

    if (pending.length > 0) {
      if (step.tags.some(decides)) {
        for (const tag of pending) waits.add(tag.change);
      }

      return 'keep';
    }
    if (!step.tags.some(decides)) return 'settled';
    if (step.tags.some((tag) => of(tag) === 'reject')) {
      return step.tags.some(stands) ? 'replaced' : 'reject';
    }

    return 'accept';
  });
  // The split's own tags and the copies under them follow the first half's
  // decisions, so no verdict waits across them.
  const free = steps.map((step) => step.tags.every(inHistory));
  const firstReject = statuses.findIndex(
    (status, index) =>
      !free[index] && (status === 'reject' || status === 'replaced')
  );
  const lastAccept = steps.findLastIndex(
    (step, index) =>
      !free[index] && step.tags.some((tag) => of(tag) === 'accept')
  );

  steps.forEach((step, index) => {
    if (statuses[index] !== 'keep' || free[index]) return;
    if ((firstReject !== -1 && index > firstReject) || index < lastAccept) {
      for (const tag of step.tags) {
        if (of(tag) === 'keep') waits.add(tag.change);
      }
    }
  });

  if (waits.size > 0) {
    return {
      readsCopies: false,
      kept: tags,
      landed: [],
      value: { kind: 'unchanged' },
      waits: [...waits],
    };
  }

  const splitPending = topSplits.some((tag) => of(tag) === 'keep');
  const awaitsSplit = (index: number) => splitPending && free[index];
  // Whether a rejected split's copies decide the key stays open while a write
  // of the second half's own is pending, so the split's tags and the standing
  // writes over them stay stored until then.
  const open =
    splitRejected &&
    statuses.some((status, index) => status === 'keep' && !free[index]);
  // A pending tag over a standing one reads it through its landed write, so
  // only a pending step under it keeps a standing tag stored.
  const kept = open
    ? steps.flatMap((step, index) =>
        free[index]
          ? step.tags
          : step.tags.filter((tag) => of(tag) !== 'reject')
      )
    : steps.flatMap((step, index) =>
        statuses[index] === 'keep' || awaitsSplit(index)
          ? step.tags
          : statuses.slice(0, index).includes('keep')
            ? step.tags.filter(stands)
            : []
      );
  const highest = statuses.findLastIndex((status) => status !== 'reject');
  const writeAt = (index: number) => {
    const step = getDefined(steps[index]);
    const standing = step.tags.filter(stands);
    const from = standing.length > 0 ? standing : step.tags;

    return valueOf(smallestId(from, from).write);
  };
  const above = steps[highest + 1];
  const own: KeyDecision['value'] =
    highest === -1
      ? { kind: 'set', value: getDefined(steps[0]).below }
      : statuses[highest] === 'replaced'
        ? { kind: 'set', value: writeAt(highest) }
        : above
          ? { kind: 'set', value: above.below }
          : { kind: 'unchanged' };

  // Rejecting a split reads what its copies read wherever the second half's
  // own writes over them leave only the split's output, and those writes go.
  if (
    splitRejected &&
    !open &&
    (highest === -1 ||
      free[highest] ||
      reading.output(
        getDefined(tags[0]).key,
        own.kind === 'set' ? own.value : live
      ))
  ) {
    const goes = (tag: FormatTag) =>
      leaves(tag) || (!inHistory(tag) && stands(tag));
    const below = tags.filter((tag) => copies.has(tag));
    const underHistoryTop = getDefined(steps[free.lastIndexOf(true)]).below;

    if (below.some((tag) => tag.split !== undefined)) {
      const earlierSplit = decideKey(below, reading, underHistoryTop);

      if (earlierSplit.waits.length === 0) {
        return {
          ...decided(
            earlierSplit.kept,
            {
              kind: 'set',
              value:
                earlierSplit.value.kind === 'set'
                  ? earlierSplit.value.value
                  : underHistoryTop,
            },
            goes
          ),
          readsCopies: true,
        };
      }
    }

    const copied = statuses.findLastIndex(
      (status, index) => free[index] && status !== 'reject'
    );

    return {
      ...decided(
        kept,
        {
          kind: 'set',
          value:
            copied === -1
              ? getDefined(steps[0]).below
              : statuses[copied] === 'replaced'
                ? writeAt(copied)
                : getDefined(steps[copied + 1]).below,
        },
        goes
      ),
      readsCopies: true,
    };
  }

  return decided(kept, own);
};

export const valueAfterLeaving = (
  tags: readonly FormatTag[],
  left: ReadonlySet<FormatTag>,
  reading: KeyReading,
  live: LayerValue
): KeyDecision['value'] | undefined => {
  const decision = decideKey(
    tags,
    {
      ...reading,
      outcome: (tag) => (left.has(tag) ? 'reject' : reading.outcome(tag)),
    },
    live
  );

  return decision.waits.length > 0 ? undefined : decision.value;
};

const acceptedValue = (
  live: LayerValue,
  tags: readonly FormatTag[],
  reading: ValueReading
): LayerValue => {
  const decision = decideKey(
    tags,
    { ...reading, outcome: () => 'reject' },
    live
  );

  return decision.value.kind === 'set' ? decision.value.value : live;
};

export const acceptedValues = (
  props: Readonly<Record<string, unknown>>,
  tags: readonly FormatTag[],
  reading: ValueReading
): Readonly<Record<string, LayerValue>> =>
  Object.fromEntries(
    [...Map.groupBy(tags, (tag) => tag.key)].map(([key, written]) => [
      key,
      acceptedValue(props[key] as LayerValue, written, reading),
    ])
  );

export type FormatWriter = Readonly<{
  at: number;
  author: string;
  change: string;
  inc?: string;
  isOwn: (tag: FormatTag) => boolean;
  commitWriteId: () => string;
}>;

const writeLayer = (
  input: Readonly<{
    key: string;
    next: LayerValue;
    ownInsertion: boolean;
    previous: LayerValue;
    source: 'command' | 'correction';
    standing: Standing;
    tags: readonly FormatTag[];
    writer: FormatWriter;
  }>
): readonly FormatTag[] => {
  const { tags, writer } = input;
  const editing = isEditingChange(writer.change);

  if (editing && (input.source === 'correction' || tags.length === 0)) {
    return tags;
  }

  const { copies, topSplits } = historyOnKey(tags);
  // A split's tags keep their place under later writes, even its own.
  const joinsRun = (tag: FormatTag) =>
    !copies.has(tag) &&
    !topSplits.includes(tag) &&
    (editing
      ? tag.change === writer.change
      : !input.standing.accepted(tag) && writer.isOwn(tag));
  const tag = (
    fields: Readonly<{
      base: FormatWrite | undefined;
      before: LayerValue;
      over: ReadonlyArray<readonly FormatLink[]>;
    }>
  ): FormatTag => ({
    at: writer.at,
    author: writer.author,
    ...(fields.over.length > 0
      ? { base: fields.base ?? { kind: 'remove' }, over: fields.over }
      : {}),
    ...(absent(fields.before) ? {} : { before: fields.before }),
    change: writer.change,
    id: writer.commitWriteId(),
    ...(writer.inc === undefined ? {} : { inc: writer.inc }),
    key: input.key,
    kind: 'format',
    write: writeOf(input.next),
  });
  const steps = keySteps(tags, input.standing.landed);
  const run: FormatTag[] = [];
  let runBelow: LayerValue;

  for (const step of [...steps].reverse()) {
    const [top] = step.tags;

    if (step.tags.length !== 1 || !top || !joinsRun(top)) break;
    run.push(top);
    runBelow = step.below;
  }
  const first = run.at(-1);

  if (first && !editing && sameValue(input.next, runBelow)) {
    return tags.filter((other) => !run.includes(other));
  }
  if (!editing && input.ownInsertion && tags.every(joinsRun)) return tags;
  if (first) {
    return [
      ...tags.filter((other) => !run.includes(other)),
      tag({ base: first.base, before: first.before, over: first.over ?? [] }),
    ];
  }

  const isTopSplit = (other: FormatTag) => topSplits.includes(other);
  const topSplitStep = Math.max(
    0,
    steps.findLastIndex((step) => step.tags.some(isTopSplit))
  );
  const topSplit = steps[topSplitStep]?.tags.find(isTopSplit);

  return [
    ...tags,
    tag({
      base: topSplit ? topSplit.write : writeOf(steps[0]?.below),
      before: input.previous,
      over: steps.slice(topSplitStep).map((step) => step.tags.map(linkOf)),
    }),
  ];
};

export const recordFormats = (
  input: Readonly<{
    keys: Iterable<string>;
    next: Readonly<Record<string, unknown>>;
    ownInsertion: boolean;
    previous: Readonly<Record<string, unknown>>;
    source: 'command' | 'correction';
    standing: Standing;
    tags: readonly FormatTag[];
    writer: FormatWriter;
  }>
): readonly FormatTag[] => {
  let { tags } = input;

  for (const key of input.keys) {
    const written = writeLayer({
      key,
      next: input.next[key] as LayerValue,
      ownInsertion: input.ownInsertion,
      previous: input.previous[key] as LayerValue,
      source: input.source,
      standing: input.standing,
      tags: tags.filter((tag) => tag.key === key),
      writer: input.writer,
    });

    tags = [...tags.filter((tag) => tag.key !== key), ...written];
  }

  return tags;
};
