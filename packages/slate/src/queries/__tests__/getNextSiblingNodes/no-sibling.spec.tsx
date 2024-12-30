/** @jsx jsxt */

import type { Range } from 'slate';

import { jsxt } from '@udecode/plate-test-utils';

import type { TDescendant, TEditor } from '../../../interfaces';

import { createTEditor } from '../../../createTEditor';
import { getBlockAbove } from '../../getBlockAbove';
import { getNextSiblingNodes } from '../../getNextSiblingNodes';

jsxt;

const input = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any as TEditor;

const output: TDescendant[] = [];

it('should be', () => {
  const editor = createTEditor();

  editor.selection = input.selection;
  editor.children = input.children;

  const above = getBlockAbove(editor) as any;
  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
