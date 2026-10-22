import type { NamedRootKey, RootKey } from '../interfaces';
import { failInvariant } from '../internal/fail-invariant';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
} from './change/document-change';
import { DocumentIndex, rootIndexOf } from './change/document-index';
import { RootChange } from './change/root-change';
import type { JsonNode } from './change/tokens';
import {
  type ElementOwnedRootIndex,
  ensureElementOwnedRootIndex,
  getElementOwnedRootGrammarBindings,
  getElementOwnedRootOwnerCounts,
  rebaseElementOwnedRootIndex,
} from './element-owned-root-index';
import { persistentMapChanges } from './persistent-map';
import type { CompiledEditorSchema } from './schema-compiler';
import { countCoreWork, readCoreWork, restoreCoreWork } from './work';

/** @internal */
export type OwnershipSides = Readonly<{
  after: ElementOwnedRootIndex | null;
  before: ElementOwnedRootIndex | null;
}>;

const ownerChanges = ({ after, before }: OwnershipSides) =>
  persistentMapChanges(before?.childRoots ?? null, after?.childRoots ?? null);

const ownersOf = (index: ElementOwnedRootIndex | null, childRoot: string) => {
  let count = 0;
  let exclusive = false;

  if (!index) return { count, exclusive };
  for (const binding of getElementOwnedRootGrammarBindings(index, childRoot)) {
    count += binding.count;
    exclusive ||= binding.ownership === 'exclusive';
  }

  return { count, exclusive };
};

const countOwners = (
  roots: Iterable<RootKey>,
  sidesOf: (root: RootKey) => OwnershipSides | undefined,
  childRoot: string
) => {
  let after = 0;
  let before = 0;
  let exclusiveAfter = false;
  let exclusiveBefore = false;
  let sharedAfter = false;
  let sharedBefore = false;

  for (const root of roots) {
    const sides = sidesOf(root);
    const was = ownersOf(sides?.before ?? null, childRoot);
    const is = ownersOf(sides?.after ?? null, childRoot);

    before += was.count;
    after += is.count;
    exclusiveBefore ||= was.exclusive;
    exclusiveAfter ||= is.exclusive;
    sharedBefore ||= was.count > 0 && !was.exclusive;
    sharedAfter ||= is.count > 0 && !is.exclusive;
  }

  return {
    after,
    before,
    exclusive: exclusiveBefore || exclusiveAfter,
    switchesOwnership:
      (exclusiveBefore && sharedAfter) || (sharedBefore && exclusiveAfter),
  };
};

const addOwner = (
  into: Map<string, Set<RootKey>>,
  childRoot: string,
  root: RootKey
) => {
  let roots = into.get(childRoot);

  if (!roots) {
    roots = new Set();
    into.set(childRoot, roots);
  }
  roots.add(root);
};

const sameRoots = (left: ReadonlySet<string>, right: ReadonlySet<string>) =>
  left.size === right.size && [...left].every((root) => right.has(root));

const judgeOwnedRoots = ({
  before,
  closed,
  exists,
  sweep,
  touched,
  tracked,
}: Readonly<{
  before: (root: RootKey) => ElementOwnedRootIndex | null;
  closed: boolean;
  exists: (root: RootKey) => boolean;
  sweep: () => Iterable<readonly [RootKey, ElementOwnedRootIndex]>;
  touched: ReadonlyMap<RootKey, OwnershipSides>;
  tracked: ReadonlySet<string>;
}>): ReadonlySet<NamedRootKey> => {
  const sides = new Map<RootKey, OwnershipSides>();
  const changedIn = new Map<string, Set<RootKey>>();
  const pending = new Set(tracked);
  const dropped = new Set<NamedRootKey>();
  let totals: Map<string, number> | undefined;

  const setSides = (root: RootKey, next: OwnershipSides) => {
    const previous = sides.get(root);

    if (previous) {
      for (const childRoot of ownerChanges(previous)) {
        changedIn.get(childRoot)?.delete(root);
        pending.add(childRoot);
      }
    }
    sides.set(root, next);
    for (const childRoot of ownerChanges(next)) {
      addOwner(changedIn, childRoot, root);
      pending.add(childRoot);
    }
  };

  const totalOwners = (childRoot: string) => {
    if (!totals) {
      totals = new Map();
      for (const [root, index] of sweep()) {
        if (dropped.has(root)) continue;
        for (const [owned, count] of getElementOwnedRootOwnerCounts(index)) {
          totals.set(owned, (totals.get(owned) ?? 0) + count);
        }
      }
    }

    return totals.get(childRoot) ?? 0;
  };

  const orphaned = (childRoot: NamedRootKey) => {
    countCoreWork('ownedRootsJudged');
    const {
      after: ownersAfter,
      before: ownersBefore,
      exclusive,
    } = countOwners(
      changedIn.get(childRoot) ?? [],
      (root) => sides.get(root),
      childRoot
    );

    if (tracked.has(childRoot)) return ownersAfter === 0;
    if (ownersBefore === 0) return false;
    if (exclusive) return ownersAfter === 0;

    return closed && totalOwners(childRoot) === 0;
  };

  for (const [root, rootSides] of touched) setSides(root, rootSides);
  while (pending.size > 0) {
    const childRoot = pending.values().next().value as string;

    pending.delete(childRoot);
    if (
      childRoot === 'main' ||
      dropped.has(childRoot) ||
      !exists(childRoot) ||
      !orphaned(childRoot)
    ) {
      continue;
    }
    const untouched = sides.has(childRoot) ? null : before(childRoot);
    const { after, before: indexBefore } = sides.get(childRoot) ?? {
      after: untouched,
      before: untouched,
    };

    dropped.add(childRoot);
    if (totals && after) {
      for (const [owned, count] of getElementOwnedRootOwnerCounts(after)) {
        totals.set(owned, (totals.get(owned) ?? 0) - count);
      }
    }
    setSides(childRoot, { after: null, before: indexBefore });
  }

  return dropped;
};

/** @internal */
export const judgeProjectedRoots = (
  input: ProjectedRootsInput
): ReadonlySet<NamedRootKey> => {
  const judged = updateProjectedRoots(input);

  if (ownershipLawCheck()) {
    const work = readCoreWork();
    const swept = input.full();

    restoreCoreWork(work);
    if (!sameRoots(swept, judged)) {
      failInvariant(
        `Projected orphans ${JSON.stringify([...judged].sort())} differ from a full judgment ${JSON.stringify([...swept].sort())}.`
      );
    }
  }

  return judged;
};

type ProjectedRootsInput = Readonly<{
  closed: boolean;
  created: ReadonlySet<RootKey>;
  exists: (root: RootKey) => boolean;
  full: () => ReadonlySet<NamedRootKey>;
  last: ReadonlySet<NamedRootKey>;
  projected: ReadonlyMap<RootKey, OwnershipSides>;
  projectedOf: (root: RootKey) => ElementOwnedRootIndex | null;
  stored: ReadonlyMap<RootKey, OwnershipSides>;
}>;

const updateProjectedRoots = ({
  closed,
  created,
  exists,
  full,
  last,
  projected,
  projectedOf,
  stored,
}: ProjectedRootsInput): ReadonlySet<NamedRootKey> => {
  const dropped = new Set([...last].filter(exists));
  const storedIn = new Map<string, Set<RootKey>>();
  const projectedIn = new Map<string, Set<RootKey>>();
  const sides = new Map<RootKey, OwnershipSides>();
  const pending = new Set<string>(created);
  const note = (
    into: Map<string, Set<RootKey>>,
    root: RootKey,
    of: OwnershipSides
  ) => {
    for (const childRoot of ownerChanges(of)) {
      addOwner(into, childRoot, root);
      pending.add(childRoot);
    }
  };
  const setProjected = (
    root: RootKey,
    before: ElementOwnedRootIndex | null
  ) => {
    const previous = sides.get(root);
    const next = {
      after: dropped.has(root)
        ? null
        : (projected.get(root)?.after ?? projectedOf(root)),
      before: last.has(root) ? null : before,
    };

    if (previous) {
      for (const childRoot of ownerChanges(previous)) {
        projectedIn.get(childRoot)?.delete(root);
        pending.add(childRoot);
      }
    }
    sides.set(root, next);
    note(projectedIn, root, next);
  };
  const beforeOf = (root: RootKey) => {
    const known = projected.get(root);

    return known ? known.before : projectedOf(root);
  };

  const revived = new Set<RootKey>();
  const revive = (root: RootKey) => {
    if (!dropped.has(root) || revived.has(root)) return;
    dropped.delete(root);
    revived.add(root);
    pending.add(root);
    for (const childRoot of ownerChanges({
      after: projected.get(root)?.after ?? projectedOf(root),
      before: null,
    })) {
      revive(childRoot);
    }
  };

  for (const root of [...projected.keys(), ...stored.keys()]) revive(root);
  for (const [root, of] of stored) note(storedIn, root, of);
  for (const root of new Set([...projected.keys(), ...revived])) {
    setProjected(root, beforeOf(root));
  }
  const ownersLastImplies = (childRoot: string, heldBefore: boolean) =>
    last.has(childRoot)
      ? { projected: 0, stored: 1 }
      : heldBefore && !created.has(childRoot)
        ? { projected: 1, stored: 1 }
        : { projected: 0, stored: 0 };

  while (pending.size > 0) {
    const childRoot = pending.values().next().value as string;

    pending.delete(childRoot);
    if (childRoot === 'main' || !exists(childRoot)) continue;
    countCoreWork('ownedRootsJudged');
    const inStored = countOwners(
      storedIn.get(childRoot) ?? [],
      (root) => stored.get(root),
      childRoot
    );
    const inProjected = countOwners(
      projectedIn.get(childRoot) ?? [],
      (root) => sides.get(root),
      childRoot
    );

    const noOwnerChanged =
      inStored.before +
        inStored.after +
        inProjected.before +
        inProjected.after ===
      0;

    if (noOwnerChanged) {
      if (revived.has(childRoot) && !dropped.has(childRoot)) {
        dropped.add(childRoot);
        setProjected(childRoot, beforeOf(childRoot));
      }
      continue;
    }
    if (inStored.switchesOwnership || inProjected.switchesOwnership) {
      return full();
    }
    if (!inStored.exclusive && !inProjected.exclusive) {
      if (closed) return full();
      continue;
    }
    const was = ownersLastImplies(
      childRoot,
      inStored.before + inProjected.before > 0
    );
    const storedOwners =
      (inStored.before > 0 ? 0 : was.stored) + inStored.after;
    const projectedOwners =
      (inProjected.before > 0 ? 0 : was.projected) + inProjected.after;
    const orphaned = storedOwners > 0 && projectedOwners === 0;

    if (orphaned === dropped.has(childRoot)) continue;
    if (orphaned) dropped.add(childRoot);
    else dropped.delete(childRoot);
    setProjected(childRoot, beforeOf(childRoot));
  }

  return dropped;
};

const sweepOrphanedRoots = ({
  after,
  before,
  closed,
  tracked,
}: Readonly<{
  after: ReadonlyMap<RootKey, ElementOwnedRootIndex>;
  before: ReadonlyMap<RootKey, ElementOwnedRootIndex>;
  closed: boolean;
  tracked: ReadonlySet<string>;
}>): ReadonlySet<NamedRootKey> => {
  const ownedBefore = new Set<string>();

  for (const index of before.values()) {
    for (const [childRoot] of getElementOwnedRootOwnerCounts(index)) {
      if (closed || ownersOf(index, childRoot).exclusive) {
        ownedBefore.add(childRoot);
      }
    }
  }
  const dropped = new Set<NamedRootKey>();
  let changed = true;

  while (changed) {
    const ownedAfter = new Set<string>();

    changed = false;
    for (const [root, index] of after) {
      if (dropped.has(root)) continue;
      for (const [childRoot, count] of getElementOwnedRootOwnerCounts(index)) {
        if (count > 0) ownedAfter.add(childRoot);
      }
    }
    for (const root of after.keys()) {
      if (
        root !== 'main' &&
        !dropped.has(root) &&
        !ownedAfter.has(root) &&
        (tracked.has(root) || ownedBefore.has(root))
      ) {
        dropped.add(root);
        changed = true;
      }
    }
  }

  return dropped;
};

const ownershipLawCheck = () => {
  const env = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env;

  return env?.NODE_ENV === 'test' && env.PLITE_LAW_CHECK !== '0';
};

const HAS_CONTENT_ROOTS = new WeakMap<CompiledEditorSchema, boolean>();

/** @internal */
export const schemaHasContentRoots = (schema: CompiledEditorSchema) => {
  let has = HAS_CONTENT_ROOTS.get(schema);

  if (has === undefined) {
    has = [...schema.elements.byType.values()].some(
      (element) => element.contentRoots.size > 0
    );
    HAS_CONTENT_ROOTS.set(schema, has);
  }

  return has;
};

/** @internal */
export const changedRootsOf = (change: DocumentChange) => {
  const moved = new Map<RootKey, RootChange | undefined>(
    getInternalDocumentChangeEntries(change)
  );

  for (const root of [...change.createRoots, ...change.deleteRoots]) {
    if (!moved.has(root)) {
      moved.set(root, getInternalDocumentRootChange(change, root));
    }
  }

  return moved;
};

/** @internal */
export type OrphanedRootsInput = Readonly<{
  after: (root: RootKey) => DocumentIndex | null;
  afterRoots: () => readonly RootKey[];
  before: (root: RootKey) => DocumentIndex | null;
  beforeRoots: () => readonly RootKey[];
  changedRoots: ReadonlyMap<RootKey, RootChange | undefined>;
  tracked: ReadonlySet<string>;
}>;

/** @internal */
export const emptyIndexedDocument = () =>
  DocumentIndex.fromValue(Object.freeze([]));

/** @internal */
export const orphanedRoots = (
  schema: CompiledEditorSchema,
  {
    after,
    afterRoots,
    before,
    beforeRoots,
    changedRoots,
    tracked,
  }: OrphanedRootsInput
): readonly NamedRootKey[] => {
  if (!schemaHasContentRoots(schema)) return Object.freeze([]);

  const indexOf = (root: RootKey, document: DocumentIndex | null) => {
    if (!document) return null;
    countCoreWork('ownerIndexReads');

    return ensureElementOwnedRootIndex(schema, root, document);
  };
  const touched = new Map<RootKey, OwnershipSides>();

  for (const [root, change] of changedRoots) {
    const beforeDocument = before(root);
    const afterDocument = after(root);
    const beforeIndex = indexOf(root, beforeDocument);
    let afterIndex: ElementOwnedRootIndex | null = null;

    if (afterDocument && change) {
      countCoreWork('ownerIndexReads');
      afterIndex = rebaseElementOwnedRootIndex(
        schema,
        root,
        change,
        beforeDocument ?? emptyIndexedDocument(),
        afterDocument
      );
    } else {
      afterIndex = indexOf(root, afterDocument);
    }
    touched.set(root, { after: afterIndex, before: beforeIndex });
  }
  const afterIndexOf = (root: RootKey) => {
    const sides = touched.get(root);

    return sides ? sides.after : indexOf(root, after(root));
  };
  const closed = schema.unknown === 'reject';
  const judged = judgeOwnedRoots({
    before: (root) => indexOf(root, before(root)),
    closed,
    exists: (root) => after(root) !== null,
    *sweep() {
      for (const root of afterRoots()) {
        const index = afterIndexOf(root);

        if (index) yield [root, index] as const;
      }
    },
    touched,
    tracked,
  });

  if (ownershipLawCheck()) {
    const work = readCoreWork();
    const indexes = (
      roots: readonly RootKey[],
      read: (root: RootKey) => ElementOwnedRootIndex | null
    ) =>
      new Map(
        roots.flatMap((root) => {
          const index = read(root);

          return index ? [[root, index] as const] : [];
        })
      );
    const swept = sweepOrphanedRoots({
      after: indexes(afterRoots(), afterIndexOf),
      before: indexes(beforeRoots(), (root) => indexOf(root, before(root))),
      closed,
      tracked,
    });

    restoreCoreWork(work);
    if (!sameRoots(swept, judged)) {
      failInvariant(
        `Orphaned roots ${JSON.stringify([...judged].sort())} differ from a full count ${JSON.stringify([...swept].sort())}.`
      );
    }
  }

  return Object.freeze([...judged].sort());
};

type RootsOf = Readonly<{
  children: readonly JsonNode[];
  roots?: Readonly<Record<string, readonly JsonNode[]>>;
}>;

/** @internal */
export const orphanedValueRoots = (
  schema: CompiledEditorSchema,
  before: RootsOf,
  after: RootsOf,
  changedRoots: ReadonlyMap<RootKey, RootChange | undefined>,
  tracked: ReadonlySet<string> = new Set()
) => {
  const side = (value: RootsOf) => ({
    read: (root: RootKey) => {
      if (root === 'main') return rootIndexOf(value, 'children');

      const roots = value.roots ?? {};

      return Object.hasOwn(roots, root) ? rootIndexOf(roots, root) : null;
    },
    roots: () => ['main', ...Object.keys(value.roots ?? {})],
  });
  const from = side(before);
  const to = side(after);
  const changes = new Map<RootKey, RootChange | undefined>();
  const same = new Set<RootKey>();

  for (const [root, change] of changedRoots) {
    const beforeDocument = from.read(root);
    const afterDocument = to.read(root);

    if (change || !beforeDocument || !afterDocument) {
      changes.set(root, change);
      continue;
    }
    const diff = RootChange.between(beforeDocument, afterDocument, {
      root: root === 'main' ? null : root,
    });

    if (diff.empty) same.add(root);
    else changes.set(root, diff);
  }

  return orphanedRoots(schema, {
    after: (root) => (same.has(root) ? from.read(root) : to.read(root)),
    afterRoots: to.roots,
    before: from.read,
    beforeRoots: from.roots,
    changedRoots: changes,
    tracked,
  });
};

/** @internal */
export const rootsDeletedByName = (
  schema: CompiledEditorSchema,
  before: RootsOf,
  after: RootsOf,
  changedRoots: ReadonlyMap<RootKey, RootChange | undefined>,
  deleted: ReadonlySet<NamedRootKey>
) => {
  const restored = {
    children: after.children,
    roots: {
      ...after.roots,
      ...Object.fromEntries(
        [...deleted].flatMap((root) => {
          const children = before.roots?.[root];

          return children ? [[root, children] as const] : [];
        })
      ),
    },
  };
  const orphaned = new Set(
    orphanedValueRoots(
      schema,
      before,
      restored,
      new Map([...changedRoots].filter(([root]) => !deleted.has(root)))
    )
  );

  return [...deleted].filter((root) => !orphaned.has(root));
};
