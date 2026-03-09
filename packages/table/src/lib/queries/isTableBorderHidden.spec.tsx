/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { isTableBorderHidden } from './isTableBorderHidden';

jsxt;

const createEditorInstance = ({
  children,
  selection,
}: {
  children?: any;
  selection?: any;
}) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection,
    value: children,
  });

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
              bottom: { size: 0 },
              left: { size: 0 },
              right: { size: 1 },
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
  ) as any as SlateEditor;

  it('returns true if left border is hidden', () => {
    const editor = createEditorInstance(input);
    const hidden = isTableBorderHidden(editor, 'left');
    expect(hidden).toBe(false);
  });

  it('returns true if top border is hidden', () => {
    const editor = createEditorInstance(input);
    const hidden = isTableBorderHidden(editor, 'top');
    expect(hidden).toBe(true);
  });

  it('returns false if left border is not hidden', () => {
    const editor = createEditorInstance(input);
    editor.selection = {
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0] },
    };
    const hidden = isTableBorderHidden(editor, 'left');
    expect(hidden).toBe(false);
  });

  it('returns false if top border is not hidden', () => {
    const editor = createEditorInstance(input);
    editor.selection = {
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    };
    const hidden = isTableBorderHidden(editor, 'top');
    expect(hidden).toBe(false);
  });

  it('returns false if no matching cell is found', () => {
    const emptyEditor = createEditorInstance({ children: [] });
    const hidden = isTableBorderHidden(emptyEditor, 'left');
    expect(hidden).toBe(false);
  });
});
