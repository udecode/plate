import { type InferConfig, createBasePlugin } from '@platejs/core';
import type {
  EditorStateView,
  Element,
  NodeInsertNodesOptions,
  Path,
} from '@platejs/plite';
import { ElementApi, NodeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type Heading = {
  depth: number;
  id: string;
  path: Path;
  title: string;
  type: string;
};

export type TocPluginState = {
  isScroll: boolean;
  topOffset: number;
  queryHeading?: (state: EditorStateView) => Heading[];
};

export const BaseTocPlugin = createBasePlugin({
  initialState: (): TocPluginState => ({
    isScroll: true,
    topOffset: 80,
  }),
  key: KEYS.toc,
  schema: {
    element: {
      void: 'block',
    },
  },
  read: ({ store, state }) => ({
    headings: () => {
      const { queryHeading } = store.get();

      if (queryHeading) return queryHeading(state);

      const headings: Heading[] = [];

      for (const [node, path] of state.nodes.entries<Element>({
        at: [],
        match: (node) =>
          ElementApi.isElement(node) &&
          typeof node.type === 'string' &&
          KEYS.heading.some((type) => type === node.type),
      })) {
        const title = NodeApi.string(node);

        if (title && typeof node.id === 'string') {
          headings.push({
            depth: Number.parseInt(node.type.slice(1), 10),
            id: node.id,
            path,
            title,
            type: node.type,
          });
        }
      }

      return headings;
    },
  }),
  update: ({ tx, type }) => ({
    insert: (options?: NodeInsertNodesOptions<Element>) => {
      tx.nodes.insert(
        {
          children: [{ text: '' }],
          type,
        },
        options
      );
    },
  }),
});

export type TocConfig = InferConfig<typeof BaseTocPlugin>;
