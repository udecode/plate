import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import { runEditorTransaction } from '../core/public-state';
import { parent as editorParent } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { type Node, NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { unsetNodes } from '../transforms-node/unset-nodes';
import { node } from './node';

export const applyRemoveMark: EditorStaticApi['removeMark'] = (editor, key) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection) return;

    const match = (innerNode: Node, path: Path) => {
      if (!NodeApi.isText(innerNode)) {
        // marks can only be applied to text
        return false;
      }
      const [parentNode] = editorParent(editor, path);
      if (!NodeApi.isElement(parentNode)) {
        return false;
      }
      return (
        !getEditorSchema(editor).isVoid(parentNode) ||
        getEditorSchema(editor).isMarkableVoid(parentNode)
      );
    };
    if (SelectionApi.isNode(selection)) {
      for (const range of editor.read.selection.ranges()) {
        unsetNodes(editor, key, {
          at: range,
          match,
          split: true,
          voids: true,
        });
      }
      return;
    }
    if (!RangeApi.isRange(selection)) return;
    const expandedSelection = RangeApi.isExpanded(selection);
    let markAcceptingVoidSelected = false;
    let selectedPath: Path | undefined;
    if (!expandedSelection) {
      const [selectedNode, path] = node(editor, selection);
      selectedPath = path;
      if (selectedNode && match(selectedNode, path)) {
        const [parentNode] = editorParent(editor, path);
        markAcceptingVoidSelected =
          NodeApi.isElement(parentNode) &&
          getEditorSchema(editor).isMarkableVoid(parentNode);
      }
    }
    if (markAcceptingVoidSelected && selectedPath) {
      unsetNodes(editor, key, {
        at: selectedPath,
        match,
        voids: true,
      });
    } else if (expandedSelection) {
      unsetNodes(editor, key, {
        match,
        split: true,
        voids: true,
      });
    } else {
      const marks = { ...tx.marks };
      delete marks[key as keyof Node];
      tx.setMarks(marks);
    }
  });
};

export const removeMark: EditorStaticApi['removeMark'] = (editor, key) => {
  dispatchCommand(editor, editorCommands.removeMark, {
    key,
  });
};
