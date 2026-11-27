import type { EditorDocumentValue, RootKey } from '../interfaces/editor';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  valueRootIndex,
} from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import type { PropertyModification } from './change/transform';
import { MAIN_ROOT_KEY } from './public-root';

export type DocumentChangeSection =
  | Readonly<{
      fromA: number;
      fromB: number;
      kind: 'properties';
      modifications: readonly PropertyModification[];
      root: RootKey;
      toA: number;
      toB: number;
    }>
  | Readonly<{
      fromA: number;
      fromB: number;
      kind: 'replace';
      root: RootKey;
      toA: number;
      toB: number;
    }>;

/**
 * Walk each unmerged changed section of `change` across every affected root.
 * Return `false` from `visit` to stop early.
 *
 * @internal
 */
export const visitDocumentChangeSections = (
  change: DocumentChange,
  visit: (section: DocumentChangeSection) => boolean | void
): void => {
  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const { data, sections } = rootChange;
    let posA = 0;
    let posB = 0;

    for (let index = 0; index < sections.length; index += 2) {
      const length = sections[index];
      const inserted = sections[index + 1];

      if (length === undefined || inserted === undefined) break;

      if (inserted === -1) {
        posA += length;
        posB += length;
        continue;
      }

      if (inserted === -2) {
        const stop = visit({
          fromA: posA,
          fromB: posB,
          kind: 'properties',
          modifications: data[index / 2] as readonly PropertyModification[],
          root,
          toA: posA + length,
          toB: posB + length,
        });

        if (stop === false) return;
        posA += length;
        posB += length;
        continue;
      }

      const stop = visit({
        fromA: posA,
        fromB: posB,
        kind: 'replace',
        root,
        toA: posA + length,
        toB: posB + inserted,
      });

      if (stop === false) return;
      posA += length;
      posB += inserted;
    }
  }
};

/**
 * Return the lazy `DocumentIndex` for `root` in `value`, or `null` when that
 * named root does not exist in `value`.
 *
 * @internal
 */
export const readCommitRootIndex = (
  value: EditorDocumentValue,
  root: RootKey
): DocumentIndex | null => {
  if (root !== MAIN_ROOT_KEY && !Object.hasOwn(value.roots ?? {}, root)) {
    return null;
  }

  return valueRootIndex(value, root);
};
