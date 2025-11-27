import { createDataTransfer } from '@platejs/test-utils';

import { createStaticEditor } from '../editor/withStatic';
import * as getSelectedDomBlocksModule from '../utils/getSelectedDomBlocks';
import * as getSelectedDomNodeModule from '../utils/getSelectedDomNode';
import * as isSelectOutsideModule from '../utils/isSelectOutside';
import { ViewPlugin } from './ViewPlugin';

describe('ViewPlugin', () => {
  let getSelectedDomBlocksSpy: ReturnType<typeof spyOn>;
  let getSelectedDomNodeSpy: ReturnType<typeof spyOn>;
  let isSelectOutsideSpy: ReturnType<typeof spyOn>;

  afterEach(() => {
    getSelectedDomBlocksSpy?.mockRestore();
    getSelectedDomNodeSpy?.mockRestore();
    isSelectOutsideSpy?.mockRestore();
  });

  describe('integration with createStaticEditor', () => {
    it('should be included in static editor', () => {
      const editor = createStaticEditor();

      expect(editor.getPlugin(ViewPlugin)).toBeDefined();
      expect(editor.tf.setFragmentData).toBeDefined();
    });

    it('should handle copy event properly', () => {
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

    it('should handle copy with no selection', () => {
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

    it('should handle non-copy events', () => {
      const editor = createStaticEditor();

      // Should pass through for non-copy events
      editor.tf.setFragmentData(mockData, 'cut');
      editor.tf.setFragmentData(mockData, 'drag');

      // Should not call setData for non-copy events
      expect(mockData.setData).not.toHaveBeenCalled();
    });

    it('should handle copy with selection outside editor', () => {
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
  });
});
