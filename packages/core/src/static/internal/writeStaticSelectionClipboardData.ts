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
    fragment,
    html: html.innerHTML,
    text: getPlainText(html),
  });

  return true;
};
