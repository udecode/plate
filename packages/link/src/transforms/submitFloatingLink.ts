import {
  focusEditor,
  getPluginOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import {
  floatingLinkActions,
  floatingLinkSelectors,
} from '../components/FloatingLink/floatingLinkStore';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';
import { validateUrl } from '../utils/index';
import { upsertLink } from './index';

/**
 * Insert link if url is valid.
 * Text is url if empty.
 * Close floating link.
 * Focus editor.
 */
export const submitFloatingLink = <V extends Value>(editor: PlateEditor<V>) => {
  if (!editor.selection) return;

  const { forceSubmit } = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

  const url = floatingLinkSelectors.url();
  if (!forceSubmit && !validateUrl(editor, url)) return;

  const text = floatingLinkSelectors.text();
  const target = floatingLinkSelectors.newTab() ? '_blank' : undefined;

  floatingLinkActions.hide();

  upsertLink(editor, {
    url,
    text,
    target,
    skipValidation: true,
  });

  focusEditor(editor, editor.selection!);

  return true;
};
