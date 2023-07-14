/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { createTablePlugin } from '@udecode/plate-table';
import { jsx } from '@udecode/plate-test-utils';

import { isTableBorderHidden } from './isTableBorderHidden';

jsx;

const createTablePluginWithOptions = () => createTablePlugin();

const createEditorInstance = (input: any) => {
  return createPlateEditor({
    editor: input,
    plugins: [createTablePluginWithOptions()],
  });
};

describe('isTableBorderHidden', () => {
  const input = (
    <editor>
      <htable>
        <htr>
          <htd borders={{ left: { size: 1 }, right: { size: 0 } }}>
            <hp>11</hp>
          </htd>
          <htd
            borders={{
              left: { size: 0 },
              right: { size: 1 },
              bottom: { size: 0 },
            }}
          >
            <hp>12</hp>
          </htd>
        </htr>
        <htr>
          <htd borders={{ top: { size: 0 } }}>
            <hp>21</hp>
          </htd>
          <htd>
            <hp>
              22
              <cursor />
            </hp>
          </htd>
        </htr>
      </htable>
    </editor>
  ) as any as PlateEditor;

  it('should return true if left border is hidden', () => {
    const editor = createEditorInstance(input);
    const hidden = isTableBorderHidden(editor, 'left');
    expect(hidden).toBe(false);
  });

  it('should return true if top border is hidden', () => {
    const editor = createEditorInstance(input);
    const hidden = isTableBorderHidden(editor, 'top');
    expect(hidden).toBe(true);
  });

  it('should return false if left border is not hidden', () => {
    const editor = createEditorInstance(input);
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    const hidden = isTableBorderHidden(editor, 'left');
    expect(hidden).toBe(false);
  });

  it('should return false if top border is not hidden', () => {
    const editor = createEditorInstance(input);
    editor.selection = {
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    };
    const hidden = isTableBorderHidden(editor, 'top');
    expect(hidden).toBe(false);
  });

  it('should return false if no matching cell is found', () => {
    const emptyEditor = createEditorInstance([]);
    const hidden = isTableBorderHidden(emptyEditor, 'left');
    expect(hidden).toBe(false);
  });
});
