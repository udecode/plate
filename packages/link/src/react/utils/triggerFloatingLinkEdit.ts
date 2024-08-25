import {
  type SlateEditor,
  findNode,
  getEditorPlugin,
  getEditorString,
} from '@udecode/plate-common';

import type { TLinkElement } from '../../lib';

import { LinkPlugin } from '../LinkPlugin';

export const triggerFloatingLinkEdit = (editor: SlateEditor) => {
  const { setOption } = getEditorPlugin(editor, LinkPlugin);

  const entry = findNode<TLinkElement>(editor, {
    match: { type: editor.getType(LinkPlugin) },
  });

  if (!entry) return;

  const [link, path] = entry;

  let text = getEditorString(editor, path);

  setOption('url', link.url);
  setOption('newTab', link.target === '_blank');

  if (text === link.url) {
    text = '';
  }

  setOption('text', text);
  setOption('isEditing', true);

  return true;
};
