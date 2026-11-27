import { DocumentChange } from '../core/change/document-change';
import { jsonEqual } from '../core/change/json';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import { registerEditorDraftGuard } from '../core/document-recorder';
import { getEditorRuntime } from '../core/editor-runtime';
import { ownedRootsOf } from '../core/element-owned-root-index';
import { fingerprintEditorJson } from '../core/json-fingerprint';
import { getCompiledEditorSchema } from '../core/plugin-registry';
import { getValueRecords, withValueRecords } from '../core/record-store';
import { publishEditorRefusal } from '../core/refusal';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import { alike } from '../core/stored-element-id';
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
import { authoredProposerOf } from './authored';
import { factsOf, membersOf, type ReviewFacts } from './facts/facts';
import { unrepresentable } from './refusal';
import { authoredResolveSchemaOf } from './resolve-schema';
import { AUTHORED_MARKS_KEY, readMembers } from './tree/marks';
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
 * native proposal. Returns `unchanged`, writing nothing, when accepting the
 * importer's own pending changes that the selection's document no longer marks,
 * and keeping every other pending change, already gives that document.
 * Otherwise returns `applied` only when accepting the proposal alone gives the
 * selection's document and rejecting it alone gives the document it started
 * from, with every other suggestion left pending. When it cannot, it writes
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
  const proposer = authoredProposerOf(editor);
  if (!proposer) {
    return { reason: 'actor', status: 'unavailable' };
  }
  const compare = compareDecided(
    editor,
    current,
    comparison.before.document,
    target
  );
  const { authorId, pending } = proposer;
  const draftRestatesOwnChanges = () => {
    try {
      const marked = changesMarkedIn(target, factsOf(current));
      const restated = (id: string) => pending.has(id) && !marked.has(id);

      return (
        [...pending].some(restated) &&
        compare(current).acceptGivesTarget(restated)
      );
    } catch {
      return false;
    }
  };
  if (draftRestatesOwnChanges()) {
    return { ids: [], mappings: [], status: 'unchanged' };
  }

  const changeId = `comparison-import:${authorId}:${proposer.createChangeId()}`;
  const mappings = selectedIds.map((groupId) => ({ changeId, groupId }));
  const exact = () => change;
  const wholeBase = () =>
    DocumentChange.between(
      comparison.before.document,
      comparison.after.document
    );
  const wholeBlocks = () => plan.select(ids, 'blocks');
  const forms = all ? [exact, wholeBase, wholeBlocks] : [exact, wholeBlocks];
  const guard = (written: JsonEditorValue) => {
    const read = compare(written);
    const imported = (id: string) => id === changeId;

    if (!read.acceptGivesTarget(imported) || !read.rejectGivesLive(imported)) {
      throw unrepresentable(
        'The review marks cannot hold this comparison import.',
        'diverged'
      );
    }
  };
  let refusal: Readonly<{ value: unknown }> | null = null;
  const tried: unknown[] = [];

  for (const form of forms) {
    const write = renewInsertedIds(editor, comparison.before.document, form());
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

const renewInsertedIds = (
  editor: AnyEditor,
  before: JsonEditorValue,
  change: DocumentChange
): DocumentChange => {
  const compiled = getCompiledEditorSchema(editor);

  if (!compiled.reservedElementId) return change;

  const beforeIds = new Set<string>();
  const collect = (nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (typeof node.id === 'string') beforeIds.add(node.id);
      if (node.children) collect(node.children);
    }
  };

  collect(before.children);
  for (const nodes of Object.values(before.roots ?? {})) collect(nodes);

  const renamed = new Map<string, string>();
  let changed = false;
  const rewrite = <T>(value: T): T => {
    if (Array.isArray(value)) return value.map(rewrite) as T;
    if (!value || typeof value !== 'object') return value;

    const record = value as Record<string, unknown>;

    if (
      typeof record.length === 'number' &&
      record.properties &&
      typeof record.properties === 'object' &&
      Array.isArray((record.properties as Record<string, unknown>).operations)
    ) {
      const properties = record.properties as Record<string, unknown>;
      const operations = properties.operations as ReadonlyArray<
        Record<string, unknown>
      >;
      const filtered = operations.filter((op) => op.key !== 'id');

      if (filtered.length !== operations.length) {
        changed = true;

        return (
          filtered.length === 0
            ? { length: record.length }
            : {
                ...record,
                properties: { ...properties, operations: filtered },
              }
        ) as T;
      }
    }

    if (
      record.kind === 'open' &&
      record.nodeKind === 'element' &&
      record.props &&
      typeof record.props === 'object'
    ) {
      const props = record.props as Record<string, unknown>;

      if (typeof props.id === 'string' && !beforeIds.has(props.id)) {
        let next = renamed.get(props.id);

        if (!next) {
          next = compiled.elementIdMint.next();
          renamed.set(props.id, next);
        }
        changed = true;

        return { ...record, props: { ...props, id: next } } as T;
      }
    }

    const out: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(record)) out[k] = rewrite(v);

    return out as T;
  };
  const rewritten = rewrite(change.toJSON());

  return changed ? DocumentChange.fromJSON(rewritten) : change;
};

const changesMarkedIn = (value: JsonEditorValue, facts: ReviewFacts) => {
  const ids = new Set<string>();
  const visit = (node: JsonNode) => {
    for (const member of readMembers(node)) {
      if ('change' in member) {
        ids.add(member.change);
      } else if (member.kind === 'in') {
        for (const { change } of membersOf(facts, member.ctx)) ids.add(change);
      }
    }
    node.children?.forEach(visit);
  };

  value.children.forEach(visit);
  for (const nodes of Object.values(value.roots ?? {})) nodes.forEach(visit);

  return ids;
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

const compareDecided = (
  editor: AnyEditor,
  live: JsonEditorValue,
  copy: JsonEditorValue,
  target: JsonEditorValue
) => {
  const schema = authoredResolveSchemaOf(editor);
  const liveRecords = getValueRecords(live);
  const root = schema.content(null, 'main');
  const mustKeep =
    root?.max == null ? Math.max(root?.prefix ?? 0, root?.min ?? 0) : Infinity;
  const read = (
    value: JsonEditorValue,
    drop: ReadonlySet<number>,
    records: ReturnType<typeof getValueRecords>,
    outcome: (change: string) => 'accept' | 'keep' | 'reject'
  ) => {
    const { children, roots } = resolveAuthoredValue(
      withValueRecords(
        {
          ...value,
          children: value.children.filter((_node, index) => !drop.has(index)),
        },
        records
      ),
      outcome,
      schema
    ).value;

    return { children, roots: roots ?? {} };
  };
  const keep = () => 'keep' as const;

  return (written: JsonEditorValue) => {
    const dropped = droppedQuietBlocks(
      live,
      copy,
      written,
      target,
      mustKeep,
      schema.ownership
    );
    const decided = (
      mine: (change: string) => boolean,
      action: 'accept' | 'reject'
    ) =>
      read(written, dropped.written, getValueRecords(written), (change) =>
        mine(change) ? action : 'keep'
      );

    return {
      acceptGivesTarget: (mine: (change: string) => boolean) =>
        alike(
          decided(mine, 'accept'),
          read(target, dropped.target, liveRecords, keep)
        ),
      rejectGivesLive: (mine: (change: string) => boolean) =>
        jsonEqual(
          decided(mine, 'reject'),
          read(live, dropped.live, liveRecords, keep)
        ),
    };
  };
};
