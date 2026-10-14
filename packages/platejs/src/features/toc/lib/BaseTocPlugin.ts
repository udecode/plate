import {
  definePlugin,
  NodeApi,
  PLUGINS,
  type DefinitionOf,
  type EditorStateView,
  type NodeKey,
} from '../../../core';
import { BaseHeadingPlugin } from '../../basic-nodes';

export type Heading = {
  depth: number;
  key: NodeKey;
  title: string;
  type: string;
};

export type TocPluginState = {
  queryHeading: ((state: EditorStateView) => Heading[]) | null;
};

export const BaseTocPlugin = definePlugin(PLUGINS.toc, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: { tag: type },
    }),
  initialState: (): TocPluginState => ({ queryHeading: null }),
  render: { readsDocument: true },
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
      const heading = editor.plugin(BaseHeadingPlugin);

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
