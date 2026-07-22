import { dispatchCommand } from '../core/command-registry';
import { editorCommands } from '../core/editor-commands';
import { getEditorSchema } from '../core/editor-runtime';
import { runEditorTransaction } from '../core/public-state';
import { parent as editorParent } from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { type Node, NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { setNodes } from '../transforms-node/set-nodes';
import { node } from './node';

export const applyAddMark: EditorStaticApi['addMark'] = (
  editor,
  key,
  value
) => {
  runEditorTransaction(editor, (tx) => {
    const selection = tx.resolveTarget();

    if (!selection || !RangeApi.isRange(selection)) {
      return;
    }
    const schema = getEditorSchema(editor);
    const root = selection.anchor.root ?? selection.focus.root ?? 'main';

    const match = (node: Node, path: Path) => {
      if (!NodeApi.isText(node)) {
        return false; // marks can only be applied to text
      }
      const [parentNode] = editorParent(editor, path);
      if (!NodeApi.isElement(parentNode)) {
        return false;
      }
      return (
        schema.isTextPropertyAllowedAt(key, path, root) &&
        (!schema.isVoid(parentNode) || schema.markableVoid(parentNode))
      );
    };
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
          getEditorSchema(editor).markableVoid(parentNode);
      }
    }
    if (markAcceptingVoidSelected && selectedPath) {
      setNodes(
        editor,
        { [key]: value },
        {
          at: selectedPath,
          marks: true,
          match,
          voids: true,
        }
      );
    } else if (expandedSelection) {
      setNodes(
        editor,
        { [key]: value },
        {
          marks: true,
          match,
          split: true,
          voids: true,
        }
      );
    } else {
      const [, currentPath] = node(editor, selection);
      const [parentNode] = editorParent(editor, currentPath);

      if (
        !NodeApi.isElement(parentNode) ||
        !schema.isTextPropertyAllowedAt(key, currentPath, root)
      ) {
        return;
      }
      const currentMarks = tx.marks ?? tx.getSelectionMarks() ?? {};
      const marks = {
        ...currentMarks,
        [key]: schema.mergeTextPropertyAt(
          key,
          currentMarks[key],
          value,
          currentPath,
          root
        ),
      };

      tx.setMarks(marks);
    }
  });
};

export const addMark: EditorStaticApi['addMark'] = (editor, key, value) => {
  dispatchCommand(editor, editorCommands.addMark, {
    key,
    value,
  });
};
