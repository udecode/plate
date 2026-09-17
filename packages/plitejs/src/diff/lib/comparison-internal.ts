import type { EditorDocumentValue, EditorStateSchemaApi, Value } from '../..';
import {
  DocumentChange,
  type DocumentChangeJson,
} from '../../core/change/document-change';
import { RootChange, type RootChangeJson } from '../../core/change/root-change';
import { jsonEqual } from '../../core/change/tokens';
import { fingerprintEditorJson } from '../../core/json-fingerprint';
import { snapshotEditorJsonValue } from '../../core/value-codec';
import type { ComparisonSnapshot, TwoWayComparison } from './comparison-types';

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

export const selectComparisonDocumentChange = (
  comparison: TwoWayComparison,
  selectedIds: ReadonlySet<string>
) => {
  if (selectedIds.size === comparison.changes.length) return comparison.change;

  const selected = comparison.changes.filter(({ id }) => selectedIds.has(id));
  const spans = (side: 'after' | 'before', root: string | null) =>
    selected.flatMap((group) =>
      group[side].filter((span) => span.root === root)
    );
  const touches = (
    from: number,
    to: number,
    candidates: ReadonlyArray<Readonly<{ from: number; to: number }>>
  ) =>
    candidates.some((span) =>
      from === to
        ? span.from <= from && from <= span.to
        : Math.max(from, span.from) < Math.min(to, span.to)
    );
  const filterRoot = (
    root: string | null,
    value: RootChangeJson | undefined
  ): RootChangeJson | undefined => {
    if (!value) return undefined;
    const beforeSpans = spans('before', root);
    const afterSpans = spans('after', root);
    let before = 0;
    let after = 0;
    const result = value.map((section) => {
      const sectionChange = RootChange.fromJSON([section]);
      const afterLength = sectionChange.newLength;
      const changed =
        section.properties !== undefined || section.replacement !== undefined;
      const include =
        changed &&
        (touches(before, before + section.length, beforeSpans) ||
          touches(after, after + afterLength, afterSpans));

      before += section.length;
      after += afterLength;

      return include ? section : Object.freeze({ length: section.length });
    });
    const filtered = RootChange.fromJSON(result);

    return filtered.empty ? undefined : filtered.toJSON();
  };
  const json = comparison.change.toJSON();
  const primary = filterRoot(null, json.primary);
  const roots = Object.fromEntries(
    Object.entries(json.roots ?? {}).flatMap(([root, change]) => {
      const filtered = filterRoot(root, change);

      return filtered ? [[root, filtered] as const] : [];
    })
  );
  const lifecycle = (kind: 'root-create' | 'root-delete', root: string) =>
    selected.some(({ effects }) =>
      effects.some(
        (effect) =>
          effect.kind === kind && 'root' in effect && effect.root === root
      )
    );
  const selectedJson: DocumentChangeJson = {
    ...(primary ? { primary } : {}),
    ...(Object.keys(roots).length > 0 ? { roots } : {}),
    ...(json.createRoots
      ? {
          createRoots: json.createRoots.filter((root) =>
            lifecycle('root-create', root)
          ),
        }
      : {}),
    ...(json.deleteRoots
      ? {
          deleteRoots: json.deleteRoots.filter((root) =>
            lifecycle('root-delete', root)
          ),
        }
      : {}),
    version: 3,
  };

  return DocumentChange.fromJSON(selectedJson);
};
