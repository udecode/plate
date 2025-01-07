import { type SlateEditor, getEditorPlugin } from '@udecode/plate';

import { upsertLink, validateUrl } from '../../lib';
import { LinkPlugin } from '../LinkPlugin';

/**
 * Insert link if url is valid. Text is url if empty. Close floating link. Focus
 * editor.
 */
export const submitFloatingLink = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const { api, getOptions } = getEditorPlugin(editor, LinkPlugin);

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

  upsertLink(editor, {
    skipValidation: true,
    target,
    text,
    url,
  });

  setTimeout(() => {
    editor.tf.focus({ at: editor.selection! });
  }, 0);

  return true;
};
