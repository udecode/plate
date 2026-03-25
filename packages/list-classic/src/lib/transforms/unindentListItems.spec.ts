import * as moveListItemsModule from './moveListItems';
import { unindentListItems } from './unindentListItems';

describe('unindentListItems', () => {
  it('forwards the options and forces decrease mode', () => {
    const spy = spyOn(moveListItemsModule, 'moveListItems').mockReturnValue(
      undefined as any
    );
    const editor = {} as any;

    unindentListItems(editor, {
      at: [0],
      enableResetOnShiftTab: true,
    });

    expect(spy).toHaveBeenCalledWith(editor, {
      at: [0],
      enableResetOnShiftTab: true,
      increase: false,
    });

    spy.mockRestore();
  });
});
