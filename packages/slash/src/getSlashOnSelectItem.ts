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
  insertText,
  isEndPoint,
  moveSelection,
  PlatePluginKey,
  removeNodes,
  TNodeProps,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-common';

import { ELEMENT_SLASH_COMMAND } from './createSlashPlugin';
import { isNodeSlashInput } from './queries/isNodeSlashInput';
import { SlashPlugin, TSlashElement } from './types';

export interface CreateSlashNode<TData extends Data> {
  (
    item: TComboboxItem<TData>,
    meta: CreateSlashNodeMeta
  ): TNodeProps<TSlashElement>;
}

export interface CreateSlashNodeMeta {
  search: string;
}

export const getSlashOnSelectItem =
  <TData extends Data = NoData>({
    key = ELEMENT_SLASH_COMMAND,
  }: PlatePluginKey = {}): ComboboxOnSelectItem<TData> =>
  (editor: any, item: any) => {
    const targetRange = comboboxSelectors.targetRange();
    if (!targetRange) return;

    const {
      options: { rules, insertSpaceAfterSlash },
    } = getPlugin<SlashPlugin>(editor, key);

    const pathAbove = getBlockAbove(editor)?.[1];
    const isBlockEnd = () =>
      editor.selection &&
      pathAbove &&
      isEndPoint(editor, editor.selection.anchor, pathAbove);

    withoutNormalizing(editor, () => {
      // Selectors are sensitive to operations, it's better to create everything
      // before the editor state is changed. For example, asking for text after
      // removeNodes below will return null.

      withoutMergingHistory(editor, () =>
        removeNodes(editor, {
          match: (node) => isNodeSlashInput(editor, node),
        })
      );

      if (rules) {
        const target = rules.find((rule) => rule.key === item.key);
        target && target.onTrigger(editor, target.key);
      }

      // move the selection after the element
      moveSelection(editor, { unit: 'offset' });

      if (isBlockEnd() && insertSpaceAfterSlash) {
        insertText(editor, ' ');
      }
    });

    return comboboxActions.reset();
  };
