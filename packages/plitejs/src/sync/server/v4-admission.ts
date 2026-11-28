import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../../core/change/tokens';
import type { V4Step } from '../../core/change/v4/types';
import {
  canonicalRecordJson,
  getRecordEntries,
  getValueRecords,
} from '../../core/record-store';
import { parseScopedElementId } from '../../core/reserved-element-id';
import type { SyncGrant } from './grant';
import type { DeletedIdRecord, ScopeRecord, SyncStorage } from './storage';

const sha256Hex = async (text: string): Promise<string> => {
  const bytes = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  );

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

export const canonicalElementHash = (node: JsonElementNode): Promise<string> =>
  sha256Hex(canonicalRecordJson(node));

const collectElements = (
  value: JsonEditorValue
): Map<string, JsonElementNode> => {
  const elements = new Map<string, JsonElementNode>();
  const walk = (nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (typeof node.id === 'string' && node.id.length > 0) {
        elements.set(node.id, node);
      }
      walk(node.children);
    }
  };

  walk(value.children);
  if (value.roots) {
    for (const nodes of Object.values(value.roots)) {
      walk(nodes);
    }
  }

  return elements;
};

const collectAuthoredReserveIds = (value: JsonEditorValue): Set<string> => {
  const ids = new Set<string>();
  const store = getValueRecords(value);

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);

      return;
    }

    const record = node as Record<string, unknown>;

    if (typeof record.id === 'string' && record.id.length > 0) {
      ids.add(record.id);
    }
    if (Array.isArray(record.children)) walk(record.children);
    if (record.node && typeof record.node === 'object') walk(record.node);
  };

  for (const [, text] of getRecordEntries(store, 'authored-reserves')) {
    try {
      walk(JSON.parse(text));
    } catch {
      // ignore
    }
  }

  return ids;
};

export type V4AdmissionOutcome =
  | Readonly<{
      deletedIds: readonly DeletedIdRecord[];
      ok: true;
      restoredIds: readonly string[];
      scopes: readonly ScopeRecord[];
    }>
  | Readonly<{ ok: false; reason: 'invalid' }>;

export const checkV4Admission = async ({
  after,
  before,
  grant,
  isRoomDecisionReplay = false,
  isTakeBack,
  roomName,
  source,
  steps,
  storage,
  version,
  writer,
}: Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  grant: SyncGrant;
  isRoomDecisionReplay?: boolean;
  isTakeBack: boolean;
  roomName: string;
  source: 'peer' | 'server';
  steps: readonly V4Step[];
  storage: SyncStorage;
  version: number;
  writer: string;
}>): Promise<V4AdmissionOutcome> => {
  const canAlterElementSet = steps.some(
    (step) =>
      step.op === 'insert_node' ||
      step.op === 'remove_node' ||
      step.op === 'split_node' ||
      step.op === 'join_nodes' ||
      step.op === 'wrap_inline' ||
      step.op === 'unwrap_inline' ||
      step.op === 'delete_root' ||
      step.op === 'delete_text'
  );

  if (!canAlterElementSet) {
    return { deletedIds: [], ok: true, restoredIds: [], scopes: [] };
  }

  const liveBefore = collectElements(before);
  const liveAfter = collectElements(after);
  const joinedSources = new Map<string, string>();
  const splitNewIds = new Map<string, string>();

  for (const step of steps) {
    if (step.op === 'join_nodes') {
      joinedSources.set(step.source, step.target);
    } else if (step.op === 'split_node') {
      splitNewIds.set(step.newId, step.id);
    }
  }

  const deletedIds: DeletedIdRecord[] = [];

  for (const [id, node] of liveBefore) {
    if (liveAfter.has(id)) continue;

    const targetId = joinedSources.get(id);

    if (targetId !== undefined) {
      deletedIds.push({
        deletedBy: writer,
        id,
        kind: 'joined',
        nodeHash: null,
        targetId,
        version,
      });
    } else {
      deletedIds.push({
        deletedBy: writer,
        id,
        kind: 'removed',
        nodeHash: await canonicalElementHash(node),
        targetId: null,
        version,
      });
    }
  }

  const introducedIds: string[] = [];

  for (const id of liveAfter.keys()) {
    if (!liveBefore.has(id)) introducedIds.push(id);
  }

  if (introducedIds.length === 0) {
    return { deletedIds, ok: true, restoredIds: [], scopes: [] };
  }

  const reserveIds = collectAuthoredReserveIds(before);
  const storedDeleted = await storage.deletedIds(roomName, introducedIds);
  const deletedById = new Map(
    storedDeleted.map((record) => [record.id, record])
  );
  const freshScopes = new Set<string>();

  for (const id of introducedIds) {
    if (reserveIds.has(id) || deletedById.has(id)) continue;

    const parsed = parseScopedElementId(id);

    if (parsed) freshScopes.add(parsed.scope);
  }

  const storedScopes =
    freshScopes.size > 0
      ? await storage.scopes(roomName, [...freshScopes])
      : [];
  const scopeByName = new Map(
    storedScopes.map((record) => [record.scope, record])
  );
  const restoredIds: string[] = [];
  const nextScopeMax = new Map<string, number>();

  for (const id of introducedIds) {
    if (reserveIds.has(id)) continue;

    const priorDeleted = deletedById.get(id);

    if (priorDeleted) {
      if (priorDeleted.kind === 'removed') {
        const canRestore =
          priorDeleted.deletedBy === writer ||
          source === 'server' ||
          isTakeBack ||
          grant.decide;
        const node = liveAfter.get(id);

        if (
          !canRestore ||
          !node ||
          priorDeleted.nodeHash === null ||
          (await canonicalElementHash(node)) !== priorDeleted.nodeHash
        ) {
          return { ok: false, reason: 'invalid' };
        }
      } else {
        const splitTarget = splitNewIds.get(id);

        if (
          priorDeleted.targetId === null ||
          splitTarget !== priorDeleted.targetId
        ) {
          return { ok: false, reason: 'invalid' };
        }
      }
      restoredIds.push(id);
      continue;
    }

    if (isRoomDecisionReplay) {
      continue;
    }

    const parsed = parseScopedElementId(id);

    if (!parsed || parsed.scope === 'fill') {
      return { ok: false, reason: 'invalid' };
    }

    const existingScope = scopeByName.get(parsed.scope);

    if (existingScope) {
      if (existingScope.writer === null || existingScope.writer !== writer) {
        return { ok: false, reason: 'invalid' };
      }
      if (parsed.counter <= existingScope.maxCounter) {
        return { ok: false, reason: 'invalid' };
      }
    }

    const prevMax = nextScopeMax.get(parsed.scope);

    if (prevMax === undefined || parsed.counter > prevMax) {
      nextScopeMax.set(parsed.scope, parsed.counter);
    }
  }

  const scopes: ScopeRecord[] = [...nextScopeMax.entries()].map(
    ([scope, maxCounter]) => ({
      maxCounter,
      scope,
      writer,
    })
  );

  return { deletedIds, ok: true, restoredIds, scopes };
};
