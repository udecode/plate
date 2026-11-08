import type { EditorDocumentValue, EditorStateSchemaApi, Value } from '../..';
import { jsonEqual } from '../../core/change/json';
import { fingerprintEditorJson } from '../../core/json-fingerprint';
import { snapshotEditorJsonValue } from '../../core/value-codec';
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

export const detachComparisonEnvelope = (input: unknown): string | null => {
  if (Array.isArray(input) || typeof input !== 'object' || input === null) {
    return null;
  }
  const { meta } = input as Readonly<{ meta?: unknown }>;

  if (meta === undefined) return null;

  return fingerprintEditorJson(
    snapshotEditorJsonValue(meta, 'Comparison document metadata')
  );
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
