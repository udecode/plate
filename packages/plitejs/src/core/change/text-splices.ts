import type { EditorCommit, NodeKey, RootKey } from '../../interfaces/editor';
import { getEditorCommitSnapshot } from '../commit';
import { toPublicRoot } from '../public-root';
import { getInternalDocumentRootChange } from './document-change';
import { DocumentIndex } from './document-index';
import { isTextNode } from './tokens';

/** A replacement in before-document UTF-16 coordinates. @internal */
export type TextSplice = Readonly<{ from: number; insert: string; to: number }>;

type TextSpliceProjection = Readonly<{
  /** Missing means unchanged; null requires canonical replacement. */
  changes: ReadonlyMap<NodeKey, readonly TextSplice[] | null>;
  insertedCodeUnits: number;
  visitedSections: number;
}>;

const projections = new WeakMap<
  EditorCommit,
  Map<RootKey, TextSpliceProjection>
>();

/** Project a root's canonical edits once, shared by every mounted view. @internal */
export const projectEditorTextSplices = (
  commit: EditorCommit,
  root: RootKey = 'main'
): TextSpliceProjection => {
  let roots = projections.get(commit);
  if (!roots) {
    roots = new Map();
    projections.set(commit, roots);
  }
  const cached = roots.get(root);
  if (cached) return cached;

  const changes = new Map<NodeKey, TextSplice[] | null>();
  let insertedCodeUnits = 0;
  let visitedSections = 0;
  const change = getInternalDocumentRootChange(commit.changes, root);
  const changedKeys = commit.changed.nodeKeys('text', toPublicRoot(root));

  if (change && changedKeys.length > 0) {
    const before = getEditorCommitSnapshot(commit, root, 'before');
    const after = getEditorCommitSnapshot(commit, root);
    const beforeDocument = DocumentIndex.fromValue(before.children);
    const afterDocument = DocumentIndex.fromValue(after.children);
    const wanted = new Set(changedKeys);
    const unlocalized = new Set<NodeKey>();
    const invalidateTouched = (
      document: DocumentIndex,
      snapshot: typeof before,
      from: number,
      to: number
    ) => {
      for (const entry of document.nodeRangesTouching(from, to)) {
        if (entry.kind !== 'text') continue;
        if (
          from === to
            ? from < entry.contentFrom || from > entry.contentTo
            : entry.from >= to || entry.to <= from
        ) {
          continue;
        }
        const key = snapshot.index.keyAt(entry.path);
        if (key && wanted.has(key)) unlocalized.add(key);
      }
    };
    let positionA = 0;
    let positionB = 0;

    for (let index = 0; index < change.sections.length; index += 2) {
      visitedSections += 1;
      const length = change.sections[index];
      const inserted = change.sections[index + 1];

      if (inserted >= 0) {
        const beforeText = beforeDocument.textAt(positionA);
        const afterText = afterDocument.textAt(positionB);
        const beforeKey = beforeText && before.index.keyAt(beforeText.path);
        const afterKey = afterText && after.index.keyAt(afterText.path);

        if (
          beforeText &&
          afterText &&
          beforeKey &&
          beforeKey === afterKey &&
          wanted.has(beforeKey) &&
          positionA >= beforeText.contentFrom &&
          positionA + length <= beforeText.contentTo &&
          positionB >= afterText.contentFrom &&
          positionB + inserted <= afterText.contentTo
        ) {
          const node = afterDocument.node(afterText.path);
          if (isTextNode(node)) {
            const splices = changes.get(beforeKey) ?? [];
            const start = positionB - afterText.contentFrom;
            // Read only the inserted range; unchanged text is never diffed.
            const insert = node.text.slice(start, start + inserted);
            const from = positionA - beforeText.contentFrom;
            const to = from + length;
            const previous = splices.at(-1);
            if (previous?.to === from) {
              splices[splices.length - 1] = Object.freeze({
                from: previous.from,
                insert: previous.insert + insert,
                to,
              });
            } else {
              splices.push(Object.freeze({ from, insert, to }));
            }
            changes.set(beforeKey, splices);
            insertedCodeUnits += insert.length;
          }
        } else {
          invalidateTouched(
            beforeDocument,
            before,
            positionA,
            positionA + length
          );
          invalidateTouched(
            afterDocument,
            after,
            positionB,
            positionB + inserted
          );
        }
      }
      positionA += length;
      positionB += inserted < 0 ? length : inserted;
    }

    for (const key of changedKeys) {
      const splices = changes.get(key);
      const beforePath = before.index.pathOf(key);
      const afterPath = after.index.pathOf(key);
      const beforeNode = beforePath && beforeDocument.node(beforePath);
      const afterNode = afterPath && afterDocument.node(afterPath);
      const delta = splices?.reduce(
        (size, splice) =>
          size + splice.insert.length - (splice.to - splice.from),
        0
      );

      if (
        unlocalized.has(key) ||
        !beforeNode ||
        !afterNode ||
        !isTextNode(beforeNode) ||
        !isTextNode(afterNode) ||
        beforeNode.text.length + (delta ?? 0) !== afterNode.text.length
      ) {
        changes.set(key, null);
      } else if (splices) {
        Object.freeze(splices);
      }
    }
  }
  const projection = Object.freeze({
    changes,
    insertedCodeUnits,
    visitedSections,
  });
  roots.set(root, projection);
  return projection;
};
