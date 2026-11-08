import type { EditorStateSchemaApi } from '../..';
import {
  DocumentChange,
  type DocumentChangeJson,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { cloneFrozen, jsonEqual } from '../../core/change/json';
import { RootChange, type RootChangeJson } from '../../core/change/root-change';
import type { JsonNode } from '../../core/change/tokens';
import { lawCheckEnabled } from '../../internal/law-check';
import {
  alignLevel,
  classify,
  type DescribedPairs,
  describedPairsOf,
  type Footprint,
  type Sides,
  type Unit,
  unitsOf,
} from './comparison-align';
import {
  createComparisonIndex,
  type ComparisonDocumentIndex,
  type ComparisonIndexNode,
} from './comparison-index';
import {
  type ComparisonDocument,
  disjointSets,
  mergeGroups,
  stableStringify,
} from './comparison-internal';
import { movedWordTies } from './comparison-moves';
import type {
  ComparedChange,
  ComparisonEffect,
  TwoWayComparison,
} from './comparison-types';

type Range = Readonly<{ from: number; to: number }>;

/** Every token between two windows is equal. */
export type PlanWindow = Readonly<{
  addsOrRemoves: boolean;
  after: Range;
  before: Range;
  blocks: RootChangeJson;
  level: number;
  marks: boolean;
  /** Group ids in comparison order. Empty for a residual no group names. */
  owners: readonly string[];
  root: string | null;
  /** Sections covering exactly `before`, in before-root coordinates. */
  sections: RootChangeJson;
  structural: boolean;
  text: boolean;
}>;

type PlanLifecycle = Readonly<{
  kind: 'create' | 'delete';
  owners: readonly string[];
  root: string;
}>;

export type ComparisonForm = 'blocks' | 'sections';

export type ComparisonPlan = Readonly<{
  /** Every window selected, residuals included. */
  change: DocumentChange;
  changes: readonly ComparedChange[];
  lifecycle: readonly PlanLifecycle[];
  /** False when a residual window reads differently in text or marks. */
  partitioned: boolean;
  /** `ids` must be closed over `requiredChangeIds`. */
  select: (
    ids: ReadonlySet<string> | 'all',
    form?: ComparisonForm
  ) => DocumentChange;
  windows: readonly PlanWindow[];
}>;

/** The own groups of a recursed element pair, which explain unclaimed changes below it. */
type PairContext = Readonly<{
  runs: ReadonlySet<string>;
  text: ReadonlySet<string>;
}>;

type Reading = Readonly<{ marks: readonly string[]; text: string }>;

type WalkState = {
  readonly described: DescribedPairs;
  failures: string[];
  readonly groupOrder: ReadonlyMap<string, number>;
  readonly index: Sides<ComparisonDocumentIndex>;
  levels: number;
  partitioned: boolean;
  requirements: Array<readonly [string, readonly string[]]>;
  windows: PlanWindow[];
};

const RECURSIVE_KINDS = new Set<ComparisonEffect['kind']>([
  'node-type',
  'property',
  'structure',
  'text',
]);

const NO_MARKS = stableStringify({});

const PLANS = new WeakMap<DocumentChange, ComparisonPlan>();

const changesOwnProps = (effect: ComparisonEffect) =>
  effect.kind === 'node-type' ||
  (effect.kind === 'property' &&
    !jsonEqual(effect.beforeProperties[0], effect.afterProperties[0]));

const changesRuns = (effect: ComparisonEffect) =>
  effect.kind === 'property' &&
  !jsonEqual(effect.beforeProperties.slice(1), effect.afterProperties.slice(1));

const readingOf = (nodes: readonly ComparisonIndexNode[]): Reading => {
  let text = '';
  const marks: string[] = [];

  for (const node of nodes) {
    for (const segment of node.textSegments) {
      const key = stableStringify(segment.properties);
      const start = marks.length;

      text += segment.text;
      marks.length += segment.text.length;
      marks.fill(key, start);
    }
  }

  return { marks, text };
};

/** True when a kept character around the change changes marks, or a changed character carries one. */
const changesMarks = (before: Reading, after: Reading) => {
  const shorter = Math.min(before.text.length, after.text.length);
  let prefix = 0;

  while (prefix < shorter && before.text[prefix] === after.text[prefix]) {
    prefix += 1;
  }
  let suffix = 0;

  while (
    suffix < shorter - prefix &&
    before.text[before.text.length - 1 - suffix] ===
      after.text[after.text.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  for (let index = 0; index < prefix; index += 1) {
    if (before.marks[index] !== after.marks[index]) return true;
  }
  for (let index = 1; index <= suffix; index += 1) {
    if (before.marks.at(-index) !== after.marks.at(-index)) return true;
  }

  return [
    before.marks.slice(prefix, before.marks.length - suffix),
    after.marks.slice(prefix, after.marks.length - suffix),
  ].some((marks) => marks.some((mark) => mark !== NO_MARKS));
};

const ownersOf = (state: WalkState, ids: Iterable<string>): readonly string[] =>
  [...new Set(ids)].toSorted(
    (left, right) =>
      (state.groupOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
        (state.groupOrder.get(right) ?? Number.MAX_SAFE_INTEGER) ||
      left.localeCompare(right)
  );

const nodesOf = (units: readonly Unit[]) => units.flatMap(({ nodes }) => nodes);

const sectionsBetween = (
  before: readonly JsonNode[],
  after: readonly JsonNode[]
): RootChangeJson =>
  RootChange.between(
    DocumentIndex.fromValue(before),
    DocumentIndex.fromValue(after)
  ).toJSON();

const isTextBlock = (node: JsonNode) =>
  node.children?.some((child) => child.text !== undefined) ?? false;

const replaceAll = (
  length: number,
  after: readonly JsonNode[]
): RootChangeJson => {
  const replacement = sectionsBetween([], after)[0]?.replacement ?? [];

  return length === 0 && replacement.length === 0
    ? []
    : [{ length, replacement }];
};

const recordableSections = (
  before: readonly JsonNode[],
  after: readonly JsonNode[]
): Pick<PlanWindow, 'blocks' | 'sections'> => {
  const sections = sectionsBetween(before, after);
  const blocks = replaceAll(
    sections.reduce((sum, { length }) => sum + length, 0),
    after
  );
  const [first, ...rest] = before;
  const [next] = after;

  if (
    !first?.children ||
    !next?.children ||
    !sections[0]?.replacement?.length ||
    sections[0].length === 0
  ) {
    return { blocks, sections };
  }
  if (![...before, ...after].every(isTextBlock)) {
    return { blocks, sections: blocks };
  }
  const reprops = { ...next, children: first.children } as JsonNode;
  const [open] = sectionsBetween([first], [reprops]);
  const [kept, ...tail] = sectionsBetween([reprops, ...rest], after);

  if (
    open?.length !== 1 ||
    !open.properties ||
    !kept ||
    kept.replacement ||
    kept.properties
  ) {
    return { blocks, sections: blocks };
  }

  return {
    blocks,
    sections: [
      open,
      ...(kept.length > 1 ? [{ length: kept.length - 1 }] : []),
      ...tail,
    ],
  };
};

const pushWindow = (
  state: WalkState,
  window: Omit<PlanWindow, 'owners'> & { owners: Iterable<string> },
  reading?: Sides<Reading>
) => {
  const owners = ownersOf(state, window.owners);
  const length = window.sections.reduce(
    (sum, { length: size }) => sum + size,
    0
  );

  if (length !== window.before.to - window.before.from) {
    throw new Error('A comparison plan window does not cover its range.');
  }
  if (
    owners.length === 0 &&
    reading &&
    (reading.before.text !== reading.after.text ||
      changesMarks(reading.before, reading.after))
  ) {
    state.partitioned = false;
    state.failures.push(
      `a residual window at ${window.root ?? 'primary'}:${window.before.from} reads differently`
    );
  }
  state.windows.push(Object.freeze({ ...window, owners }));
};

const contentWindow = (
  state: WalkState,
  input: Readonly<{
    after: readonly Unit[];
    afterAt: number;
    before: readonly Unit[];
    beforeAt: number;
    effects: readonly ComparisonEffect[];
    level: number;
    owners: Iterable<string>;
    root: string | null;
  }>
) => {
  const beforeNodes = nodesOf(input.before);
  const afterNodes = nodesOf(input.after);
  const reading = {
    after: readingOf(afterNodes),
    before: readingOf(beforeNodes),
  };
  const addsOrRemoves = input.before.length !== input.after.length;

  pushWindow(
    state,
    {
      addsOrRemoves,
      after: {
        from: input.after[0]?.from ?? input.afterAt,
        to: input.after.at(-1)?.to ?? input.afterAt,
      },
      before: {
        from: input.before[0]?.from ?? input.beforeAt,
        to: input.before.at(-1)?.to ?? input.beforeAt,
      },
      level: input.level,
      marks: changesMarks(reading.before, reading.after),
      owners: input.owners,
      root: input.root,
      ...recordableSections(
        beforeNodes.map(({ node }) => node),
        afterNodes.map(({ node }) => node)
      ),
      structural:
        addsOrRemoves ||
        input.effects.some(
          ({ kind }) => kind === 'placement' || kind === 'wrapper'
        ),
      text: reading.before.text !== reading.after.text,
    },
    reading
  );
};

const unitsEqual = (before: Unit, after: Unit) =>
  before.nodes.length === after.nodes.length &&
  before.nodes.every(
    (node, index) => node.canonical === after.nodes[index]?.canonical
  );

/** The pair's own groups whose effects explain a change no footprint claims. */
const explain = (pair: PairContext | null, before: Unit, after: Unit) => {
  if (!pair) return [];
  const beforeReading = readingOf(before.nodes);
  const afterReading = readingOf(after.nodes);
  const text = beforeReading.text !== afterReading.text;
  const marks = changesMarks(beforeReading, afterReading);

  if (
    (!text && !marks) ||
    (text && pair.text.size === 0) ||
    (marks && pair.runs.size === 0)
  ) {
    return [];
  }

  return [...(text ? pair.text : []), ...(marks ? pair.runs : [])];
};

const truncate = (
  state: WalkState,
  mark: Readonly<[number, number, number]>
) => {
  state.windows.length = mark[0];
  state.requirements.length = mark[1];
  state.failures.length = mark[2];
};

const markOf = (state: WalkState): Readonly<[number, number, number]> => [
  state.windows.length,
  state.requirements.length,
  state.failures.length,
];

const elementPair = (
  state: WalkState,
  root: string | null,
  level: number,
  before: ComparisonIndexNode,
  after: ComparisonIndexNode,
  footprints: Sides<readonly Footprint[]>
) => {
  const isOwn = (footprint: Footprint, node: ComparisonIndexNode) =>
    footprint.from === node.from && footprint.to === node.to;
  const ownGroups = new Set([
    ...footprints.before
      .filter((footprint) => isOwn(footprint, before))
      .map(({ owner }) => owner),
    ...footprints.after
      .filter((footprint) => isOwn(footprint, after))
      .map(({ owner }) => owner),
  ]);
  const all = [...footprints.before, ...footprints.after];
  const ownEffects = [
    ...new Map(
      all
        .filter(({ owner }) => ownGroups.has(owner))
        .map(({ effect, owner }) => [effect.id, { effect, owner }])
    ).values(),
  ];
  const inner = {
    after: footprints.after.filter(({ owner }) => !ownGroups.has(owner)),
    before: footprints.before.filter(({ owner }) => !ownGroups.has(owner)),
  };
  const pairUnit = (node: ComparisonIndexNode): Unit => ({
    element: node,
    from: node.from,
    nodes: [node],
    to: node.to,
  });
  const whole = () =>
    contentWindow(state, {
      after: [pairUnit(after)],
      afterAt: after.from,
      before: [pairUnit(before)],
      beforeAt: before.from,
      effects: all.map(({ effect }) => effect),
      level,
      owners: all.map(({ owner }) => owner),
      root,
    });
  const recurse =
    ownEffects.every(({ effect }) => RECURSIVE_KINDS.has(effect.kind)) &&
    (inner.before.length + inner.after.length > 0 ||
      ownEffects.some(({ effect }) => changesOwnProps(effect)));

  if (!recurse) {
    whole();
    return;
  }
  const beforeUnits = unitsOf(state.index.before, before.childIndexes);
  const afterUnits = unitsOf(state.index.after, after.childIndexes);
  const textBlock = [before, after].some((node, side) =>
    node.childIndexes.some(
      (childIndex) =>
        (side === 0 ? state.index.before : state.index.after).nodes[childIndex]
          .kind === 'text'
    )
  );
  const mark = markOf(state);
  const fallback = (failure: string | null) => {
    truncate(state, mark);
    whole();
    if (failure) state.failures.push(failure);
  };

  if (textBlock && beforeUnits.length !== afterUnits.length) {
    whole();
    return;
  }
  if (!jsonEqual(before.properties, after.properties)) {
    const [open] = sectionsBetween(
      [before.node],
      [{ ...after.node, children: before.node.children } as JsonNode]
    );

    if (open?.length !== 1 || open.properties === undefined) {
      fallback(
        `the open token at ${root ?? 'primary'}:${before.from} is not one property section`
      );
      return;
    }
    pushWindow(state, {
      addsOrRemoves: false,
      after: { from: after.from, to: after.from + 1 },
      before: { from: before.from, to: before.from + 1 },
      blocks: [open],
      level,
      marks: false,
      owners: ownEffects
        .filter(({ effect }) => changesOwnProps(effect))
        .map(({ owner }) => owner),
      root,
      sections: [open],
      structural: false,
      text: false,
    });
  }
  const descendantsFrom = state.windows.length;
  const childLevel = state.levels;

  state.levels += 1;
  const tiled = walkLevel(
    state,
    root,
    childLevel,
    { after: afterUnits, before: beforeUnits },
    inner,
    { after: after.contentFrom, before: before.contentFrom },
    {
      runs: new Set(
        ownEffects
          .filter(({ effect }) => changesRuns(effect))
          .map(({ owner }) => owner)
      ),
      text: new Set(
        ownEffects
          .filter(({ effect }) => effect.kind === 'text')
          .map(({ owner }) => owner)
      ),
    }
  );

  if (!tiled) {
    fallback(
      textBlock
        ? null
        : `the children of ${root ?? 'primary'}:${before.from} do not tile`
    );
    return;
  }
  const descendants = state.windows.slice(descendantsFrom);
  const atLevel = descendants.filter((window) => window.level === childLevel);

  for (const { effect, owner } of ownEffects) {
    let targets: readonly PlanWindow[];

    if (changesRuns(effect)) {
      targets = descendants.filter(({ marks }) => marks);
    } else if (effect.kind === 'structure') {
      targets = atLevel.filter(({ structural }) => structural);
    } else if (effect.kind === 'text') {
      targets = descendants.filter(({ text }) => text);
    } else {
      continue;
    }
    if (targets.length === 0) {
      targets = atLevel.filter(({ addsOrRemoves }) => addsOrRemoves);
    }
    if (targets.length === 0) targets = descendants;
    state.requirements.push([
      owner,
      targets.flatMap(({ owners }) => owners).filter((id) => id !== owner),
    ]);
  }
};

const pairUnits = (
  state: WalkState,
  root: string | null,
  level: number,
  before: Unit,
  after: Unit,
  footprints: Sides<readonly Footprint[]>,
  pair: PairContext | null
) => {
  if (footprints.before.length + footprints.after.length === 0) {
    if (unitsEqual(before, after)) return;
    contentWindow(state, {
      after: [after],
      afterAt: after.from,
      before: [before],
      beforeAt: before.from,
      effects: [],
      level,
      owners: explain(pair, before, after),
      root,
    });
    return;
  }
  if (before.element && after.element) {
    elementPair(state, root, level, before.element, after.element, footprints);
    return;
  }
  contentWindow(state, {
    after: [after],
    afterAt: after.from,
    before: [before],
    beforeAt: before.from,
    effects: [...footprints.before, ...footprints.after].map(
      ({ effect }) => effect
    ),
    level,
    owners: [...footprints.before, ...footprints.after].map(
      ({ owner }) => owner
    ),
    root,
  });
};

const walkLevel = (
  state: WalkState,
  root: string | null,
  level: number,
  units: Sides<readonly Unit[]>,
  footprints: Sides<readonly Footprint[]>,
  at: Sides<number>,
  pair: PairContext | null
): boolean => {
  const before = classify(units.before, footprints.before);
  const after = classify(units.after, footprints.after);

  if (!before || !after) return false;
  const steps = alignLevel({
    classified: { after, before },
    described: state.described,
    root,
    units,
  });

  if (!steps) return false;
  const position = (side: 'after' | 'before', cursor: number) =>
    units[side][cursor]?.from ?? units[side].at(-1)?.to ?? at[side];
  let beforeCursor = 0;
  let afterCursor = 0;

  for (const step of steps) {
    if (step.kind === 'anchor') {
      const { anchor } = step;

      pairUnits(
        state,
        root,
        level,
        units.before[anchor.before],
        units.after[anchor.after],
        anchor.ranges
          ? {
              after: anchor.ranges.after.footprints,
              before: anchor.ranges.before.footprints,
            }
          : {
              after: after.inside.get(anchor.after) ?? [],
              before: before.inside.get(anchor.before) ?? [],
            },
        pair
      );
      beforeCursor = anchor.before + 1;
      afterCursor = anchor.after + 1;
      continue;
    }
    const beforeUnits = step.before
      ? units.before.slice(step.before.start, step.before.end + 1)
      : [];
    const afterUnits = step.after
      ? units.after.slice(step.after.start, step.after.end + 1)
      : [];
    const [onlyBefore] = beforeUnits;
    const [onlyAfter] = afterUnits;
    const found = [...step.footprints.before, ...step.footprints.after];

    if (
      beforeUnits.length === 1 &&
      afterUnits.length === 1 &&
      onlyBefore?.element &&
      onlyAfter?.element
    ) {
      elementPair(
        state,
        root,
        level,
        onlyBefore.element,
        onlyAfter.element,
        step.footprints
      );
    } else {
      contentWindow(state, {
        after: afterUnits,
        afterAt: position('after', afterCursor),
        before: beforeUnits,
        beforeAt: position('before', beforeCursor),
        effects: found.map(({ effect }) => effect),
        level,
        owners: found.map(({ owner }) => owner),
        root,
      });
    }
    if (step.before) beforeCursor = step.before.end + 1;
    if (step.after) afterCursor = step.after.end + 1;
  }

  return true;
};

const rootChildren = (document: ComparisonDocument, root: string | null) =>
  (root === null
    ? document.children
    : (document.roots?.[root] ?? [])) as readonly JsonNode[];

type PlanInput = Readonly<{
  after: ComparisonDocument;
  afterIndex: ComparisonDocumentIndex;
  before: ComparisonDocument;
  beforeIndex: ComparisonDocumentIndex;
  groups: readonly ComparedChange[];
}>;

const walkPlan = (input: PlanInput): ComparisonPlan => {
  const { after, afterIndex, before, beforeIndex, groups } = input;
  const state: WalkState = {
    described: describedPairsOf(groups),
    failures: [],
    groupOrder: new Map(groups.map(({ id }, index) => [id, index])),
    index: { after: afterIndex, before: beforeIndex },
    levels: 0,
    partitioned: true,
    requirements: [],
    windows: [],
  };
  const footprints = {
    after: new Map<string | null, Footprint[]>(),
    before: new Map<string | null, Footprint[]>(),
  };

  for (const group of groups) {
    for (const effect of group.effects) {
      for (const side of ['before', 'after'] as const) {
        for (const span of effect[side]) {
          const list = footprints[side].get(span.root) ?? [];

          list.push({ effect, from: span.from, owner: group.id, to: span.to });
          footprints[side].set(span.root, list);
        }
      }
    }
  }
  const beforeRoots = Object.keys(before.roots ?? {});
  const afterRoots = Object.keys(after.roots ?? {});
  const roots = [
    null,
    ...[...new Set([...beforeRoots, ...afterRoots])].toSorted(),
  ];
  const lifecycle: PlanLifecycle[] = [];

  for (const root of roots) {
    const inBefore = root === null || Object.hasOwn(before.roots ?? {}, root);
    const inAfter = root === null || Object.hasOwn(after.roots ?? {}, root);
    const found = {
      after: footprints.after.get(root) ?? [],
      before: footprints.before.get(root) ?? [],
    };
    const everyOwner = [...found.before, ...found.after].map(
      ({ owner }) => owner
    );
    const wholeRoot = () => {
      const beforeLength = beforeIndex.roots.get(root)?.length ?? 0;
      const afterLength = afterIndex.roots.get(root)?.length ?? 0;
      const afterChildren = inAfter ? rootChildren(after, root) : [];

      pushWindow(state, {
        addsOrRemoves: true,
        after: { from: 0, to: inAfter ? afterLength : 0 },
        before: { from: 0, to: inBefore ? beforeLength : 0 },
        blocks: replaceAll(inBefore ? beforeLength : 0, afterChildren),
        level: -1,
        marks: true,
        owners: everyOwner,
        root,
        sections: sectionsBetween(
          inBefore ? rootChildren(before, root) : [],
          afterChildren
        ),
        structural: true,
        text: true,
      });
    };

    if (root !== null && inBefore !== inAfter) {
      wholeRoot();
      lifecycle.push({
        kind: inAfter ? 'create' : 'delete',
        owners: ownersOf(state, everyOwner),
        root,
      });
      continue;
    }
    const mark = markOf(state);
    const level = state.levels;

    state.levels += 1;
    if (
      !walkLevel(
        state,
        root,
        level,
        {
          after: unitsOf(
            afterIndex,
            afterIndex.roots.get(root)?.topLevelIndexes ?? []
          ),
          before: unitsOf(
            beforeIndex,
            beforeIndex.roots.get(root)?.topLevelIndexes ?? []
          ),
        },
        found,
        { after: 0, before: 0 },
        null
      )
    ) {
      truncate(state, mark);
      wholeRoot();
      state.failures.push(
        `the top level of ${root ?? 'primary'} does not tile`
      );
    }
  }

  const required = new Map(
    groups.map(({ id, requiredChangeIds }) => [id, new Set(requiredChangeIds)])
  );
  const owning = new Set<string>();
  const requiring = new Set<string>();

  for (const { owners } of [...state.windows, ...lifecycle]) {
    const [hub, ...others] = owners;

    for (const owner of owners) owning.add(owner);
    for (const other of others) {
      required.get(hub)?.add(other);
      required.get(other)?.add(hub);
    }
  }
  for (const [owner, ids] of state.requirements) {
    if (ids.length > 0) requiring.add(owner);
    for (const id of ids) required.get(owner)?.add(id);
  }
  for (const { id } of groups) {
    if (!owning.has(id) && !requiring.has(id)) {
      state.failures.push(`group ${id} owns no window and requires none`);
    }
  }
  if (lawCheckEnabled() && state.failures.length > 0) {
    throw new Error(
      `Comparison plan invariant failed: ${state.failures.join('; ')}.`
    );
  }

  const windows = Object.freeze(state.windows);
  const select = (
    ids: ReadonlySet<string> | 'all',
    form: ComparisonForm = 'sections'
  ) => {
    const keep = (owners: readonly string[]) =>
      ids === 'all' || (owners.length > 0 && owners.every((id) => ids.has(id)));
    const rootJson = (root: string | null): RootChangeJson | undefined => {
      const kept = windows.filter(
        (window) => window.root === root && keep(window.owners)
      );

      if (kept.length === 0) return undefined;
      const length = beforeIndex.roots.get(root)?.length ?? 0;
      const sections: Array<RootChangeJson[number]> = [];
      let cursor = 0;

      for (const window of kept) {
        if (window.before.from < cursor) {
          throw new Error('Comparison plan windows overlap.');
        }
        if (window.before.from > cursor) {
          sections.push({ length: window.before.from - cursor });
        }
        sections.push(...window[form]);
        cursor = window.before.to;
      }
      if (length > cursor) sections.push({ length: length - cursor });

      return sections;
    };
    const primary = rootJson(null);
    const named = roots.flatMap((root) => {
      const json = root === null ? undefined : rootJson(root);

      return root !== null && json ? [[root, json] as const] : [];
    });
    const flags = (kind: PlanLifecycle['kind']) =>
      lifecycle
        .filter((flag) => flag.kind === kind && keep(flag.owners))
        .map(({ root }) => root);
    const createRoots = flags('create');
    const deleteRoots = flags('delete');
    const json: DocumentChangeJson = {
      ...(createRoots.length > 0 ? { createRoots } : {}),
      ...(deleteRoots.length > 0 ? { deleteRoots } : {}),
      ...(primary ? { primary } : {}),
      ...(named.length > 0 ? { roots: Object.fromEntries(named) } : {}),
      version: 3,
    };

    return DocumentChange.fromJSON(json);
  };
  const change = select('all');
  const plan: ComparisonPlan = Object.freeze({
    change,
    changes: cloneFrozen(
      groups.map((group) => ({
        ...group,
        requiredChangeIds: ownersOf(
          state,
          [...(required.get(group.id) ?? [])].filter((id) => id !== group.id)
        ),
      }))
    ),
    lifecycle: Object.freeze(lifecycle),
    partitioned: state.partitioned,
    select,
    windows,
  });

  return plan;
};

const mergeTied = (
  groups: readonly ComparedChange[],
  ties: ReadonlyArray<readonly string[]>
) => {
  const indexOf = new Map(groups.map(({ id }, index) => [id, index]));
  const { find, join } = disjointSets(groups.length);

  for (const owners of ties) {
    const [first, ...rest] = owners.flatMap((id) => {
      const at = indexOf.get(id);

      return at === undefined ? [] : [at];
    });

    for (const member of rest) join(first, member);
  }
  const sets = new Map<number, number[]>();

  groups.forEach((_group, index) => {
    const root = find(index);
    const set = sets.get(root);

    if (set) set.push(index);
    else sets.set(root, [index]);
  });

  return mergeGroups(
    groups,
    [...sets.values()]
      .filter((members) => members.length > 1)
      .map((members) => ({ members, owner: members[0] }))
  );
};

export const planComparison = (input: PlanInput): ComparisonPlan => {
  let { groups } = input;

  for (;;) {
    const plan = walkPlan({ ...input, groups });
    const ties = movedWordTies(
      plan.windows,
      plan.changes,
      input.beforeIndex,
      input.afterIndex
    );

    if (ties.length === 0) {
      PLANS.set(plan.change, plan);

      return plan;
    }
    groups = mergeTied(groups, ties);
  }
};

const sameChanges = (
  plan: ComparisonPlan,
  changes: readonly ComparedChange[]
) => plan.changes === changes || jsonEqual(plan.changes, changes);

export const comparisonPlanOf = (
  comparison: TwoWayComparison,
  schema: EditorStateSchemaApi
): ComparisonPlan | null => {
  const cached = PLANS.get(comparison.change);

  if (cached && sameChanges(cached, comparison.changes)) return cached;
  try {
    const afterIndex = createComparisonIndex(comparison.after.document, schema);
    const beforeIndex = createComparisonIndex(
      comparison.before.document,
      schema
    );
    const plan = planComparison({
      after: comparison.after.document,
      afterIndex,
      before: comparison.before.document,
      beforeIndex,
      groups: comparison.changes,
    });

    if (
      !jsonEqual(plan.change.toJSON(), comparison.change.toJSON()) ||
      !sameChanges(plan, comparison.changes)
    ) {
      return null;
    }
    PLANS.set(comparison.change, plan);

    return plan;
  } catch {
    return null;
  }
};

/** `ids` and every group they require, transitively. */
export const closeOverRequired = (
  groups: readonly ComparedChange[],
  ids: Iterable<string>
): ReadonlySet<string> => {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const closed = new Set(ids);

  for (const id of closed) {
    for (const required of byId.get(id)?.requiredChangeIds ?? []) {
      closed.add(required);
    }
  }

  return closed;
};
