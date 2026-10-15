import { valueRootNodes } from '../../core/change/document-change';
import type { NodeList } from '../../core/change/document-index';
import { toInternalRoot as normalizeRootKey } from '../../core/public-root';
import { runTrustedUpdate } from '../../core/public-state';
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

export type YjsEditorAdapter = {
  readonly applyRemote: (input: {
    readonly replacement?: EditorDocumentValue;
    readonly change?: DocumentChange;
    readonly effects: readonly PendingYjsEffect[];
    /** Record writes applied before the content change, in the same commit. */
    readonly records?: DocumentChange | null;
    readonly selection?: Range | Selection;
  }) => void;
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

export const createYjsEditorAdapter = (
  editor: YjsEditor,
  canonicalize: YjsEditorAdapter['canonicalize']
): YjsEditorAdapter => {
  let importing = false;

  const readValue = (): EditorDocumentValue => editor.read.value();
  const readChildren = (root: string): readonly Descendant[] => {
    const value = readValue();

    return root === 'main' ? value.children : (value.roots?.[root] ?? []);
  };
  const applyRemote: YjsEditorAdapter['applyRemote'] = ({
    replacement,
    change,
    effects,
    records,
    selection,
  }) => {
    let nextSelection: EditorSelection | null = null;

    if (selection !== undefined && selection !== null) {
      const currentValue = editor.read.value();
      const nextValue =
        replacement ?? (change ? change.apply(currentValue) : currentValue);
      const editorRoot =
        !SelectionApi.isNode(selection) && !RangeApi.isRange(selection)
          ? normalizeRootKey(editor.read.view.root())
          : normalizeRootKey(SelectionApi.root(selection));

      nextSelection = sanitizeImportSelection(
        valueRootNodes(nextValue, editorRoot) as NodeList<Descendant>,
        selection
      );
    }

    importing = true;

    try {
      runTrustedUpdate(
        editor,
        (tx) => {
          if (records) tx.changes.apply(records);
          if (replacement) tx.value.replace(replacement);
          if (change && !change.empty) {
            tx.changes.apply(change);
          }
          if (selection !== undefined) {
            tx.selection.set(nextSelection);
          }

          for (const pending of effects) {
            const effect = typeof pending === 'function' ? pending() : pending;
            if (effect) tx.effects.emit(effect.type, effect.value);
          }
        },
        { tags: YjsUpdatePolicy.remote.tags }
      );
    } finally {
      importing = false;
    }
  };

  return {
    applyRemote,
    canonicalize,
    canonicalizeDocument: (value) =>
      editor.read.schema.fitDocument(value as unknown as EditorDocumentValue),
    importing: () => importing,
    readChildren,
    readValue,
  };
};
