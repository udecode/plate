import {
  type Editor as SlateV2Editor,
  type Element as PliteElement,
  ElementApi,
  PointApi,
} from '@platejs/plite';
import { type BasePlateEditor, KEYS } from 'platejs';

import type { MentionConfig } from './BaseMentionPlugin';
import type { TMentionItemBase } from './types';

export type MentionOnSelectItem<
  TItem extends TMentionItemBase = TMentionItemBase,
> = (editor: BasePlateEditor, item: TItem, search?: string) => void;

const isSelectionAtBlockEnd = (editor: BasePlateEditor) =>
  (editor as unknown as SlateV2Editor).read((state) => {
    const selection = state.selection.get();

    if (!selection) return false;

    const block = state.nodes.above<PliteElement>({
      match: (node) => ElementApi.isElement(node) && state.nodes.isBlock(node),
    });

    if (!block) return false;

    return PointApi.equals(selection.anchor, state.points.end(block[1]));
  });

export const getMentionOnSelectItem =
  <TItem extends TMentionItemBase = TMentionItemBase>({
    key = KEYS.mention,
  }: {
    key?: string;
  } = {}): MentionOnSelectItem<TItem> =>
  (editor, item, search = '') => {
    const { insertSpaceAfterMention } = editor.getOptions<MentionConfig>({
      key: key as MentionConfig['key'],
    });
    const shouldInsertSpace =
      insertSpaceAfterMention && isSelectionAtBlockEnd(editor);

    editor.update<MentionConfig['tx']>((tx) => {
      tx.mention.insert({
        key: item.key,
        search,
        trailingText: shouldInsertSpace ? ' ' : undefined,
        value: item.text,
      });
    });
  };
