import {
  comboboxActions,
  ComboboxOnSelectItem,
  comboboxSelectors,
  Data,
  NoData,
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
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-core';
import { ELEMENT_EMOJI, ELEMENT_EMOJI_INPUT } from './constants';
import { EmojiPlugin, TEmojiElement } from './types';

export const getEmojiOnSelectItem = <TData extends Data = NoData>({
  key = ELEMENT_EMOJI,
}: PlatePluginKey = {}): ComboboxOnSelectItem<TData> => (editor, item) => {
  const targetRange = comboboxSelectors.targetRange();
  if (!targetRange) return;

  const {
    type,
    options: { insertSpaceAfterEmoji, createEmojiNode },
  } = getPlugin<EmojiPlugin>(editor as any, key);

  const pathAbove = getBlockAbove(editor)?.[1];
  const isBlockEnd = () =>
    editor.selection &&
    pathAbove &&
    isEndPoint(editor, editor.selection.anchor, pathAbove);

  withoutNormalizing(editor, () => {
    // Selectors are sensitive to operations, it's better to create everything
    // before the editor state is changed. For example, asking for text after
    // removeNodes below will return null.
    const props = createEmojiNode!(item, {
      search: comboboxSelectors.text() ?? '',
    });

    select(editor, targetRange);

    withoutMergingHistory(editor, () =>
      removeNodes(editor, {
        match: (node) => node.type === ELEMENT_EMOJI_INPUT,
      })
    );

    insertNodes<TEmojiElement>(editor, {
      type,
      children: [{ text: '' }],
      ...props,
    } as TEmojiElement);

    // move the selection after the element
    moveSelection(editor, { unit: 'offset' });

    if (isBlockEnd() && insertSpaceAfterEmoji) {
      insertText(editor, ' ');
    }
  });

  return comboboxActions.reset();
};
