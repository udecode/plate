import { Editor, Transforms } from 'slate';

type Params = Parameters<typeof Transforms.insertNodes>;

export interface EditorTransforms {
  insertNodes: (nodes: Params[1], options?: Params[2]) => void;
}

/**
 * Extends `editor` with transforms:
 * - `editor.insertNodes` to use `Transforms.insertNodes` as `editor.insertNode` does not accept `options`.
 */
export const withTransforms = () => <T extends Editor>(editor: T) => {
  const e = editor as T & EditorTransforms;

  e.insertNodes = (nodes, options) => {
    Transforms.insertNodes(editor, nodes, options);
  };

  return e;
};
