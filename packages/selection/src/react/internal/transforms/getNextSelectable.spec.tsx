/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { createPlateEditor } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { getNextSelectable } from './getNextSelectable';

jsxt;

describe('getNextSelectable', () => {
  let editor: PlateEditor;

  describe('with flat structure', () => {
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

    it('should return next block when available', () => {
      // from block1 => expect block2
      const nextEntry = getNextSelectable(editor, [0]);
      expect(nextEntry?.[0].id).toBe('block2');
    });

    it('should return undefined when no next block exists', () => {
      // from block3 => no next
      const nextEntry = getNextSelectable(editor, [2]);
      expect(nextEntry).toBeUndefined();
    });
  });

  describe('with nested structure', () => {
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

    it('should return next sibling when not last child', () => {
      // from child1 => expect child2
      const nextEntry = getNextSelectable(editor, [1, 0]);
      expect(nextEntry?.[0].id).toBe('child2');
    });

    it('should return parent’s next block if last child and skipping columns', () => {
      // from child2 => next is column_group1 (since columns are not selectable, but column_group might be)
      const nextEntry = getNextSelectable(editor, [1, 1]);
      // If column_group1 is also selectable, we get it
      // If not, we'd skip and potentially go to grandchild1, depending on your logic.
      expect(nextEntry?.[0].id).toBe('column_group1');
    });

    it('should skip non-selectable column node and return grandchild inside next column if column_group is selectable', () => {
      // If column_group1 is selectable, but we want to find the next "block" after child2:
      // Typically, you'd first get column_group1. If that's not selectable, you'd skip it.
      // Then you'd see it has columns which are not selectable. Possibly we skip them,
      // eventually we find grandchild1 or grandchild2.
      // For demonstration, let's say column_group1 is also not selectable:
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'column' && node.type !== 'column_group';
      });

      // from child2 => the next top-level is column_group1, but it's not selectable
      // we skip it, skip the columns, eventually find grandchild1
      const nextEntry = getNextSelectable(editor, [1, 1]);
      expect(nextEntry?.[0].id).toBe('grandchild1');
    });

    it('should handle deeper nesting if child is last in column, moves up to parent, etc.', () => {
      // from grandchild2 => no "next sibling" in column2, so we move up to column2
      // which is non-selectable, then up to column_group1 => which might be selectable or not
      // If not, we skip it, next we might see there's no next sibling => done => undefined
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        // skip columns and column_group
        return node.type !== 'column' && node.type !== 'column_group';
      });

      const nextEntry = getNextSelectable(editor, [2, 1, 0]);
      expect(nextEntry).toBeUndefined();
    });
  });

  describe('with non-selectable blocks', () => {
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
            id: 'nonSelectable1',
            children: [{ text: 'Non Selectable' }],
            type: 'comment',
          },
          {
            id: 'nonSelectable2',
            children: [{ text: 'Non Selectable 2' }],
            type: 'comment',
          },
          {
            id: 'block2',
            children: [{ text: 'Block Two' }],
            type: 'p',
          },
        ],
      });

      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'comment';
      });
    });

    it('should skip non-selectable next blocks until finding a selectable one', () => {
      // from block1 => next siblings are nonSelectable1, nonSelectable2, then block2
      const nextEntry = getNextSelectable(editor, [0]);
      expect(nextEntry?.[0].id).toBe('block2');
    });

    it('should return undefined if all next blocks are non-selectable', () => {
      // e.g. if the last block is non-selectable or everything after is non-selectable
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          {
            id: 'block1',
            children: [{ text: 'Block One' }],
            type: 'p',
          },
          {
            id: 'nonSelectable1',
            children: [{ text: 'Non Selectable 1' }],
            type: 'comment',
          },
          {
            id: 'nonSelectable2',
            children: [{ text: 'Non Selectable 2' }],
            type: 'comment',
          },
        ],
      });

      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'comment';
      });

      // from block1 => next siblings are comment nodes => skip => none left
      const nextEntry = getNextSelectable(editor, [0]);
      expect(nextEntry).toBeUndefined();
    });

    it('should handle a mix of non-selectable blocks in nested structure', () => {
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
                id: 'nonSelectable2',
                children: [{ text: 'Non Selectable 2' }],
                type: 'comment',
              },
            ],
            type: 'div',
          },
          {
            id: 'nonSelectable3',
            children: [{ text: 'Non Selectable 3' }],
            type: 'comment',
          },
          {
            id: 'block2',
            children: [{ text: 'Block Two' }],
            type: 'p',
          },
        ],
      });

      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'comment';
      });

      // from child1 => next sibling is nonSelectable2 => skip => next top-level is nonSelectable3 => skip => block2
      const nextEntry = getNextSelectable(editor, [1, 0]);
      expect(nextEntry?.[0].id).toBe('block2');
    });
  });
});
