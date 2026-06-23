import type { Value } from '@platejs/plite';

import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseTablePlugin } from './BaseTablePlugin';

const tablePlugin = BaseTablePlugin.configure({
  options: {
    disableMerge: true,
  },
});

const createTableEditor = ({
  selection,
  value,
}: {
  selection: NonNullable<
    Parameters<typeof createPlateRuntimeEditor>[0]
  >['initialSelection'];
  value: Value;
}) =>
  createPlateRuntimeEditor({
    initialSelection: selection,
    initialValue: value,
    plugins: [tablePlugin],
  });

describe('BaseTablePlugin Plite runtime extension', () => {
  it('applies marks across a multi-cell selection', () => {
    const editor = createTableEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 1, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'p' }],
                  id: 'c1',
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'p' }],
                  id: 'c2',
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    expect(editor.read((state) => state.marks.get())).toEqual({});

    editor.update((tx) => tx.marks.add('bold', true));

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [
                  { children: [{ bold: true, text: 'A' }], type: 'p' },
                ],
                id: 'c1',
                type: 'td',
              },
              {
                children: [
                  { children: [{ bold: true, text: 'B' }], type: 'p' },
                ],
                id: 'c2',
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
    expect(editor.read((state) => state.marks.get())).toEqual({ bold: true });
  });

  it('clears every selected cell on deleteFragment', () => {
    const editor = createTableEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 1, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'p' }],
                  id: 'c1',
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: 'B' }], type: 'p' }],
                  id: 'c2',
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.update((tx) => {
      tx.fragment.delete();
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: '' }], type: 'p' }],
                id: 'c1',
                type: 'td',
              },
              {
                children: [{ children: [{ text: '' }], type: 'p' }],
                id: 'c2',
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('expands a table when pasting a larger table into a cell', () => {
    const editor = createTableEditor({
      selection: {
        anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'A' }], type: 'p' }],
                  id: 'c1',
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.update((tx) => {
      tx.fragment.insert([
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: '1' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: '2' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: '3' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: '4' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ]);
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: '1' }], type: 'p' }],
                id: 'c1',
                type: 'td',
              },
              {
                children: [{ children: [{ text: '2' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ children: [{ text: '3' }], type: 'p' }],
                type: 'td',
              },
              {
                children: [{ children: [{ text: '4' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ]);
  });
});
