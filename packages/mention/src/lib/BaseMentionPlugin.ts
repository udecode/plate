import type { TriggerComboboxPluginOptions } from '@platejs/combobox';
import type { EditorUpdateTransaction } from '@platejs/plite';
import {
  type PluginConfig,
  type EditorPlugin,
  type TMentionElement,
  createEditorPlugin,
  KEYS,
} from 'platejs';

export type MentionInsertOptions = {
  key?: number | string;
  search?: string;
  trailingText?: string;
  value: string;
};

type MentionElement = TMentionElement & {
  key?: number | string;
};

type MentionTx = {
  mention: {
    insert: (options: MentionInsertOptions) => void;
  };
};

export type MentionConfig = PluginConfig<
  typeof KEYS.mention,
  {
    insertSpaceAfterMention?: boolean;
  } & TriggerComboboxPluginOptions,
  {},
  {},
  {},
  MentionTx
>;

export const BaseMentionInputPlugin = createEditorPlugin({
  key: KEYS.mentionInput,
  node: { isElement: true, isInline: true, isVoid: true },
});

const createMentionNode = (
  type: string,
  { key, value }: MentionInsertOptions
): MentionElement => ({
  key,
  children: [{ text: '' }],
  type,
  value,
});

/** Enables support for autocompleting @mentions. */
const BaseMentionPluginBase: EditorPlugin<MentionConfig> =
  createEditorPlugin<MentionConfig>({
    key: KEYS.mention,
    node: {
      isElement: true,
      isInline: true,
      isMarkableVoid: true,
      isVoid: true,
    },
    options: {
      trigger: '@',
      triggerPreviousCharPattern: /^\s?$/,
      createComboboxInput: (trigger) => ({
        children: [{ text: '' }],
        trigger,
        type: KEYS.mentionInput,
      }),
    },
    plugins: [BaseMentionInputPlugin],
  }).extendTx(({ type }) => (tx: EditorUpdateTransaction) => ({
    insert: ({ trailingText = '', ...options }: MentionInsertOptions) => {
      tx.nodes.insert([
        createMentionNode(type, options),
        { text: trailingText },
      ]);
    },
  }));

export const BaseMentionPlugin: EditorPlugin<MentionConfig> & {
  runtimeTriggerCombobox: boolean;
} = Object.assign(BaseMentionPluginBase, {
  runtimeTriggerCombobox: true,
});
