/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/bold/defaults';
import { MARK_ITALIC } from '../../../../../marks/basic-marks/src/italic/defaults';
import { getOnKeyDownMark } from '../../../utils/getOnKeyDownMark';

const input = (
  <editor>
    <hp>
      t<htext italic>est</htext>
    </hp>
    <selection>
      <anchor path={[0, 1]} offset={0} />
      <focus path={[0, 1]} offset={3} />
    </selection>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      t<htext bold>est</htext>
    </hp>
    <selection>
      <anchor path={[0, 1]} offset={0} />
      <focus path={[0, 1]} offset={3} />
    </selection>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  getOnKeyDownMark({
    type: MARK_BOLD,
    hotkey: 'ctrl+b',
    clear: MARK_ITALIC,
  })?.(input)(event);
  expect(input.children).toEqual(output.children);
  expect(input.selection).toEqual(output.selection);
});
