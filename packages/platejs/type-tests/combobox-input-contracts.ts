import {
  BaseBlockquotePlugin,
  createEditor,
  type Editor,
  type NodeKey,
  type PluginTransaction,
} from 'platejs';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { BaseMentionPlugin } from 'platejs/mention';
import { KbdPlugin } from 'platejs/react';

const editor = createEditor({ plugins: [BaseMentionPlugin] });
const mentionType = editor.plugin(BaseMentionPlugin).schema.type;
declare const input: NodeKey;
const completed: boolean = editor
  .plugin(BaseComboboxPlugin)
  .api.commit(input, (tx) => {
    tx.plugin(BaseMentionPlugin).insert({ ref: 'alice' });
    tx.nodes.insert({
      children: [{ text: '' }],
      label: 'Alice',
      ref: 'alice',
      type: mentionType,
    });
    tx.plugin(BaseMentionPlugin.name).insert({ ref: 'alice' });
  });
const transactionConsumer = (tx: PluginTransaction) => {
  tx.plugin(BaseBlockquotePlugin).insert({}, { replaceEmpty: true });
  tx.plugin(KbdPlugin).toggle();
  tx.plugin(BaseMentionPlugin).insert({ ref: 'alice' });
  tx.plugin(BaseMentionPlugin.name).insert({ ref: 'alice' });
};
declare const genericEditor: Editor;
genericEditor.update((tx) => {
  tx.plugin(KbdPlugin).toggle();
});
const cancelled: boolean = editor
  .plugin(BaseComboboxPlugin)
  .api.cancel(input, { text: '@alice', select: 'end' });
// @ts-expect-error Cancellation places the cursor at a text boundary.
editor.plugin(BaseComboboxPlugin).api.cancel(input, { select: 'outside' });
void [completed, cancelled, transactionConsumer];
