import { Element, Node, NodeEntry } from 'slate';
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
}: WithNodeIDProps = {}) => <T extends HistoryEditor>(e: T) => {
  const editor = e as T & { removedIDs: Set<any> };

  const { apply } = editor;

  const idPropsCreator = () => ({ [idKey]: idCreator() });

  editor.removedIDs = new Set();

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      const newFilter = (entry: NodeEntry<Node>) => {
        const [node] = entry;
        return filter(entry) && filterText
          ? Element.isElement(node)
          : isDescendant(node);
      };

      const { node } = operation;

      // it will not overwrite ids once it's set as it's read-only
      setPropsToNodes(node, idPropsCreator, {
        filter: newFilter,
        allow,
        exclude,
      });

      return apply({
        ...operation,
        node,
      });
    }

    if (
      operation.type === 'split_node' &&
      (!filterText || operation.properties.type)
    ) {
      let id = operation.properties[idKey];
      if (editor.removedIDs.has(id)) {
        editor.removedIDs.delete(id);
      } else {
        id = idCreator();
      }

      return apply({
        ...operation,
        properties: {
          ...operation.properties,
          [idKey]: id,
        },
      });
    }

    if (
      operation.type === 'merge_node' &&
      (!filterText || operation.properties.type)
    ) {
      editor.removedIDs.add(operation.properties.id);
    }

    return apply(operation);
  };

  return editor;
};
