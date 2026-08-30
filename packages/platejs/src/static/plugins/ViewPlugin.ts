import { DOMPlugin } from '../../lib/plugins/dom/DOMPlugin';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';

export const ViewPlugin = DOMPlugin.extend({
  api: ({ editor }) => ({
    getSelectedFragment() {
      return getSelectedDomFragment(editor);
    },
  }),
});
