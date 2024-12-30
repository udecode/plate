/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { isTextByPath } from '../../isTextByPath';

jsxt;

const editor = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as TEditor;

const path = [0];

const output = false;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
