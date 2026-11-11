import {
  hasInternalDocumentChangeRoot,
  mapInternalDocumentChangePosition,
  valueRoot,
  valueRootIndex,
  valueRootNodes,
} from '../../core/change/document-change';
import type { NodeList } from '../../core/change/document-index';
import { withoutRepairOrphans } from '../../core/document-admission';
import { getEditorSchema } from '../../core/editor-runtime';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import { toInternalRoot as normalizeRootKey } from '../../core/public-root';
import {
  type AdmittedRepair,
  getCurrentSelection,
  runTrustedUpdate,
} from '../../core/public-state';
import { withoutPlacement } from '../../core/view-carets';
import type {
  Descendant,
  DocumentChange,
  EditorDocumentValue,
  EditorSelection,
  EditorUpdatePolicy,
  JsonEditorValue,
  Path,
  Range,
  Selection,
} from '../../index';
import { NodeApi, RangeApi, SelectionApi } from '../../index';
import type { YjsEditor } from './editor-types';
import type { PendingYjsEffect } from './shared-effect-log';

type YjsRemoteImport = Readonly<{
  replacement?: EditorDocumentValue;
  change?: DocumentChange;
  effects: readonly PendingYjsEffect[];
  /** Record writes applied before the content change, in the same commit. */
  records?: DocumentChange | null;
  selection?: Range | Selection;
}>;

export type YjsImportOutcome = Readonly<{
  admission: AdmittedRepair | null;
  deletedRoots: readonly string[];
}>;

export type YjsEditorAdapter = {
  readonly applyRemote: (
    input: YjsRemoteImport,
    beforeListeners: (outcome: YjsImportOutcome) => void
  ) => void;
  readonly canonicalize: (
    root: string,
    children: readonly Descendant[]
  ) => readonly Descendant[];
  readonly canonicalizeDocument: (value: JsonEditorValue) => JsonEditorValue;
  readonly importing: () => boolean;
  readonly readChildren: (root: string) => readonly Descendant[];
  readonly readValue: () => EditorDocumentValue;
};

/**
 * Update policies for host adapters that import canonical `DocumentChange`
 * values without the built-in Yjs binding. `remote` marks the commit as a
 * remote Yjs import, so history and outbound subscriptions treat it like the
 * binding's own imports.
 */
export const YjsUpdatePolicy = Object.freeze({
  remote: Object.freeze({
    tags: Object.freeze([
      'collaboration',
      'remote-yjs-import',
      'history-skip',
      'skip-dom-selection',
      'skip-selection-focus',
      'skip-scroll-into-view',
    ]),
  } satisfies EditorUpdatePolicy),
});

/** Reads the top-level node through `at`, so a lazy root builds no array. */
const nodeAtImportPath = (children: NodeList<Descendant>, path: Path) => {
  const top = path[0] === undefined ? undefined : children.at(path[0]);

  return top === undefined || path.length === 1
    ? top
    : NodeApi.getIf(top, path.slice(1));
};

const sanitizeImportSelection = (
  children: NodeList<Descendant>,
  selection: Range | Selection
): EditorSelection | null => {
  if (selection === null) {
    return null;
  }
  if (SelectionApi.isNode(selection)) {
    return selection.paths.every((path) => nodeAtImportPath(children, path))
      ? SelectionApi.nodes(selection.paths, {
          anchorPath: selection.anchorPath,
          focusPath: selection.focusPath,
          mode: selection.mode,
          ...(selection.root === undefined ? {} : { root: selection.root }),
        })
      : null;
  }
  if ('kind' in selection && selection.kind !== 'text') return null;

  return isValidImportSelectionPoint(children, selection.anchor) &&
    isValidImportSelectionPoint(children, selection.focus)
    ? SelectionApi.text(selection)
    : null;
};

/**
 * Map a text range through an import's change. Null when the change deletes
 * the content around a point, as a value diff that replaces its block does.
 */
const mapImportRange = (
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  root: string,
  range: Range
): Range | null => {
  if (!hasInternalDocumentChangeRoot(change, root)) return range;

  const nodes = valueRootNodes(before, root) as NodeList<Descendant>;

  if (
    !isValidImportSelectionPoint(nodes, range.anchor) ||
    !isValidImportSelectionPoint(nodes, range.focus)
  ) {
    return null;
  }

  const source = valueRootIndex(before, root);
  const target = valueRootIndex(after, root);
  const map = (point: Range['anchor']) => {
    const position = mapInternalDocumentChangePosition(
      change,
      root,
      source.positionAt(point),
      -1,
      'around'
    );
    const mapped = position === null ? null : target.pointAt(position, -1);

    return mapped && { ...point, offset: mapped.offset, path: mapped.path };
  };
  const anchor = map(range.anchor);
  const focus = map(range.focus);

  return anchor && focus ? { ...range, anchor, focus } : null;
};

const isValidImportSelectionPoint = (
  children: NodeList<Descendant>,
  point: Range['anchor']
): boolean => {
  const node = nodeAtImportPath(children, point.path);

  return (
    node !== undefined &&
    NodeApi.isText(node) &&
    point.offset >= 0 &&
    point.offset <= node.text.length
  );
};

const NO_ROOTS: readonly string[] = Object.freeze([]);

export const createYjsEditorAdapter = (
  editor: YjsEditor,
  canonicalize: YjsEditorAdapter['canonicalize']
): YjsEditorAdapter => {
  let importing = 0;

  const readValue = (): EditorDocumentValue => editor.read.value();
  const readChildren = (root: string): readonly Descendant[] => {
    const value = readValue();

    return root === 'main' ? value.children : (value.roots?.[root] ?? []);
  };
  const applyRemote: YjsEditorAdapter['applyRemote'] = (
    { replacement, change, effects, records, selection },
    beforeListeners
  ) => {
    const currentValue = readValue();
    // Two peers can each remove one owner of a shared root, so neither update
    // deletes it; the merge orphans it, and a closed schema refuses that
    // change unless the import drops the root with it.
    const imported =
      change && !change.empty && editor.read.schema.hasContentRoots()
        ? withoutRepairOrphans(getCompiledEditorSchema(editor), currentValue, {
            change,
            value: change.apply(currentValue),
          })
        : null;
    const publishable = imported?.change ?? change;
    const wasSetRoot = (root: string) =>
      getEditorSchema(editor).isSetRoot(root, {
        rootChildren: (name: string) => valueRoot(currentValue, name),
        value: () => currentValue,
      });
    const selectionAfter = (
      nextValue: EditorDocumentValue,
      editorMapped: () => EditorSelection | null
    ) => {
      if (selection === undefined || selection === null) return null;

      const editorRoot =
        !SelectionApi.isNode(selection) && !RangeApi.isRange(selection)
          ? normalizeRootKey(editor.read.view.root())
          : normalizeRootKey(SelectionApi.root(selection));
      const changes =
        replacement === undefined && publishable && !publishable.empty;

      if (changes && SelectionApi.isNode(selection)) return editorMapped();

      // A text selection maps through the change, so a caret after a
      // remote split moves into the line that now holds its letters.
      const mapped =
        changes &&
        !SelectionApi.isNode(selection) &&
        !('kind' in selection && selection.kind !== 'text')
          ? mapImportRange(
              publishable,
              currentValue,
              nextValue,
              editorRoot,
              selection
            )
          : selection;

      if (mapped === null && wasSetRoot(editorRoot)) return editorMapped();

      return sanitizeImportSelection(
        valueRootNodes(nextValue, editorRoot) as NodeList<Descendant>,
        mapped ?? selection
      );
    };

    const deletedRoots = imported ? [...imported.change.deleteRoots] : NO_ROOTS;
    let settled = false;
    let settleError = null as Readonly<{ value: unknown }> | null;
    const settleOnce = (admission: AdmittedRepair | null) => {
      if (settled) return;
      settled = true;
      try {
        beforeListeners(Object.freeze({ admission, deletedRoots }));
      } catch (error) {
        settleError = { value: error };
      }
    };

    importing += 1;

    try {
      const { admission } = runTrustedUpdate(
        editor,
        (tx) => {
          if (records) tx.changes.apply(records);
          if (replacement) tx.value.replace(replacement);
          if (publishable && !publishable.empty) {
            tx.changes.apply(publishable);
          }
          if (selection !== undefined) {
            const nextSelection = selectionAfter(tx.value(), () =>
              getCurrentSelection(editor)
            );

            withoutPlacement(editor, () => tx.selection.set(nextSelection));
          }

          for (const pending of effects) {
            const effect = typeof pending === 'function' ? pending() : pending;
            if (effect) tx.effects.emit(effect.type, effect.value);
          }
        },
        { onAdmission: settleOnce, tags: YjsUpdatePolicy.remote.tags }
      );

      settleOnce(admission);
    } finally {
      importing -= 1;
    }
    if (settleError) throw settleError.value;
  };

  return {
    applyRemote,
    canonicalize,
    canonicalizeDocument: (value) =>
      editor.read.schema.fitDocument(value as unknown as EditorDocumentValue),
    importing: () => importing > 0,
    readChildren,
    readValue,
  };
};
