import {
  type Descendant,
  ElementApi,
  NodeApi,
  type NodeMatch,
  PathApi,
} from '../../facade';
import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import type { DefinitionOf } from '../../lib/plugin/PluginDefinition';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { PLUGINS } from '../plate-keys';

export type TrailingBlockPluginState = {
  /** Wrap the default insertion without exposing the active transaction. */
  insert?: (defaultInsert: () => void) => void;
  /** Level where the trailing node should be, the first level being 0. */
  level: number;
  /** Match the last node before inserting the trailing block. */
  match?: NodeMatch<Descendant>;
  /** Type of the trailing block */
  type: string;
};

export const TrailingBlockPlugin = defineBasePlugin(PLUGINS.trailingBlock, {
  initialState: ({ editor }): TrailingBlockPluginState => ({
    level: 0,
    type: editor.plugin(BaseParagraphPlugin).schema.type,
  }),
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct({ editor, tx }) {
        const { insert, level, match, type } = editor
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
          const insertDefault = () => {
            tx.nodes.insert({ children: [{ text: '' }], type }, { at });
          };

          if (insert) {
            insert(insertDefault);
          } else {
            insertDefault();
          }
        }
      },
    },
  ],
});

export type TrailingBlockDefinition = DefinitionOf<typeof TrailingBlockPlugin>;
