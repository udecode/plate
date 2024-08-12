import {
  type PlateEditor,
  findNode,
  getEditorString,
  getPluginType,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../LinkPlugin';
import { floatingLinkActions } from '../components/FloatingLink/floatingLinkStore';

export const triggerFloatingLinkEdit = (editor: PlateEditor) => {
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
