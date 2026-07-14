/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { setTableMarginLeft } from './setTableMarginLeft';

jsxt;

const createTableEditor = (input: TestEditor) =>
  createPlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

describe('setTableMarginLeft', () => {
  it('sets the margin on the matched table node', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
        </htable>
        <htable>
          <htr>
            <htd>
              <hp>
                21
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    setTableMarginLeft(editor, { marginLeft: 48 }, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { type: 'table' },
      { marginLeft: 48, type: 'table' },
    ]);
  });

  it('does nothing when no table matches the requested location', () => {
    const input = (
      <editor>
        <hp>
          text
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createTableEditor(input);

    setTableMarginLeft(editor, { marginLeft: 24 }, { at: [0] });

    expect(editor.read.children()).toMatchObject(input.children);
  });
});
