import {
  type Descendant,
  type QueryNodeOptions,
  type Value,
  ElementApi,
  queryNode,
} from '@platejs/slate';
import { nanoid } from 'nanoid';

import type { PluginConfig } from '../../plugin/BasePlugin';

import { createTSlatePlugin } from '../../plugin/createSlatePlugin';
import { withNodeId } from './withNodeId';

export type NodeIdOptions = {
  /**
   * By default, when a node inserted using editor.tf.insertNode(s) has an id,
   * it will be used instead of the id generator, except if it already exists in
   * the document. Set this option to true to disable this behavior.
   */
  disableInsertOverrides?: boolean;
  /**
   * Filter inline `Element` nodes.
   *
   * @default true
   */
  filterInline?: boolean;
  /**
   * Filter `Text` nodes.
   *
   * @default true
   */
  filterText?: boolean;
  /**
   * Node key to store the id.
   *
   * @default 'id'
   */
  idKey?: string;
  /**
   * Normalize initial value. If false, normalize only the first and last node
   * are missing id. To disable this behavior, use `NodeIdPlugin.configure({
   * normalizeInitialValue: null })`.
   *
   * @default false
   */
  normalizeInitialValue?: boolean;
  /**
   * Reuse ids on undo/redo and copy/pasting if not existing in the document.
   * This is disabled by default to avoid duplicate ids across documents.
   *
   * @default false
   */
  reuseId?: boolean;
  /**
   * A function that generates and returns a unique ID.
   *
   * @default () => nanoid(10)
   */
  idCreator?: () => any;
} & QueryNodeOptions;

export type NormalizeNodeIdOptions = Pick<
  NodeIdOptions,
  | 'allow'
  | 'exclude'
  | 'filter'
  | 'filterInline'
  | 'filterText'
  | 'idCreator'
  | 'idKey'
>;

/**
 * Normalize node IDs in a value without using editor operations. This is a pure
 * function that returns a new normalized value.
 */
export const normalizeNodeId = <V extends Value>(
  value: V,
  options: NormalizeNodeIdOptions = {}
): V => {
  const {
    allow,
    exclude,
    filter = () => true,
    filterInline = true,
    filterText = true,
    idCreator = () => nanoid(10),
    idKey = 'id',
  } = options;

  const normalizeNode = (node: Descendant, path: number[]): Descendant => {
    // Clone the node to avoid mutating the original
    const clonedNode = { ...node };

    // Check if we should add ID to this node
    if (
      !clonedNode[idKey] &&
      queryNode([clonedNode, path], {
        allow,
        exclude,
        filter: (entry) => {
          const [node] = entry;

          if (filterText && !ElementApi.isElement(node)) {
            return false;
          }
          if (
            filterInline &&
            ElementApi.isElement(node) &&
            // For static normalization, we can't use editor.api.isBlock
            // so we'll assume all elements with children are blocks unless inline is explicitly set
            (node as any).inline === true
          ) {
            return false;
          }

          return filter(entry);
        },
      })
    ) {
      clonedNode[idKey] = idCreator();
    }

    // Recursively normalize children if it's an element
    if (ElementApi.isElement(clonedNode)) {
      clonedNode.children = clonedNode.children.map((child, index) =>
        normalizeNode(child as Descendant, [...path, index])
      );
    }

    return clonedNode;
  };

  // Normalize all top-level nodes
  return value.map((node, index) => normalizeNode(node, [index])) as V;
};

export type NodeIdConfig = PluginConfig<
  'nodeId',
  NodeIdOptions,
  {},
  {
    nodeId: {
      normalize: () => void;
    };
  }
>;

/** @see {@link withNodeId} */
export const NodeIdPlugin = createTSlatePlugin<NodeIdConfig>({
  key: 'nodeId',
  options: {
    filterInline: true,
    filterText: true,
    idKey: 'id',
    normalizeInitialValue: false,
    filter: () => true,
    idCreator: () => nanoid(10),
  },
})
  .extendTransforms(({ editor, getOptions }) => ({
    normalize() {
      const { allow, exclude, filter, filterInline, filterText, idKey } =
        getOptions();

      const addNodeId = (entry: [Descendant, number[]]) => {
        const [node, path] = entry;

        if (
          !node[idKey!] &&
          queryNode([node, path], {
            allow,
            exclude,
            filter: (entry) => {
              const [node] = entry;

              if (filterText && !ElementApi.isElement(node)) {
                return false;
              }
              if (
                filterInline &&
                ElementApi.isElement(node) &&
                !editor.api.isBlock(node)
              ) {
                return false;
              }

              return filter!(entry);
            },
          })
        ) {
          // Verify node exists at path before attempting to modify
          const existingNode = editor.api.node(path);
          if (!existingNode) {
            return;
          }

          editor.tf.withoutSaving(() => {
            editor.tf.setNodes(
              { [idKey!]: getOptions().idCreator!() },
              { at: path }
            );
          });
        }

        // Only traverse children if this is an Element node
        if (ElementApi.isElement(node)) {
          node.children.forEach((child: any, index: number) => {
            addNodeId([child, [...path, index]]);
          });
        }
      };

      // Process top-level nodes in place
      editor.children.forEach((node, index) => {
        addNodeId([node, [index]]);
      });
    },
  }))
  .extend({
    normalizeInitialValue: ({ editor, getOptions, tf }) => {
      const { normalizeInitialValue } = getOptions();

      // Perf: check if normalization is needed by looking at the first node and last node
      if (!normalizeInitialValue) {
        const firstNode = editor.children[0];
        const lastNode = editor.children.at(-1);

        if (firstNode?.id && lastNode?.id) {
          return;
        }
      }

      tf.nodeId.normalize();
    },
  })
  .overrideEditor(withNodeId);
