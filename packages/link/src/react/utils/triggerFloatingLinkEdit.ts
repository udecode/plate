import {
  type BasePlateEditor,
  type TLinkElement,
  getEditorPlugin,
  KEYS,
} from 'platejs';
import type { NodeEntry } from '@platejs/plite';

import { LinkPlugin } from '../LinkPlugin';

export const triggerFloatingLinkEdit = (editor: BasePlateEditor) => {
  const { setOption } = getEditorPlugin(editor, LinkPlugin);

  const entry = editor.api.node({
    match: { type: editor.getType(KEYS.link) },
  }) as NodeEntry<TLinkElement> | undefined;

  if (!entry) return;

  const [link, path] = entry;

  let text = editor.api.string(path);

  setOption('url', link.url);
  setOption('newTab', link.target === '_blank');

  if (text === link.url) {
    text = '';
  }

  setOption('text', text);
  setOption('isEditing', true);

  return true;
};
