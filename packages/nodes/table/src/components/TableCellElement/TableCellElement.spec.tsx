import React from 'react';
import { usePlateEditorRef } from '@udecode/plate-common';
import { createTablePlugin } from '@udecode/plate-table';
import { createPlateUI } from '@udecode/plate-ui';
import * as resizeable from 're-resizable';
import { createPlateTestEditor } from '../../../../../core/src/utils/__tests__/createPlateTestEditor';
import { tableInput } from './TableCellElement.fixtures';

const core = { usePlateEditorRef };

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
      expect(spyResizable.mock.calls[3][0].enable?.bottom).not.toEqual(true);
    });
  });
});
