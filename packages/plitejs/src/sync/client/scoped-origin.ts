import {
  DocumentChange,
  type DocumentChangeJson,
} from '../../core/change/document-change';
import { cloneJson, jsonEqual } from '../../core/change/json';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../../core/change/tokens';
import type { V4Place, V4Step } from '../../core/change/v4/types';
import {
  applyRecordOps,
  EMPTY_RECORD_STORE,
  getRecordText,
  getValueRecords,
  type RecordOpsJson,
  recordOpsFromJson,
  showValueRecords,
  withValueRecords,
} from '../../core/record-store';
import { rebaseOver } from '../protocol';
import type { BatchOrigin, ScopedBlockPlacement } from './outbox';

const STUB_PREFIX = '__scoped_stub__.';

const collectNodeIds = (node: JsonNode, into: Set<string>) => {
  if (!isElementNode(node)) return;
  if (typeof node.id === 'string' && node.id.length > 0) into.add(node.id);
  for (const child of node.children) collectNodeIds(child, into);
};

type StepTouchSummary = Readonly<{
  containers: Set<string>;
  ids: Set<string>;
  records: Set<string>;
  rootLifecycle: Set<string>;
  roots: Set<string>;
  siblingShiftContainers: Set<string>;
}>;

const containerKey = (root: string, parentId: string | null) =>
  parentId === null ? `r:${root}` : `e:${parentId}`;

const placeContainerKey = (place: V4Place): string | null =>
  'root' in place
    ? `r:${place.root}`
    : 'index' in place
      ? `e:${place.id}`
      : null;

const summarizeChange = (json: DocumentChangeJson): StepTouchSummary => {
  const ids = new Set<string>();
  const containers = new Set<string>();
  const siblingShiftContainers = new Set<string>();
  const roots = new Set<string>();
  const rootLifecycle = new Set<string>();
  const records = new Set<string>();

  if (json.records) {
    for (const [set, entries] of Object.entries(json.records)) {
      for (const id of Object.keys(entries)) {
        records.add(`${set}\u0000${id}`);
      }
    }
  }

  for (const step of json.steps ?? []) {
    switch (step.op) {
      case 'insert_text':
      case 'delete_text':
      case 'format_text': {
        ids.add(step.target);
        break;
      }
      case 'insert_node': {
        collectNodeIds(step.node, ids);
        if ('id' in step.to) ids.add(step.to.id);
        if ('root' in step.to) roots.add(step.to.root);

        const cKey = placeContainerKey(step.to);

        if (cKey) {
          containers.add(cKey);
          siblingShiftContainers.add(cKey);
        }
        break;
      }
      case 'remove_node': {
        ids.add(step.id);
        break;
      }
      case 'move_node': {
        ids.add(step.id);
        if ('id' in step.to) ids.add(step.to.id);
        if ('root' in step.to) roots.add(step.to.root);

        const cKey = placeContainerKey(step.to);

        if (cKey) {
          containers.add(cKey);
          siblingShiftContainers.add(cKey);
        }
        break;
      }
      case 'split_node': {
        ids.add(step.id);
        ids.add(step.newId);
        break;
      }
      case 'join_nodes': {
        ids.add(step.source);
        ids.add(step.target);
        break;
      }
      case 'set_props': {
        ids.add(step.id);
        break;
      }
      case 'wrap_inline': {
        ids.add(step.target);
        collectNodeIds(step.node, ids);
        break;
      }
      case 'unwrap_inline': {
        ids.add(step.id);
        ids.add(step.parent);
        break;
      }
      case 'create_root':
      case 'delete_root': {
        roots.add(step.root);
        rootLifecycle.add(step.root);
        break;
      }
      case 'set_register': {
        records.add(`${step.set}\u0000${step.id}`);
        break;
      }
    }
  }

  return {
    containers,
    ids,
    records,
    rootLifecycle,
    roots,
    siblingShiftContainers,
  };
};

type LocatedElement = Readonly<{
  ancestors: readonly string[];
  index: number;
  node: JsonElementNode;
  parentId: string | null;
  root: string;
}>;

const locateElements = (
  value: JsonEditorValue,
  wantedIds: ReadonlySet<string>,
  wantedContainers: ReadonlySet<string>
): Readonly<{
  containerChildIds: Record<string, readonly string[]>;
  placements: Map<string, LocatedElement>;
  topLevelParents: Map<string, LocatedElement>;
}> => {
  const placements = new Map<string, LocatedElement>();
  const topLevelParents = new Map<string, LocatedElement>();
  const containerChildIds: Record<string, readonly string[]> = {};

  const recordContainer = (cKey: string, children: readonly JsonNode[]) => {
    if (!wantedContainers.has(cKey)) return;
    containerChildIds[cKey] = children.map((child, index) =>
      isElementNode(child) &&
      typeof child.id === 'string' &&
      child.id.length > 0
        ? child.id
        : `${STUB_PREFIX}${cKey}.${index}`
    );
  };

  const walk = (
    root: string,
    parentId: string | null,
    nodes: readonly JsonNode[],
    ancestors: readonly string[]
  ) => {
    const cKey = containerKey(root, parentId);

    recordContainer(cKey, nodes);

    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];

      if (!isElementNode(node)) continue;
      const id =
        typeof node.id === 'string' && node.id.length > 0 ? node.id : null;

      if (id && wantedIds.has(id)) {
        placements.set(id, {
          ancestors,
          index,
          node,
          parentId,
          root,
        });
      }
      if (parentId === null && id) {
        topLevelParents.set(id, {
          ancestors: [],
          index,
          node,
          parentId: null,
          root,
        });
      }
      if (id) {
        walk(root, id, node.children, [...ancestors, id]);
      }
    }
  };

  walk('main', null, value.children, []);
  if (value.roots) {
    for (const [root, nodes] of Object.entries(value.roots)) {
      walk(root, null, nodes, []);
    }
  }

  return { containerChildIds, placements, topLevelParents };
};

export const createScopedOrigin = (
  before: JsonEditorValue,
  change: DocumentChangeJson,
  keepFullBefore = false
): BatchOrigin => {
  if (keepFullBefore) {
    return { before, change, since: [] };
  }

  const summary = summarizeChange(change);
  const { containerChildIds, placements, topLevelParents } = locateElements(
    before,
    summary.ids,
    summary.containers
  );

  const capturedTopIds = new Set<string>();
  const beforeBlocks: ScopedBlockPlacement[] = [];
  const hasJoinNodes = (change.steps ?? []).some(
    (step) => step.op === 'join_nodes'
  );
  const joinContainers = new Set<string>();

  for (const [, loc] of placements) {
    const topId = loc.ancestors[0] ?? (loc.node.id as string);

    if (hasJoinNodes) {
      joinContainers.add(containerKey(loc.root, loc.parentId));
    }
    if (capturedTopIds.has(topId)) continue;
    capturedTopIds.add(topId);

    const top = topLevelParents.get(topId) ?? loc;

    beforeBlocks.push({
      ancestors: top.ancestors,
      index: top.index,
      node: cloneJson(top.node),
      parentId: top.parentId,
      root: top.root,
    });
  }

  const mergedContainerChildIds: Record<string, readonly string[]> = {
    ...containerChildIds,
  };

  if (joinContainers.size > 0) {
    const extra = locateElements(before, new Set(), joinContainers);

    Object.assign(mergedContainerChildIds, extra.containerChildIds);
  }
  const allContainers =
    Object.keys(mergedContainerChildIds).length > 0
      ? mergedContainerChildIds
      : undefined;

  let beforeRecords: Record<string, Record<string, string | null>> | undefined;

  if (summary.records.size > 0) {
    const store = getValueRecords(before);

    beforeRecords = {};
    for (const key of summary.records) {
      const sep = key.indexOf('\u0000');
      const set = key.slice(0, sep);
      const id = key.slice(sep + 1);

      beforeRecords[set] ??= {};
      beforeRecords[set][id] = getRecordText(store, set, id) ?? null;
    }
  }

  return {
    beforeBlocks,
    ...(beforeRecords ? { beforeRecords } : {}),
    change,
    ...(allContainers ? { containerChildren: allContainers } : {}),
    since: [],
  };
};

const originTouchSet = (origin: BatchOrigin) => {
  const ids = new Set<string>();
  const roots = new Set<string>();
  const containers = new Set<string>();
  const records = new Set<string>();

  for (const block of origin.beforeBlocks ?? []) {
    roots.add(block.root);
    for (const anc of block.ancestors) ids.add(anc);
    collectNodeIds(block.node, ids);
  }
  for (const cKey of Object.keys(origin.containerChildren ?? {})) {
    containers.add(cKey);
    if (cKey.startsWith('e:')) ids.add(cKey.slice(2));
    else if (cKey.startsWith('r:')) roots.add(cKey.slice(2));
  }
  for (const json of [origin.change, ...origin.since]) {
    const summary = summarizeChange(json);

    for (const id of summary.ids) ids.add(id);
    for (const root of summary.roots) roots.add(root);
    for (const cKey of summary.containers) containers.add(cKey);
    for (const rec of summary.records) records.add(rec);
  }

  return { containers, ids, records, roots };
};

const carriedTouchesOrigin = (
  tracked: ReturnType<typeof originTouchSet>,
  carried: DocumentChangeJson,
  beforeDoc?: JsonEditorValue
): boolean => {
  const summary = summarizeChange(carried);

  for (const id of summary.ids) {
    if (tracked.ids.has(id)) return true;
  }
  for (const root of summary.rootLifecycle) {
    if (tracked.roots.has(root)) return true;
  }
  for (const rec of summary.records) {
    if (tracked.records.has(rec)) return true;
  }
  for (const cKey of summary.siblingShiftContainers) {
    if (tracked.containers.has(cKey)) return true;
  }
  if (tracked.containers.size > 0 && beforeDoc && carried.steps?.length) {
    const sourceIds = new Set<string>();

    for (const step of carried.steps) {
      if (
        step.op === 'remove_node' ||
        step.op === 'move_node' ||
        step.op === 'split_node'
      ) {
        sourceIds.add(step.id);
      } else if (step.op === 'join_nodes') {
        sourceIds.add(step.source);
        sourceIds.add(step.target);
      }
    }
    if (sourceIds.size > 0) {
      const located = locateElements(beforeDoc, sourceIds, new Set());

      for (const loc of located.placements.values()) {
        if (tracked.containers.has(containerKey(loc.root, loc.parentId))) {
          return true;
        }
      }
    }
  }

  return false;
};

export const appendRelevantSince = (
  origin: BatchOrigin,
  carried: DocumentChangeJson,
  beforeDoc?: JsonEditorValue
): BatchOrigin => {
  if (origin.gap) return origin;
  if (origin.before !== undefined) {
    return { ...origin, since: [...origin.since, carried] };
  }

  const tracked = originTouchSet(origin);

  if (!carriedTouchesOrigin(tracked, carried, beforeDoc)) {
    return origin;
  }

  let beforeBlocks = origin.beforeBlocks ?? [];

  if (beforeDoc) {
    const carriedSummary = summarizeChange(carried);
    const missingIds = new Set<string>();

    for (const id of carriedSummary.ids) {
      if (!tracked.ids.has(id)) missingIds.add(id);
    }
    if (missingIds.size > 0) {
      const existingTopIds = new Set(
        beforeBlocks
          .map((block) => block.node.id)
          .filter((id): id is string => typeof id === 'string')
      );
      const { placements, topLevelParents } = locateElements(
        beforeDoc,
        missingIds,
        new Set()
      );
      const added: ScopedBlockPlacement[] = [];

      for (const loc of placements.values()) {
        const topId = loc.ancestors[0] ?? (loc.node.id as string);

        if (existingTopIds.has(topId)) continue;
        existingTopIds.add(topId);

        const top = topLevelParents.get(topId) ?? loc;

        added.push({
          ancestors: top.ancestors,
          index: top.index,
          node: cloneJson(top.node),
          parentId: top.parentId,
          root: top.root,
        });
      }
      if (added.length > 0) {
        beforeBlocks = [...beforeBlocks, ...added];
      }
    }
  }

  return {
    ...origin,
    beforeBlocks,
    since: [...origin.since, carried],
  };
};

const buildScopedBase = (origin: BatchOrigin): JsonEditorValue => {
  const byRoot = new Map<string, ScopedBlockPlacement[]>();

  for (const block of origin.beforeBlocks ?? []) {
    const list = byRoot.get(block.root);

    if (list) list.push(block);
    else byRoot.set(block.root, [block]);
  }

  const buildRootChildren = (
    root: string,
    blocks: readonly ScopedBlockPlacement[]
  ): JsonNode[] => {
    const orderedIds = origin.containerChildren?.[`r:${root}`];
    const blockById = new Map<string, JsonElementNode>();

    for (const block of blocks) {
      if (typeof block.node.id === 'string') {
        blockById.set(block.node.id, cloneJson(block.node));
      }
    }

    if (orderedIds) {
      const used = new Set<string>();
      const out: JsonNode[] = orderedIds.map((id, index) => {
        const real = blockById.get(id);

        if (real) {
          used.add(id);

          return real;
        }

        return {
          children: [{ text: '' }],
          id: `${STUB_PREFIX}${root}.${index}`,
          type: 'paragraph',
        };
      });

      for (const [id, node] of blockById) {
        if (!used.has(id)) out.push(node);
      }

      return out;
    }

    return [...blocks]
      .sort((a, b) => a.index - b.index)
      .map((block) => cloneJson(block.node));
  };

  const mainBlocks = byRoot.get('main') ?? [];
  const children = buildRootChildren('main', mainBlocks);

  if (children.length === 0) {
    children.push({
      children: [{ text: '' }],
      id: `${STUB_PREFIX}main.empty`,
      type: 'paragraph',
    });
  }

  const roots: Record<string, readonly JsonNode[]> = {};

  for (const [root, blocks] of byRoot) {
    if (root === 'main') continue;
    roots[root] = buildRootChildren(root, blocks);
  }
  for (const cKey of Object.keys(origin.containerChildren ?? {})) {
    if (!cKey.startsWith('r:')) continue;

    const root = cKey.slice(2);

    if (root !== 'main' && !Object.hasOwn(roots, root)) {
      roots[root] = buildRootChildren(root, []);
    }
  }

  const records: Record<string, Record<string, string>> = {};

  for (const [set, entries] of Object.entries(origin.beforeRecords ?? {})) {
    for (const [id, text] of Object.entries(entries)) {
      if (text === null) continue;
      records[set] ??= {};
      records[set][id] = text;
    }
  }

  const base: JsonEditorValue = {
    children,
    ...(Object.keys(roots).length > 0 ? { roots } : {}),
  };

  if (Object.keys(records).length > 0) {
    const store = applyRecordOps(
      EMPTY_RECORD_STORE,
      recordOpsFromJson(records)
    );
    const mutable: Record<string, unknown> = { ...base };

    withValueRecords(mutable, store);
    showValueRecords(mutable, store);

    return mutable as JsonEditorValue;
  }

  return base;
};

const indexNonStubElements = (
  value: JsonEditorValue
): Map<string, JsonElementNode> => {
  const map = new Map<string, JsonElementNode>();
  const walk = (nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (
        typeof node.id === 'string' &&
        node.id.length > 0 &&
        !node.id.startsWith(STUB_PREFIX)
      ) {
        map.set(node.id, node);
      }
      walk(node.children);
    }
  };

  walk(value.children);
  if (value.roots) {
    for (const nodes of Object.values(value.roots)) walk(nodes);
  }

  return map;
};

export const recoverScopedOrigin = (
  origin: BatchOrigin,
  at: JsonEditorValue,
  later: readonly DocumentChangeJson[],
  view: JsonEditorValue
):
  | Readonly<{
      change: DocumentChange;
      draft: JsonEditorValue;
      ok: true;
      scopedBase: JsonEditorValue;
    }>
  | Readonly<{ ok: false; refused: 'conflict' | 'gap' }> => {
  if (origin.gap) return { ok: false, refused: 'gap' };

  const scopedBase = buildScopedBase(origin);
  let own: DocumentChange;

  try {
    own = DocumentChange.fromJSON(origin.change);
  } catch {
    return { ok: false, refused: 'gap' };
  }

  let reached = scopedBase;

  try {
    for (const json of origin.since) {
      reached = DocumentChange.fromJSON(json).apply(reached);
    }
  } catch {
    return { ok: false, refused: 'gap' };
  }

  const reachedElements = indexNonStubElements(reached);
  const atElements = indexNonStubElements(at);

  for (const [id, node] of reachedElements) {
    const live = atElements.get(id);

    if (!live || !jsonEqual(live, node)) {
      return { ok: false, refused: 'gap' };
    }
  }

  if (origin.beforeRecords) {
    const reachedStore = getValueRecords(reached);
    const atStore = getValueRecords(at);

    for (const [set, entries] of Object.entries(origin.beforeRecords)) {
      for (const id of Object.keys(entries)) {
        if (
          getRecordText(reachedStore, set, id) !==
          getRecordText(atStore, set, id)
        ) {
          return { ok: false, refused: 'gap' };
        }
      }
    }
  }

  let effectiveOrigin = origin;
  const relevantLater: DocumentChangeJson[] = [];

  for (const json of later) {
    const tracked = originTouchSet(effectiveOrigin);

    if (carriedTouchesOrigin(tracked, json, at)) {
      relevantLater.push(json);
      effectiveOrigin = appendRelevantSince(effectiveOrigin, json, at);
    }
  }

  try {
    const rebase = rebaseOver(
      [...origin.since, ...relevantLater].map((json) =>
        DocumentChange.fromJSON(json)
      ),
      own,
      scopedBase
    );

    if (rebase.kind !== 'rebased') return { ok: false, refused: 'conflict' };

    const draft = rebase.change.apply(view);

    return { change: rebase.change, draft, ok: true, scopedBase };
  } catch {
    return { ok: false, refused: 'conflict' };
  }
};

export const remintIntroducedIds = (
  change: DocumentChange,
  before: JsonEditorValue,
  mint: () => string
): DocumentChange => {
  const json = change.toJSON();

  if (!json.steps || json.steps.length === 0) return change;

  const liveIds = indexNonStubElements(before);
  const renamed = new Map<string, string>();
  let changed = false;

  const mapExistingOrRenamed = (id: string): string => renamed.get(id) ?? id;
  const mintFresh = (id: string): string => {
    if (liveIds.has(id)) return id;

    let next = renamed.get(id);

    if (!next) {
      next = mint();
      renamed.set(id, next);
    }
    changed = true;

    return next;
  };
  const remapNode = (node: JsonNode): JsonNode => {
    if (!isElementNode(node)) return node;

    const nextId = typeof node.id === 'string' ? mintFresh(node.id) : node.id;
    const nextChildren = node.children.map(remapNode);

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
  const remapPlace = (place: V4Place): V4Place =>
    'id' in place ? { ...place, id: mapExistingOrRenamed(place.id) } : place;

  const nextSteps: V4Step[] = json.steps.map((step): V4Step => {
    switch (step.op) {
      case 'insert_text':
      case 'delete_text':
      case 'format_text': {
        return { ...step, target: mapExistingOrRenamed(step.target) };
      }
      case 'insert_node': {
        return {
          ...step,
          node: remapNode(step.node) as JsonElementNode,
          to: remapPlace(step.to),
        };
      }
      case 'remove_node':
      case 'set_props': {
        return { ...step, id: mapExistingOrRenamed(step.id) };
      }
      case 'move_node': {
        return {
          ...step,
          id: mapExistingOrRenamed(step.id),
          to: remapPlace(step.to),
        };
      }
      case 'split_node': {
        return {
          ...step,
          id: mapExistingOrRenamed(step.id),
          newId: mintFresh(step.newId),
        };
      }
      case 'join_nodes': {
        return {
          ...step,
          source: mapExistingOrRenamed(step.source),
          target: mapExistingOrRenamed(step.target),
        };
      }
      case 'wrap_inline': {
        return {
          ...step,
          node: remapNode(step.node) as JsonElementNode,
          target: mapExistingOrRenamed(step.target),
        };
      }
      case 'unwrap_inline': {
        return {
          ...step,
          id: mapExistingOrRenamed(step.id),
          parent: mapExistingOrRenamed(step.parent),
        };
      }
      case 'create_root':
      case 'delete_root':
      case 'set_register': {
        return step;
      }
      default: {
        const _exhaustive: never = step;

        return _exhaustive;
      }
    }
  });

  if (!changed) return change;

  const records: RecordOpsJson | undefined = json.records;

  return DocumentChange.fromJSON({
    ...(records ? { records } : {}),
    steps: nextSteps,
    version: 4,
  });
};
