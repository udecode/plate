import { DocumentChange } from '../core/change/document-change';
import { jsonEqual } from '../core/change/tokens';
import { fingerprintEditorJson } from '../core/json-fingerprint';
import {
  COMPARISON_POLICY,
  selectComparisonDocumentChange,
} from '../diff/lib/comparison-internal';
import type { TwoWayComparison } from '../diff/lib/comparison-types';
import type {
  AnyEditor,
  EditorStateSchemaApi,
  Value,
} from '../interfaces/editor';

export type AuthoredComparisonImportResult =
  | Readonly<{
      ids: readonly string[];
      mappings: ReadonlyArray<Readonly<{ changeId: string; groupId: string }>>;
      status: 'applied' | 'unchanged';
    }>
  | Readonly<{
      reason: 'authored-frontier' | 'document' | 'schema';
      status: 'stale';
    }>
  | Readonly<{
      reason: 'ambiguous-selection' | 'dependency';
      status: 'blocked';
    }>
  | Readonly<{
      reason: 'comparison' | 'selection';
      status: 'invalid';
    }>
  | Readonly<{ reason: 'actor' | 'plugin'; status: 'unavailable' }>;

const validComparison = (comparison: TwoWayComparison): boolean => {
  if (
    comparison.kind !== 'two-way' ||
    !jsonEqual(comparison.policy, COMPARISON_POLICY) ||
    !DocumentChange.isDocumentChange(comparison.change) ||
    !Array.isArray(comparison.changes) ||
    !Array.isArray(comparison.diagnostics) ||
    comparison.before.projection !== 'accepted'
  ) {
    return false;
  }

  try {
    const prefix = `comparison:${fingerprintEditorJson({
      after: comparison.after.fingerprint,
      before: comparison.before.fingerprint,
      policy: comparison.policy,
    })}`;
    if (
      comparison.id !==
      `${prefix}:${fingerprintEditorJson({
        change: comparison.change.toJSON(),
        changes: comparison.changes,
        diagnostics: comparison.diagnostics,
      })}`
    ) {
      return false;
    }
    return (
      jsonEqual(
        comparison.change.apply(comparison.before.document),
        comparison.after.document
      ) &&
      jsonEqual(
        comparison.change
          .invert(comparison.before.document)
          .apply(comparison.after.document),
        comparison.before.document
      )
    );
  } catch {
    return false;
  }
};

/** Publish a validated fixed-revision comparison as one native proposal. */
export const proposeAuthoredComparison = <V extends Value>(
  editor: AnyEditor<V>,
  input: Readonly<{
    comparison: TwoWayComparison<V>;
    groupIds?: readonly string[];
  }>
): AuthoredComparisonImportResult => {
  const { comparison } = input;
  if (!validComparison(comparison)) {
    return { reason: 'comparison', status: 'invalid' };
  }
  if (typeof editor.read.authored?.change !== 'function') {
    return { reason: 'plugin', status: 'unavailable' };
  }
  const groups = new Map(comparison.changes.map((group) => [group.id, group]));
  const requested = input.groupIds ?? [...groups.keys()];
  if (
    new Set(requested).size !== requested.length ||
    requested.some((id) => !groups.has(id))
  ) {
    return { reason: 'selection', status: 'invalid' };
  }
  const selected = new Set(requested);
  for (const id of selected) {
    for (const required of groups.get(id)?.requiredChangeIds ?? []) {
      if (!groups.has(required)) {
        return { reason: 'comparison', status: 'invalid' };
      }
      selected.add(required);
    }
  }
  const selectedIds = [...groups.keys()].filter((id) => selected.has(id));
  if (
    selectedIds.length < groups.size &&
    comparison.diagnostics.some(({ code }) => code === 'ambiguous')
  ) {
    return { reason: 'ambiguous-selection', status: 'blocked' };
  }
  if (selectedIds.length === 0 || comparison.change.empty) {
    return { ids: [], mappings: [], status: 'unchanged' };
  }

  const changeId = `comparison-import:${comparison.id}:${fingerprintEditorJson(
    selectedIds
  )}`;
  const mappings = selectedIds.map((groupId) => ({ changeId, groupId }));
  const authoredRead = editor.read.authored as {
    change: (id: string) => { status: string } | null;
  };
  const existing = authoredRead.change(changeId);
  if (existing) {
    return existing.status === 'pending' || existing.status === 'conflicted'
      ? { ids: [changeId], mappings, status: 'unchanged' }
      : { reason: 'authored-frontier', status: 'stale' };
  }

  const schema: EditorStateSchemaApi<V> = editor.read.schema;
  if (!jsonEqual(schema.identity(), comparison.before.schema)) {
    return { reason: 'schema', status: 'stale' };
  }
  const current = editor.read.value();
  const document = {
    children: current.children,
    ...(current.roots ? { roots: current.roots } : {}),
  };
  if (!jsonEqual(document, comparison.before.document)) {
    return { reason: 'document', status: 'stale' };
  }
  const envelopeFingerprint =
    current.meta === undefined ? null : fingerprintEditorJson(current.meta);
  if (envelopeFingerprint !== comparison.before.envelopeFingerprint) {
    return { reason: 'authored-frontier', status: 'stale' };
  }

  let change: DocumentChange;
  try {
    schema.assertDocument(comparison.before.document);
    schema.assertDocument(comparison.after.document);
    change = selectComparisonDocumentChange(comparison, selected);
    schema.assertDocument(change.apply(comparison.before.document));
  } catch {
    return { reason: 'dependency', status: 'blocked' };
  }
  if (change.empty) {
    return { ids: [], mappings: [], status: 'unchanged' };
  }

  try {
    editor.update((tx) => {
      tx.authored.propose({ changeId });
      tx.changes.apply(change);
    });
  } catch (error) {
    return error instanceof Error &&
      error.message === 'An author ID is required for authored writes.'
      ? { reason: 'actor', status: 'unavailable' }
      : { reason: 'dependency', status: 'blocked' };
  }
  return { ids: [changeId], mappings, status: 'applied' };
};
