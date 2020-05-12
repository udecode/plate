import { isTextByPath } from 'common/queries/isTextByPath';
import { setPropsToDescendants, setPropsToElements } from 'common/transforms';
import { castArray } from 'lodash';
import { EditorTransforms } from 'node/withTransforms';
import { Editor, Node } from 'slate';

/**
 * Set an id to new `Element` nodes. If `textID` is true, set an id to `Text` nodes as well.
 *
 * Depends on `withForcedLayout`.
 */
export const withNodeID = ({
  idKey = 'id',
  idGenerator = () => Date.now(),
  textID = false,
}: {
  idKey?: string;
  idGenerator?: Function;
  textID?: boolean;
} = {}) => <T extends Editor & EditorTransforms>(editor: T) => {
  const { apply, insertNode, insertNodes } = editor;

  const idProps = { [idKey]: idGenerator() };

  const setProps = (node: Node) => {
    if (!textID) {
      setPropsToElements(node, idProps);
    } else {
      setPropsToDescendants(node, idProps);
    }
  };

  editor.insertNode = (node) => {
    setProps(node);
    return insertNode(node);
  };

  editor.insertNodes = (nodes, options) => {
    const nodesArray: Node[] = castArray(nodes);
    nodesArray.forEach((node) => {
      setProps(node);
    });
    return insertNodes(nodes, options);
  };

  editor.apply = (operation) => {
    if (operation.type === 'split_node') {
      if (!textID && isTextByPath(editor, operation.path)) {
        return apply(operation);
      }

      return apply({
        ...operation,
        properties: {
          ...operation.properties,
          ...idProps,
        },
      });
    }

    return apply(operation);
  };

  return editor;
};
