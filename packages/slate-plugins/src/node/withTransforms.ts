import { Editor, Transforms } from 'slate';

type Params = Parameters<typeof Transforms.insertNodes>;

export interface TransformEditor {
  insertNodes: (nodes: Params[1], options?: Params[2]) => void;
}

/**
 * Extends `editor` with transforms:
 * - `editor.insertNodes` to use `Transforms.insertNodes` as `editor.insertNode` does not accept `options`.
 */
export const withTransforms = () => <T extends Editor>(editor: T) => {
  const e = editor as T & TransformEditor;

  e.insertNodes = (nodes, options) => {
    try {
      Transforms.insertNodes(editor, nodes, options);
    } catch (err) {}
  };

  return e;
};
