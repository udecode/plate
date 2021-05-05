import {
  defaultsDeepToNodes,
  mergeDeepToNodes,
  QueryNodeOptions,
  someNode,
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
}: WithNodeIdProps = {}): WithOverride<HistoryEditor> => (e) => {
  const editor = e as typeof e & HistoryEditor;

  const { apply } = editor;

  const idPropsCreator = () => ({ [idKey]: idCreator() });

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      const newFilter = (entry: NodeEntry<TNode>) => {
        const [node] = entry;
        return filter(entry) && filterText
          ? isElement(node)
          : isDescendant(node);
      };

      const node = cloneDeep(operation.node) as TNode
      // the id in the new node is already being used in the editor, we need to replace it with a new id
      if (someNode(editor, { match: { [idKey]: node[idKey] } })) {
        delete node[idKey]
      }

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

      if (
        someNode(editor, {
          match: { [idKey]: (operation.properties as Partial<TNode>)[idKey] },
        })
      ) {
        // the id in the new node is already being used in the editor, we need to replace it with a new id
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

    return apply(operation);
  };

  return editor;
};

/**
 * @see {@link withNodeId}
 */
export const createNodeIdPlugin = getSlatePluginWithOverrides(withNodeId);
