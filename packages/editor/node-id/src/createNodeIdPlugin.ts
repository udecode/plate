import { createPluginFactory, QueryNodeOptions } from '@udecode/plate-common';
import { withNodeId } from './withNodeId';

export interface NodeIdPlugin extends QueryNodeOptions {
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
   * Reuse ids on undo/redo and copy/pasting if not existing in the document.
   * This is disabled by default to avoid duplicate ids across documents.
   * @default false
   */
  reuseId?: boolean;
}

export const KEY_NODE_ID = 'nodeId';

/**
 * @see {@link withNodeId}
 */
export const createNodeIdPlugin = createPluginFactory<NodeIdPlugin>({
  key: KEY_NODE_ID,
  withOverrides: withNodeId,
  options: {
    idKey: 'id',
    idCreator: () => Math.random().toString(36).substring(2, 7),
    filterText: true,
    filter: () => true,
  },
});
