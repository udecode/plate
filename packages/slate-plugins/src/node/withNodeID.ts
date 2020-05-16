import { isDescendant } from 'common/queries';
import { QueryProps, setPropsToNodes } from 'common/transforms';
import { Element, Node } from 'slate';
import { HistoryEditor } from 'slate-history';

export interface WithNodeIDProps extends QueryProps {
  // Key used for the id. Default is `id`.
  idKey?: string;
  // ID factory, e.g. `uuid`
  idCreator?: Function;
  // Filter `Text` nodes.
  filterText?: boolean;
}

/**
 * Set an id to new nodes.
 */
export const withNodeID = ({
  idKey = 'id',
  idCreator = () => Date.now(),
  filter = () => true,
  filterText = true,
  allow,
  exclude,
}: WithNodeIDProps = {}) => <T extends HistoryEditor>(editor: T) => {
  const { apply } = editor;

  const idPropsCreator = () => ({ [idKey]: idCreator() });

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      const newFilter = (n: Node) =>
        filter(n) && filterText ? Element.isElement(n) : isDescendant(n);

      // it will not overwrite ids once it's set as it's read-only
      setPropsToNodes(operation.node, idPropsCreator, {
        filter: newFilter,
        allow,
        exclude,
      });

      return apply({
        ...operation,
        node: operation.node,
      });
    }

    if (
      operation.type === 'split_node' &&
      (!filterText || operation.properties.type)
    ) {
      return apply({
        ...operation,
        properties: {
          ...operation.properties,
          [idKey]: operation.properties.id || idCreator(),
        },
      });
    }

    return apply(operation);
  };

  return editor;
};
