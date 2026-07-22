import type {
  Descendant,
  DocumentChange,
  Editor,
  EditorEffect,
  EditorUpdatePolicy,
  Element,
  Range,
  TextSelection,
} from '@platejs/plite';
import { NodeApi, SelectionApi } from '@platejs/plite';
import { runTrustedUpdate, toInternalRoot } from '@platejs/plite/internal';

export type YjsEditorAdapter = {
  readonly applyRemote: (input: {
    readonly change?: DocumentChange;
    readonly effects: readonly EditorEffect[];
    readonly selection?: Range | null;
  }) => void;
  readonly canonicalize: (
    children: readonly Descendant[]
  ) => readonly Descendant[];
  readonly canonicalizeNode: (node: Descendant) => Descendant;
  readonly importing: () => boolean;
  readonly readChildren: () => readonly Descendant[];
};

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

const SELECTION_ROOT_TYPE = 'plite-yjs-selection-root';

const sanitizeImportSelection = (
  children: readonly Descendant[],
  selection: Range | null
): TextSelection | null => {
  if (selection === null) {
    return null;
  }
  if ('kind' in selection && selection.kind !== 'text') return null;

  // Selection validation is read-only; avoid a second shallow copy of large
  // remote imports before the actual replace payload is copied.
  const root: Element = {
    children: children as Element['children'],
    type: SELECTION_ROOT_TYPE,
  };

  return isValidImportSelectionPoint(root, selection.anchor) &&
    isValidImportSelectionPoint(root, selection.focus)
    ? SelectionApi.text(selection)
    : null;
};

const isValidImportSelectionPoint = (
  root: Element,
  point: Range['anchor']
): boolean => {
  const node = NodeApi.getIf(root, point.path);

  return (
    node !== undefined &&
    NodeApi.isText(node) &&
    point.offset >= 0 &&
    point.offset <= node.text.length
  );
};

export const createYjsEditorAdapter = (
  editor: Editor,
  canonicalize: YjsEditorAdapter['canonicalize']
): YjsEditorAdapter => {
  let importing = false;

  const readChildren = (): readonly Descendant[] => editor.read.children();
  const canonicalizeNode = (node: Descendant): Descendant => {
    const children = canonicalize([node]);

    if (children.length !== 1 || children[0] === undefined) {
      throw new Error(
        'A Yjs top-level node must canonicalize to one editor node.'
      );
    }

    return children[0];
  };

  const applyRemote: YjsEditorAdapter['applyRemote'] = ({
    change,
    effects,
    selection,
  }) => {
    const currentValue = editor.read.value();
    const nextValue = change ? change.apply(currentValue) : currentValue;
    const editorRoot = toInternalRoot(editor.read.view.root());
    const nextChildren =
      editorRoot === 'main'
        ? nextValue.children
        : (nextValue.roots?.[editorRoot] ?? []);
    const nextSelection = sanitizeImportSelection(
      nextChildren,
      selection ?? null
    );

    importing = true;

    try {
      runTrustedUpdate(
        editor,
        (tx) => {
          if (change && !change.empty) {
            tx.changes.apply(change);
          }
          if (selection !== undefined) {
            tx.selection.set(nextSelection);
          }

          for (const effect of effects) {
            tx.effects.emit(effect.type, effect.value);
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
    canonicalizeNode,
    importing: () => importing,
    readChildren,
  };
};
