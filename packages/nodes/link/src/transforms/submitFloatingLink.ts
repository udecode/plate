import {
  focusEditor,
  getPluginOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import {
  floatingLinkActions,
  floatingLinkSelectors,
} from '../components/FloatingLink/floatingLinkStore';
import { ELEMENT_LINK, LinkPlugin } from '../createLinkPlugin';
import { upsertLink } from './index';

/**
 * Insert link if url is valid.
 * Text is url if empty.
 * Close floating link.
 * Focus editor.
 */
export const submitFloatingLink = <V extends Value>(editor: PlateEditor<V>) => {
  if (!editor.selection) return;

  const { isUrl } = getPluginOptions<LinkPlugin, V>(editor, ELEMENT_LINK);

  const url = floatingLinkSelectors.url();
  const isValid = isUrl?.(url);
  if (!isValid) return;

  const text = floatingLinkSelectors.text();

  floatingLinkActions.hide();

  upsertLink(editor, {
    url,
    text,
  });

  setTimeout(() => {
    focusEditor(editor, editor.selection!);
  }, 0);

  return true;
};
