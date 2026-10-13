import {
  bindDocumentChangeNodeKeys,
  getInternalDocumentChangeEntries,
  type DocumentChange,
} from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import {
  getDocumentSliceNodeKeys,
  PreparedTokenSlice,
  type JsonEditorValue,
} from '../core/change/tokens';
import { defineEffect } from '../core/transaction-values';
import type { NodeKey } from '../interfaces/editor';
import type { EditorJsonValue } from '../interfaces/json';
import { authoredPositionAt } from './positions';
import { readRecord } from './record-tree';
import {
  decodeAuthoredViewSelection,
  type AuthoredViewSelection,
} from './selection';
import { decodeAuthoredEdit, type AuthoredEdit } from './state';
import { authoredRootNodes, type AuthoredPositionRoots } from './steps';

type AuthoredNodeRecovery = ReadonlyArray<
  Readonly<{ root: string; origin: string; offset: number; key: NodeKey }>
>;

export type AuthoredHistoryNodeKeys = Readonly<{
  accepted: AuthoredNodeRecovery;
  proposed: AuthoredNodeRecovery;
}>;

export const captureAuthoredHistoryNodeKeys = (
  inverse: DocumentChange,
  positions: AuthoredPositionRoots
): AuthoredNodeRecovery => {
  const recovered: Array<AuthoredNodeRecovery[number]> = [];
  for (const [root, change] of getInternalDocumentChangeEntries(inverse)) {
    const indexed = readRecord(positions, root);
    if (!indexed?.present) continue;
    let position = 0;
    for (
      let section = 0, data = 0;
      section < change.sections.length;
      section += 2, data++
    ) {
      const length = change.sections[section];
      const inserted = change.sections[section + 1];
      const slice = change.data[data];
      if (inserted > 0 && slice instanceof PreparedTokenSlice) {
        for (const [offset, key] of getDocumentSliceNodeKeys(slice)) {
          const token = authoredPositionAt(
            indexed.positions,
            position + offset
          ).right;
          if (token) recovered.push({ root, ...token, key });
        }
      }
      position += inserted < 0 ? length : inserted;
    }
  }
  return recovered;
};

export const restoreAuthoredHistoryNodeKeys = (
  change: DocumentChange,
  after: JsonEditorValue,
  positions: AuthoredPositionRoots,
  recovered: AuthoredNodeRecovery | undefined
) => {
  if (!recovered?.length) return change;
  const keys = new Map(
    recovered.map(({ root, origin, offset, key }) => [
      JSON.stringify([root, origin, offset]),
      key,
    ])
  );
  return bindDocumentChangeNodeKeys(change, after, (root, path) => {
    const indexed = readRecord(positions, root);
    if (!indexed?.present) return null;
    const start = DocumentIndex.fromValue(
      authoredRootNodes(after, root)
    ).nodeRange(path).from;
    const token = authoredPositionAt(indexed.positions, start).right;
    return token
      ? (keys.get(JSON.stringify([root, token.origin, token.offset])) ?? null)
      : null;
  });
};

type AuthoredHistory = Readonly<{
  id: string;
  retained: readonly AuthoredEdit[];
  inverseSelection?: AuthoredViewSelection;
  selection?: AuthoredViewSelection;
  nodeKeys?: AuthoredHistoryNodeKeys;
}>;

export const authoredHistoryEffect = defineEffect<AuthoredHistory>({
  key: 'authored.history',
  history: 'skip',
  persist: {
    decode(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid authored history operation.');
      }
      const data = value as Record<string, unknown>;
      if (
        Object.keys(data).some(
          (key) =>
            key !== 'id' &&
            key !== 'retained' &&
            key !== 'selection' &&
            key !== 'inverseSelection'
        ) ||
        typeof data.id !== 'string' ||
        !data.id ||
        data.id.includes('\u0000') ||
        !Array.isArray(data.retained)
      ) {
        throw new Error('Invalid authored history operation.');
      }
      return {
        id: data.id,
        retained: data.retained.map(decodeAuthoredEdit),
        ...(Object.hasOwn(data, 'inverseSelection')
          ? {
              inverseSelection: decodeAuthoredViewSelection(
                data.inverseSelection
              ),
            }
          : {}),
        ...(Object.hasOwn(data, 'selection')
          ? { selection: decodeAuthoredViewSelection(data.selection) }
          : {}),
      };
    },
    encode: ({ nodeKeys: _nodeKeys, ...value }) =>
      value as unknown as EditorJsonValue,
    version: 1,
  },
});
