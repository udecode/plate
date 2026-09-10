import { writeDOMFragmentData } from '../../dom/plite-dom.internal';
import { ContentSlice } from '../../facade';
import type { Editor } from '../../lib/editor';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment.internal';
import { getSelectedDomNode } from '../utils/getSelectedDomNode.internal';
import { isSelectOutside } from '../utils/isSelectOutside.internal';
import { getPlainText } from './getPlainText';

export const writeStaticSelectionClipboardData = (
  editor: Editor,
  data: Pick<DataTransfer, 'setData'>
) => {
  const fragment = getSelectedDomFragment(editor);
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
