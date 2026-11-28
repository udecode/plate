import type {
  DocumentChange,
  EditorDocumentValue,
  EditorStateSchemaApi,
  Value,
} from '../..';
import {
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import { isElementNode, type JsonNode } from '../../core/change/tokens';
import { fingerprintEditorJson } from '../../core/json-fingerprint';
import { recordOpsToJson } from '../../core/record-store';
import { storedElementIdOf } from '../../core/stored-element-id';
import { snapshotEditorJsonValue } from '../../core/value-codec';
import type { ComparisonDocumentIndex } from './comparison-index';
import type {
  ComparedChange,
  ComparisonSnapshot,
  ComparisonSpan,
} from './comparison-types';

export type ComparisonDocument<V extends Value = Value> = Pick<
  EditorDocumentValue<V>,
  'children' | 'roots'
>;

export const COMPARISON_POLICY = Object.freeze({
  id: 'structural-diff' as const,
  version: 1 as const,
});

export const COMPARISON_WORD =
  /[\p{L}\p{M}\p{N}]+(?:['’][\p{L}\p{M}\p{N}]+)*/gu;

export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'undefined';
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableStringify(
          (value as Readonly<Record<string, unknown>>)[key]
        )}`
    )
    .join(',')}}`;
};

export const comparisonHash = (value: unknown) => fingerprintEditorJson(value);

export const comparisonChangeHashPayload = (change: DocumentChange) => {
  try {
    return change.toJSON();
  } catch {
    const records = getInternalDocumentChangeRecords(change);

    return {
      createRoots: [...change.createRoots].sort(),
      deleteRoots: [...change.deleteRoots].sort(),
      ...(records.size > 0 ? { records: recordOpsToJson(records) } : {}),
      roots: [...getInternalDocumentChangeEntries(change)]
        .map(([root, rootChange]) => [root, rootChange.toJSON()] as const)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    };
  }
};

export const detachComparisonEnvelope = (input: unknown): string | null => {
  if (Array.isArray(input) || typeof input !== 'object' || input === null) {
    return null;
  }
  const { meta, records } = input as Readonly<{
    meta?: unknown;
    records?: unknown;
  }>;

  if (meta === undefined && records === undefined) return null;

  return fingerprintEditorJson({
    ...(meta === undefined
      ? {}
      : {
          meta: snapshotEditorJsonValue(meta, 'Comparison document metadata'),
        }),
    ...(records === undefined
      ? {}
      : {
          records: snapshotEditorJsonValue(
            records,
            'Comparison document records'
          ),
        }),
  });
};

export const detachComparisonDocument = <V extends Value>(
  input: unknown,
  schema: EditorStateSchemaApi<V>
): ComparisonDocument<V> => {
  const candidate = Array.isArray(input) ? { children: input } : input;

  schema.assertDocument(candidate);

  const document = snapshotEditorJsonValue(
    {
      children: candidate.children,
      ...(candidate.roots ? { roots: candidate.roots } : {}),
    },
    'Comparison document'
  ) as ComparisonDocument<V>;

  return document;
};

const scanIds = (
  nodes: readonly JsonNode[],
  onElement: (id: string | undefined) => void
) => {
  for (const node of nodes) {
    if (!isElementNode(node)) continue;
    onElement(storedElementIdOf(node));
    scanIds(node.children, onElement);
  }
};

const scanDocumentIds = (
  document: ComparisonDocument,
  onElement: (id: string | undefined) => void
) => {
  scanIds(document.children, onElement);
  const { roots } = document;

  if (!roots) return;
  for (const root of Object.keys(roots).sort()) {
    scanIds(roots[root], onElement);
  }
};

const pathKey = (root: string | null, path: readonly number[]) =>
  `${root ?? ''}:${path.join(',')}`;

const stripElementIdsFromNodes = (
  nodes: readonly JsonNode[]
): readonly JsonNode[] =>
  nodes.map((node) => {
    if (!isElementNode(node)) return node;
    const children = stripElementIdsFromNodes(node.children);

    if (storedElementIdOf(node) === undefined && children === node.children) {
      return node;
    }
    const { id: _id, ...rest } = node as Record<string, unknown>;

    return Object.freeze({ ...rest, children });
  });

export const needsComparisonElementIds = <V extends Value>(
  before: ComparisonDocument<V>,
  after: ComparisonDocument<V>
): boolean => {
  let beforeHasId = false;

  scanDocumentIds(before, (id) => {
    if (id !== undefined) beforeHasId = true;
  });
  if (!beforeHasId) return false;

  let afterMissingId = false;

  scanDocumentIds(after, (id) => {
    if (id === undefined) afterMissingId = true;
  });

  return afterMissingId;
};

export const stripComparisonElementIds = <V extends Value>(
  document: ComparisonDocument<V>
): ComparisonDocument<V> => {
  const { roots } = document;

  return Object.freeze({
    children: stripElementIdsFromNodes(document.children) as V,
    ...(roots
      ? {
          roots: Object.freeze(
            Object.fromEntries(
              Object.keys(roots)
                .sort()
                .map((root) => [
                  root,
                  stripElementIdsFromNodes(roots[root]) as V,
                ])
            )
          ),
        }
      : {}),
  });
};

const nodeAtPath = (
  document: ComparisonDocument,
  root: string | null,
  path: readonly number[]
): JsonNode | undefined => {
  let list: readonly JsonNode[] | undefined =
    root === null ? document.children : document.roots?.[root];
  let current: JsonNode | undefined;

  for (const index of path) {
    current = list?.[index];
    if (!current || !isElementNode(current)) return undefined;
    list = current.children;
  }

  return current;
};

export const fillComparisonElementIds = <V extends Value>(
  before: ComparisonDocument<V>,
  after: ComparisonDocument<V>,
  beforeIndex: ComparisonDocumentIndex,
  afterIndex: ComparisonDocumentIndex,
  inPlaceMatches: ReadonlyArray<readonly [number, number]>
): ComparisonDocument<V> => {
  const used = new Set<string>();

  scanDocumentIds(before, (id) => {
    if (id !== undefined) used.add(id);
  });
  scanDocumentIds(after, (id) => {
    if (id !== undefined) used.add(id);
  });

  const matchedIds = new Map<string, string>();
  const claimed = new Set<string>();

  scanDocumentIds(after, (id) => {
    if (id !== undefined) claimed.add(id);
  });

  for (const [bIndex, aIndex] of inPlaceMatches) {
    const bMeta = beforeIndex.nodes[bIndex];
    const aMeta = afterIndex.nodes[aIndex];
    const bNode = nodeAtPath(before, bMeta.root, bMeta.path);
    const id = bNode ? storedElementIdOf(bNode) : undefined;

    if (id !== undefined && !claimed.has(id)) {
      claimed.add(id);
      matchedIds.set(pathKey(aMeta.root, aMeta.path), id);
    }
  }

  let next = 0;
  const draw = () => {
    while (used.has(`fill.${next}`)) next += 1;
    const id = `fill.${next}`;

    used.add(id);
    next += 1;

    return id;
  };
  const fillNodes = (
    nodes: readonly JsonNode[],
    root: string | null,
    prefix: readonly number[]
  ): readonly JsonNode[] =>
    nodes.map((node, index) => {
      if (!isElementNode(node)) return node;
      const path = [...prefix, index];
      const children = fillNodes(node.children, root, path);
      const existing = storedElementIdOf(node);
      const id = existing ?? matchedIds.get(pathKey(root, path)) ?? draw();

      if (existing !== undefined && children === node.children) return node;

      return Object.freeze({
        ...node,
        ...(existing === undefined ? { id } : {}),
        children,
      });
    });

  const afterRoots = after.roots;
  const afterRootKeys = Object.keys(afterRoots ?? {}).sort();
  const children = fillNodes(after.children, null, []) as V;
  const roots =
    afterRoots && afterRootKeys.length > 0
      ? Object.freeze(
          Object.fromEntries(
            afterRootKeys.map((root) => [
              root,
              fillNodes(afterRoots[root], root, []) as V,
            ])
          )
        )
      : undefined;

  return Object.freeze({
    children,
    ...(roots ? { roots } : {}),
  });
};

export const createComparisonSnapshot = <V extends Value>(
  document: ComparisonDocument<V>,
  schema: EditorStateSchemaApi<V>,
  projection: 'accepted' | 'proposed',
  envelopeFingerprint: string | null
): ComparisonSnapshot<V> => {
  const identity = schema.identity();
  const fingerprint = fingerprintEditorJson({
    document,
    envelopeFingerprint,
    projection,
    schema: identity,
  });

  return Object.freeze({
    document,
    envelopeFingerprint,
    fingerprint,
    projection,
    schema: identity,
  });
};

export const comparisonDocumentsEqual = (
  left: ComparisonDocument,
  right: ComparisonDocument
) => jsonEqual(left, right);

export const disjointSets = (count: number) => {
  const parent = Array.from({ length: count }, (_value, index) => index);
  const find = (index: number) => {
    let root = index;

    while (parent[root] !== root) {
      parent[root] = parent[parent[root]];
      root = parent[root];
    }

    return root;
  };

  return {
    find,
    join: (left: number, right: number) => {
      const from = find(left);
      const to = find(right);

      if (from === to) return false;
      parent[from] = to;

      return true;
    },
  };
};

export const spanKey = ({ from, root, to }: ComparisonSpan) =>
  `${root === null ? 'primary' : `named:${root}`}:${from}:${to}`;

export const uniqueSpans = (spans: readonly ComparisonSpan[]) =>
  Object.freeze([
    ...new Map(spans.map((value) => [spanKey(value), value])).values(),
  ]);

export type GroupMerge = Readonly<{
  members: readonly number[];
  owner: number;
}>;

export const mergeGroups = (
  changes: readonly ComparedChange[],
  merges: readonly GroupMerge[]
) => {
  const placed = new Map<number, GroupMerge>();
  const absorbed = new Set<number>();

  for (const merge of merges) {
    placed.set(Math.min(...merge.members), merge);
    for (const member of merge.members) absorbed.add(member);
  }

  return changes.flatMap((change, index) => {
    const merge = placed.get(index);

    if (!merge) return absorbed.has(index) ? [] : [change];
    const merged = merge.members.map((member) => changes[member]);
    const { evidence, id } = changes[merge.owner];

    return [
      Object.freeze({
        after: uniqueSpans(merged.flatMap(({ after: spans }) => spans)),
        before: uniqueSpans(merged.flatMap(({ before: spans }) => spans)),
        correspondence: Object.freeze(
          merged.flatMap(({ correspondence }) => correspondence)
        ),
        effects: Object.freeze(merged.flatMap(({ effects }) => effects)),
        evidence,
        id,
        requiredChangeIds: Object.freeze([
          ...new Set(
            merged.flatMap(({ requiredChangeIds }) => requiredChangeIds)
          ),
        ]),
      }),
    ];
  });
};

export const createAbortError = () => {
  const error = new Error('The comparison was aborted.');

  error.name = 'AbortError';

  return error;
};

export const assertComparisonActive = (signal?: AbortSignal) => {
  if (signal?.aborted) throw createAbortError();
};

export const yieldComparisonWork = async (signal?: AbortSignal) => {
  assertComparisonActive(signal);
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
  assertComparisonActive(signal);
};
