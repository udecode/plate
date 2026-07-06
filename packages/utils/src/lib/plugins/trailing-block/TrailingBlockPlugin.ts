import {
  createBasePlugin,
  type PluginConfig,
  type BaseEditor,
} from '@platejs/core';
import {
  ElementApi,
  PathApi,
  queryNode,
  type Path,
  type QueryNodeOptions,
} from '@platejs/plite';

import { KEYS } from '../../plate-keys';

export type TrailingBlockInsertOptions = {
  at: Path;
  insert: () => void;
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
    level?: number;
    /** Type of the trailing block */
    type?: string;
  } & QueryNodeOptions
>;

export const TrailingBlockPlugin = createBasePlugin<TrailingBlockConfig>({
  key: KEYS.trailingBlock,
  options: {
    level: 0,
  },
})
  .extend(({ editor }) => ({
    options: {
      type: editor.getType(KEYS.p),
    },
  }))
  .extendExtension(({ editor, getOptions }) => ({
    normalizers: {
      editor({ next, tx }) {
        const { insert, level, type, ...query } = getOptions();
        const trailingType = type ?? editor.getType(KEYS.p);
        const lastChild =
          editor.read.children().length > 0
            ? editor.read.nodes.last([], { level })
            : undefined;
        const lastChildNode = lastChild?.[0];
        const lastChildType = ElementApi.isElement(lastChildNode)
          ? lastChildNode.type
          : undefined;

        if (
          !lastChildNode ||
          (lastChildType !== trailingType && queryNode(lastChild, query))
        ) {
          const at = lastChild ? PathApi.next(lastChild[1]) : [0];
          const insertTrailingBlock = () => {
            tx.nodes.insert(
              { children: [{ text: '' }], type: trailingType },
              { at }
            );
          };

          if (insert) {
            insert(editor, {
              at,
              insert: insertTrailingBlock,
              type: trailingType,
            });
          } else {
            insertTrailingBlock();
          }

          return;
        }

        next();
      },
    },
  }));
