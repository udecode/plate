/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';

import { createPlateTestEditor } from '../../core/src/client/__tests__/createPlateTestEditor';
import { blockSelectionActions } from './blockSelectionStore';
import { onKeyDownSelection } from './onKeyDownSelection';

jsx;

describe('onKeyDownSelection', () => {
  it('should select all when cmd+a is pressed and selection covers block', async () => {
    const input = (
      <editor>
        <hp id="1">
          <cursor />
          <htext>test</htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp id="1">
          <anchor />
          <htext>test</htext>
          <focus />
        </hp>
      </editor>
    ) as any;

    const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
      editor: input,
      plugins: [
        { handlers: { onKeyDown: onKeyDownSelection }, key: 'blockSelection' },
      ],
    });

    await triggerKeyboardEvent('mod+a');

    expect(editor.selection).toEqual(output.selection);
  });

  it('should select all when cmd+a is pressed and selection is not in same block', async () => {
    const input = (
      <editor>
        <hp>
          te
          <anchor />
          st
        </hp>
        <hp>
          te
          <focus />
          st
        </hp>
      </editor>
    ) as any;

    const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
      editor: input,
      plugins: [
        { handlers: { onKeyDown: onKeyDownSelection }, key: 'blockSelection' },
      ],
    });

    jest.spyOn(blockSelectionActions, 'selectedAll');

    await triggerKeyboardEvent('mod+a');

    expect(blockSelectionActions.selectedAll).toHaveBeenCalled();
  });
});
