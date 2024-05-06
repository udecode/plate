import {
  type PlateEditor,
  type Value,
  findNode,
  getEditorString,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { floatingLinkActions } from '../components/FloatingLink/floatingLinkStore';
import { ELEMENT_LINK } from '../createLinkPlugin';

export const triggerFloatingLinkEdit = <V extends Value>(
  editor: PlateEditor<V>
) => {
  const entry = findNode<TLinkElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  if (!entry) return;

  const [link, path] = entry;

  let text = getEditorString(editor, path);

  floatingLinkActions.url(link.url);

  floatingLinkActions.newTab(link.target === '_blank');

  if (text === link.url) {
    text = '';
  }

  floatingLinkActions.text(text);

  floatingLinkActions.isEditing(true);

  return true;
};
