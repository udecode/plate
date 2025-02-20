import {
  type Descendant,
  type PluginConfig,
  type QueryNodeOptions,
  createTSlatePlugin,
  ElementApi,
  nanoid,
  queryNode,
} from '@udecode/plate';

import { withNodeId } from './withNodeId';

export type NodeIdConfig = PluginConfig<
  'nodeId',
  {
    /**
     * By default, when a node inserted using editor.tf.insertNode(s) has an id,
     * it will be used instead of the id generator, except if it already exists
     * in the document. Set this option to true to disable this behavior.
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
     * ID factory, e.g. `uuid`
     *
     * @default () => Date.now()
     */
    idCreator?: () => any;
  } & QueryNodeOptions
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
  normalizeInitialValue: ({ editor, getOptions }) => {
    const {
      allow,
      exclude,
      filter,
      filterInline,
      filterText,
      idKey,
      normalizeInitialValue,
    } = getOptions();

    // Perf: check if normalization is needed by looking at the first node and last node
    if (!normalizeInitialValue) {
      const firstNode = editor.children[0];
      const lastNode = editor.children.at(-1);

      if (firstNode?.id && lastNode?.id) {
        return;
      }
    }

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
        node[idKey!] = getOptions().idCreator!();
      }
      // Process children in place if they exist
      if ((node.children as any)?.length > 0) {
        (node.children as any).forEach((child: any, index: number) => {
          addNodeId([child, [...path, index]]);
        });
      }

      return node;
    };

    // Process top-level nodes in place
    editor.children.forEach((node, index) => {
      addNodeId([node, [index]]);
    });
  },
}).overrideEditor(withNodeId);
