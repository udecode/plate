import {
  BaseBlockquotePlugin,
  BaseParagraphPlugin,
  type PluginTransaction,
} from 'platejs';
import { useCombobox } from 'platejs/combobox/react';
import { BaseMentionPlugin } from 'platejs/mention';
import { KbdPlugin } from 'platejs/react';

declare const editableRef: { current: HTMLDivElement | null };

export function MentionComboboxContract() {
  const box = useCombobox({ editableRef, plugin: BaseMentionPlugin });

  if (!box.match) return null;

  const completed: boolean = box.complete(box.match, (tx) => {
    tx.plugin(BaseMentionPlugin).insert({ ref: 'alice' });
    tx.plugin(BaseMentionPlugin.name).insert({ ref: 'alice' });
  });
  const refused: boolean = box.complete(box.match, (tx) => {
    if (!tx.selection()) return false;
    tx.plugin(BaseBlockquotePlugin).insert({}, { replaceEmpty: true });
  });

  // @ts-expect-error A completion runs inside one synchronous transaction.
  box.complete(box.match, async (tx) => {
    tx.plugin(KbdPlugin).toggle();
  });

  void [completed, refused];

  return null;
}

export function ParagraphComboboxContract() {
  // @ts-expect-error A combobox plugin keeps a ComboboxState trigger policy.
  useCombobox({ editableRef, plugin: BaseParagraphPlugin });

  return null;
}

const transactionConsumer = (tx: PluginTransaction) => {
  tx.plugin(KbdPlugin).toggle();
};

void transactionConsumer;
