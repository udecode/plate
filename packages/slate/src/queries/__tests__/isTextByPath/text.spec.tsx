/** @jsx jsxt */

import type { TEditor } from '../../../interfaces';;

import { jsxt } from '@udecode/plate-test-utils';

import { isTextByPath } from '../../isTextByPath';

jsxt;

const editor = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as TEditor;

const path = [0, 0];

const output = true;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
