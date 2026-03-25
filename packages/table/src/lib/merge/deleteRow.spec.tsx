/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';
import { deleteTableMergeRow } from './deleteRow';

jsxt;

const createTableEditor = (input: SlateEditor) =>
  createSlateEditor({
    nodeId: true,
    plugins: getTestTablePlugins({ disableMerge: false }),
    selection: input.selection,
    value: input.children,
  });

describe('deleteTableMergeRow', () => {
  it('moves row-spanning cells into the next remaining row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
            <htd rowSpan={2}>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>31</hp>
            </htd>
            <htd>
              <hp>32</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTableMergeRow(editor);

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              { children: [{ children: [{ text: '21' }] }], type: 'td' },
              {
                children: [{ children: [{ text: '12' }] }],
                rowSpan: 1,
                type: 'td',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              { children: [{ children: [{ text: '31' }] }], type: 'td' },
              { children: [{ children: [{ text: '32' }] }], type: 'td' },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('shrinks rowSpan on cells that started before the deleted row', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd attributes={{ rowspan: '2' }} rowSpan={2}>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                22
                <cursor />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>31</hp>
            </htd>
            <htd>
              <hp>32</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTableMergeRow(editor);

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                attributes: { rowspan: '1' },
                children: [{ children: [{ text: '11' }] }],
                rowSpan: 1,
                type: 'td',
              },
              { children: [{ children: [{ text: '12' }] }], type: 'td' },
            ],
            type: 'tr',
          },
          {
            children: [
              { children: [{ children: [{ text: '31' }] }], type: 'td' },
              { children: [{ children: [{ text: '32' }] }], type: 'td' },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('inserts moved row-span cells before the next matching column and updates rowspan attributes', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>00</hp>
            </htd>
            <htd>
              <hp>01</hp>
            </htd>
            <htd>
              <hp>02</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>
                10
                <cursor />
              </hp>
            </htd>
            <htd attributes={{ rowspan: '2' }} rowSpan={2}>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>12</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>20</hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTableMergeRow(editor);

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              { children: [{ children: [{ text: '00' }] }], type: 'td' },
              { children: [{ children: [{ text: '01' }] }], type: 'td' },
              { children: [{ children: [{ text: '02' }] }], type: 'td' },
            ],
            type: 'tr',
          },
          {
            children: [
              { children: [{ children: [{ text: '20' }] }], type: 'td' },
              {
                attributes: { rowspan: '1' },
                children: [{ children: [{ text: '11' }] }],
                rowSpan: 1,
                type: 'td',
              },
              { children: [{ children: [{ text: '22' }] }], type: 'td' },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('removes the whole table when the only row is deleted', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                only
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as any as SlateEditor;

    const editor = createTableEditor(input);

    deleteTableMergeRow(editor);

    expect(editor.children).toEqual([]);
  });
});
