import { createDataTransfer } from '@platejs/test-utils';
import type { Descendant } from '@platejs/plite';

import { createStaticEditor } from '../editor/withStatic';
import * as getSelectedDomFragmentModule from '../utils/getSelectedDomFragment';
import * as getSelectedDomNodeModule from '../utils/getSelectedDomNode';
import * as isSelectOutsideModule from '../utils/isSelectOutside';
import { ViewPlugin } from './ViewPlugin';

describe('ViewPlugin', () => {
  let getSelectedDomFragmentSpy: ReturnType<typeof spyOn>;
  let getSelectedDomNodeSpy: ReturnType<typeof spyOn>;
  let isSelectOutsideSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    getSelectedDomFragmentSpy?.mockRestore();
    getSelectedDomNodeSpy?.mockRestore();
    isSelectOutsideSpy?.mockRestore();
  });

  describe('integration with createStaticEditor', () => {
    it('is included in the static editor', () => {
      const editor = createStaticEditor();

      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
      expect(editor.api.setFragmentData).toBeDefined();
    });

    it('handles copy events without throwing', () => {
      const editor = createStaticEditor();
      editor.children = [
        {
          id: 'block-1',
          children: [{ text: 'First paragraph' }],
          type: 'p',
        },
        {
          id: 'block-2',
          children: [{ text: 'Second paragraph' }],
          type: 'p',
        },
      ];

      const mockData = createDataTransfer();

      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(undefined);
      isSelectOutsideSpy = spyOn(
        isSelectOutsideModule,
        'isSelectOutside'
      ).mockReturnValue(false);

      // Should not throw when called
      expect(() => editor.api.setFragmentData(mockData, 'copy')).not.toThrow();
    });

    it('proxies getFragment through getSelectedDomFragment', () => {
      const fragment = [
        { children: [{ text: 'First paragraph' }], type: 'p' },
      ] satisfies Descendant[];
      const editor = createStaticEditor();

      getSelectedDomFragmentSpy = spyOn(
        getSelectedDomFragmentModule,
        'getSelectedDomFragment'
      ).mockReturnValue(fragment);

      expect(editor.api.getFragment()).toEqual(fragment);
    });
  });

  describe('setFragmentData API', () => {
    let mockData: DataTransfer;
    let originalBtoa: typeof window.btoa;
    let originalEncodeURIComponent: typeof encodeURIComponent;

    beforeEach(() => {
      // Save original global functions
      originalBtoa = global.window.btoa;
      originalEncodeURIComponent = global.encodeURIComponent;

      const dataMap = new Map();
      mockData = createDataTransfer(dataMap);
      spyOn(mockData, 'setData');

      // Mock window.btoa
      global.window.btoa = mock((str) => `base64-${str}`);
      global.encodeURIComponent = mock((str) => `encoded-${str}`);
    });

    afterEach(() => {
      // Restore original global functions
      global.window.btoa = originalBtoa;
      global.encodeURIComponent = originalEncodeURIComponent;
    });

    it('handle copy with no selection', () => {
      const editor = createStaticEditor();

      // Mock utilities to return null
      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(undefined);

      // Should not throw
      expect(() => editor.api.setFragmentData(mockData, 'copy')).not.toThrow();
    });

    it('handle non-copy events', () => {
      const editor = createStaticEditor();

      // Should pass through for non-copy events
      editor.api.setFragmentData(mockData, 'cut');
      editor.api.setFragmentData(mockData, 'drag');

      // Should not call setData for non-copy events
      expect(mockData.setData).not.toHaveBeenCalled();
    });

    it('handle copy with selection outside editor', () => {
      // Mock selection outside editor
      const mockHtml = document.createElement('div');
      const editorDiv = document.createElement('div');
      editorDiv.dataset.slateEditor = 'true';
      mockHtml.append(editorDiv);

      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(mockHtml);
      isSelectOutsideSpy = spyOn(
        isSelectOutsideModule,
        'isSelectOutside'
      ).mockReturnValue(true);

      const editor = createStaticEditor();

      // Should not throw
      expect(() => editor.api.setFragmentData(mockData, 'copy')).not.toThrow();
    });

    it('writes slate fragment, html, and plain text payloads on copy', () => {
      const editor = createStaticEditor();
      const fragment = [
        { children: [{ text: 'Alpha' }], type: 'p' },
      ] satisfies Descendant[];
      const html = document.createElement('div');

      html.innerHTML = '<p>Alpha</p>';

      getSelectedDomFragmentSpy = spyOn(
        getSelectedDomFragmentModule,
        'getSelectedDomFragment'
      ).mockReturnValue(fragment);
      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(html);
      isSelectOutsideSpy = spyOn(
        isSelectOutsideModule,
        'isSelectOutside'
      ).mockReturnValue(false);

      editor.api.setFragmentData(mockData, 'copy');

      expect(mockData.setData).toHaveBeenCalledWith(
        'application/x-plite-fragment',
        expect.any(String)
      );
      expect(mockData.setData).toHaveBeenCalledWith(
        'text/html',
        '<p>Alpha</p>'
      );
      expect(mockData.setData).toHaveBeenCalledWith('text/plain', 'Alpha');
    });
  });
});
