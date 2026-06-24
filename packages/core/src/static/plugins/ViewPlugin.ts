import { DOMPlugin } from '../../lib';
import { getPlainText } from '../internal/getPlainText';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';
import { getSelectedDomNode } from '../utils/getSelectedDomNode';
import { isSelectOutside } from '../utils/isSelectOutside';

export const ViewPlugin = DOMPlugin.extendEditorApi(({ editor }) => ({
  getFragment() {
    return getSelectedDomFragment(editor);
  },
  setFragmentData(data: DataTransfer, originEvent: string) {
    if (originEvent !== 'copy') return;

    const fragment = getSelectedDomFragment(editor);
    const html = getSelectedDomNode();

    if (!html || !fragment) return;

    const selectOutside = isSelectOutside(html);

    if (selectOutside) return;

    // only crossing multiple blocks
    if (fragment.length > 0) {
      const string = JSON.stringify(fragment);
      const encoded = window.btoa(encodeURIComponent(string));

      data.setData('application/x-plite-fragment', encoded);
      data.setData('text/html', html.innerHTML);
      data.setData('text/plain', getPlainText(html));
    }
  },
}));
