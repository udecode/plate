import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import type {
  EditorStateView,
  Element,
  NodeInsertNodesOptions,
  Path,
} from '@platejs/plite';
import { ElementApi, NodeApi } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

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

export const BaseTocPlugin = defineBasePlugin(KEYS.toc, {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/markdown': {
        from: 'toc',
        kind: 'node',
        decode: ({ decode, decoration, node, type }) => ({
          children: decode(node.children, decoration),
          type,
        }),
        encode: ({ encodeFlow, node }) => ({
          attributes: [],
          children: encodeFlow(node.children),
          name: 'toc',
          type: 'mdxJsxFlowElement',
        }),
      },
    }),
  initialState: (): TocPluginState => ({
    isScroll: true,
    topOffset: 80,
  }),
  schema: {
    element: {
      void: 'block',
    },
  },
}).extend({
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
          NODES.heading.some((type) => type === node.type),
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

export type TocDefinition = DefinitionOf<typeof BaseTocPlugin>;
