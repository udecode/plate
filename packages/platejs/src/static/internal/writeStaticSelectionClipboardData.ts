import { writeDOMFragmentData } from '../../dom/plite-dom.internal';
import { ContentSlice } from '../../facade';
import type { Editor } from '../../lib/editor';
import type { StaticDocument } from '../document';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';
import { getSelectedDomNode } from '../utils/getSelectedDomNode';
import { isSelectOutside } from '../utils/isSelectOutside';
import { getPlainText } from './getPlainText';

export const writeStaticSelectionClipboardData = (
  editor: Editor,
  data: Pick<DataTransfer, 'setData'>,
  options?: { document?: StaticDocument; element?: HTMLElement }
) => {
  const fragment = getSelectedDomFragment(editor, options);
  const html = getSelectedDomNode();

  if (!html || !fragment || isSelectOutside(html) || fragment.length === 0) {
    return false;
  }

  writeDOMFragmentData(data, {
    html: html.innerHTML,
    slice: ContentSlice.closed(fragment),
    text: getPlainText(html),
  });

  return true;
};
