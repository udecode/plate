import {
  comboboxActions,
  ComboboxOnSelectItem,
  comboboxSelectors,
  Data,
  NoData,
  TComboboxItem,
} from '@udecode/plate-combobox';
import {
  getBlockAbove,
  getPlugin,
  insertNodes,
  insertText,
  isEndPoint,
  moveSelection,
  PlatePluginKey,
  removeNodes,
  select,
  TNodeProps,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-common';
import { ELEMENT_MENTION, ELEMENT_MENTION_INPUT } from './createMentionPlugin';
import { MentionPlugin, TMentionElement } from './types';

export interface CreateMentionNode<TData extends Data> {
  (
    item: TComboboxItem<TData>,
    meta: CreateMentionNodeMeta
  ): TNodeProps<TMentionElement>;
}

export interface CreateMentionNodeMeta {
  search: string;
}

export const getMentionOnSelectItem = <TData extends Data = NoData>({
  key = ELEMENT_MENTION,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const targetRange = comboboxSelectors.targetRange();
  if (!targetRange) return;

  const {
    type,
    options: { insertSpaceAfterMention, createMentionNode },
  } = getPlugin<MentionPlugin>(editor as any, key);

  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd = () =>
    editor.selection &&
    pathAbove &&
    isEndPoint(editor, editor.selection.anchor, pathAbove);

  withoutNormalizing(editor, () => {
    // Selectors are sensitive to operations, it's better to create everything
    // before the editor state is changed. For example, asking for text after
    // removeNodes below will return null.
    const props = createMentionNode!(item, {
      search: comboboxSelectors.text() ?? '',
    });

    select(editor, targetRange);

    withoutMergingHistory(editor, () =>
      removeNodes(editor, {
        match: (node) => node.type === ELEMENT_MENTION_INPUT,
      })
    );

    insertNodes<TMentionElement>(editor, {
      type,
      children: [{ text: '' }],
      ...props,
    } as TMentionElement);

    // move the selection after the element
    moveSelection(editor, { unit: 'offset' });

    if (isBlockEnd() && insertSpaceAfterMention) {
      insertText(editor, ' ');
    }
  });

  return comboboxActions.reset();
};
