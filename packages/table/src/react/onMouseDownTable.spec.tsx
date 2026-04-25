/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../lib/__tests__/getTestTablePlugins';
import { onMouseDownTable } from './onMouseDownTable';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins(),
    selection: input.selection,
    value: input.children,
  });

const setRect = (element: HTMLElement, rect: Partial<DOMRect>) => {
  element.getBoundingClientRect = () =>
    ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => rect,
      ...rect,
    }) as DOMRect;
};

describe('onMouseDownTable', () => {
  it('selects a Slate point when a click lands on the editable root beside a table', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
        </htable>
        <hp>after</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const editable = document.createElement('div');
    const tableDom = document.createElement('table');
    const paragraphDom = document.createElement('p');
    const preventDefault = mock();
    const stopPropagation = mock();

    editable.setAttribute('data-slate-editor', 'true');
    editable.setAttribute('data-slate-node', 'value');
    editable.append(tableDom, paragraphDom);
    setRect(tableDom, { bottom: 40, top: 0 });
    setRect(paragraphDom, { bottom: 80, top: 41 });

    spyOn(editor.api, 'toDOMNode').mockImplementation((node) =>
      node === editor.children[0] ? tableDom : paragraphDom
    );

    onMouseDownTable({
      editor,
      event: {
        button: 0,
        clientY: 30,
        currentTarget: editable,
        defaultPrevented: false,
        preventDefault,
        stopPropagation,
        target: editable,
      },
    } as any);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0, 0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0, 0, 0] },
    });
  });

  it('ignores clicks that already target a mapped Slate node', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);
    const editable = document.createElement('div');
    const mappedNode = document.createElement('div');
    const preventDefault = mock();

    editable.setAttribute('data-slate-editor', 'true');
    mappedNode.setAttribute('data-slate-node', 'element');
    editable.append(mappedNode);

    onMouseDownTable({
      editor,
      event: {
        button: 0,
        clientY: 20,
        currentTarget: editable,
        defaultPrevented: false,
        preventDefault,
        stopPropagation: mock(),
        target: mappedNode,
      },
    } as any);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(editor.selection).toEqual(input.selection);
  });
});
