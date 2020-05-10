import { isTextByPath } from 'common/queries/isTextByPath';
import { setPropsToDescendants, setPropsToElements } from 'common/transforms';
import { Editor } from 'slate';

export const withNodeID = ({
  idKey = 'id',
  idGenerator = () => Date.now(),
  textID = false,
}: {
  idKey?: string;
  idGenerator?: Function;
  textID?: boolean;
} = {}) => <T extends Editor>(editor: T) => {
  const { apply, insertNode } = editor;

  const idProps = { [idKey]: idGenerator() };

  editor.insertNode = (node) => {
    if (!textID) {
      setPropsToElements(node, idProps);
    } else {
      setPropsToDescendants(node, idProps);
    }

    return insertNode(node);
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
