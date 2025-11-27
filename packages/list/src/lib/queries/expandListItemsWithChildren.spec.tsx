/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type Descendant, type SlateEditor, createEditor } from 'platejs';

import { expandListItemsWithChildren } from './expandListItemsWithChildren';

jsxt;

describe('expandListItemsWithChildren', () => {
  describe('when input contains no list items', () => {
    it('should return the same blocks unchanged', () => {
      const input = (
        <fragment>
          <hp id="1">
            paragraph 1<cursor />
          </hp>
          <hp id="2">paragraph 2</hp>
          <hh1 id="3">heading</hh1>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entries = [
        [input[0], [0]],
        [input[1], [1]],
        [input[2], [2]],
      ] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual(entries);
    });
  });

  describe('when input contains list items without children', () => {
    it('should return the same list items', () => {
      const input = (
        <fragment>
          <hp id="1" indent={1} listStyleType="disc">
            item 1
          </hp>
          <hp id="2" indent={1} listStyleType="disc">
            item 2<cursor />
          </hp>
          <hp id="3" indent={1} listStyleType="disc">
            item 3
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entries = [
        [input[0], [0]],
        [input[1], [1]],
        [input[2], [2]],
      ] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual(entries);
    });
  });

  describe('when input contains list items with children', () => {
    it('should expand single list item to include its children', () => {
      const input = (
        <fragment>
          <hp id="1" indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp id="2" indent={2} listStyleType="disc">
            child 1
          </hp>
          <hp id="3" indent={2} listStyleType="disc">
            child 2
          </hp>
          <hp id="4" indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      // Only pass the parent item
      const entries = [[input[0], [0]]] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual([
        [input[0], [0]], // parent
        [input[1], [1]], // child 1
        [input[2], [2]], // child 2
      ] as any);
    });

    it('should handle multiple list items with children', () => {
      const input = (
        <fragment>
          <hp id="1" indent={1} listStyleType="disc">
            parent 1
          </hp>
          <hp id="2" indent={2} listStyleType="disc">
            child 1.1
          </hp>
          <hp id="3" indent={1} listStyleType="disc">
            parent 2<cursor />
          </hp>
          <hp id="4" indent={2} listStyleType="disc">
            child 2.1
          </hp>
          <hp id="5" indent={3} listStyleType="disc">
            grandchild 2.1.1
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      // Pass both parent items
      const entries = [
        [input[0], [0]],
        [input[2], [2]],
      ] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual([
        [input[0], [0]], // parent 1
        [input[1], [1]], // child 1.1
        [input[2], [2]], // parent 2
        [input[3], [3]], // child 2.1
        [input[4], [4]], // grandchild 2.1.1
      ] as any);
    });

    it('should avoid duplicates when children are already in input', () => {
      const input = (
        <fragment>
          <hp id="1" indent={1} listStyleType="disc">
            parent
          </hp>
          <hp id="2" indent={2} listStyleType="disc">
            child 1<cursor />
          </hp>
          <hp id="3" indent={2} listStyleType="disc">
            child 2
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      // Pass parent and one child (child 1)
      const entries = [
        [input[0], [0]],
        [input[1], [1]],
      ] as any;

      const result = expandListItemsWithChildren(editor, entries);

      // Should not duplicate child 1, but should add child 2
      expect(result).toEqual([
        [input[0], [0]], // parent
        [input[1], [1]], // child 1 (from input)
        [input[2], [2]], // child 2 (added)
      ] as any);
    });
  });

  describe('when input contains mixed blocks', () => {
    it('should expand only list items and keep other blocks as-is', () => {
      const input = (
        <fragment>
          <hp id="1">paragraph before</hp>
          <hp id="2" indent={1} listStyleType="disc">
            list parent
            <cursor />
          </hp>
          <hp id="3" indent={2} listStyleType="disc">
            list child
          </hp>
          <hh1 id="4">heading after</hh1>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entries = [
        [input[0], [0]], // paragraph
        [input[1], [1]], // list parent
        [input[3], [3]], // heading
      ] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual([
        [input[0], [0]], // paragraph (unchanged)
        [input[1], [1]], // list parent
        [input[2], [2]], // list child (added)
        [input[3], [3]], // heading (unchanged)
      ] as any);
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const editor = createEditor((<editor />) as any as SlateEditor);

      const result = expandListItemsWithChildren(editor, []);

      expect(result).toEqual([]);
    });

    it('should handle list items at end of document', () => {
      const input = (
        <fragment>
          <hp id="1" indent={1} listStyleType="disc">
            parent at end
            <cursor />
          </hp>
          <hp id="2" indent={2} listStyleType="disc">
            child at end
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entries = [[input[0], [0]]] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual([
        [input[0], [0]], // parent
        [input[1], [1]], // child
      ] as any);
    });

    it('should handle deeply nested lists', () => {
      const input = (
        <fragment>
          <hp id="1" indent={1} listStyleType="disc">
            level 1<cursor />
          </hp>
          <hp id="2" indent={2} listStyleType="disc">
            level 2
          </hp>
          <hp id="3" indent={3} listStyleType="disc">
            level 3
          </hp>
          <hp id="4" indent={4} listStyleType="disc">
            level 4
          </hp>
          <hp id="5" indent={5} listStyleType="disc">
            level 5
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entries = [[input[0], [0]]] as any;

      const result = expandListItemsWithChildren(editor, entries);

      expect(result).toEqual([
        [input[0], [0]], // level 1
        [input[1], [1]], // level 2
        [input[2], [2]], // level 3
        [input[3], [3]], // level 4
        [input[4], [4]], // level 5
      ] as any);
    });
  });
});
