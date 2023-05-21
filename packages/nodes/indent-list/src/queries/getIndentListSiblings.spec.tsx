/** @jsx jsx */

import {
  getBlockAbove,
  PlateEditor,
  TDescendant,
  TElement,
} from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { getIndentListSiblings } from './getIndentListSiblings';

jsx;

describe('getIndentListSiblings', () => {
  describe('listStyleType is not defined', () => {
    it('should be empty', async () => {
      const input = (
        <fragment>
          <hp indent={1} listStyleType="disc">
            1
          </hp>
          <hp indent={1}>
            1<cursor />
          </hp>
          <hp indent={1} listStyleType="disc">
            1
          </hp>
        </fragment>
      ) as any as TDescendant[];

      const editor = (<editor>{input}</editor>) as any as PlateEditor;

      const entry = getBlockAbove<TElement>(editor);

      const siblings = getIndentListSiblings(editor, entry!);

      expect(siblings).toEqual([]);
    });
  });

  describe('listStyleType is defined', () => {
    it('should get nodes', async () => {
      const input = (
        <fragment>
          <hp indent={2} listStyleType="disc">
            21
          </hp>
          <hp indent={1} listStyleType="disc">
            11
          </hp>
          <hp indent={2} listStyleType="disc">
            21
          </hp>
          <hp indent={2} listStyleType="disc">
            22
            <cursor />
          </hp>
          <hp indent={3} listStyleType="decimal">
            31
          </hp>
          <hp indent={2} listStyleType="disc">
            23
          </hp>
          <hp indent={2} listStyleType="decimal">
            21
          </hp>
          <hp indent={1} listStyleType="disc">
            12
          </hp>
          <hp indent={2} listStyleType="decimal">
            21
          </hp>
        </fragment>
      ) as any as TDescendant[];

      const output = (
        <fragment>
          <hp indent={2} listStyleType="disc">
            21
          </hp>
          <hp indent={2} listStyleType="disc">
            22
            <cursor />
          </hp>
          <hp indent={2} listStyleType="disc">
            23
          </hp>
        </fragment>
      ) as any as TDescendant[];

      const editor = (<editor>{input}</editor>) as any as PlateEditor;

      const entry = getBlockAbove<TElement>(editor);

      const siblings = getIndentListSiblings(editor, entry!);

      expect(siblings).toEqual([
        [output[0], [2]],
        [output[1], [3]],
        [output[2], [5]],
      ]);
    });
  });
});
