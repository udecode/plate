import {
  createBasePlugin,
  type BaseEditor,
  type PluginConfig,
} from '@platejs/core';
import {
  type EditorUpdateTransaction,
  ElementApi,
  type Node,
  NodeApi,
  type NodeMatch,
  PathApi,
  type Path,
} from '@platejs/plite';

import { KEYS } from '../../plate-keys';

export type TrailingBlockInsertOptions = {
  at: Path;
  insert: () => void;
  tx: Pick<EditorUpdateTransaction, 'tags'>;
  type: string;
};

export type TrailingBlockConfig = PluginConfig<
  'trailingBlock',
  {
    /**
     * Customize how the trailing block is inserted.
     *
     * Useful when another plugin needs to wrap the insertion, such as
     * disabling suggestions during normalization-generated inserts.
     */
    insert?: (editor: BaseEditor, options: TrailingBlockInsertOptions) => void;
    /** Level where the trailing node should be, the first level being 0. */
    level: number;
    /** Match the last node before inserting the trailing block. */
    match?: NodeMatch<Node>;
    /** Type of the trailing block */
    type: string;
  }
>;

export const TrailingBlockPlugin = createBasePlugin<TrailingBlockConfig>({
  extension: ({ editor, getOptions }) => ({
    corrections: [
      {
        event: 'children',
        query: 'root',
        correct({ tx }) {
          const { insert, level, match, type } = getOptions();
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
            const insertTrailingBlock = () => {
              tx.nodes.insert({ children: [{ text: '' }], type }, { at });
            };

            if (insert) {
              insert(editor, {
                at,
                insert: insertTrailingBlock,
                tx,
                type,
              });
            } else {
              insertTrailingBlock();
            }
          }
        },
      },
    ],
  }),
  key: KEYS.trailingBlock,
  options: ({ editor }) => ({
    level: 0,
    type: editor.getType(KEYS.p),
  }),
});
