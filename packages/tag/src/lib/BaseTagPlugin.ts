import {
  type TElement,
  type UnknownObject,
  createSlatePlugin,
  insertNodes,
  isText,
  moveSelection,
  removeEditorText,
  removeNodes,
  replaceNode,
  someNode,
} from '@udecode/plate-common';
import { Path } from 'slate';

export type TagLike = { value: string } & UnknownObject;

export type TTagElement = TElement & TagLike;

export const BaseTagPlugin = createSlatePlugin({
  key: 'tag',
  extendEditor: ({ editor, type }) => {
    const { deleteBackward, normalizeNode, onChange } = editor;

    editor.deleteBackward = (unit) => {
      deleteBackward(unit);

      if (
        someNode(editor, {
          match: (n) => n.type === type,
        })
      ) {
        moveSelection(editor);
      }
    };

    editor.onChange = (op) => {
      onChange(op);

      // Remove text not in selection or if selection contains an tag
      removeEditorText(editor, {
        match: (_, p) =>
          someNode(editor, {
            match: { type },
          }) ||
          !someNode(editor, {
            match: (t, textPath) => {
              return isText(t) && Path.equals(textPath, p);
            },
          }),
      });
    };

    editor.normalizeNode = ([node, path]) => {
      // Duplicate tag removal
      if (
        node.type === type &&
        someNode(editor, {
          at: [],
          match: (n, p) =>
            n.type === type && n.value === node.value && !Path.equals(p, path),
        })
      ) {
        removeNodes(editor, {
          at: path,
        });

        return;
      }
      // Trim leading whitespace
      if (isText(node) && node.text) {
        const trimmedText = node.text.trimStart();

        if (trimmedText !== node.text) {
          replaceNode(editor, {
            at: path,
            insertOptions: {
              select: true,
            },
            nodes: { text: trimmedText },
          });

          return;
        }
      }

      normalizeNode([node, path]);
    };

    return editor;
  },
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
}).extendEditorTransforms(({ editor, type }) => ({
  insert: {
    option: (props: TagLike) => {
      insertNodes(editor, {
        children: [{ text: '' }],
        type,
        ...props,
      });

      moveSelection(editor);
    },
  },
}));
