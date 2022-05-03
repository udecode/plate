import React from 'react';
import { render } from '@testing-library/react';
import * as core from '@udecode/plate-core';
import { withProps } from '@udecode/plate-core';
import { Plate } from '@udecode/plate-core/src';
import { createTablePlugin, ELEMENT_TD } from '@udecode/plate-table';
import {
  createPlateUI,
  createPlateUIEditor,
  TableCellElement,
} from '@udecode/plate-ui';
import * as resizeable from 're-resizable';
import { tableInput } from './TableCellElement.fixtures';

jest.mock('re-resizable');

describe('TableCellElement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('readOnly mode', () => {
    it('should disable resize in readOnly mode', () => {
      const spyResizable = jest.spyOn(resizeable, 'Resizable');
      const editor = createPlateUIEditor({
        plugins: [createTablePlugin()],
      });
      editor.children = tableInput;
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(editor as any);

      render(<Plate editor={editor} editableProps={{ readOnly: true }} />);

      expect(spyResizable).toHaveBeenCalled();
      expect(spyResizable).toHaveBeenCalledTimes(4);
      expect(spyResizable.mock.calls[3][0].enable?.right).not.toEqual(true);
    });
    it('should allow resize in readOnly mode when ignore readOnly is passed in', () => {
      const spyResizable = jest.spyOn(resizeable, 'Resizable');
      const editor = createPlateUIEditor({
        plugins: [createTablePlugin()],
        components: {
          ...createPlateUI(),
          [ELEMENT_TD]: withProps(TableCellElement, {
            ignoreReadOnly: true,
          }),
        },
      });
      editor.children = tableInput;
      jest.spyOn(core, 'usePlateEditorRef').mockReturnValue(editor as any);

      render(<Plate editor={editor} editableProps={{ readOnly: true }} />);

      expect(spyResizable).toHaveBeenCalled();
      expect(spyResizable).toHaveBeenCalledTimes(4);
      expect(spyResizable.mock.calls[3][0].enable?.right).toEqual(true);
    });
  });
});
