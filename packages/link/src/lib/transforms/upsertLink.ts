import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
  Text,
} from '@platejs/plite';
import { NodeApi, RangeApi } from '@platejs/plite';
import type { TLinkElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

import { type CreateLinkNodeOptions, validateUrl } from '../utils';
import { insertLink } from './insertLink';
import type { UnwrapLinkOptions } from './unwrapLink';
import { unwrapLink } from './unwrapLink';
import { upsertLinkText } from './upsertLinkText';
import { type WrapLinkOptions, wrapLink } from './wrapLink';

export type UpsertLinkOptions = {
  insertNodesOptions?: NodeInsertNodesOptions<TLinkElement | Text>;
  /** Insert text when the selection is already in a link. */
  insertTextInLink?: boolean;
  skipValidation?: boolean;
  unwrapNodesOptions?: UnwrapLinkOptions;
  wrapNodesOptions?: Omit<WrapLinkOptions, 'url'>;
} & CreateLinkNodeOptions;

/** Insert or update a link at the current selection. */
export const upsertLink = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    insertNodesOptions,
    insertTextInLink,
    skipValidation = false,
    target,
    text,
    unwrapNodesOptions,
    url,
    wrapNodesOptions,
  }: UpsertLinkOptions
) => {
  const selection = tx.selection();

  if (!selection) return;

  const linkAbove = tx.nodes.above<TLinkElement>({
    at: selection,
    match: { type: editor.getType(KEYS.link) },
  });

  if (insertTextInLink && linkAbove) {
    tx.text.insert(url, { at: selection });

    return true;
  }
  if (!skipValidation && !validateUrl(editor, url)) return;

  const nextText = isDefined(text) && text.length === 0 ? url : text;

  if (linkAbove) {
    const [link] = linkAbove;

    if (url !== link.url || target !== link.target) {
      tx.nodes.set<TLinkElement>({ target, url }, { at: link });
    }

    upsertLinkText(editor, tx, { target, text: nextText, url });

    return true;
  }

  const linkEntry = tx.nodes.find<TLinkElement>({
    at: selection,
    match: { type: editor.getType(KEYS.link) },
  });

  if (RangeApi.isExpanded(selection)) {
    unwrapLink(editor, tx, { split: true, ...unwrapNodesOptions });
    wrapLink(editor, tx, { target, url, ...wrapNodesOptions });
    upsertLinkText(editor, tx, { target, text: nextText, url });

    return true;
  }

  const path = selection.focus.path;
  const leaf = tx.nodes.leaf(path);

  if (!leaf) return;

  insertLink(
    editor,
    tx,
    {
      ...(linkEntry ? NodeApi.extractProps(linkEntry[0]) : {}),
      children: [{ ...leaf[0], text: nextText?.length ? nextText : url }],
      target,
      url,
    },
    insertNodesOptions
  );

  return true;
};
