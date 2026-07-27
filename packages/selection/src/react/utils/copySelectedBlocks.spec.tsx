import * as copyToClipboardModule from 'copy-to-clipboard';
import { BaseParagraphPlugin, createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import {
  defineEditorExtension,
  NodeApi,
  type NodeEntry,
  schema,
} from '@platejs/plite';
import * as PliteDOM from '@platejs/plite-dom';
import type { TIdElement } from '@platejs/utils';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

type CopyOptions = {
  onCopy?: (dataTransfer: DataTransfer) => void;
};

const createDataTransfer = () => {
  const values = new Map<string, string>();
  const data = {
    get types() {
      return [...values.keys()];
    },
    getData: mock((type: string) => values.get(type) ?? ''),
    setData: mock((type: string, value: string) => {
      values.set(type, value);
    }),
  } as unknown as DataTransfer;

  return { data, values };
};

const CopyTableCellPlugin = createBasePlugin({
  key: 'td',
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent(),
      topLevel: false,
    },
  }),
});

const CopyTableRowPlugin = createBasePlugin({
  dependencies: [CopyTableCellPlugin],
  key: 'tr',
  schema: {
    element: {
      content: schema.content.type('td', { min: 1 }),
      topLevel: false,
    },
  },
});

const CopyTablePlugin = createBasePlugin({
  dependencies: [CopyTableRowPlugin],
  key: 'table',
  schema: {
    element: {
      content: schema.content.type('tr', { min: 1 }),
    },
  },
});

const createCopyEditor = (
  entries: NodeEntry<TIdElement>[],
  documentEntries = entries
) => {
  const selection = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
    kind: 'text' as const,
  };
  const selectedIds = new Set(
    entries.flatMap(([node]) => (typeof node.id === 'string' ? [node.id] : []))
  );

  const editor = createPlateEditor({
    plugins: [
      BaseParagraphPlugin,
      CopyTablePlugin,
      BlockSelectionPlugin.configure({
        initialState: { selectedIds },
      }),
    ],
    selection,
    initialValue:
      documentEntries.length > 0
        ? documentEntries.map(([node]) => node)
        : [{ children: [{ text: '' }], type: 'p' }],
  });

  editor.extend(
    defineEditorExtension({
      api: {
        dom: {
          getWindow: () => window,
        },
      },
      name: 'test:block-selection-copy-window',
    })
  );

  return editor;
};

const decodeSlice = (encoded: string) =>
  JSON.parse(decodeURIComponent(window.atob(encoded))).slice;

describe('api.copy', () => {
  let copyToClipboardSpy: AnyTestMock;
  let copyToClipboardMock: ReturnType<typeof mock>;
  let writeDOMRangeDataSpy: AnyTestMock;

  beforeEach(() => {
    copyToClipboardMock = mock();
    copyToClipboardSpy = spyOn(
      copyToClipboardModule,
      'default'
    ).mockImplementation(
      copyToClipboardMock as unknown as (
        text: string,
        options?: CopyOptions
      ) => boolean
    );
    writeDOMRangeDataSpy = spyOn(
      PliteDOM,
      'writeDOMRangeData'
    ).mockImplementation((editor, data, range) => {
      const entry = editor.read.nodes.get(range.anchor.path.slice(0, 1)) as
        | NodeEntry<TIdElement>
        | undefined;
      const text = entry ? NodeApi.string(entry[0]) : '';

      data.setData('text/plain', text);
      data.setData(
        'text/html',
        `<p data-plite-fragment="block" data-plite-fragment-format="x-plite-fragment">${text}</p>`
      );

      return data;
    });
  });

  afterEach(() => {
    copyToClipboardSpy.mockRestore();
    writeDOMRangeDataSpy.mockRestore();
  });

  it('writes one exact Plite slice while preserving model selection', () => {
    const entries = [
      [{ id: 'block1', children: [{ text: 'First block' }], type: 'p' }, [0]],
      [{ id: 'block2', children: [{ text: '' }], type: 'p' }, [1]],
      [{ id: 'block3', children: [{ text: 'Last block' }], type: 'p' }, [2]],
    ] satisfies NodeEntry<TIdElement>[];
    const editor = createCopyEditor(entries);
    const { data, values } = createDataTransfer();
    const selection = editor.read.selection();

    copyToClipboardMock.mockImplementation(
      (_text: string, options?: CopyOptions) => {
        options?.onCopy?.(data);

        return true;
      }
    );

    expect(editor.plugin(BlockSelectionPlugin).api.copy()).toBe(true);
    expect(editor.read.selection()).toEqual(selection);
    expect(writeDOMRangeDataSpy).toHaveBeenCalledTimes(2);
    expect(values.get('text/plain')).toBe('First block\n\nLast block\n');
    expect(values.get('text/html')).toContain('<p></p>');
    expect(values.get('text/html')).toContain('data-plite-fragment=');
    expect(
      values.get('text/html')!.match(/data-plite-fragment=/g)
    ).toHaveLength(1);
    expect(decodeSlice(values.get('application/x-plite-fragment')!)).toEqual({
      content: entries.map(([node]) => node),
      openEnd: 0,
      openStart: 0,
    });
    expect(values.has('application/x-slate-fragment')).toBe(false);
  });

  it('writes directly to provided clipboard data without synthetic copy', () => {
    const entries = [
      [{ id: 'block1', children: [{ text: 'First block' }], type: 'p' }, [0]],
      [{ id: 'block2', children: [{ text: 'Second block' }], type: 'p' }, [1]],
    ] satisfies NodeEntry<TIdElement>[];
    const editor = createCopyEditor(entries);
    const { data, values } = createDataTransfer();

    expect(editor.plugin(BlockSelectionPlugin).api.copy(data)).toBe(true);
    expect(copyToClipboardMock).not.toHaveBeenCalled();
    expect(values.get('text/plain')).toBe('First block\nSecond block\n');
    expect(values.get('application/x-plite-fragment')).not.toBe('');
  });

  it('preserves collapsed table rows in the exact Plite slice', () => {
    const firstRow = {
      children: [
        {
          children: [{ children: [{ text: 'one' }], type: 'p' }],
          id: 'cell1',
          type: 'td',
        },
      ],
      id: 'row1',
      type: 'tr',
    };
    const secondRow = {
      children: [
        {
          children: [{ children: [{ text: 'two' }], type: 'p' }],
          id: 'cell2',
          type: 'td',
        },
      ],
      id: 'row2',
      type: 'tr',
    };
    const selectedTable = {
      children: [firstRow],
      id: 'table1',
      type: 'table',
    };
    const documentTable = {
      ...selectedTable,
      children: [firstRow, secondRow],
    };
    const editor = createCopyEditor(
      [[firstRow, [0, 0]]],
      [[documentTable, [0]]]
    );
    const { data, values } = createDataTransfer();

    expect(editor.plugin(BlockSelectionPlugin).api.copy(data)).toBe(true);
    expect(decodeSlice(values.get('application/x-plite-fragment')!)).toEqual({
      content: [selectedTable],
      openEnd: 0,
      openStart: 0,
    });
  });

  it('returns false without writing when no blocks are selected', () => {
    const editor = createCopyEditor([]);
    const { data, values } = createDataTransfer();

    expect(editor.plugin(BlockSelectionPlugin).api.copy(data)).toBe(false);
    expect(values.size).toBe(0);
  });
});
