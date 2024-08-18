/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';

import { createPlateTestEditor } from '../../core/src/client/__tests__/createPlateTestEditor';
import { createInlineDatePlugin } from './createInlineDatePlugin';

jsx;

describe('On keydown', () => {
  it('inline date should not be selected on keydown arrow right', async () => {
    const input = (
      <editor>
        <hp>
          <htext>test</htext>
          <cursor />
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <htext>test</htext>
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>
          <htext>test</htext>
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <cursor />
          <htext>test</htext>
        </hp>
      </editor>
    ) as any as PlateEditor;

    const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
      editor: input,
      plugins: [createInlineDatePlugin()],
    });

    await triggerKeyboardEvent('ArrowRight');

    expect(editor.selection).toEqual(output.selection);
  });

  it('inline date should not be selected on keydown arrow left', async () => {
    const input = (
      <editor>
        <hp>
          <htext>test</htext>
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <cursor />
          <htext>test</htext>
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>
          <htext>test</htext>
          <cursor />
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <htext>test</htext>
        </hp>
      </editor>
    ) as any as PlateEditor;

    const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
      editor: input,
      plugins: [createInlineDatePlugin()],
    });

    await triggerKeyboardEvent('ArrowLeft');

    expect(editor.selection).toEqual(output.selection);
  });

  it('inline date should not be selected When two inline dates are adjacent', async () => {
    const input = (
      <editor>
        <hp>
          <htext>test</htext>
          <cursor />
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <htext />
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <htext>test</htext>
        </hp>
      </editor>
    ) as any as PlateEditor;

    const output = (
      <editor>
        <hp>
          <htext>test</htext>
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <cursor />
          <htext />
          <hinlinedate date="2024-01-01">
            <htext />
          </hinlinedate>
          <htext />
          <htext>test</htext>
        </hp>
      </editor>
    ) as any as PlateEditor;

    const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
      editor: input,
      plugins: [createInlineDatePlugin()],
    });

    await triggerKeyboardEvent('ArrowRight');

    expect(editor.selection).toEqual(output.selection);
  });
});
