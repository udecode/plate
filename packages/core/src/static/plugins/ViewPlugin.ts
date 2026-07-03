import { DOMPlugin } from '../../lib';
import { getSelectedDomFragment } from '../utils/getSelectedDomFragment';

export const ViewPlugin = DOMPlugin.extendEditorApi(({ editor }) => ({
  getFragment() {
    return getSelectedDomFragment(editor);
  },
}));
