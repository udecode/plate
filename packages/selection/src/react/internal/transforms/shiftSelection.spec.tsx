/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { createPlateEditor } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { shiftSelection } from './shiftSelection';

jsxt;

describe('shiftSelection', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    editor = createPlateEditor({
      // Register your plugin(s). If you have multiple, add them here.
      plugins: [BlockSelectionPlugin],
      value: [
        {
          id: 'block1',
          children: [{ text: 'Block One' }],
          type: 'p',
        },
        {
          id: 'block2',
          children: [{ text: 'Block Two' }],
          type: 'p',
        },
        {
          id: 'block3',
          children: [{ text: 'Block Three' }],
          type: 'p',
        },
      ],
    });
  });

  describe('when anchor is top-most and SHIFT+DOWN', () => {
    it('should expand selection downward', () => {
      // Initially select block1 and set anchorId=block1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      // SHIFT+DOWN => expand selection from block1 → block2
      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['block1', 'block2'].sort()
      );
    });
  });

  describe('when anchor is top-most and SHIFT+DOWN again', () => {
    it('should expand further to block3', () => {
      // block1, block2 selected; anchor = block1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['block1', 'block2', 'block3'].sort()
      );
    });
  });

  describe('when anchor is NOT top-most and SHIFT+DOWN', () => {
    it('should shrink from the top-most block', () => {
      // block1, block2 selected; anchor is block2 => top-most is block1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block2');

      shiftSelection(editor, 'down');

      // Expect block1 removed
      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(['block2'].sort());
    });
  });

  describe('when anchor is bottom-most and SHIFT+UP', () => {
    it('should expand selection upward', () => {
      // block2, block3 selected; anchor=block3 => bottom-most
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block2', 'block3'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block3');

      shiftSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      // Should now include block1
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['block1', 'block2', 'block3'].sort()
      );
    });
  });

  describe('when anchor is NOT bottom-most and SHIFT+UP', () => {
    it('should shrink selection from bottom-most', () => {
      // block1, block2, block3 => anchor=block1 => not bottom-most
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2', 'block3'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      shiftSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['block1', 'block2'].sort()
      );
    });
  });
});
