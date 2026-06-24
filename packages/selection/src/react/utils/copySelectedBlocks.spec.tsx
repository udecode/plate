/** @jsx jsx */

import { jsx } from '@platejs/test-utils';
import * as copyToClipboardModule from 'copy-to-clipboard';
import { createBasePlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { copySelectedBlocks } from './copySelectedBlocks';

jsx;

describe('copySelectedBlocks', () => {
  let editor: any;
  let copyToClipboardSpy: ReturnType<typeof spyOn>;
  let copyToClipboardMock: ReturnType<typeof mock>;

  beforeEach(() => {
    copyToClipboardMock = mock();
    copyToClipboardSpy = spyOn(
      copyToClipboardModule,
      'default'
    ).mockImplementation(
      copyToClipboardMock as unknown as (
        text: string,
        options?: { debug?: boolean; message?: string }
      ) => boolean
    );
  });

  afterEach(() => {
    copyToClipboardSpy?.mockRestore();
  });

  describe('when copying blocks with empty content', () => {
    beforeEach(() => {
      editor = createBasePlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          {
            id: 'block1',
            children: [{ text: 'First block' }],
            type: 'p',
          },
          {
            id: 'block2',
            children: [{ text: '' }], // Empty block
            type: 'p',
          },
          {
            id: 'block3',
            children: [{ text: '   ' }], // Block with only whitespace
            type: 'p',
          },
          {
            id: 'block4',
            children: [{ text: 'Last block' }],
            type: 'p',
          },
        ],
      });

      // Set selected blocks
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2', 'block3', 'block4'])
      );
    });

    it('copy empty blocks but not call setFragmentData for them', () => {
      const mockDataTransfer = {
        getData: mock((type: string) => {
          if (type === 'text/plain') return 'mock plain text';
          if (type === 'text/html') return '<p>mock html</p>';
          return '';
        }),
        setData: mock(),
      };

      const writeSelection = mock();
      editor.api.clipboard = { writeSelection };

      // Mock the blockSelection.getNodes to return the selected entries
      editor.api.blockSelection = {
        getNodes: mock().mockReturnValue([
          [
            { id: 'block1', children: [{ text: 'First block' }], type: 'p' },
            [0],
          ],
          [{ id: 'block2', children: [{ text: '' }], type: 'p' }, [1]],
          [{ id: 'block3', children: [{ text: '   ' }], type: 'p' }, [2]],
          [
            { id: 'block4', children: [{ text: 'Last block' }], type: 'p' },
            [3],
          ],
        ]),
      };

      // Mock editor.api.string() to return the text content of each block
      const stringResults = ['First block', '', '   ', 'Last block'];
      let stringCallIndex = 0;
      editor.api.string = mock(() => stringResults[stringCallIndex++]);

      copyToClipboardMock.mockImplementation((_text, options) => {
        if (options?.onCopy) {
          options.onCopy(mockDataTransfer as any);
        }
        return true;
      });

      copySelectedBlocks(editor);

      // writeSelection should only be called for non-empty blocks.
      expect(writeSelection).toHaveBeenCalledTimes(3);

      // Verify the final clipboard data was set
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        expect.any(String)
      );

      // Verify HTML includes empty paragraphs for empty blocks
      const htmlCall = mockDataTransfer.setData.mock.calls.find(
        (call) => call[0] === 'text/html'
      );
      expect(htmlCall).toBeDefined();
      const htmlContent = htmlCall![1];
      // Should have 4 divs (one for each block)
      const divCount = (htmlContent.match(/<div>/g) || []).length;
      expect(divCount).toBe(4);
      // Should have empty paragraphs for empty blocks
      expect(htmlContent).toContain('<p></p>');

      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/x-plite-fragment',
        expect.any(String)
      );
    });
  });

  describe('when copying blocks with content', () => {
    beforeEach(() => {
      editor = createBasePlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          {
            id: 'block1',
            children: [{ text: 'First block' }],
            type: 'p',
          },
          {
            id: 'block2',
            children: [{ text: 'Second block' }],
            type: 'p',
          },
        ],
      });

      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
    });

    it('copy all selected blocks with content', () => {
      const mockDataTransfer = {
        getData: mock((type: string) => {
          if (type === 'text/plain') return 'mock plain text';
          if (type === 'text/html') return '<p>mock html</p>';
          return '';
        }),
        setData: mock(),
      };

      const writeSelection = mock();
      editor.api.clipboard = { writeSelection };

      editor.api.blockSelection = {
        getNodes: mock().mockReturnValue([
          [
            { id: 'block1', children: [{ text: 'First block' }], type: 'p' },
            [0],
          ],
          [
            { id: 'block2', children: [{ text: 'Second block' }], type: 'p' },
            [1],
          ],
        ]),
      };

      const stringResults = ['First block', 'Second block'];
      let stringCallIndex = 0;
      editor.api.string = mock(() => stringResults[stringCallIndex++]);

      copyToClipboardMock.mockImplementation((_text, options) => {
        if (options?.onCopy) {
          options.onCopy(mockDataTransfer as any);
        }
        return true;
      });

      copySelectedBlocks(editor);

      expect(writeSelection).toHaveBeenCalledTimes(2);
      expect(writeSelection).toHaveBeenCalledWith(mockDataTransfer);

      // Verify the clipboard data was set
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        expect.any(String)
      );
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/html',
        expect.any(String)
      );
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/x-plite-fragment',
        expect.any(String)
      );
    });

    it('writes to provided clipboard data without starting a synthetic copy', () => {
      const mockDataTransfer = {
        getData: mock((type: string) => {
          if (type === 'text/plain') return 'mock plain text';
          if (type === 'text/html') return '<p>mock html</p>';
          return '';
        }),
        setData: mock(),
      };

      const writeSelection = mock();
      editor.api.clipboard = { writeSelection };

      editor.api.blockSelection = {
        getNodes: mock().mockReturnValue([
          [
            { id: 'block1', children: [{ text: 'First block' }], type: 'p' },
            [0],
          ],
          [
            { id: 'block2', children: [{ text: 'Second block' }], type: 'p' },
            [1],
          ],
        ]),
      };

      const copied = (
        copySelectedBlocks as (
          editor: any,
          dataTransfer?: DataTransfer
        ) => boolean
      )(editor, mockDataTransfer as any);

      expect(copied).toBe(true);
      expect(copyToClipboardMock).not.toHaveBeenCalled();
      expect(writeSelection).toHaveBeenCalledTimes(2);
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        expect.any(String)
      );
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/html',
        expect.any(String)
      );
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/x-plite-fragment',
        expect.any(String)
      );
    });
  });
});
