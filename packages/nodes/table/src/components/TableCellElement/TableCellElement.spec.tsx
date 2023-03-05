import React from 'react';
import * as core from '@udecode/plate-core';
import { withProps } from '@udecode/plate-core';
import { createTablePlugin, ELEMENT_TD } from '@udecode/plate-table';
import { createPlateUI } from '@udecode/plate-ui';
import * as resizeable from 're-resizable';
import { createPlateTestEditor } from '../../../../../core/src/utils/__tests__/createPlateTestEditor';
import { tableInput } from './TableCellElement.fixtures';
import { TableCellElementResizable } from './TableCellElementResizable';

jest.mock('re-resizable');

describe('TableCellElement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('readOnly mode', () => {
    it('should disable resize in readOnly mode', async () => {
      const [editor, { rerender }] = await createPlateTestEditor(
        {
          plugins: [createTablePlugin()],
          components: createPlateUI(),
        } as any,
        {
          componentProps: { editableProps: { readOnly: true } },
        }
      );

      const spyResizable = jest.spyOn(resizeable, 'Resizable');
      editor.children = tableInput;
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(editor as any);

      await rerender();

      expect(spyResizable).toHaveBeenCalled();
      expect(spyResizable).toHaveBeenCalledTimes(4);
      expect(spyResizable.mock.calls[3][0].enable?.right).not.toEqual(true);
    });
    it('should allow resize in readOnly mode when ignore readOnly is passed in', async () => {
      const [editor, { rerender }] = await createPlateTestEditor(
        {
          plugins: [createTablePlugin()],
          components: createPlateUI({
            [ELEMENT_TD]: withProps(TableCellElementResizable, {
              ignoreReadOnly: true,
            }),
          }),
        } as any,
        {
          componentProps: { editableProps: { readOnly: true } },
        }
      );

      const spyResizable = jest.spyOn(resizeable, 'Resizable');
      editor.children = tableInput;
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(editor as any);

      await rerender();

      expect(spyResizable).toHaveBeenCalled();
      expect(spyResizable).toHaveBeenCalledTimes(4);
      expect(spyResizable.mock.calls[3][0].enable?.right).toEqual(true);
    });
  });
});
