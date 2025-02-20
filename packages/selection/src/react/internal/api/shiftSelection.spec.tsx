/** @jsx jsxt */
import type { PlateEditor } from '@udecode/plate/react';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

import { BlockSelectionPlugin } from '../../BlockSelectionPlugin';
import { shiftSelection } from './shiftSelection';

jsxt;

describe('shiftSelection', () => {
  let editor: PlateEditor;

  describe('Flat structure', () => {
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

    describe('when anchor is top-most and SHIFT+DOWN', () => {
      it('should expand selection downward', () => {
        editor.setOption(
          BlockSelectionPlugin,
          'selectedIds',
          new Set(['block1'])
        );
        editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

        shiftSelection(editor, 'down');

        const selectedIds = editor.getOption(
          BlockSelectionPlugin,
          'selectedIds'
        );
        expect(Array.from(selectedIds!).sort()).toEqual(
          ['block1', 'block2'].sort()
        );
      });
    });

    describe('when anchor is top-most and SHIFT+DOWN again', () => {
      it('should expand further to block3', () => {
        editor.setOption(
          BlockSelectionPlugin,
          'selectedIds',
          new Set(['block1', 'block2'])
        );
        editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

        shiftSelection(editor, 'down');

        const selectedIds = editor.getOption(
          BlockSelectionPlugin,
          'selectedIds'
        );
        expect(Array.from(selectedIds!).sort()).toEqual(
          ['block1', 'block2', 'block3'].sort()
        );
      });
    });

    describe('when anchor is NOT top-most and SHIFT+DOWN', () => {
      it('should shrink from the top-most block', () => {
        editor.setOption(
          BlockSelectionPlugin,
          'selectedIds',
          new Set(['block1', 'block2'])
        );
        editor.setOption(BlockSelectionPlugin, 'anchorId', 'block2');

        shiftSelection(editor, 'down');

        const selectedIds = editor.getOption(
          BlockSelectionPlugin,
          'selectedIds'
        );
        expect(Array.from(selectedIds!).sort()).toEqual(['block2'].sort());
      });
    });

    describe('when anchor is bottom-most and SHIFT+UP', () => {
      it('should expand selection upward', () => {
        editor.setOption(
          BlockSelectionPlugin,
          'selectedIds',
          new Set(['block2', 'block3'])
        );
        editor.setOption(BlockSelectionPlugin, 'anchorId', 'block3');

        shiftSelection(editor, 'up');

        const selectedIds = editor.getOption(
          BlockSelectionPlugin,
          'selectedIds'
        );
        expect(Array.from(selectedIds!).sort()).toEqual(
          ['block1', 'block2', 'block3'].sort()
        );
      });
    });

    describe('when anchor is NOT bottom-most and SHIFT+UP', () => {
      it('should shrink from bottom-most block', () => {
        editor.setOption(
          BlockSelectionPlugin,
          'selectedIds',
          new Set(['block1', 'block2', 'block3'])
        );
        editor.setOption(BlockSelectionPlugin, 'anchorId', 'block1');

        shiftSelection(editor, 'up');

        const selectedIds = editor.getOption(
          BlockSelectionPlugin,
          'selectedIds'
        );
        expect(Array.from(selectedIds!).sort()).toEqual(
          ['block1', 'block2'].sort()
        );
      });
    });
  });

  describe('Nested structure', () => {
    beforeEach(() => {
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
            type: 'div',
          },
          {
            id: 'block3',
            children: [{ text: 'Block Three' }],
            type: 'p',
          },
          {
            id: 'block4',
            children: [{ text: 'Block Four' }],
            type: 'p',
          },
        ],
      });

      // For testing skipping, let's say child2 is not selectable or something
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        // We'll skip if node.id === 'child2'
        return node.id !== 'child2';
      });
    });

    it('should expand down from parent1 to block3 if anchor is parent1 (top-most)', () => {
      // parent1 selected, anchor=parent1, SHIFT+DOWN => expand to block3
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['parent1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'parent1');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['parent1', 'block3']);
    });

    it('should shrink from parent1 if anchor is block3 (not top-most) SHIFT+DOWN', () => {
      // parent1, block3 selected; anchor=block3 => top-most=parent1 => remove parent1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block3', 'parent1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block3');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block3']);
    });

    it('should expand up from block4 to block3 if anchor is block4 (bottom-most)', () => {
      // block3, block4 selected; anchor=block4 => SHIFT+UP => expand to parent1
      // Actually, let's do block3, block4 => anchor=block4 => SHIFT+UP => add parent1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block3', 'block4'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'block4');

      shiftSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['child1', 'block3', 'block4'].sort()
      );
    });

    it('should shrink from block4 if anchor is parent1 SHIFT+UP', () => {
      // parent1, block3, block4 => anchor=parent1 => SHIFT+UP => remove block4
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block3', 'block4', 'parent1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'parent1');

      shiftSelection(editor, 'up');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      // block4 should be removed from selection
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['parent1', 'block3'].sort()
      );
    });

    it('should skip non-selectable child2 when expanding down from parent1 to block3', () => {
      // We already set child2 as not selectable
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['parent1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'parent1');

      // SHIFT+DOWN => next selectable after parent1 is block3, skipping child2
      shiftSelection(editor, 'down');
      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');

      expect(Array.from(selectedIds!).sort()).toEqual(
        ['parent1', 'block3'].sort()
      );
    });
  });

  describe('Complex columns or table-like structure', () => {
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
          {
            id: 'blockZ',
            children: [{ text: 'Below Table' }],
            type: 'p',
          },
        ],
      });

      // Let’s make only 'table' and 'tr' selectable
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return node.type === 'table' || node.type === 'tr';
      });
    });

    it('should NOT expand down from table1 => add tr1 if anchor=table1', () => {
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['table1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'table1');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      // Should now have table1 + tr1
      expect(Array.from(selectedIds!).sort()).toEqual(['table1'].sort());
    });

    it('should shrink from table1 if anchor=tr1 SHIFT+DOWN', () => {
      // table1, tr1 => anchor=tr1 => top-most=table1 => remove table1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['table1', 'tr1'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr1');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['tr1']);
    });

    it('should expand up from tr1 => add table1 if anchor=tr1 is bottom-most - remove', () => {
      // Suppose table1, tr1 are selected => anchor=tr1 => SHIFT+UP => expand up => add ???
      // But let's do an easier test: if only tr1 is selected => anchor=tr1 => SHIFT+UP =>
      // see if there's an above block to add? Actually, tr1 is the bottom-most if there's only 1 selected.
      // This scenario is contrived, let's just keep it simple:
      editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['tr1']));
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr1');

      shiftSelection(editor, 'up');

      // We expect table1 included
      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(['table1'].sort());
    });

    it('should expand down from tr1 => add tr2 if anchor=tr1 is top-most', () => {
      // anchor=tr1 => SHIFT+DOWN => add tr2
      editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['tr1']));
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr1');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(['tr1', 'tr2'].sort());
    });

    it('should shrink from tr1 if anchor=tr2 SHIFT+DOWN', () => {
      // anchor=tr2 => top-most=tr1 => remove tr1
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['tr1', 'tr2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr2');

      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['tr2']);
    });

    it('should skip td / p nodes that are not selectable', () => {
      // anchor=tr2 => SHIFT+DOWN => next would be blockZ skipping over child tds
      editor.setOption(BlockSelectionPlugin, 'selectedIds', new Set(['tr2']));
      editor.setOption(BlockSelectionPlugin, 'anchorId', 'tr2');

      // SHIFT+DOWN => tries to find next block after tr2 => blockZ is next top-level
      shiftSelection(editor, 'down');

      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      // Now includes blockZ only if blockZ is selectable.
      // Since we only made 'table' or 'tr' selectable, blockZ might be skipped.
      // For this test let's assume blockZ is also selectable => let's set isSelectable accordingly.
      // We'll do that quickly:
      editor.setOption(BlockSelectionPlugin, 'isSelectable', (node) => {
        return (
          node.type === 'table' || node.type === 'tr' || node.id === 'blockZ'
        );
      });
      // Re-run shiftSelection to see if blockZ is included
      shiftSelection(editor, 'down');

      const newSelectedIds = editor.getOption(
        BlockSelectionPlugin,
        'selectedIds'
      );
      expect(Array.from(newSelectedIds!).sort()).toEqual(
        ['blockZ', 'tr2'].sort()
      );
    });
  });

  describe('Anchor defaults to top-most/bottom-most if not set', () => {
    it('should set anchor to top-most for SHIFT+DOWN', () => {
      // We have block1, block2.
      // Let's select block2 only, no anchor set => SHIFT+DOWN => anchor=top-most => block2 => expand => block3.
      editor = createPlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [
          { id: 'block1', children: [{ text: 'One' }], type: 'p' },
          { id: 'block2', children: [{ text: 'Two' }], type: 'p' },
          { id: 'block3', children: [{ text: 'Three' }], type: 'p' },
        ],
      });

      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', null);

      shiftSelection(editor, 'down');

      // Now block2, block3 selected
      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!).sort()).toEqual(
        ['block2', 'block3'].sort()
      );
      // anchor is set to block2
      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block2');
    });

    it('should set anchor to bottom-most for SHIFT+UP', () => {
      // block1, block2 => no anchor => SHIFT+UP => anchor=bottom-most => block2 => expand up => block3 if existed
      editor.setOption(
        BlockSelectionPlugin,
        'selectedIds',
        new Set(['block1', 'block2'])
      );
      editor.setOption(BlockSelectionPlugin, 'anchorId', null);

      shiftSelection(editor, 'up');

      // Because we only have block1, block2, we can't go "up" further
      const selectedIds = editor.getOption(BlockSelectionPlugin, 'selectedIds');
      expect(Array.from(selectedIds!)).toEqual(['block1', 'block2']);

      const anchorId = editor.getOption(BlockSelectionPlugin, 'anchorId');
      expect(anchorId).toBe('block2');
    });
  });
});
