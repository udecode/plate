import {
  definePlugin,
  ElementApi,
  NodeApi,
  PLUGINS,
  type DefinitionOf,
  type EditorStateView,
  type NodeKey,
} from '../../../core';
import { registerFirstPartyPlugin } from '../../../internal/plugin/firstPartyPlugin';
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
  read: ({ editor, store, state }) => ({
    headings: () => {
      const { queryHeading } = store.get();

      if (queryHeading) return queryHeading(state);

      const headings: Heading[] = [];
      const heading = editor.plugin(BaseHeadingPlugin);

      if (!heading.installed) return headings;

      for (const [node] of state.nodes.entries({
        at: [],
        match: ElementApi.isElement,
      })) {
        const depth = heading.read.level(node);

        if (depth === undefined) continue;

        const title = NodeApi.string(node);

        if (title) {
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
  render: { readsDocument: true },
  schema: {
    element: {
      void: 'block',
    },
  },
});

export type TocDefinition = DefinitionOf<typeof BaseTocPlugin>;

registerFirstPartyPlugin(BaseTocPlugin);
