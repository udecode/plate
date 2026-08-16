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
      const headingDepthByType = new Map(
        [PLUGINS.h1, PLUGINS.h2, PLUGINS.h3, PLUGINS.h4, PLUGINS.h5, PLUGINS.h6]
          .map((name, index) => [editor.plugin(name), index + 1] as const)
          .filter(([plugin]) => plugin.installed)
          .map(([plugin, depth]) => [plugin.schema.type, depth] as const)
      );

      for (const [node] of state.nodes.entries({
        at: [],
        type: [...headingDepthByType.keys()],
      })) {
        const title = NodeApi.string(node);

        if (title) {
          headings.push({
            depth: headingDepthByType.get(node.type)!,
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
