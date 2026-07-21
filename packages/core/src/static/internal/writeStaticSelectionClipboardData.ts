import { ContentSlice } from '@platejs/plite';
import { writeDOMFragmentData } from '@platejs/plite-dom';

import type { BaseEditor } from '../../lib/editor';
import { getPlainText } from './getPlainText';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';
import { getSelectedDomNode } from '../utils/getSelectedDomNode';
import { isSelectOutside } from '../utils/isSelectOutside';

export const writeStaticSelectionClipboardData = (
  editor: BaseEditor,
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
