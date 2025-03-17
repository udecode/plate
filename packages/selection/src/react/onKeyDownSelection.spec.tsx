/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

jsxt;

// FIXME
describe('onKeyDownSelection', () => {
  it('todo', () => {
    expect(true).toBe(true);
  });

  // it('should select all when cmd+a is pressed and selection covers block', async () => {
  //   const input = (
  //     <editor>
  //       <hp id="1">
  //         <cursor />
  //         <htext>test</htext>
  //       </hp>
  //     </editor>
  //   ) as any;
  //
  //   const output = (
  //     <editor>
  //       <hp id="1">
  //         <anchor />
  //         <htext>test</htext>
  //         <focus />
  //       </hp>
  //     </editor>
  //   ) as any;
  //
  //   const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
  //     value: input.children,
  // selection: input.selection,
  //     plugins: [BlockSelectionPlugin],
  //   });
  //
  //   await triggerKeyboardEvent('mod+a');
  //
  //   expect(editor.selection).toEqual(output.selection);
  // });
  //
  // it('should select all when cmd+a is pressed and selection is not in same block', async () => {
  //   const input = (
  //     <editor>
  //       <hp>
  //         te
  //         <anchor />
  //         st
  //       </hp>
  //       <hp>
  //         te
  //         <focus />
  //         st
  //       </hp>
  //     </editor>
  //   ) as any;
  //
  //   const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
  //     value: input.children,
  // selection: input.selection,
  //     plugins: [BlockSelectionPlugin],
  //   });
  //
  //   jest.spyOn(editor.api.blockSelection, 'selectAll');
  //
  //   await triggerKeyboardEvent('mod+a');
  //
  //   expect(editor.api.blockSelection.selectAll).toHaveBeenCalled();
  // });
});
