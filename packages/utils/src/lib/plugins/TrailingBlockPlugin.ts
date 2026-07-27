import { createBasePlugin, type PluginConfig } from '@platejs/core';
import {
  ElementApi,
  type Node,
  NodeApi,
  type NodeMatch,
  PathApi,
} from '@platejs/plite';

import { KEYS } from '../plate-keys';

export type TrailingBlockConfig = PluginConfig<
  'trailingBlock',
  {
    /**
     * Wrap the default insertion without exposing the active editor
     * transaction.
     */
    insert?: (defaultInsert: () => void) => void;
    /** Level where the trailing node should be, the first level being 0. */
    level: number;
    /** Match the last node before inserting the trailing block. */
    match?: NodeMatch<Node>;
    /** Type of the trailing block */
    type: string;
  }
>;

export const TrailingBlockPlugin = createBasePlugin<TrailingBlockConfig>({
  extension: ({ store }) => ({
    corrections: [
      {
        event: 'children',
        query: 'root',
        correct({ tx }) {
          const { insert, level, match, type } = store.get();
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
              (!match || NodeApi.matches(lastChildNode, match, lastChild[1])))
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
  }),
  key: KEYS.trailingBlock,
  initialState: ({ editor }) => ({
    level: 0,
    type: editor.getType(KEYS.p),
  }),
});
