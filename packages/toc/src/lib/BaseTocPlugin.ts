import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import type { EditorStateView, NodeKey } from '@platejs/plite';
import { NodeApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type Heading = {
  depth: number;
  key: NodeKey;
  title: string;
  type: string;
};

export type TocPluginState = {
  isScroll: boolean;
  topOffset: number;
  queryHeading?: (state: EditorStateView) => Heading[];
};

export const BaseTocPlugin = defineBasePlugin(PLUGINS.toc, {
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ decode, decoration, node }) => ({
          children: decode(node.children, decoration),
          type,
        }),
        encode: ({ encodeFlow, node }) => ({
          attributes: [],
          children: encodeFlow(node.children),
          name: type,
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
}).extend(({ editor }) => ({
  read: ({ store, state }) => ({
    headings: () => {
      const { queryHeading } = store.get();

      if (queryHeading) return queryHeading(state);

      const headings: Heading[] = [];
      const heading = editor.plugin(PLUGINS.heading);

      if (!heading.installed) return headings;

      for (const [node] of state.nodes.entries({
        at: [],
        type: heading.schema.type,
      })) {
        const title = NodeApi.string(node);
        const depth = node.level;

        if (
          title &&
          typeof depth === 'number' &&
          Number.isInteger(depth) &&
          depth >= 1 &&
          depth <= 6
        ) {
          headings.push({
            depth,
            key: state.key(node),
            title,
            type: node.type,
          });
        }
      }

      return headings;
    },
  }),
}));

export type TocDefinition = DefinitionOf<typeof BaseTocPlugin>;
