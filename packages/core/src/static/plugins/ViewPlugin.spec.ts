import { createDataTransfer } from '@platejs/test-utils';

import { createStaticEditor } from '../editor/withStatic';
import { ViewPlugin } from './ViewPlugin';

describe('ViewPlugin', () => {
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
      const mockGetSelectedDomBlocks = jest.fn(() => []);
      const mockGetSelectedDomNode = jest.fn(() => null);
      const mockIsSelectOutside = jest.fn(() => false);

      jest.doMock('../utils/getSelectedDomBlocks', () => ({
        getSelectedDomBlocks: mockGetSelectedDomBlocks,
      }));

      jest.doMock('../utils/getSelectedDomNode', () => ({
        getSelectedDomNode: mockGetSelectedDomNode,
      }));

      jest.doMock('../utils/isSelectOutside', () => ({
        isSelectOutside: mockIsSelectOutside,
      }));

      // Should not throw when called
      expect(() => editor.tf.setFragmentData(mockData, 'copy')).not.toThrow();
    });
  });

  describe('setFragmentData override', () => {
    let mockData: DataTransfer;

    beforeEach(() => {
      // Mock DataTransfer with spy
      const dataMap = new Map();
      mockData = {
        getData: jest.fn((type: string) => dataMap.get(type) ?? ''),
        setData: jest.fn((type: string, value: string) =>
          dataMap.set(type, value)
        ),
      } as any;

      // Mock DOM utilities
      mockGetSelectedDomBlocks = jest.fn();
      mockGetSelectedDomNode = jest.fn();
      mockIsSelectOutside = jest.fn();
      mockGetPlainText = jest.fn();

      // Mock window.btoa
      global.window.btoa = jest.fn((str) => `base64-${str}`);
      global.encodeURIComponent = jest.fn((str) => `encoded-${str}`);
    });

    afterEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it('should handle copy with no selection', () => {
      const editor = createStaticEditor();

      // Mock utilities to return null
      jest.doMock('../utils/getSelectedDomBlocks', () => ({
        getSelectedDomBlocks: () => null,
      }));
      jest.doMock('../utils/getSelectedDomNode', () => ({
        getSelectedDomNode: () => null,
      }));

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

      jest.doMock('../utils/getSelectedDomBlocks', () => ({
        getSelectedDomBlocks: () => [],
      }));
      jest.doMock('../utils/getSelectedDomNode', () => ({
        getSelectedDomNode: () => mockHtml,
      }));
      jest.doMock('../utils/isSelectOutside', () => ({
        isSelectOutside: () => true,
      }));

      // Require module after mocking
      jest.resetModules();
      const {
        createStaticEditor: createStaticEditorMocked,
      } = require('../editor/withStatic');
      const editorMocked = createStaticEditorMocked();

      // Should not throw
      expect(() =>
        editorMocked.tf.setFragmentData(mockData, 'copy')
      ).not.toThrow();
    });
  });
});
