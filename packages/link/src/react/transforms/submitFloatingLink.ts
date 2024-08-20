import type { SlateEditor } from '@udecode/plate-common';

import { focusEditor } from '@udecode/plate-common/react';

import { LinkPlugin, upsertLink, validateUrl } from '../../lib';
import { floatingLinkActions, floatingLinkSelectors } from '../components';

/**
 * Insert link if url is valid. Text is url if empty. Close floating link. Focus
 * editor.
 */
export const submitFloatingLink = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const { forceSubmit, transformInput } = editor.getOptions(LinkPlugin);

  const inputUrl = floatingLinkSelectors.url();
  const url = transformInput ? transformInput(inputUrl) ?? '' : inputUrl;

  if (!forceSubmit && !validateUrl(editor, url)) return;

  const text = floatingLinkSelectors.text();
  const target = floatingLinkSelectors.newTab() ? '_blank' : undefined;

  floatingLinkActions.hide();

  upsertLink(editor, {
    skipValidation: true,
    target,
    text,
    url,
  });

  setTimeout(() => {
    focusEditor(editor, editor.selection!);
  }, 0);

  return true;
};
