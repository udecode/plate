/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import {
  type Descendant,
  type SlateEditor,
  type TElement,
  createEditor,
} from 'platejs';

import { getListChildren } from './getListChildren';

jsxt;

describe('getListChildren', () => {
  describe('when node is not a list item', () => {
    it('should return empty array when node has no listType', () => {
      const input = (
        <fragment>
          <hp indent={1}>
            not a list item
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            list item
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([]);
    });

    it('should return empty array when node has no indent', () => {
      const input = (
        <fragment>
          <hp listStyleType="disc">
            no indent
            <cursor />
          </hp>
          <hp indent={1} listStyleType="disc">
            child
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([]);
    });
  });

  describe('when node is a list item', () => {
    it('should get all direct children with bigger indent', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child 1
          </hp>
          <hp indent={2} listStyleType="disc">
            child 2
          </hp>
          <hp indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={2} listStyleType="disc">
            child 1
          </hp>
          <hp indent={2} listStyleType="disc">
            child 2
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([
        [output[0], [1]],
        [output[1], [2]],
      ] as any);
    });

    it('should get nested children with multiple indent levels', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child
          </hp>
          <hp indent={3} listStyleType="disc">
            grandchild
          </hp>
          <hp indent={4} listStyleType="disc">
            great-grandchild
          </hp>
          <hp indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={2} listStyleType="disc">
            child
          </hp>
          <hp indent={3} listStyleType="disc">
            grandchild
          </hp>
          <hp indent={4} listStyleType="disc">
            great-grandchild
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([
        [output[0], [1]],
        [output[1], [2]],
        [output[2], [3]],
      ] as any);
    });

    it('should stop at item with equal indent', () => {
      const input = (
        <fragment>
          <hp indent={2} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={3} listStyleType="disc">
            child 1
          </hp>
          <hp indent={3} listStyleType="disc">
            child 2
          </hp>
          <hp indent={2} listStyleType="disc">
            sibling (should stop here)
          </hp>
          <hp indent={3} listStyleType="disc">
            not included
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={3} listStyleType="disc">
            child 1
          </hp>
          <hp indent={3} listStyleType="disc">
            child 2
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([
        [output[0], [1]],
        [output[1], [2]],
      ] as any);
    });

    it('should stop at item with lower indent', () => {
      const input = (
        <fragment>
          <hp indent={3} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={4} listStyleType="disc">
            child 1
          </hp>
          <hp indent={5} listStyleType="disc">
            grandchild
          </hp>
          <hp indent={2} listStyleType="disc">
            ancestor (should stop here)
          </hp>
          <hp indent={4} listStyleType="disc">
            not included
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={4} listStyleType="disc">
            child 1
          </hp>
          <hp indent={5} listStyleType="disc">
            grandchild
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([
        [output[0], [1]],
        [output[1], [2]],
      ] as any);
    });

    it('should stop at non-list item', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            child 1
          </hp>
          <hp indent={2}>not a list item (should stop here)</hp>
          <hp indent={2} listStyleType="disc">
            not included
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={2} listStyleType="disc">
            child 1
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([[output[0], [1]]] as any);
    });

    it('should return empty array when no children exist', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([]);
    });

    it('should return empty array when at last position', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            item 1
          </hp>
          <hp indent={2} listStyleType="disc">
            last item
            <cursor />
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([]);
    });

    it('should work with mixed list types', () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            parent
            <cursor />
          </hp>
          <hp indent={2} listStyleType="decimal">
            ordered child 1
          </hp>
          <hp indent={2} listStyleType="disc">
            unordered child 2
          </hp>
          <hp indent={3} listStyleType="decimal">
            nested ordered
          </hp>
          <hp indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={2} listStyleType="decimal">
            ordered child 1
          </hp>
          <hp indent={2} listStyleType="disc">
            unordered child 2
          </hp>
          <hp indent={3} listStyleType="decimal">
            nested ordered
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([
        [output[0], [1]],
        [output[1], [2]],
        [output[2], [3]],
      ] as any);
    });

    it('should work with todo lists', () => {
      const input = (
        <fragment>
          <hp indent={1} listChecked={false} listStyleType="disc">
            parent todo
            <cursor />
          </hp>
          <hp indent={2} listChecked={true} listStyleType="disc">
            checked child
          </hp>
          <hp indent={2} listChecked={false} listStyleType="disc">
            unchecked child
          </hp>
          <hp indent={1} listStyleType="disc">
            sibling
          </hp>
        </fragment>
      ) as any as Descendant[];

      const output = (
        <fragment>
          <hp indent={2} listChecked={true} listStyleType="disc">
            checked child
          </hp>
          <hp indent={2} listChecked={false} listStyleType="disc">
            unchecked child
          </hp>
        </fragment>
      ) as any as Descendant[];

      const editor = createEditor(
        (<editor>{input}</editor>) as any as SlateEditor
      );

      const entry = editor.api.block<TElement>();
      const children = getListChildren(editor, entry!);

      expect(children).toEqual([
        [output[0], [1]],
        [output[1], [2]],
      ] as any);
    });
  });
});
