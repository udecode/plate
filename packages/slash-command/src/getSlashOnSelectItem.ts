import {
  type ComboboxOnSelectItem,
  type Data,
  type NoData,
  type TComboboxItem,
  comboboxActions,
  comboboxSelectors,
} from '@udecode/plate-combobox';
import {
  type PlatePluginKey,
  type TNodeProps,
  getBlockAbove,
  getPlugin,
  insertText,
  isEndPoint,
  moveSelection,
  removeNodes,
  withoutMergingHistory,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { SlashPlugin, TSlashElement } from './types';

import { KEY_SLASH_COMMAND } from './createSlashPlugin';
import { isNodeSlashInput } from './queries/isNodeSlashInput';

export type CreateSlashNode<TData extends Data> = (
  item: TComboboxItem<TData>,
  meta: CreateSlashNodeMeta
) => TNodeProps<TSlashElement>;

export interface CreateSlashNodeMeta {
  search: string;
}

export const getSlashOnSelectItem =
  <TData extends Data = NoData>({
    key = KEY_SLASH_COMMAND,
  }: PlatePluginKey = {}): ComboboxOnSelectItem<TData> =>
  (editor: any, item: any) => {
    const targetRange = comboboxSelectors.targetRange();

    if (!targetRange) return;

    const {
      options: { insertSpaceAfterSlash, rules },
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
