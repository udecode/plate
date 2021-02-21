import cloneDeep from 'lodash/cloneDeep';
import { Element, Node, NodeEntry } from 'slate';
import { HistoryEditor } from 'slate-history';
import { isDescendant } from '../../queries/index';
import { defaultsDeepToNodes } from '../../transforms/defaultsDeepToNodes';
import { mergeDeepToNodes } from '../../transforms/mergeDeepToNodes';
import { QueryNodeOptions } from '../../types/QueryNodeOptions';

export interface WithNodeIDProps extends QueryNodeOptions {
  // Key used for the id. Default is `id`.
  idKey?: string;
  // ID factory, e.g. `uuid`
  idCreator?: Function;
  // Filter `Text` nodes.
  filterText?: boolean;
  // The existing ID is still reset even if the ID already exists. Default is `false`.
  resetExistingID?: boolean;
}

/**
 * Enables support for inserting nodes with an id key.
 */
export const withNodeID = ({
  idKey = 'id',
  idCreator = () => Date.now(),
  filterText = true,
  resetExistingID = false,
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

      const node = cloneDeep(operation.node);

      // it will not overwrite ids once it's set as it's read-only
      const applyDeepToNodes = resetExistingID
        ? mergeDeepToNodes
        : defaultsDeepToNodes;
      applyDeepToNodes({
        node,
        source: idPropsCreator,
        query: {
          filter: newFilter,
          allow,
          exclude,
        },
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
