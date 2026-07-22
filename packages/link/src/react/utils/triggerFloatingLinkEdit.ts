import type { PlateEditor } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

import { LinkPlugin } from '../LinkPlugin';

export const triggerFloatingLinkEdit = (editor: PlateEditor) => {
  const { setOption } = editor.plugin(LinkPlugin);
  const selection = editor.read.selection();

  if (!selection) return;

  const entry = editor.read.nodes.above<TLinkElement>({
    at: selection,
    match: { type: editor.getType(KEYS.link) },
  });

  if (!entry) return;

  const [link, path] = entry;

  let text = editor.read.text.string(path);

  setOption('url', link.url);
  setOption('newTab', link.target === '_blank');

  if (text === link.url) {
    text = '';
  }

  setOption('text', text);
  setOption('isEditing', true);

  return true;
};
