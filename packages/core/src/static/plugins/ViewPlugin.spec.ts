import type { Descendant } from '@platejs/plite';

import { createStaticEditor } from '../editor/withStatic';
import * as getSelectedDomFragmentModule from '../utils/getSelectedDomFragment';
import { ViewPlugin } from './ViewPlugin';

describe('ViewPlugin', () => {
  let getSelectedDomFragmentSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    getSelectedDomFragmentSpy?.mockRestore();
    window.getSelection()?.removeAllRanges();
    document.body.innerHTML = '';
  });

  describe('integration with createStaticEditor', () => {
    it('is included in the static editor', () => {
      const editor = createStaticEditor();

      expect(editor.plugin(ViewPlugin)).toBeDefined();
      expect(editor.api.dom.getSelectedFragment).toBeDefined();
    });

    it('proxies getSelectedFragment through getSelectedDomFragment', () => {
      const fragment = [
        { children: [{ text: 'First paragraph' }], type: 'paragraph' },
      ] satisfies Descendant[];
      const editor = createStaticEditor();

      getSelectedDomFragmentSpy = spyOn(
        getSelectedDomFragmentModule,
        'getSelectedDomFragment'
      ).mockReturnValue(fragment);

      expect(editor.api.dom.getSelectedFragment()).toEqual(fragment);
    });
  });
});
