import {
  defineBasePlugin,
  NodeApi,
  PLUGINS,
  type DefinitionOf,
  type Path,
  ElementApi,
  type NodeKey,
} from '../../../core';
import type { StaticDocument } from '../../../lib/types/StaticDocument';

export type Heading<TKey extends string = NodeKey> = {
  depth: number;
  key: TKey;
  title: string;
  type: string;
};

export type TocPluginState = {
  isScroll: boolean;
  topOffset: number;
  /** Select headings by document path; rendering supplies the appropriate identity. */
  queryHeading?: (
    document: Pick<StaticDocument, 'nodes'>
  ) => Array<Omit<Heading, 'key'> & { path: Path }>;
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
  read: ({ store, state }) => {
    function headings(options: {
      document: StaticDocument;
    }): Array<Heading<string>>;
    function headings(): Heading[];
    function headings(options?: {
      document: StaticDocument;
    }): Array<Heading<string>> {
      const document = options?.document;
      const source: Pick<StaticDocument, 'nodes'> = document ?? {
        nodes: {
          get: state.nodes.get,
          parent: state.nodes.parent,
          path: state.nodes.path,
          entries: () => state.nodes.entries({ at: [] }),
        },
      };
      const { queryHeading } = store.get();
      const heading = editor.plugin(PLUGINS.heading);
      const candidates = queryHeading
        ? queryHeading(source)
        : [...source.nodes.entries()].flatMap(([node, path]) => {
            if (
              !heading.installed ||
              !ElementApi.isElement(node) ||
              node.type !== heading.schema.type
            ) {
              return [];
            }
            const title = NodeApi.string(node);
            const depth = node.level;
            return title &&
              typeof depth === 'number' &&
              Number.isInteger(depth) &&
              depth >= 1 &&
              depth <= 6
              ? [{ depth, path, title, type: node.type }]
              : [];
          });
      return candidates.flatMap(({ path, ...entry }) => {
        if (!source.nodes.get(path)) return [];
        const key = document ? document.anchorId(path) : state.key(path);
        return key ? [{ ...entry, key }] : [];
      });
    }
    return { headings };
  },
}));

export type TocDefinition = DefinitionOf<typeof BaseTocPlugin>;
