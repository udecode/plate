import { type InferConfig, createBasePlugin } from '@platejs/core';
import type {
  EditorStateView,
  Element,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import { ElementApi, NodeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { Heading } from './types';

export type TocPluginState = {
  isScroll: boolean;
  topOffset: number;
  queryHeading?: (state: EditorStateView) => Heading[];
};

const initialState: TocPluginState = {
  isScroll: true,
  topOffset: 80,
};

export const BaseTocPlugin = createBasePlugin({
  key: KEYS.toc,
  schema: {
    element: {
      void: 'block',
    },
  },
  initialState,
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
