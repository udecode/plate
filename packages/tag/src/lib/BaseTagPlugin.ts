import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import type {
  PluginConfig,
  EditorPlugin,
  TTagElement,
  TTagProps,
} from 'platejs';

import { createEditorPlugin, KEYS } from 'platejs';

type TagInsertNode = TTagElement | { text: string };

export type InsertTagOptions = NodeInsertNodesOptions<TagInsertNode>;

type TagTx = {
  tag: {
    insert: (props: TTagProps, options?: InsertTagOptions) => void;
  };
};

export type TagConfig = PluginConfig<typeof KEYS.tag, {}, {}, {}, {}, TagTx>;

const createTagNodes = (type: string, props: TTagProps): TagInsertNode[] => [
  {
    children: [{ text: '' }],
    type,
    ...props,
  },
  { text: '' },
];

export const BaseTagPlugin: EditorPlugin<TagConfig> =
  createEditorPlugin<TagConfig>({
    key: KEYS.tag,
    node: {
      isElement: true,
      isInline: true,
      isVoid: true,
    },
  }).extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
    insert: (props: TTagProps, options?: InsertTagOptions) => {
      tx.nodes.insert(createTagNodes(type, props), options);
    },
  }));
