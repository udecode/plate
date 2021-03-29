import {
  defaultsDeepToNodes,
  mergeDeepToNodes,
  QueryNodeOptions,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginWithOverrides,
  isDescendant,
  isElement,
  TNode,
  WithOverride,
} from '@udecode/slate-plugins-core';
import cloneDeep from 'lodash/cloneDeep';
import { NodeEntry } from 'slate';
import { HistoryEditor } from 'slate-history';

export interface NodeIdEditor extends HistoryEditor {
  removedIDs: Set<any>;
}

export interface WithNodeIdProps extends QueryNodeOptions {
  /**
   * Node key to store the id.
   * @default 'id'
   */
  idKey?: string;

  /**
   * ID factory, e.g. `uuid`
   * @default () => Date.now()
   */
  idCreator?: Function;

  /**
   * Filter `Text` nodes.
   * @default true
   */
  filterText?: boolean;

  /**
   * The existing id is still reset even if the id already exists.
   * @default false
   */
  resetExistingID?: boolean;
}

/**
 * Enables support for inserting nodes with an id key.
 */
export const withNodeId = ({
  idKey = 'id',
  idCreator = () => Date.now(),
  filterText = true,
  resetExistingID = false,
  filter = () => true,
  allow,
  exclude,
}: WithNodeIdProps = {}): WithOverride<HistoryEditor, NodeIdEditor> => (e) => {
  const editor = e as typeof e & NodeIdEditor;

  const { apply } = editor;

  const idPropsCreator = () => ({ [idKey]: idCreator() });

  editor.removedIDs = new Set();

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      const newFilter = (entry: NodeEntry<TNode>) => {
        const [node] = entry;
        return filter(entry) && filterText
          ? isElement(node)
          : isDescendant(node);
      };

      const node = cloneDeep(operation.node) as TNode;

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
      (!filterText || (operation.properties as Partial<TNode>).type)
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
      (!filterText || (operation.properties as Partial<TNode>).type)
    ) {
      editor.removedIDs.add((operation.properties as Partial<TNode>).id);
    }

    return apply(operation);
  };

  return editor;
};

/**
 * @see {@link withNodeId}
 */
export const createNodeIdPlugin = getSlatePluginWithOverrides(withNodeId);
