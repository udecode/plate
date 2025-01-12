/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { createPlateEditor } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import * as domUtils from '../../../lib';
import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { moveSelection } from './moveSelection';

jsxt;

jest.mock('../../../lib', () => ({
  ...jest.requireActual('../../../lib'),
  querySelectorSelectable: (id: string) => ({
    id,
    dataset: { blockId: id },
  }),
}));

describe('moveSelection', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    jest.spyOn(domUtils, 'querySelectorSelectable');

    editor = createPlateEditor({
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when pressing arrow down without shift', () => {
    it('should set anchor to block below the bottom-most and select it alone', () => {
      // Suppose block1, block2 selected
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
      // anchor = block1 (arbitrary choice)
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      // Move selection DOWN => below bottom-most (which is block2) => block3
      moveSelection(editor, 'down');

      // Should now only have block3 in selection
      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block3']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block3');
    });
  });

  describe('when pressing arrow up without shift', () => {
    it('should set anchor to block above the top-most and select it alone', () => {
      // Suppose block2, block3 selected, anchor is block3
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block2', 'block3'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block3');

      // Move selection UP => above top-most (which is block2) => block1
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block1');
    });
  });

  describe('when only one block is selected', () => {
    it('should do nothing if there is no block above/below', () => {
      // Only block1 selected, anchor = block1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      // Move up => block1 is the top-most => no block above
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1']);

      // Move down twice => block2 => block3
      moveSelection(editor, 'down'); // Now block3
      moveSelection(editor, 'down'); // No block below block3 => do nothing

      const selectedIds2 = editor.getOption(
        BlockSelectionPlugin,
        'selectedIds'
      );
      expect(Array.from(selectedIds2!)).toEqual(['block3']);
    });
  });

  describe('when pressing arrow up with nested blocks', () => {
    it('should select parent block if no previous sibling exists', () => {
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          {
            id: 'parent1',
            children: [
              {
                id: 'child1',
                children: [{ text: 'Child One' }],
                type: 'p',
              },
              {
                id: 'child2',
                children: [{ text: 'Child Two' }],
                type: 'p',
              },
            ],
            type: 'p',
          },
        ],
      });

      // Select child1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['child1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'child1');

      // Move selection UP => no previous sibling => should select parent1
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['parent1']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('parent1');
    });

    it('should do nothing if at root level with no previous sibling', () => {
      // Using the original test value
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      // Move up from the first block at root level
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block1');
    });
  });
});
