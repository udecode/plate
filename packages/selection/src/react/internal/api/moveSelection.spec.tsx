/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

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
    it('should maintain current selection if there is no block above/below', () => {
      // Only block1 selected, anchor = block1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      // Move up => block1 is the top-most => no block above => maintain block1
      moveSelection(editor, 'up');

      let selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1']);
      let anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block1');

      // Only block3 selected, anchor = block3
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block3'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block3');

      // Move down => block3 is the bottom-most => no block below => maintain block3
      moveSelection(editor, 'down');

      selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block3']);
      anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block3');
    });

    it('should maintain current selection when multiple blocks are selected and no prev/next block exists', () => {
      // block1 and block2 selected at the top
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

      // Move up => no block above block1 => maintain current selection
      moveSelection(editor, 'up');

      let selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1']);
      let anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block1');

      // block2 and block3 selected at the bottom
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block2', 'block3'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block3');

      // Move down => no block below block3 => maintain current selection
      moveSelection(editor, 'down');

      selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block3']);
      anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block3');
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

  describe('when pressing arrow down with nested blocks', () => {
    beforeEach(() => {
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          {
            id: 'table1',
            children: [
              {
                id: 'tr1',
                children: [
                  {
                    id: 'td11',
                    children: [
                      {
                        id: 'p11',
                        children: [{ text: 'Cell 1-1' }],
                        type: 'p',
                      },
                    ],
                    type: 'td',
                  },
                  {
                    id: 'td12',
                    children: [
                      {
                        id: 'p12',
                        children: [{ text: 'Cell 1-2' }],
                        type: 'p',
                      },
                    ],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
              {
                id: 'tr2',
                children: [
                  {
                    id: 'td21',
                    children: [
                      {
                        id: 'p21',
                        children: [{ text: 'Cell 2-1' }],
                        type: 'p',
                      },
                    ],
                    type: 'td',
                  },
                  {
                    id: 'td22',
                    children: [
                      {
                        id: 'p22',
                        children: [{ text: 'Cell 2-2' }],
                        type: 'p',
                      },
                    ],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      });

      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        // Only table and tr are selectable
        return node.type === 'table' || node.type === 'tr';
      });
    });

    it('should move from first tr to second tr in table', () => {
      // Select tr1
      editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['tr1']));
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr1');

      // Move down
      moveSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['tr2']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('tr2');
    });

    it('should do nothing when at last tr', () => {
      // Select tr2
      editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['tr2']));
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr2');

      // Move down
      moveSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['tr2']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('tr2');
    });

    it('should skip non-selectable td cells', () => {
      // Select td11
      editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['td11']));
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'td11');

      // Move down
      moveSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['tr2']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('tr2');
    });
  });

  describe('when pressing arrow up with complex nested blocks', () => {
    beforeEach(() => {
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          {
            id: 'block1',
            children: [{ text: 'Block One' }],
            type: 'p',
          },
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
            type: 'div',
          },
          {
            id: 'column_group1',
            children: [
              {
                id: 'column1',
                children: [
                  {
                    id: 'grandchild1',
                    children: [{ text: 'Grandchild One' }],
                    type: 'p',
                  },
                ],
                type: 'column',
              },
              {
                id: 'column2',
                children: [
                  {
                    id: 'grandchild2',
                    children: [{ text: 'Grandchild Two' }],
                    type: 'p',
                  },
                ],
                type: 'column',
              },
            ],
            type: 'column_group',
          },
        ],
      });

      // For testing, let's skip columns
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'column';
      });
    });

    it('should move to previous sibling when not first child', () => {
      // Select child2
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['child2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'child2');

      // Move up => should select child1
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['child1']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('child1');
    });

    it('should move to parents previous block if first child and skipping columns', () => {
      // Select grandchild2
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['grandchild2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'grandchild2');

      // Move up => should select grandchild1 (since columns are not selectable)
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['grandchild1']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('grandchild1');
    });

    it('should handle deeper nesting with non-selectable parents', () => {
      // Make column_group1 not selectable as well
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'column' && node.type !== 'column_group';
      });

      // Select grandchild1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['grandchild1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'grandchild1');

      // Move up => should skip column1 and column_group1, select child2
      moveSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['child2']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('child2');
    });
  });
});
