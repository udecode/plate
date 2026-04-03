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
   * Controls how missing ids are assigned in the initial value.
   *
   * - `'if-needed'`: normalize only when the first or last top-level node is
   *   missing an id
   * - `'always'`: walk the whole initial value and fill any missing ids
   * - `false`: skip initial-value id assignment
   *
   * @default 'if-needed'
   */
  initialValueIds?: false | 'always' | 'if-needed';
  /**
   * Legacy alias for `initialValueIds`.
   *
   * - `false`: only check the first and last top-level nodes
   * - `true`: walk the whole initial value and fill missing ids
   * - `null`: skip initial-value id assignment
   *
   * @deprecated Use `initialValueIds` instead.
   */
  normalizeInitialValue?: boolean | null;
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

type NormalizeNodeIdRuntimeOptions = NormalizeNodeIdOptions & {
  isBlock?: (node: Descendant) => boolean;
};

const isDefaultNodeIdFastPath = ({
  allow,
  exclude,
  filter,
  filterInline = true,
  filterText = true,
}: NormalizeNodeIdRuntimeOptions) =>
  allow === undefined &&
  exclude === undefined &&
  filter === undefined &&
  filterInline &&
  filterText;

const isBlockCandidate = (
  node: Descendant,
  isBlock?: (node: Descendant) => boolean
) =>
  ElementApi.isElement(node) &&
  (isBlock ? isBlock(node) : (node as any).inline !== true);

const shouldAssignNodeId = (
  entry: [Descendant, number[]],
  options: NormalizeNodeIdRuntimeOptions = {}
) => {
  const {
    allow,
    exclude,
    filter = () => true,
    filterInline = true,
    filterText = true,
    isBlock,
    idKey = 'id',
  } = options;
  const [node, path] = entry;

  return (
    !node[idKey] &&
    queryNode([node, path], {
      allow,
      exclude,
      filter: (nextEntry) => {
        const [entryNode] = nextEntry;

        if (filterText && !ElementApi.isElement(entryNode)) {
          return false;
        }
        if (
          filterInline &&
          ElementApi.isElement(entryNode) &&
          !(isBlock ? isBlock(entryNode) : (entryNode as any).inline !== true)
        ) {
          return false;
        }

        return filter(nextEntry);
      },
    })
  );
};

const resolveInitialValueIds = (
  options: Pick<NodeIdOptions, 'initialValueIds' | 'normalizeInitialValue'>
): false | 'always' | 'if-needed' => {
  if (options.initialValueIds !== undefined) {
    return options.initialValueIds;
  }

  if (options.normalizeInitialValue === null) {
    return false;
  }

  if (options.normalizeInitialValue === true) {
    return 'always';
  }

  return 'if-needed';
};

/**
 * Normalize node IDs in a value without using editor operations. This is a pure
 * function that returns the normalized value and preserves references for
 * unchanged branches.
 */
const normalizeNodeIdRuntime = <V extends Value>(
  value: V,
  options: NormalizeNodeIdRuntimeOptions = {}
): V => {
  const { idCreator = () => nanoid(10), idKey = 'id' } = options;

  if (isDefaultNodeIdFastPath(options)) {
    const normalizeNodeFast = (node: Descendant): Descendant => {
      if (!ElementApi.isElement(node)) return node;
      if (!isBlockCandidate(node, options.isBlock)) return node;

      let nextChildren: Descendant[] | undefined;

      node.children.forEach((child, index) => {
        const nextChild = normalizeNodeFast(child as Descendant);

        if (nextChild !== child) {
          if (!nextChildren) {
            nextChildren = [...node.children] as Descendant[];
          }

          nextChildren[index] = nextChild;
        }
      });

      if (!node[idKey]) {
        return {
          ...node,
          ...(nextChildren ? { children: nextChildren } : {}),
          [idKey]: idCreator(),
        };
      }

      if (nextChildren) {
        return {
          ...node,
          children: nextChildren,
        };
      }

      return node;
    };

    let valueChanged = false;

    const nextValue = value.map((node) => {
      const nextNode = normalizeNodeFast(node as Descendant);

      if (nextNode !== node) {
        valueChanged = true;
      }

      return nextNode;
    }) as V;

    return valueChanged ? nextValue : value;
  }

  const normalizeNode = (node: Descendant, path: number[]): Descendant => {
    let nextNode = node;
    let childrenChanged = false;

    if (shouldAssignNodeId([node, path], options)) {
      nextNode = {
        ...node,
        [idKey]: idCreator(),
      };
    }

    if (ElementApi.isElement(node)) {
      const nextChildren = node.children.map((child, index) => {
        const nextChild = normalizeNode(child as Descendant, [...path, index]);

        if (nextChild !== child) {
          childrenChanged = true;
        }

        return nextChild;
      });

      if (childrenChanged) {
        nextNode =
          nextNode === node
            ? {
                ...node,
                children: nextChildren,
              }
            : {
                ...nextNode,
                children: nextChildren,
              };
      }
    }

    return nextNode;
  };

  let valueChanged = false;

  const nextValue = value.map((node, index) => {
    const nextNode = normalizeNode(node, [index]);

    if (nextNode !== node) {
      valueChanged = true;
    }

    return nextNode;
  }) as V;

  return valueChanged ? nextValue : value;
};

export const normalizeNodeId = <V extends Value>(
  value: V,
  options: NormalizeNodeIdOptions = {}
): V => normalizeNodeIdRuntime(value, options);

export const normalizeNodeIdWithEditor = <V extends Value>(
  editor: { api: { isBlock: (node: Descendant) => boolean } },
  value: V,
  options: NormalizeNodeIdOptions = {}
): V =>
  normalizeNodeIdRuntime(value, {
    ...options,
    isBlock: editor.api.isBlock,
  });

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
    filter: () => true,
    idCreator: () => nanoid(10),
  },
})
  .extendTransforms(({ editor, getOptions }) => ({
    normalize() {
      const options = getOptions();
      const { idCreator, idKey } = options;
      const updates: { at: number[]; props: Record<string, unknown> }[] = [];

      if (
        isDefaultNodeIdFastPath({ ...options, isBlock: editor.api.isBlock })
      ) {
        const path: number[] = [];

        const visitFast = (node: Descendant) => {
          if (!ElementApi.isElement(node)) return;
          if (!isBlockCandidate(node, editor.api.isBlock)) return;

          if (!node[idKey!]) {
            updates.push({
              at: [...path],
              props: { [idKey!]: idCreator!() },
            });
          }

          node.children.forEach((child: any, index: number) => {
            path.push(index);
            visitFast(child);
            path.pop();
          });
        };

        editor.children.forEach((node, index) => {
          path.push(index);
          visitFast(node);
          path.pop();
        });

        if (updates.length === 0) return;

        editor.tf.withoutSaving(() => {
          editor.tf.setNodesBatch(updates as any);
        });

        return;
      }

      const addNodeId = (entry: [Descendant, number[]]) => {
        const [node, path] = entry;

        if (
          shouldAssignNodeId(entry, { ...options, isBlock: editor.api.isBlock })
        ) {
          updates.push({
            at: path,
            props: { [idKey!]: idCreator!() },
          });
        }

        // Only traverse children if this is an Element node
        if (ElementApi.isElement(node)) {
          node.children.forEach((child: any, index: number) => {
            addNodeId([child, [...path, index]]);
          });
        }
      };

      // Start traversal from top-level nodes.
      editor.children.forEach((node, index) => {
        addNodeId([node, [index]]);
      });

      if (updates.length === 0) return;

      editor.tf.withoutSaving(() => {
        editor.tf.setNodesBatch(updates as any);
      });
    },
  }))
  .extend({
    transformInitialValue: ({ editor, getOptions, value }): Value => {
      const options = getOptions();
      const { idKey = 'id' } = options;
      const initialValueIds = resolveInitialValueIds(options);

      if (initialValueIds === false) {
        return value;
      }

      // Perf: check if normalization is needed by looking at the first node and last node
      if (initialValueIds === 'if-needed') {
        const firstNode = value[0];
        const lastNode = value.at(-1);

        if (firstNode?.[idKey] && lastNode?.[idKey]) {
          return value;
        }
      }

      return normalizeNodeIdWithEditor(editor, value, options);
    },
  })
  .overrideEditor(withNodeId);
