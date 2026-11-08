import { DocumentChange } from '../core/change/document-change';
import { jsonEqual } from '../core/change/json';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import { registerEditorDraftGuard } from '../core/document-recorder';
import { getEditorRuntime } from '../core/editor-runtime';
import { ownedRootsOf } from '../core/element-owned-root-index';
import { fingerprintEditorJson } from '../core/json-fingerprint';
import { getValueRecords, withValueRecords } from '../core/record-store';
import { publishEditorRefusal } from '../core/refusal';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import type { SpeculativeUpdate } from '../core/update-policy';
import { COMPARISON_POLICY } from '../diff/lib/comparison-internal';
import {
  closeOverRequired,
  comparisonPlanOf,
} from '../diff/lib/comparison-plan';
import type { TwoWayComparison } from '../diff/lib/comparison-types';
import type {
  AnyEditor,
  EditorStateSchemaApi,
  Value,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { unrepresentable } from './refusal';
import { authoredResolveSchemaOf } from './resolve-schema';
import { AUTHORED_MARKS_KEY } from './tree/marks';
import { resolveAuthoredValue } from './tree/resolve';

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

/**
 * Publish the selected groups of a validated fixed-revision comparison as one
 * native proposal. Returns `applied` only when accepting the proposal alone
 * gives the selection's document and rejecting it alone gives the document it
 * started from, with every other suggestion left pending. Otherwise it writes
 * nothing and returns `blocked`. Review can still hold the proposal's decision
 * until a pending change it waits on is decided. An error that escapes the
 * update after the proposal commits propagates.
 */
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
  const schema: EditorStateSchemaApi<V> = editor.read.schema;
  // A plan derived under a changed schema can fail and report `invalid`, so it
  // is derived only under the comparison's own schema and a mismatch reports
  // `stale`.
  const schemaCurrent = jsonEqual(schema.identity(), comparison.before.schema);
  const plan = schemaCurrent ? comparisonPlanOf(comparison, schema) : undefined;
  if (plan === null) {
    return { reason: 'comparison', status: 'invalid' };
  }
  const groups = new Map(comparison.changes.map((group) => [group.id, group]));
  const requested = input.groupIds ?? [...groups.keys()];
  if (
    new Set(requested).size !== requested.length ||
    requested.some((id) => !groups.has(id))
  ) {
    return { reason: 'selection', status: 'invalid' };
  }
  const selected = closeOverRequired([...groups.values()], requested);
  if ([...selected].some((id) => !groups.has(id))) {
    return { reason: 'comparison', status: 'invalid' };
  }
  const selectedIds = [...groups.keys()].filter((id) => selected.has(id));
  const all = selectedIds.length === groups.size;
  if (!all && comparison.diagnostics.some(({ code }) => code === 'ambiguous')) {
    return { reason: 'ambiguous-selection', status: 'blocked' };
  }
  if (selectedIds.length === 0 || comparison.change.empty) {
    return { ids: [], mappings: [], status: 'unchanged' };
  }
  if (!all && plan && !plan.partitioned) {
    return { reason: 'ambiguous-selection', status: 'blocked' };
  }

  const changeId = `comparison-import:${comparison.id}:${fingerprintEditorJson(
    selectedIds
  )}`;
  const mappings = selectedIds.map((groupId) => ({ changeId, groupId }));
  const authoredRead = editor.read.authored as {
    change: (id: string) => unknown;
  };
  if (authoredRead.change(changeId)) {
    return { ids: [changeId], mappings, status: 'unchanged' };
  }

  if (!plan) {
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

  const ids = all ? 'all' : selected;
  let change: DocumentChange;
  let target: JsonEditorValue;
  try {
    schema.assertDocument(comparison.before.document);
    schema.assertDocument(comparison.after.document);
    change = plan.select(ids);
    target = change.apply(comparison.before.document);
    schema.assertDocument(target);
  } catch {
    return { reason: 'dependency', status: 'blocked' };
  }
  if (change.empty) {
    return { ids: [], mappings: [], status: 'unchanged' };
  }

  const exact = () => change;
  const wholeBase = () =>
    DocumentChange.between(
      comparison.before.document,
      comparison.after.document
    );
  const wholeBlocks = () => plan.select(ids, 'blocks');
  const forms = all ? [exact, wholeBase, wholeBlocks] : [exact, wholeBlocks];
  const guard = readsExactly(
    editor,
    current,
    comparison.before.document,
    target,
    changeId
  );
  let refusal: Readonly<{ value: unknown }> | null = null;
  const tried: unknown[] = [];

  for (const form of forms) {
    const write = form();
    const json = write.toJSON();
    if (tried.some((other) => jsonEqual(other, json))) continue;
    tried.push(json);
    const trial: SpeculativeUpdate = { committed: false };
    try {
      getEditorRuntime(editor).update(
        (tx) => {
          registerEditorDraftGuard(editor, guard, 'recorded', 'transaction');
          tx.authored.propose({ changeId });
          tx.changes.apply(write);
        },
        { speculative: trial }
      );
    } catch (error) {
      if (trial.committed) throw error;
      if (
        error instanceof Error &&
        error.message === 'An author ID is required for authored writes.'
      ) {
        return { reason: 'actor', status: 'unavailable' };
      }
      continue;
    }
    if (trial.committed) {
      return { ids: [changeId], mappings, status: 'applied' };
    }
    if ('refusal' in trial) refusal = { value: trial.refusal };
  }
  if (refusal) publishEditorRefusal(editor, refusal.value);

  return { reason: 'dependency', status: 'blocked' };
};

const readsAlone = (node: JsonNode, schema: CompiledEditorSchema): boolean =>
  !(AUTHORED_MARKS_KEY in node) &&
  ownedRootsOf(schema, node).length === 0 &&
  (node.children?.every((child) => readsAlone(child, schema)) ?? true);

const positions = (nodes: readonly JsonNode[]) => {
  const at = new Map<JsonNode, number>();
  const repeated = new Set<JsonNode>();

  nodes.forEach((node, index) => {
    if (at.has(node)) repeated.add(node);
    at.set(node, index);
  });
  for (const node of repeated) at.delete(node);

  return at;
};

const keepsNeighbors = (
  nodes: readonly JsonNode[],
  at: ReadonlyMap<JsonNode, number>,
  index: number
) => {
  const middle = at.get(nodes[index]);

  return (
    middle !== undefined &&
    at.get(nodes[index - 1]) === middle - 1 &&
    at.get(nodes[index + 1]) === middle + 1
  );
};

const droppedQuietBlocks = (
  live: JsonEditorValue,
  copy: JsonEditorValue,
  written: JsonEditorValue,
  target: JsonEditorValue,
  mustKeep: number,
  schema: CompiledEditorSchema
) => {
  const liveAt = positions(live.children);
  const copyAt = positions(copy.children);
  const writtenAt = positions(written.children);
  const targetAt = positions(target.children);
  const quiet = live.children.map(
    (node, index) =>
      liveAt.has(node) &&
      copyAt.has(copy.children[index]) &&
      writtenAt.has(node) &&
      targetAt.has(copy.children[index]) &&
      readsAlone(node, schema)
  );
  const dropped = {
    live: new Set<number>(),
    target: new Set<number>(),
    written: new Set<number>(),
  };
  let keptQuiet = 0;

  live.children.forEach((node, index) => {
    if (
      keptQuiet >= mustKeep &&
      quiet[index - 1] &&
      quiet[index] &&
      quiet[index + 1] &&
      keepsNeighbors(live.children, writtenAt, index) &&
      keepsNeighbors(copy.children, targetAt, index)
    ) {
      dropped.live.add(index);
      dropped.written.add(getDefined(writtenAt.get(node)));
      dropped.target.add(getDefined(targetAt.get(copy.children[index])));
    } else if (quiet[index]) {
      keptQuiet += 1;
    }
  });

  return dropped;
};

const readsExactly = (
  editor: AnyEditor,
  live: JsonEditorValue,
  copy: JsonEditorValue,
  target: JsonEditorValue,
  changeId: string
) => {
  const schema = authoredResolveSchemaOf(editor);
  const liveRecords = getValueRecords(live);
  const root = schema.content(null, 'main');
  const mustKeep =
    root?.max == null ? Math.max(root?.prefix ?? 0, root?.min ?? 0) : Infinity;
  const read = (
    value: JsonEditorValue,
    action: 'accept' | 'keep' | 'reject'
  ) => {
    const { children, roots } = resolveAuthoredValue(
      value,
      (change) => (change === changeId ? action : 'keep'),
      schema
    ).value;

    return { children, roots: roots ?? {} };
  };

  return (written: JsonEditorValue) => {
    const dropped = droppedQuietBlocks(
      live,
      copy,
      written,
      target,
      mustKeep,
      schema.ownership
    );
    const kept = (
      value: JsonEditorValue,
      drop: ReadonlySet<number>,
      records: ReturnType<typeof getValueRecords>
    ) =>
      withValueRecords(
        {
          ...value,
          children: value.children.filter((_node, index) => !drop.has(index)),
        },
        records
      );
    const recording = kept(written, dropped.written, getValueRecords(written));

    if (
      !jsonEqual(
        read(recording, 'accept'),
        read(kept(target, dropped.target, liveRecords), 'keep')
      ) ||
      !jsonEqual(
        read(recording, 'reject'),
        read(kept(live, dropped.live, liveRecords), 'keep')
      )
    ) {
      throw unrepresentable(
        'The review marks cannot hold this comparison import.',
        'diverged'
      );
    }
  };
};
