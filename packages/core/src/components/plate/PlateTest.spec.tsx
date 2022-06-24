/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { assertOutput, buildTestHarness } from 'slate-test-utils';
import { PlateTest } from './PlateTest';

jsx;

it('user types, presses undo, presses redo, and types more', async () => {
  const input = (
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  );

  const [editor, { type, undo, redo }] = await buildTestHarness(PlateTest)({
    editor: input,
  });

  await type('banana');

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          banana
          <cursor />
        </htext>
      </hp>
    </editor>
  );

  await undo();

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          <cursor />
        </htext>
      </hp>
    </editor>
  );

  await redo();

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          banana
          <cursor />
        </htext>
      </hp>
    </editor>
  );

  await type(' mango');

  assertOutput(
    editor,
    <editor>
      <hp>
        <htext>
          banana mango
          <cursor />
        </htext>
      </hp>
    </editor>
  );
});
