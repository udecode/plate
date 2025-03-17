/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../react';
import { selectBlocks } from './selectBlocks';

jsxt;

describe('selectBlocks', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    editor = createPlateEditor({
      plugins: [BlockSelectionPlugin],
      selection: {
        anchor: { offset: 0, path: [0] },
        focus: { offset: 0, path: [0] },
      },
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

  describe('when no blocks are selected', () => {
    it('should select the specified block', () => {
      selectBlocks(editor, [1]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block2']);
    });
  });

  describe('when blocks are already selected', () => {
    beforeEach(() => {
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
    });

    it('should keep existing selection if selecting an already selected block', () => {
      selectBlocks(editor, [0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1', 'block2']);
    });

    it('should select only the new block if selecting an unselected block', () => {
      selectBlocks(editor, [2]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block3']);
    });
  });

  describe('with nested blocks', () => {
    beforeEach(() => {
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
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
            type: 'div',
          },
        ],
      });
    });

    it('should select nested block', () => {
      selectBlocks(editor, [0, 0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['child1']);
    });

    it('should select parent block', () => {
      selectBlocks(editor, [0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['parent1']);
    });
  });

  describe('with non-selectable blocks', () => {
    beforeEach(() => {
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0] },
        },
        value: [
          {
            id: 'table1',
            children: [
              {
                id: 'tr1',
                children: [
                  {
                    id: 'td1',
                    children: [{ text: 'Cell One' }],
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
    });

    it('should select block at path', () => {
      selectBlocks(editor, [0, 0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['tr1']);
    });
  });

  describe('with multi-level selection', () => {
    beforeEach(() => {
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0] },
        },
        value: [
          {
            id: 'root1',
            children: [
              {
                id: 'section1',
                children: [
                  {
                    id: 'div1',
                    children: [
                      {
                        id: 'p1',
                        children: [{ text: 'Paragraph 1' }],
                        type: 'p',
                      },
                    ],
                    type: 'div',
                  },
                  {
                    id: 'div2',
                    children: [
                      {
                        id: 'p2',
                        children: [{ text: 'Paragraph 2' }],
                        type: 'p',
                      },
                    ],
                    type: 'div',
                  },
                ],
                type: 'section',
              },
              {
                id: 'section2',
                children: [
                  {
                    id: 'div3',
                    children: [
                      {
                        id: 'p3',
                        children: [{ text: 'Paragraph 3' }],
                        type: 'p',
                      },
                    ],
                    type: 'div',
                  },
                ],
                type: 'section',
              },
            ],
            type: 'root',
          },
        ],
      });
    });

    it('should select only blocks at same level', () => {
      // Set selection from div1 to div3
      editor.selection = {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
      };

      selectBlocks(editor, [0, 0, 0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['div1', 'div2', 'div3']);
    });

    it('should select only sections when selecting across sections', () => {
      // Set selection from section1 to section2
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 1] },
      };

      selectBlocks(editor, [0, 0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['section1', 'section2']);
    });

    it('should select only paragraphs when selecting across nested paragraphs', () => {
      // Set selection from p1 to p3
      editor.selection = {
        anchor: { offset: 0, path: [0, 0, 0, 0] },
        focus: { offset: 0, path: [0, 1, 0, 0] },
      };

      selectBlocks(editor, [0, 0, 0, 0]);

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['p1', 'p2', 'p3']);
    });
  });
});
