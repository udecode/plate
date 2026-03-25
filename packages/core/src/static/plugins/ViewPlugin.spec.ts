import { createDataTransfer } from '@platejs/test-utils';

import { createStaticEditor } from '../editor/withStatic';
import * as getSelectedDomFragmentModule from '../utils/getSelectedDomFragment';
import * as getSelectedDomBlocksModule from '../utils/getSelectedDomBlocks';
import * as getSelectedDomNodeModule from '../utils/getSelectedDomNode';
import * as isSelectOutsideModule from '../utils/isSelectOutside';
import { ViewPlugin } from './ViewPlugin';

describe('ViewPlugin', () => {
  let getSelectedDomFragmentSpy: ReturnType<typeof spyOn>;
  let getSelectedDomBlocksSpy: ReturnType<typeof spyOn>;
  let getSelectedDomNodeSpy: ReturnType<typeof spyOn>;
  let isSelectOutsideSpy: ReturnType<typeof spyOn>;
  let warnSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    getSelectedDomFragmentSpy?.mockRestore();
    getSelectedDomBlocksSpy?.mockRestore();
    getSelectedDomNodeSpy?.mockRestore();
    isSelectOutsideSpy?.mockRestore();
    warnSpy?.mockRestore();
  });

  const suppressSetFragmentDataOverrideWarning = () => {
    const originalWarn = console.warn;

    warnSpy = spyOn(console, 'warn').mockImplementation((message, ...args) => {
      if (
        typeof message === 'string' &&
        message.includes('[OVERRIDE_MISSING]') &&
        message.includes('editor.setFragmentData()')
      ) {
        return;
      }

      originalWarn(message, ...args);
    });
  };

  describe('integration with createStaticEditor', () => {
    it('is included in the static editor', () => {
      const editor = createStaticEditor();

      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
      expect(editor.tf.setFragmentData).toBeDefined();
    });

    it('handles copy events without throwing', () => {
      suppressSetFragmentDataOverrideWarning();

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

      // Mock DOM utilities
      getSelectedDomBlocksSpy = spyOn(
        getSelectedDomBlocksModule,
        'getSelectedDomBlocks'
      ).mockReturnValue([]);
      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(undefined);
      isSelectOutsideSpy = spyOn(
        isSelectOutsideModule,
        'isSelectOutside'
      ).mockReturnValue(false);

      // Should not throw when called
      expect(() => editor.tf.setFragmentData(mockData, 'copy')).not.toThrow();
    });

    it('proxies getFragment through getSelectedDomFragment', () => {
      const fragment = [{ children: [{ text: 'First paragraph' }], type: 'p' }];
      const editor = createStaticEditor();

      getSelectedDomFragmentSpy = spyOn(
        getSelectedDomFragmentModule,
        'getSelectedDomFragment'
      ).mockReturnValue(fragment as any);

      expect(editor.api.getFragment()).toEqual(fragment);
    });
  });

  describe('setFragmentData override', () => {
    let mockData: DataTransfer;
    let originalBtoa: typeof window.btoa;
    let originalEncodeURIComponent: typeof encodeURIComponent;

    beforeEach(() => {
      // Save original global functions
      originalBtoa = global.window.btoa;
      originalEncodeURIComponent = global.encodeURIComponent;

      // Mock DataTransfer with spy
      const dataMap = new Map();
      mockData = {
        getData: mock((type: string) => dataMap.get(type) ?? ''),
        setData: mock((type: string, value: string) =>
          dataMap.set(type, value)
        ),
      } as any;

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
      suppressSetFragmentDataOverrideWarning();

      const editor = createStaticEditor();

      // Mock utilities to return null
      getSelectedDomBlocksSpy = spyOn(
        getSelectedDomBlocksModule,
        'getSelectedDomBlocks'
      ).mockReturnValue(undefined);
      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(undefined);

      // Should not throw
      expect(() => editor.tf.setFragmentData(mockData, 'copy')).not.toThrow();
    });

    it('handle non-copy events', () => {
      suppressSetFragmentDataOverrideWarning();

      const editor = createStaticEditor();

      // Should pass through for non-copy events
      editor.tf.setFragmentData(mockData, 'cut');
      editor.tf.setFragmentData(mockData, 'drag');

      // Should not call setData for non-copy events
      expect(mockData.setData).not.toHaveBeenCalled();
    });

    it('handle copy with selection outside editor', () => {
      suppressSetFragmentDataOverrideWarning();

      // Mock selection outside editor
      const mockHtml = document.createElement('div');
      const editorDiv = document.createElement('div');
      editorDiv.dataset.slateEditor = 'true';
      mockHtml.append(editorDiv);

      getSelectedDomBlocksSpy = spyOn(
        getSelectedDomBlocksModule,
        'getSelectedDomBlocks'
      ).mockReturnValue([]);
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
      expect(() => editor.tf.setFragmentData(mockData, 'copy')).not.toThrow();
    });

    it('writes slate fragment, html, and plain text payloads on copy', () => {
      suppressSetFragmentDataOverrideWarning();

      const editor = createStaticEditor();
      const fragment = [{ children: [{ text: 'Alpha' }], type: 'p' }];
      const html = document.createElement('div');

      html.innerHTML = '<p>Alpha</p>';

      getSelectedDomFragmentSpy = spyOn(
        getSelectedDomFragmentModule,
        'getSelectedDomFragment'
      ).mockReturnValue(fragment as any);
      getSelectedDomNodeSpy = spyOn(
        getSelectedDomNodeModule,
        'getSelectedDomNode'
      ).mockReturnValue(html);
      isSelectOutsideSpy = spyOn(
        isSelectOutsideModule,
        'isSelectOutside'
      ).mockReturnValue(false);

      editor.tf.setFragmentData(mockData, 'copy');

      expect(mockData.setData).toHaveBeenCalledWith(
        'application/x-slate-fragment',
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
