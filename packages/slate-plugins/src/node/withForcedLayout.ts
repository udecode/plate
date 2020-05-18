import { HeadingType, PARAGRAPH } from 'elements';
import { TransformEditor } from 'node/withTransforms';
import { Editor, Node, Transforms } from 'slate';

export const withForcedLayout = ({
  typeH1 = HeadingType.H1,
  typeP = PARAGRAPH,
} = {}) => <T extends Editor & TransformEditor>(editor: T) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (!path.length) {
      if (!editor.children.length) {
        const h1: Node = {
          type: typeH1,
          children: [{ text: '' }],
        };
        editor.insertNodes(h1, { at: path.concat(0) });
      } else {
        const child = Node.child(editor, 0);

        if (child.type !== typeH1) {
          Transforms.setNodes(editor, { type: typeH1 }, { at: [0] });
        }
      }

      if (editor.children.length === 1) {
        const paragraph = {
          type: typeP,
          children: [{ text: '' }],
        };
        editor.insertNodes(paragraph, { at: path.concat(1) });
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};
