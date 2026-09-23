import {
  type Descendant,
  ElementApi,
  NodeApi,
  type NodeMatch,
  PathApi,
} from '../../facade';
import { definePlugin } from '../../lib/plugin/definePlugin';
import type { DefinitionOf } from '../../lib/plugin/PluginDefinition';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { PLUGINS } from '../plate-keys';

export type TrailingBlockPluginState = {
  /** Level where the trailing node should be, the first level being 0. */
  level: number;
  /** Match the last node before inserting the trailing block. */
  match: NodeMatch<Descendant> | null;
  /** Type of the trailing block */
  type: string;
};

export const TrailingBlockPlugin = definePlugin(PLUGINS.trailingBlock, {
  initialState: ({ editor }): TrailingBlockPluginState => ({
    level: 0,
    match: null,
    type: editor.plugin(BaseParagraphPlugin).schema.type,
  }),
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct({ editor, tx }) {
        const { level, match, type } = editor
          .plugin(TrailingBlockPlugin)
          .store.get();
        const lastChild =
          tx.nodes.children().length > 0
            ? tx.nodes.last([], { level })
            : undefined;
        const lastChildNode = lastChild?.[0];
        const lastChildType = ElementApi.isElement(lastChildNode)
          ? lastChildNode.type
          : undefined;

        if (
          !lastChildNode ||
          (lastChildType !== type &&
            (!match ||
              (NodeApi.isDescendant(lastChildNode) &&
                NodeApi.matches(lastChildNode, match, lastChild[1]))))
        ) {
          const at = lastChild ? PathApi.next(lastChild[1]) : [0];

          tx.nodes.insert(tx.schema.create(type), { at });
        }
      },
    },
  ],
});

export type TrailingBlockDefinition = DefinitionOf<typeof TrailingBlockPlugin>;
