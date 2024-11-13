/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';

import { isTextByPath } from '../../isTextByPath';

jsxt;

const editor = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as SlateEditor;

const path = [0, 0];

const output = true;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
