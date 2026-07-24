import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  valueRoot,
} from './document-change';
import { DocumentIndex } from './document-index';
import type { RootChange } from './root-change';
import {
  type JsonEditorValue,
  jsonEqual,
  type JsonNode,
  type JsonRecord,
  pathKey,
} from './tokens';

export type DocumentChangeRelocation = Readonly<{
  path: readonly number[];
  /** `null` addresses the implicit primary root. */
  root: string | null;
  targetPath: readonly number[];
}>;

/** @internal Read one exact move without exposing the private root algebra. */
export const getExactDocumentChangeRelocation = (
  change: DocumentChange,
  root: string,
  before: readonly JsonNode[]
): DocumentChangeRelocation | null => {
  const exact = getInternalDocumentRootChange(change, root)?.movedNode(
    DocumentIndex.fromValue(before)
  );

  return exact
    ? Object.freeze({
        path: exact.path,
        root: root === 'main' ? null : root,
        targetPath: exact.targetPath,
      })
    : null;
};

/** @internal Read exact canonical moves without reconstructing the after value. */
export const getExactDocumentChangeRelocations = (
  change: DocumentChange,
  before: JsonEditorValue
): readonly DocumentChangeRelocation[] =>
  Object.freeze(
    [...getInternalDocumentChangeEntries(change)].flatMap(([root]) => {
      const exact = getExactDocumentChangeRelocation(
        change,
        root,
        valueRoot(before, root)
      );

      return exact ? [exact] : [];
    })
  );

export type RelocationCandidate = Readonly<{
  node: JsonNode;
  path: readonly number[];
}>;

export type RelocationCandidateGroup = {
  candidates: RelocationCandidate[];
  node: JsonNode;
};

export type StructuralFingerprint = Readonly<{
  hash: number;
  size: number;
}>;

export const mixStructuralFingerprint = (hash: number, value: number) =>
  Math.imul(hash ^ value, 0x01_00_01_93) >>> 0;

export const mixStructuralFingerprintString = (hash: number, value: string) => {
  let next = mixStructuralFingerprint(hash, value.length);

  for (let index = 0; index < value.length; index++) {
    next = mixStructuralFingerprint(next, value.charCodeAt(index));
  }

  return next;
};

export const getStructuralFingerprint = (
  value: unknown,
  cache: WeakMap<object, StructuralFingerprint>
): StructuralFingerprint => {
  if (value !== null && typeof value === 'object') {
    const cached = cache.get(value);

    if (cached) return cached;

    let hash = mixStructuralFingerprint(0x81_1c_9d_c5, 5);
    let size = 1;

    if (Array.isArray(value)) {
      hash = mixStructuralFingerprint(hash, 6);
      hash = mixStructuralFingerprint(hash, value.length);

      for (const item of value) {
        const child = getStructuralFingerprint(item, cache);

        hash = mixStructuralFingerprint(hash, child.hash);
        hash = mixStructuralFingerprint(hash, child.size);
        size += child.size;
      }
    } else {
      const record = value as JsonRecord;
      const keys = Object.keys(record).sort();

      hash = mixStructuralFingerprint(hash, 7);
      hash = mixStructuralFingerprint(hash, keys.length);

      for (const key of keys) {
        hash = mixStructuralFingerprintString(hash, key);

        const child = getStructuralFingerprint(record[key], cache);

        hash = mixStructuralFingerprint(hash, child.hash);
        hash = mixStructuralFingerprint(hash, child.size);
        size += child.size;
      }
    }

    const fingerprint = Object.freeze({ hash, size });

    cache.set(value, fingerprint);

    return fingerprint;
  }

  const type = typeof value;
  let hash = mixStructuralFingerprint(0x81_1c_9d_c5, 1);

  hash = mixStructuralFingerprintString(hash, type);
  hash = mixStructuralFingerprintString(
    hash,
    typeof value === 'number' && Object.is(value, -0) ? '-0' : String(value)
  );

  return Object.freeze({ hash, size: 1 });
};

export const groupRelocationCandidates = (
  candidates: readonly RelocationCandidate[],
  fingerprintCache: WeakMap<object, StructuralFingerprint>
) => {
  const buckets = new Map<string, RelocationCandidateGroup[]>();

  for (const candidate of candidates) {
    const fingerprint = getStructuralFingerprint(
      candidate.node,
      fingerprintCache
    );
    const key = `${fingerprint.hash}:${fingerprint.size}`;
    const groups = buckets.get(key) ?? [];
    const group = groups.find((entry) => jsonEqual(entry.node, candidate.node));

    if (group) {
      group.candidates.push(candidate);
    } else {
      groups.push({ candidates: [candidate], node: candidate.node });
      buckets.set(key, groups);
    }
  }

  return buckets;
};

export const compareRelocationPaths = (
  left: readonly number[],
  right: readonly number[]
) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index]! - right[index]!;

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

export const collectRelocationCandidates = (
  document: DocumentIndex,
  ranges: readonly (readonly [number, number])[]
) => {
  const candidates = new Map<string, RelocationCandidate>();

  for (const [from, to] of ranges) {
    for (const range of document.nodeRangesTouching(from, to)) {
      const key = pathKey(range.path);

      if (candidates.has(key)) continue;

      candidates.set(
        key,
        Object.freeze({
          node: document.node(range.path),
          path: range.path,
        })
      );
    }
  }

  return [...candidates.values()];
};

export const hasIndexedPathAncestor = (
  paths: ReadonlySet<string>,
  path: readonly number[]
) => {
  for (let depth = 1; depth < path.length; depth++) {
    if (paths.has(pathKey(path.slice(0, depth)))) return true;
  }

  return false;
};

export const deriveRootRelocations = (
  root: string,
  change: RootChange,
  before: DocumentIndex,
  after: DocumentIndex = change.apply(before)
): readonly DocumentChangeRelocation[] => {
  const exactMove = change.movedNode(before);

  if (exactMove) {
    return Object.freeze([
      Object.freeze({
        path: exactMove.path,
        root: root === 'main' ? null : root,
        targetPath: exactMove.targetPath,
      }),
    ]);
  }

  const beforeRanges: Array<readonly [number, number]> = [];
  const afterRanges: Array<readonly [number, number]> = [];

  change.iterChangedRanges((fromA, toA, fromB, toB) => {
    beforeRanges.push([fromA, toA]);
    afterRanges.push([fromB, toB]);
  });

  const beforeCandidates = collectRelocationCandidates(before, beforeRanges);
  const afterCandidates = collectRelocationCandidates(after, afterRanges);
  const fingerprintCache = new WeakMap<object, StructuralFingerprint>();
  const beforeBuckets = groupRelocationCandidates(
    beforeCandidates,
    fingerprintCache
  );
  const afterBuckets = groupRelocationCandidates(
    afterCandidates,
    fingerprintCache
  );
  const candidates: DocumentChangeRelocation[] = [];

  for (const [key, sourceGroups] of beforeBuckets) {
    const targetGroups = afterBuckets.get(key);

    if (!targetGroups) continue;

    for (const sourceGroup of sourceGroups) {
      if (sourceGroup.candidates.length !== 1) continue;

      const targetGroup = targetGroups.find((group) =>
        jsonEqual(sourceGroup.node, group.node)
      );

      if (!targetGroup || targetGroup.candidates.length !== 1) continue;

      const source = sourceGroup.candidates[0]!;
      const target = targetGroup.candidates[0]!;

      if (pathKey(source.path) === pathKey(target.path)) continue;

      candidates.push(
        Object.freeze({
          path: source.path,
          root: root === 'main' ? null : root,
          targetPath: target.path,
        })
      );
    }
  }

  candidates.sort(
    (left, right) =>
      left.path.length - right.path.length ||
      compareRelocationPaths(left.path, right.path)
  );

  const selected: DocumentChangeRelocation[] = [];
  const selectedSourcePaths = new Set<string>();
  const selectedTargetPaths = new Set<string>();

  for (const candidate of candidates) {
    if (
      hasIndexedPathAncestor(selectedSourcePaths, candidate.path) ||
      hasIndexedPathAncestor(selectedTargetPaths, candidate.targetPath)
    ) {
      continue;
    }

    selected.push(candidate);
    selectedSourcePaths.add(pathKey(candidate.path));
    selectedTargetPaths.add(pathKey(candidate.targetPath));
  }

  return Object.freeze(selected);
};

/** @internal Derive maximal stable subtree relocations for one root change. */
export const getRootChangeRelocations = (
  change: RootChange,
  before: DocumentIndex,
  after?: DocumentIndex
): readonly Readonly<{
  path: readonly number[];
  targetPath: readonly number[];
}>[] =>
  Object.freeze(
    deriveRootRelocations('main', change, before, after).map(
      ({ path, targetPath }) => Object.freeze({ path, targetPath })
    )
  );

/** @internal Derive maximal unique unchanged-subtree relocations. */
export const getDocumentChangeRelocations = (
  change: DocumentChange,
  before: JsonEditorValue
): readonly DocumentChangeRelocation[] =>
  Object.freeze(
    [...getInternalDocumentChangeEntries(change)].flatMap(
      ([root, rootChange]) =>
        deriveRootRelocations(
          root,
          rootChange,
          DocumentIndex.fromValue(valueRoot(before, root))
        )
    )
  );
