import {
  type DefinitionOf,
  defineBasePlugin,
  ElementIdPlugin,
} from '@platejs/core';
import type { EditorStateView, Element, Path } from '@platejs/plite';
import { ElementApi, NodeApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

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
  dependencies: [ElementIdPlugin],
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

      for (const [node, path] of state.nodes.entries<Element>({
        at: [],
        match: (node) =>
          ElementApi.isElement(node) &&
          typeof node.type === 'string' &&
          headingDepthByType.has(node.type),
      })) {
        const title = NodeApi.string(node);

        if (title) {
          headings.push({
            depth: headingDepthByType.get(node.type)!,
            id: editor.plugin(ElementIdPlugin).read.id(node),
            path,
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
