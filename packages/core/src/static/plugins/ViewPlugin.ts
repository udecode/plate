import { DOMPlugin } from '../../lib';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';

export const ViewPlugin = DOMPlugin.extend(({ editor }) => ({
  api: () => ({
    getSelectedFragment() {
      return getSelectedDomFragment(editor);
    },
  }),
}));
