/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { createPlateEditor } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { getPreviousSelectable } from './getPreviousSelectable';

jsxt;

describe('getPreviousSelectable', () => {
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

    it('should return previous block when available', () => {
      const prevEntry = getPreviousSelectable(editor, [1]); // From block2
      expect(prevEntry?.[0].id).toBe('block1');
    });

    it('should return undefined when no previous block exists', () => {
      const prevEntry = getPreviousSelectable(editor, [0]); // From block1
      expect(prevEntry).toBeUndefined();
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
                id: 'column1',
                children: [
                  {
                    id: 'grandchild2',
                    children: [{ text: 'Grandchild One' }],
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

      // Mock isSelectable to control which blocks are selectable
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        // Make parent1 selectable but column_group1 not selectable
        if (node.type === 'column') return false;

        return true;
      });
    });

    it('should return parent when first child and parent is selectable', () => {
      const prevEntry = getPreviousSelectable(editor, [1, 0]); // From child1
      expect(prevEntry?.[0].id).toBe('parent1');
    });

    it('should return previous sibling when not first child', () => {
      const prevEntry = getPreviousSelectable(editor, [1, 1]); // From child2
      expect(prevEntry?.[0].id).toBe('child1');
    });

    it('should return previous block of parent when parent not selectable', () => {
      const prevEntry = getPreviousSelectable(editor, [2, 1, 0]); // From grandchild2
      expect(prevEntry?.[0].id).toBe('grandchild1');
    });

    it('should handle deeply nested first blocks recursively', () => {
      // Add a more complex nested structure
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
                id: 'column1',
                children: [
                  {
                    id: 'grandchild1',
                    children: [{ text: 'Grandchild One' }],
                    type: 'p',
                  },
                ],
                type: 'div',
              },
            ],
            type: 'div',
          },
        ],
      });

      // Test recursive parent selection when all parents are selectable
      editor.setOption(BlockSelectionPlugin, 'isSelectable', () => true);
      const prevEntry = getPreviousSelectable(editor, [1, 0, 0]); // From grandchild1
      expect(prevEntry?.[0].id).toBe('column1');

      // Test skipping non-selectable parents
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.id !== 'column1'; // Make column not selectable
      });
      const prevEntry2 = getPreviousSelectable(editor, [1, 0, 0]); // From grandchild1
      expect(prevEntry2?.[0].id).toBe('parent1');
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

    it('should skip non-selectable previous blocks until finding a selectable one', () => {
      const prevEntry = getPreviousSelectable(editor, [3]); // From block2
      expect(prevEntry?.[0].id).toBe('block1');
    });

    it('should return undefined if all previous blocks are non-selectable', () => {
      // Add non-selectable blocks at the start
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
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
          {
            id: 'block1',
            children: [{ text: 'Block One' }],
            type: 'p',
          },
        ],
      });

      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'comment';
      });

      const prevEntry = getPreviousSelectable(editor, [2]); // From block1
      expect(prevEntry).toBeUndefined();
    });

    it('should handle mix of non-selectable blocks and nested structure', () => {
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
            id: 'parent1',
            children: [
              {
                id: 'nonSelectable2',
                children: [{ text: 'Non Selectable 2' }],
                type: 'comment',
              },
              {
                id: 'child1',
                children: [{ text: 'Child One' }],
                type: 'p',
              },
            ],
            type: 'div',
          },
        ],
      });

      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type !== 'comment';
      });

      const prevEntry = getPreviousSelectable(editor, [2, 1]); // From child1
      expect(prevEntry?.[0].id).toBe('parent1');
    });
  });
});
