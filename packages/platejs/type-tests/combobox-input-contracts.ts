import {
  createEditor,
  type NodeKey,
  type PlatePluginTransaction,
} from 'platejs';
import { BaseComboboxPlugin } from 'platejs/combobox';
import { BaseMentionPlugin } from 'platejs/mention';

const editor = createEditor({ plugins: [BaseMentionPlugin] });
declare const input: NodeKey;
const completed: boolean = editor
  .plugin(BaseComboboxPlugin)
  .api.commit(input, (tx) => {
    tx.plugin(BaseMentionPlugin).insert({ ref: 'alice', label: 'Alice' });
    // @ts-expect-error Mention identity is inferred through the transaction portal.
    tx.plugin(BaseMentionPlugin).insert({ ref: 123 });
  });
const transactionConsumer = (tx: PlatePluginTransaction) => {
  tx.plugin(BaseMentionPlugin).insert({ ref: 'alice' });
  // @ts-expect-error A generic transaction still preserves descriptor inference.
  tx.plugin(BaseMentionPlugin).insert({ ref: false });
};
const cancelled: boolean = editor
  .plugin(BaseComboboxPlugin)
  .api.cancel(input, { text: '@alice', select: 'end' });
// @ts-expect-error Cancellation places the cursor at a text boundary.
editor.plugin(BaseComboboxPlugin).api.cancel(input, { select: 'outside' });
void [completed, cancelled, transactionConsumer];
