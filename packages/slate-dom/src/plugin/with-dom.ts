import {
  defineEditorExtension,
  type EditorExtensionSetupContext,
  LocationApi,
  NodeApi,
  type Path,
  PathApi,
  type PathRef,
  RangeApi,
  type Editor as SlateEditor,
} from '@platejs/slate';
import {
  Editor,
  getEditorTransformRegistry,
  setEditorTransformRegistry,
  withOperationRootChildren,
} from '@platejs/slate/internal';
import {
  type TextDiff,
  transformPendingPoint,
  transformPendingRange,
  transformTextDiff,
} from '../utils/diff-text';
import type { Key } from '../utils/key';
import { findCurrentLineRange } from '../utils/lines';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_PENDING_SELECTION,
  EDITOR_TO_ROOT_VIEW_EDITORS,
  EDITOR_TO_SCHEDULE_FLUSH,
  EDITOR_TO_USER_MARKS,
  EDITOR_TO_USER_SELECTION,
  IS_NODE_MAP_DIRTY,
  NODE_TO_KEY,
} from '../utils/weak-maps';
import { setDOMClipboardFormatKey } from './dom-clipboard-runtime';
import {
  createDOMEditorCapability,
  type DOMApi,
  DOMEditor,
} from './dom-editor';

const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-slate-fragment';

const clearUserSelectionRef = (editor: SlateEditor) => {
  EDITOR_TO_USER_SELECTION.get(editor)?.unref();
  EDITOR_TO_USER_SELECTION.delete(editor);
};

export interface DOMEditorOptions {
  /**
   * Bare `DataTransfer` subtype for Slate's internal fragment payload.
   *
   * Slate writes and reads `application/${clipboardFormatKey}`.
   */
  clipboardFormatKey?: string;
}

/**
 * Install DOM-specific behavior for the dom() extension.
 *
 * TypeScript value generics are preserved from the editor passed to this
 * plugin.
 */

export const installDOM = <
  V extends import('@platejs/slate').Value,
  T extends import('@platejs/slate').Editor<V>,
>(
  editor: T,
  options: DOMEditorOptions = {}
): T & DOMEditor<V> => {
  const e = editor as unknown as T & DOMEditor<V>;
  const transforms = getEditorTransformRegistry(e);
  const { clipboardFormatKey = DEFAULT_CLIPBOARD_FORMAT_KEY } = options;

  setDOMClipboardFormatKey(e, clipboardFormatKey);
  e.dom = createDOMEditorCapability(e);

  // The WeakMap which maps a key to a specific HTMLElement must be scoped to the editor instance to
  // avoid collisions between editors in the DOM that share the same value.
  EDITOR_TO_KEY_TO_ELEMENT.set(e, new WeakMap());

  setEditorTransformRegistry(e, {
    ...transforms,
    addMark: (key, value) => {
      EDITOR_TO_SCHEDULE_FLUSH.get(e)?.();

      if (
        !EDITOR_TO_PENDING_INSERTION_MARKS.get(e) &&
        EDITOR_TO_PENDING_DIFFS.get(e)?.length
      ) {
        // Ensure the current pending diffs originating from changes before the addMark
        // are applied with the current formatting
        EDITOR_TO_PENDING_INSERTION_MARKS.set(e, null);
      }

      EDITOR_TO_USER_MARKS.delete(e);

      transforms.addMark(key, value);
    },

    removeMark: (key) => {
      if (
        !EDITOR_TO_PENDING_INSERTION_MARKS.get(e) &&
        EDITOR_TO_PENDING_DIFFS.get(e)?.length
      ) {
        // Ensure the current pending diffs originating from changes before the addMark
        // are applied with the current formatting
        EDITOR_TO_PENDING_INSERTION_MARKS.set(e, null);
      }

      EDITOR_TO_USER_MARKS.delete(e);

      transforms.removeMark(key);
    },

    deleteBackward: (unit) => {
      if (unit !== 'line') {
        return transforms.deleteBackward(unit);
      }

      const selection = e.read((state) => state.selection.get());

      if (selection && RangeApi.isCollapsed(selection)) {
        const parentBlockEntry = Editor.above(e, {
          match: (n) => NodeApi.isElement(n) && Editor.isBlock(e, n),
          at: selection,
        });

        if (parentBlockEntry) {
          const [, parentBlockPath] = parentBlockEntry;
          const parentElementRange = Editor.range(
            e,
            parentBlockPath,
            selection.anchor
          );

          const currentLineRange = findCurrentLineRange(e, parentElementRange);

          if (!RangeApi.isCollapsed(currentLineRange)) {
            transforms.delete({ at: currentLineRange });
          }
        }
      }
    },
  });

  // This attempts to reset the NODE_TO_KEY entry to the correct value
  // as operation application changes object references and invalidates NODE_TO_KEY.
  e.extend({
    name: 'slate-dom-operation-middleware',
    operations: {
      apply({ operation: op, next }) {
        withOperationRootChildren(e, op, () => {
          const matches: [Path, Key][] = [];
          const pathRefMatches: [PathRef, Key][] = [];
          const transformPendingState = (editor: SlateEditor) => {
            const pendingDiffs = EDITOR_TO_PENDING_DIFFS.get(editor);

            if (pendingDiffs?.length) {
              const transformed = pendingDiffs
                .map((textDiff) => transformTextDiff(textDiff, op, editor))
                .filter(Boolean) as TextDiff[];

              EDITOR_TO_PENDING_DIFFS.set(editor, transformed);
            }

            const pendingSelection = EDITOR_TO_PENDING_SELECTION.get(editor);
            if (pendingSelection) {
              EDITOR_TO_PENDING_SELECTION.set(
                editor,
                transformPendingRange(editor, pendingSelection, op)
              );
            }

            const pendingAction = EDITOR_TO_PENDING_ACTION.get(editor);
            if (pendingAction?.at) {
              const at = LocationApi.isPoint(pendingAction.at)
                ? transformPendingPoint(editor, pendingAction.at, op)
                : transformPendingRange(editor, pendingAction.at, op);

              EDITOR_TO_PENDING_ACTION.set(
                editor,
                at ? { ...pendingAction, at } : null
              );
            }
          };

          transformPendingState(e);
          EDITOR_TO_ROOT_VIEW_EDITORS.get(e)?.forEach((viewEditor) => {
            transformPendingState(viewEditor);
          });

          switch (op.type) {
            case 'insert_text':
            case 'remove_text':
            case 'set_node':
            case 'split_node': {
              matches.push(...getMatches(e, op.path));
              break;
            }

            case 'set_selection': {
              // Selection was manually set, don't restore the user selection after the change.
              clearUserSelectionRef(e);
              EDITOR_TO_ROOT_VIEW_EDITORS.get(e)?.forEach((viewEditor) => {
                clearUserSelectionRef(viewEditor);
              });
              break;
            }

            case 'insert_node':
            case 'remove_node': {
              pathRefMatches.push(
                ...getPathRefMatches(e, PathApi.parent(op.path))
              );
              break;
            }

            case 'merge_node': {
              const prevPath = PathApi.previous(op.path);
              matches.push(...getMatches(e, prevPath));
              break;
            }

            case 'move_node': {
              const commonPath = PathApi.common(
                PathApi.parent(op.path),
                PathApi.parent(op.newPath)
              );
              matches.push(...getMatches(e, commonPath));

              let changedPath: Path;
              if (PathApi.isBefore(op.path, op.newPath)) {
                matches.push(...getMatches(e, PathApi.parent(op.path)));
                changedPath = op.newPath;
              } else {
                matches.push(...getMatches(e, PathApi.parent(op.newPath)));
                changedPath = op.path;
              }

              const changedNode = NodeApi.get(e, PathApi.parent(changedPath));
              const changedNodeKey = DOMEditor.findKey(e, changedNode);
              const changedPathRef = Editor.pathRef(
                e,
                PathApi.parent(changedPath)
              );
              pathRefMatches.push([changedPathRef, changedNodeKey]);

              break;
            }
          }

          next(op);

          switch (op.type) {
            case 'insert_node':
            case 'remove_node':
            case 'merge_node':
            case 'move_node':
            case 'split_node':
            case 'insert_text':
            case 'remove_text': {
              // The DOM mapping is out of sync until render refreshes it.
              IS_NODE_MAP_DIRTY.set(e, true);
            }
          }

          for (const [path, key] of matches) {
            const [node] = e.read((state) => state.nodes.get(path));
            NODE_TO_KEY.set(node, key);
          }

          for (const [pathRef, key] of pathRefMatches) {
            if (pathRef.current) {
              const [node] = e.read((state) =>
                state.nodes.get(pathRef.current!)
              );
              NODE_TO_KEY.set(node, key);
            }

            pathRef.unref();
          }
        });
      },
    },
  });

  return e;
};

/** Install DOM clipboard, selection, focus, and node-resolution behavior. */
export const dom = (options: DOMEditorOptions = {}) =>
  defineEditorExtension({
    name: 'dom',
    setup(context: EditorExtensionSetupContext<SlateEditor>) {
      const editor = installDOM(context.editor, options);
      const { clipboard, ...domApi } = editor.dom;

      Reflect.deleteProperty(editor, 'dom');

      return {
        api: {
          clipboard,
          dom: Object.freeze(domApi) as DOMApi,
        },
      };
    },
  });

const getMatches = (e: DOMEditor<any>, path: Path) => {
  const matches: [Path, Key][] = [];
  for (const [n, p] of Editor.levels(e, { at: path })) {
    const key = DOMEditor.findKey(e, n);
    matches.push([p, key]);
  }
  return matches;
};

const getPathRefMatches = (e: DOMEditor<any>, path: Path) => {
  const matches: [PathRef, Key][] = [];

  const entries = e.read((state) =>
    state.nodes.toArray({
      at: path,
      mode: 'all',
      voids: true,
    })
  );

  for (const [n, p] of entries) {
    const key = DOMEditor.findKey(e, n);
    const pathRef = Editor.pathRef(e, p);

    matches.push([pathRef, key]);
  }

  return matches;
};
