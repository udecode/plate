import { Editor, Node } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { Plugin } from 'slate-react';

export const withLayout = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length < 1) {
        const title = {
          type: ElementType.HEADING_1,
          children: [{ text: 'Untitled' }],
        };
        Editor.insertNodes(editor, title, { at: path.concat(0) });
      }

      if (editor.children.length < 2) {
        const paragraph = {
          type: ElementType.PARAGRAPH,
          children: [{ text: '' }],
        };
        Editor.insertNodes(editor, paragraph, { at: path.concat(1) });
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        const type =
          childPath[0] === 0 ? ElementType.HEADING_1 : ElementType.PARAGRAPH;

        if (child.type !== type) {
          Editor.setNodes(editor, { type }, { at: childPath });
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const ForcedLayoutPlugin = (): Plugin => ({
  editor: withLayout,
});
