import {
  attachLazyV4Steps,
  createInternalDocumentChange,
  DocumentChange,
  getAttachedV4Steps,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  isUnboundV4DocumentChange,
} from '../core/change/document-change';
import { jsonEqual } from '../core/change/json';
import { RootChange } from '../core/change/root-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../core/change/tokens';
import {
  isEmptyPropDelta,
  type V4Place,
  type V4PropDelta,
  type V4Step,
} from '../core/change/v4/types';
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
import {
  COMPARISON_POLICY,
  comparisonChangeHashPayload,
  detachComparisonEnvelope,
} from '../diff/lib/comparison-internal';
import {
  closeOverRequired,
  comparisonPlanOf,
} from '../diff/lib/comparison-plan';
import type { Comparison } from '../diff/lib/comparison-types';
import type { Editor, EditorStateSchemaApi, Value } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { factsOf, membersOf, type ReviewFacts } from './facts/facts';
import { unrepresentable } from './refusal';
import { authoredResolveSchemaOf } from './resolve-schema';
import { AUTHORED_MARKS_KEY, readMembers } from './tree/marks';
import { resolveAuthoredValue } from './tree/resolve';

/** Outcome of proposing a validated document comparison as one native change. */
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
  | Readonly<{ reason: 'actor'; status: 'unavailable' }>;

export type AuthoredComparisonProposer = Readonly<{
  authorId: () => string | null;
  createChangeId: () => string;
  pendingIds: (authorId: string) => ReadonlySet<string>;
}>;

const validComparison = (comparison: Comparison): boolean => {
  try {
    if (
      !jsonEqual(comparison.policy, COMPARISON_POLICY) ||
      !DocumentChange.isDocumentChange(comparison.change) ||
      !Array.isArray(comparison.changes) ||
      !Array.isArray(comparison.diagnostics) ||
      comparison.before.projection !== 'accepted'
    ) {
      return false;
    }

    const prefix = `comparison:${fingerprintEditorJson({
      after: comparison.after.fingerprint,
      before: comparison.before.fingerprint,
      policy: comparison.policy,
    })}`;
    if (
      comparison.id !==
      `${prefix}:${fingerprintEditorJson({
        change: comparisonChangeHashPayload(comparison.change),
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

export const proposeAuthoredComparison = <V extends Value>(
  editor: Editor<V>,
  input: Readonly<{
    comparison: Comparison<V>;
    groupIds?: readonly string[];
  }>,
  proposer: AuthoredComparisonProposer
): AuthoredComparisonImportResult => {
  const { comparison } = input;
  if (!validComparison(comparison)) {
    return { reason: 'comparison', status: 'invalid' };
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
  const envelopeFingerprint = detachComparisonEnvelope(current);
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
  const authorId = proposer.authorId();
  if (authorId === null) {
    return { reason: 'actor', status: 'unavailable' };
  }
  const compare = compareDecided(
    editor,
    current,
    comparison.before.document,
    target
  );
  const pending = proposer.pendingIds(authorId);
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
    const signature = isUnboundV4DocumentChange(write)
      ? write.toJSON()
      : {
          createRoots: [...write.createRoots].sort(),
          deleteRoots: [...write.deleteRoots].sort(),
          roots: [...getInternalDocumentChangeEntries(write)]
            .map(([root, rootChange]) => [root, rootChange.toJSON()] as const)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        };
    if (tried.some((other) => jsonEqual(other, signature))) continue;
    tried.push(signature);
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

const renewInsertedIds = <V extends Value>(
  editor: Editor<V>,
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
  const mapId = (id: string): string => {
    if (beforeIds.has(id)) return id;

    let next = renamed.get(id);

    if (!next) {
      next = compiled.elementIdMint.next();
      renamed.set(id, next);
    }
    changed = true;

    return next;
  };
  const mapNode = (node: JsonNode): JsonNode => {
    if (!isElementNode(node)) return node;

    const nextId = typeof node.id === 'string' ? mapId(node.id) : node.id;
    const nextChildren = node.children.map(mapNode);

    if (
      nextId === node.id &&
      nextChildren.every((child, index) => child === node.children[index])
    ) {
      return node;
    }

    return {
      ...node,
      ...(nextId === undefined ? {} : { id: nextId }),
      children: nextChildren,
    };
  };
  const mapPlace = (place: V4Place): V4Place =>
    'id' in place ? { ...place, id: mapId(place.id) } : place;
  const stripIdDelta = (delta: V4PropDelta): V4PropDelta => {
    const hasSet = delta.set !== undefined && Object.hasOwn(delta.set, 'id');
    const hasUnset = delta.unset?.includes('id') ?? false;
    const hasAdd = delta.add !== undefined && Object.hasOwn(delta.add, 'id');
    const hasRemove =
      delta.remove !== undefined && Object.hasOwn(delta.remove, 'id');

    if (!hasSet && !hasUnset && !hasAdd && !hasRemove) return delta;
    changed = true;

    const omitKey = <T extends Readonly<Record<string, unknown>>>(
      record: T | undefined
    ): T | undefined => {
      if (!record) return undefined;
      const entries = Object.entries(record).filter(([key]) => key !== 'id');

      return entries.length > 0
        ? (Object.fromEntries(entries) as T)
        : undefined;
    };
    const nextSet = omitKey(delta.set);
    const nextUnset = delta.unset?.filter((key) => key !== 'id');
    const nextAdd = omitKey(delta.add);
    const nextRemove = omitKey(delta.remove);

    return {
      ...(nextAdd ? { add: nextAdd } : {}),
      ...(nextRemove ? { remove: nextRemove } : {}),
      ...(nextSet ? { set: nextSet } : {}),
      ...(nextUnset && nextUnset.length > 0 ? { unset: nextUnset } : {}),
    };
  };

  if (!isUnboundV4DocumentChange(change)) {
    const rewriteRoot = <T>(value: T): T => {
      if (Array.isArray(value)) return value.map(rewriteRoot) as T;
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
          const next = mapId(props.id);

          return { ...record, props: { ...props, id: next } } as T;
        }
      }

      const out: Record<string, unknown> = {};

      for (const [k, v] of Object.entries(record)) out[k] = rewriteRoot(v);

      return out as T;
    };

    const nextRoots = new Map<string, RootChange>();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      nextRoots.set(
        root,
        RootChange.fromJSON(rewriteRoot(rootChange.toJSON()))
      );
    }

    if (!changed) {
      if (!getAttachedV4Steps(change)) {
        attachLazyV4Steps(change, before, change.apply(before));
      }

      return change;
    }

    const next = createInternalDocumentChange(nextRoots, {
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    });

    attachLazyV4Steps(next, before, next.apply(before));

    return next;
  }

  const json = change.toJSON();
  const nextSteps: V4Step[] = [];

  for (const step of json.steps ?? []) {
    switch (step.op) {
      case 'insert_text':
      case 'delete_text':
      case 'format_text': {
        nextSteps.push({ ...step, target: mapId(step.target) });
        break;
      }
      case 'insert_node': {
        nextSteps.push({
          ...step,
          node: mapNode(step.node) as JsonElementNode,
          to: mapPlace(step.to),
        });
        break;
      }
      case 'remove_node': {
        nextSteps.push({ ...step, id: mapId(step.id) });
        break;
      }
      case 'move_node': {
        nextSteps.push({
          ...step,
          id: mapId(step.id),
          to: mapPlace(step.to),
        });
        break;
      }
      case 'split_node': {
        nextSteps.push({
          ...step,
          id: mapId(step.id),
          newId: mapId(step.newId),
        });
        break;
      }
      case 'join_nodes': {
        nextSteps.push({
          ...step,
          source: mapId(step.source),
          target: mapId(step.target),
        });
        break;
      }
      case 'set_props': {
        const delta = stripIdDelta(step);

        if (!isEmptyPropDelta(delta)) {
          nextSteps.push({ ...delta, id: mapId(step.id), op: 'set_props' });
        }
        break;
      }
      case 'wrap_inline': {
        nextSteps.push({
          ...step,
          node: mapNode(step.node) as JsonElementNode,
          target: mapId(step.target),
        });
        break;
      }
      case 'unwrap_inline': {
        nextSteps.push({
          ...step,
          id: mapId(step.id),
          parent: mapId(step.parent),
        });
        break;
      }
      case 'create_root':
      case 'delete_root':
      case 'set_register': {
        nextSteps.push(step);
        break;
      }
    }
  }

  return changed
    ? DocumentChange.fromJSON({
        ...(json.records ? { records: json.records } : {}),
        ...(nextSteps.length > 0 ? { steps: nextSteps } : {}),
        version: 4,
      })
    : change;
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

const compareDecided = <V extends Value>(
  editor: Editor<V>,
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
