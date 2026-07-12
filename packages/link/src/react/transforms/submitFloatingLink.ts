import type { PlateEditor } from '@platejs/core/react';

import { upsertLink, validateUrl } from '../../lib';
import { LinkPlugin } from '../LinkPlugin';

/**
 * Insert link if url is valid. Text is url if empty. Close floating link. Focus
 * editor.
 */
export const submitFloatingLink = (editor: PlateEditor) => {
  if (!editor.read.selection()) return;

  const { api, getOptions } = editor.plugin(LinkPlugin);

  const {
    forceSubmit,
    newTab,
    text,
    transformInput,
    url: inputUrl,
  } = getOptions();

  const url = transformInput ? (transformInput(inputUrl) ?? '') : inputUrl;

  if (!forceSubmit && !validateUrl(editor, url)) return;

  const target = newTab ? '_blank' : undefined;

  api.floatingLink.hide();

  editor.update((tx) => {
    upsertLink(editor, tx, {
      skipValidation: true,
      target,
      text,
      url,
    });
  });

  setTimeout(() => {
    editor.api.dom.focus();
  }, 0);

  return true;
};
