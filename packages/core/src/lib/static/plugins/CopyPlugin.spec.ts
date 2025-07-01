/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

import { createStaticEditor } from '../editor/createStaticEditor';
import { CopyPlugin, setFragmentDataStatic } from './CopyPlugin';

jsx;

// Mock window functions
const mockGetSelection = jest.fn();
const mockGetRangeAt = jest.fn();
const mockCloneContents = jest.fn();

global.window.getSelection = mockGetSelection;
global.window.btoa = jest.fn((str) => `encoded:${str}`);

describe('CopyPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('plugin configuration', () => {
    it('should have correct key', () => {
      expect(CopyPlugin.key).toBe('copy');
    });

    it('should override setFragmentData transform', () => {
      const editor = createStaticEditor();
      const plugin = editor.getPlugin(CopyPlugin);
      
      expect(plugin).toBeDefined();
      expect(editor.tf.setFragmentData).toBeDefined();
    });
  });

  describe('setFragmentDataStatic', () => {
    let editor: any;
    let mockDataTransfer: any;
    let mockFragment: any;

    beforeEach(() => {
      const value = (
        <editor>
          <hp id="1">
            <htext>First paragraph</htext>
          </hp>
          <hp id="2">
            <htext>Second paragraph</htext>
          </hp>
          <hp id="3">
            <htext>Third paragraph</htext>
          </hp>
        </editor>
      );

      editor = createStaticEditor({
        value: value.children,
      });

      // Mock the node API to return nodes by ID
      editor.api.node = jest.fn(({ id }) => {
        const node = value.children.find((child: any) => child.id === id);
        if (node) {
          return [node, [parseInt(id) - 1]];
        }
        return null;
      });

      mockDataTransfer = {
        getData: jest.fn(),
        setData: jest.fn(),
      };

      mockFragment = {
        querySelectorAll: jest.fn(),
      };
    });

    it('should return early if no selection', () => {
      mockGetSelection.mockReturnValue(null);

      setFragmentDataStatic(editor, mockDataTransfer);

      expect(mockDataTransfer.setData).not.toHaveBeenCalled();
    });

    it('should return early if selection has no ranges', () => {
      mockGetSelection.mockReturnValue({ rangeCount: 0 });

      setFragmentDataStatic(editor, mockDataTransfer);

      expect(mockDataTransfer.setData).not.toHaveBeenCalled();
    });

    it('should set fragment data for valid selection', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<p>Selected content</p>';
      
      const mockBlocks = [
        { dataset: { slateId: '1' } },
        { dataset: { slateId: '2' } },
      ];

      mockFragment.querySelectorAll.mockReturnValue(mockBlocks);
      mockCloneContents.mockReturnValue(mockFragment);
      mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
      mockGetSelection.mockReturnValue({
        rangeCount: 1,
        getRangeAt: mockGetRangeAt,
      });

      // Mock document.createElement
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn(() => mockDiv);

      setFragmentDataStatic(editor, mockDataTransfer);

      // Verify setData was called with correct arguments
      expect(mockDataTransfer.setData).toHaveBeenCalledTimes(3);
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/x-slate-fragment',
        expect.stringContaining('encoded:')
      );
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/html',
        '<p>Selected content</p>'
      );
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        expect.any(String)
      );

      document.createElement = originalCreateElement;
    });

    it('should skip inline elements', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<p>Selected content</p>';
      
      const mockBlocks = [
        { dataset: { slateId: '1' } },
        { dataset: { slateId: '2' } },
      ];

      // Mock node API to return inline elements (path length > 1)
      editor.api.node = jest.fn(({ id }) => {
        if (id === '1') {
          return [{ id: '1', text: 'inline' }, [0, 0]]; // Inline path
        }
        if (id === '2') {
          return [{ id: '2', children: [{ text: 'block' }] }, [1]]; // Block path
        }
        return null;
      });

      mockFragment.querySelectorAll.mockReturnValue(mockBlocks);
      mockCloneContents.mockReturnValue(mockFragment);
      mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
      mockGetSelection.mockReturnValue({
        rangeCount: 1,
        getRangeAt: mockGetRangeAt,
      });

      // Mock document.createElement
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn(() => mockDiv);

      setFragmentDataStatic(editor, mockDataTransfer);

      // Verify the encoded fragment only contains the block element
      const encodedCall = mockDataTransfer.setData.mock.calls.find(
        (call: any) => call[0] === 'application/x-slate-fragment'
      );
      
      expect(encodedCall).toBeDefined();
      const encoded = encodedCall[1];
      expect(encoded).toContain('block');
      expect(encoded).not.toContain('inline');

      document.createElement = originalCreateElement;
    });

    it('should handle selection outside editor', () => {
      const mockDiv = document.createElement('div');
      mockDiv.innerHTML = '<div data-slate-editor="true">Editor content</div>';
      
      mockFragment.querySelectorAll.mockReturnValue([]);
      mockCloneContents.mockReturnValue(mockFragment);
      mockGetRangeAt.mockReturnValue({ cloneContents: mockCloneContents });
      mockGetSelection.mockReturnValue({
        rangeCount: 1,
        getRangeAt: mockGetRangeAt,
      });

      // Mock document.createElement
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn(() => mockDiv);

      setFragmentDataStatic(editor, mockDataTransfer);

      // Should not set data if selection is outside editor
      expect(mockDataTransfer.setData).not.toHaveBeenCalled();

      document.createElement = originalCreateElement;
    });
  });
});