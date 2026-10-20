import {
  definePlugin,
  ElementApi,
  NodeApi,
  PLUGINS,
  type DefinitionOf,
  type Editor,
  type EditorStateView,
  type NodeKey,
} from '../../../core';
import { BaseHeadingPlugin, type HeadingLevel } from '../../basic-nodes';

export type Heading = {
  key: NodeKey;
  level: HeadingLevel;
  title: string;
};

/**
 * Lists every titled heading in `state`, in document order, at the level the
 * installed `BaseHeadingPlugin` reads. A read override filters this list to
 * change which headings a table of contents shows. `editor`'s heading plugin
 * reads each level, so pass the `editor` and `state` of one read.
 */
export const readTocHeadings = ({
  editor,
  state,
}: Readonly<{ editor: Editor; state: EditorStateView }>): Heading[] => {
  const heading = editor.plugin(BaseHeadingPlugin);

  if (!heading.installed) return [];

  const headings: Heading[] = [];

  for (const [node] of state.nodes.entries({
    at: [],
    match: ElementApi.isElement,
  })) {
    const level = heading.read.level(node);

    if (level === undefined) continue;

    const title = NodeApi.string(node);

    if (title) {
      headings.push({ key: state.key(node), level, title });
    }
  }

  return headings;
};

export const BaseTocPlugin = definePlugin(PLUGINS.toc, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: { tag: type },
    }),
  read: ({ editor, state }) => ({
    headings: () => readTocHeadings({ editor, state }),
  }),
  render: { readsDocument: true },
  schema: {
    element: {
      void: 'block',
    },
  },
});

export type TocDefinition = DefinitionOf<typeof BaseTocPlugin>;
