import {
  type PluginConfig,
  type QueryNodeOptions,
  type TDescendant,
  type Value,
  createTSlatePlugin,
  isBlock,
  isElement,
  nanoid,
  queryNode,
} from '@udecode/plate-common';

import { withNodeId } from './withNodeId';

export type NodeIdConfig = PluginConfig<
  'nodeId',
  {
    /**
     * By default, when a node inserted using editor.insertNode(s) has an id, it
     * will be used instead of the id generator, except if it already exists in
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
     * ID factory, e.g. `uuid`
     *
     * @default () => Date.now()
     */
    idCreator?: () => any;

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
  } & QueryNodeOptions
>;

/** @see {@link withNodeId} */
export const NodeIdPlugin = createTSlatePlugin<NodeIdConfig>({
  key: 'nodeId',
  extendEditor: withNodeId,
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
        return editor.children as Value;
      }
    }

    const addNodeId = (entry: [TDescendant, number[]]) => {
      const [node, path] = entry;
      const newNode = { ...node };

      if (
        !newNode[idKey!] &&
        queryNode([node, path], {
          allow,
          exclude,
          filter: (entry) => {
            const [node] = entry;

            if (filterText && !isElement(node)) {
              return false;
            }
            if (filterInline && isElement(node) && !isBlock(editor, node)) {
              return false;
            }

            return filter!(entry);
          },
        })
      ) {
        newNode[idKey!] = getOptions().idCreator!();
      }
      // Recursively process children if they exist
      if ((newNode.children as any)?.length > 0) {
        newNode.children = (newNode.children as any).map(
          (child: any, index: number) => addNodeId([child, [...path, index]])
        );
      }

      return newNode;
    };

    // Process top-level nodes
    return editor.children.map((node, index) =>
      addNodeId([node, [index]])
    ) as Value;
  },
  options: {
    filter: () => true,
    filterInline: true,
    filterText: true,
    idCreator: () => nanoid(10),
    idKey: 'id',
    normalizeInitialValue: false,
  },
});
