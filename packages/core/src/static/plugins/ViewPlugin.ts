import { DOMPlugin } from '../../lib';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';

export const ViewPlugin = DOMPlugin.extend(({ editor }) => ({
  extension: {
    api: {
      dom: {
        getSelectedFragment() {
          return getSelectedDomFragment(editor);
        },
      },
    },
  },
}));
