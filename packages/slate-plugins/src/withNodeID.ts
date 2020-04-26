import { Editor } from 'slate';

export const withNodeID = ({
  idKey = 'id',
  idGenerator = () => Date.now(),
}: {
  idKey?: string;
  idGenerator?: Function;
} = {}) => <T extends Editor>(editor: T) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    const isNewNode =
      operation.type === 'insert_node' ||
      operation.type === 'merge_node' ||
      operation.type === 'split_node';

    if (isNewNode) {
      return apply({
        ...operation,
        properties: { ...operation.properties, [idKey]: idGenerator() },
      });
    }
    return apply(operation);
  };

  return editor;
};
