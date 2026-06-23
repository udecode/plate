import { DOMPlugin } from '../../lib';
import { withLegacyTransformOverride } from '../../internal/plugin/withLegacyTransformOverride';
import { getPlainText } from '../internal/getPlainText';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';
import { getSelectedDomNode } from '../utils/getSelectedDomNode';
import { isSelectOutside } from '../utils/isSelectOutside';

const BaseViewPlugin = DOMPlugin.extendEditorApi(({ editor }) => ({
  getFragment() {
    return getSelectedDomFragment(editor);
  },
}));

export const ViewPlugin = withLegacyTransformOverride(
  BaseViewPlugin,
  ({ editor, tf: { setFragmentData } }) => ({
    tf: {
      setFragmentData(data, originEvent) {
        if (originEvent !== 'copy') return setFragmentData(data, originEvent);

        const fragment = getSelectedDomFragment(editor);
        const html = getSelectedDomNode();

        if (!html || !fragment) return;

        const selectOutside = isSelectOutside(html);

        if (selectOutside) return;

        // only crossing multiple blocks
        if (fragment.length > 0) {
          const string = JSON.stringify(fragment);
          const encoded = window.btoa(encodeURIComponent(string));

          data.setData('application/x-slate-fragment', encoded);
          data.setData('text/html', html.innerHTML);
          data.setData('text/plain', getPlainText(html));
        }
      },
    },
  })
);
