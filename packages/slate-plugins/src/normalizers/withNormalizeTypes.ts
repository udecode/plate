import { Editor, Path, Transforms } from 'slate';
import { getNode } from '../common/queries';
import { TransformEditor } from '../common/transforms';

interface Rule {
  /**
   * Force the type of the node at the given path
   */
  strictType?: string;
  /**
   * Type of the inserted node at the given path if `strictType` is not provided
   */
  type?: string;
  /**
   * Path where the rule applies
   */
  path: Path;
}

export interface WithNormalizeTypes {
  /**
   * Set of rules for the types.
   * For each rule, provide a `path` and either `strictType` or `type`.
   * If there is no node existing at `path`:
   * insert a node with `strictType`.
   * If there is a node existing at `path` but its type is not `strictType` or `type`:
   * set the node type to `strictType` or `type`.
   */
  rules: Rule[];
}

export const withNormalizeTypes = ({ rules }: WithNormalizeTypes) => <
  T extends Editor & TransformEditor
>(
  editor: T
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      rules.forEach(({ strictType, type, path }) => {
        const node = getNode(editor, path);

        if (node) {
          if (strictType && node.type !== strictType) {
            Transforms.setNodes(editor, { type: strictType }, { at: path });
          }
        } else {
          editor.insertNodes(
            {
              type: strictType ?? type,
              children: [{ text: '' }],
            },
            { at: path }
          );
        }
      });
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
