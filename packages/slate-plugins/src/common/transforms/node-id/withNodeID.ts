import { Element, Node } from 'slate';
import { HistoryEditor } from 'slate-history';
import { isDescendant } from '../../queries';
import { QueryOptions } from '../../types';
import { setPropsToNodes } from '../setPropsToNodes';

export interface WithNodeIDProps extends QueryOptions {
  // Key used for the id. Default is `id`.
  idKey?: string;
  // ID factory, e.g. `uuid`
  idCreator?: Function;
  // Filter `Text` nodes.
  filterText?: boolean;
}

/**
 * Enables support for inserting nodes with an id key.
 */
export const withNodeID = ({
  idKey = 'id',
  idCreator = () => Date.now(),
  filterText = true,
  filter = () => true,
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
