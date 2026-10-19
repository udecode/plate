import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  type Descendant,
  EditorSchemaValidationError,
  type Element,
  type Point,
  property,
  type Range,
  schema,
  transfer,
} from 'plitejs';

const gridAndRow = {
  grid: {
    content: schema.content.type('row', { min: 1 }),
    structure: { kind: 'grid', role: 'grid' },
  },
  row: {
    content: schema.content.type('cell', { min: 1 }),
    structure: { kind: 'grid', role: 'row' },
  },
} as const;
const gridRoot = schema.content.types(['grid', 'paragraph'], {
  default: { type: 'paragraph' },
});

const GridSchema = defineEditorSchema('grid-removal-contract', {
  elements: {
    ...gridAndRow,
    cell: {
      content: schema.content.types(['paragraph', 'image'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      properties: { rowSpan: property.number() },
      structure: { kind: 'grid', role: 'cell', rowSpan: 'rowSpan' },
    },
    image: { void: 'block' },
    link: { content: schema.content.text(), inline: true },
    paragraph: schema.element.textBlock(),
  },
  root: gridRoot,
  unknown: 'reject',
});
const UneditableCellSchema = defineEditorSchema(
  'grid-removal-contract-uneditable',
  {
    elements: {
      ...gridAndRow,
      cell: {
        content: schema.content.types(['paragraph', 'chip', 'locked'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        structure: { kind: 'grid', role: 'cell' },
      },
      chip: { atom: true, content: schema.content.text() },
      locked: { content: schema.content.text(), readOnly: true },
      paragraph: schema.element.textBlock(),
    },
    root: gridRoot,
  }
);

const OptionalCellSchema = defineEditorSchema(
  'grid-removal-contract-optional',
  {
    elements: {
      ...gridAndRow,
      cell: {
        content: schema.content.types(['paragraph', 'image'], { min: 0 }),
        structure: { kind: 'grid', role: 'cell' },
      },
      image: { void: 'block' },
      paragraph: schema.element.textBlock(),
    },
    root: gridRoot,
  }
);
const SpanSchema = defineEditorSchema('grid-removal-contract-span', {
  elements: {
    cell: {
      content: schema.content.types(['paragraph', 'grid'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      properties: { rowSpan: property.number() },
      structure: { kind: 'grid', role: 'cell', rowSpan: 'rowSpan' },
    },
    grid: gridAndRow.grid,
    paragraph: schema.element.textBlock(),
    row: {
      content: schema.content.type('cell', { min: 0 }),
      structure: { kind: 'grid', role: 'row' },
    },
  },
  root: gridRoot,
});
const ChipCellSchema = defineEditorSchema('grid-removal-contract-chip', {
  elements: {
    ...gridAndRow,
    cell: {
      content: schema.content.types(['chip', 'paragraph'], { min: 0 }),
      structure: { kind: 'grid', role: 'cell' },
    },
    chip: { atom: true, content: schema.content.text() },
    locked: { content: schema.content.text(), readOnly: true },
    paragraph: schema.element.textBlock(),
  },
  root: schema.content.types(['grid', 'locked', 'paragraph'], {
    default: { type: 'paragraph' },
  }),
});
const BoxSchema = defineEditorSchema('grid-removal-contract-box', {
  elements: {
    ...gridAndRow,
    box: {
      content: schema.content.types(
        ['paragraph', 'grid', 'box', 'image', 'locked'],
        { default: { type: 'paragraph' }, min: 1 }
      ),
    },
    cell: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      structure: { kind: 'grid', role: 'cell' },
    },
    image: { void: 'block' },
    locked: { content: schema.content.text(), readOnly: true },
    mention: { void: 'inline' },
    paragraph: schema.element.textBlock(),
  },
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.types(['grid', 'paragraph', 'box'], {
    default: { type: 'paragraph' },
  }),
});
const ChildlessBoxSchema = defineEditorSchema(
  'grid-removal-contract-childless-box',
  {
    elements: {
      ...gridAndRow,
      box: { content: schema.content.type('paragraph', { min: 0 }) },
      cell: {
        content: schema.content.types(['box', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        structure: { kind: 'grid', role: 'cell' },
      },
      paragraph: schema.element.textBlock(),
    },
    root: gridRoot,
  }
);
const PrefixSchema = defineEditorSchema('grid-removal-contract-prefix', {
  elements: {
    ...gridAndRow,
    box: {
      content: schema.content.prefix(
        [{ element: 'paragraph' }],
        schema.content.text()
      ),
    },
    cell: {
      content: schema.content.types(['paragraph', 'box'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      structure: { kind: 'grid', role: 'cell' },
    },
    paragraph: schema.element.textBlock(),
  },
  root: schema.content.types(['grid', 'paragraph', 'box'], {
    default: { type: 'paragraph' },
  }),
});
const ContainerSchema = defineEditorSchema('grid-removal-contract-container', {
  elements: {
    box: {
      content: schema.content.types(['paragraph', 'box'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    paragraph: schema.element.textBlock(),
  },
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.types(['paragraph', 'box'], {
    default: { type: 'paragraph' },
  }),
});
const paragraphCell = {
  content: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  structure: { kind: 'grid', role: 'cell' },
} as const;
const ReadOnlyGridSchema = defineEditorSchema(
  'grid-removal-contract-read-only-grid',
  {
    elements: {
      cell: paragraphCell,
      grid: { ...gridAndRow.grid, readOnly: true },
      paragraph: schema.element.textBlock(),
      row: gridAndRow.row,
    },
    root: gridRoot,
  }
);
const ReadOnlyBoxSchema = defineEditorSchema(
  'grid-removal-contract-read-only-box',
  {
    elements: {
      ...gridAndRow,
      box: {
        content: schema.content.types(['paragraph', 'grid'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        readOnly: true,
      },
      cell: paragraphCell,
      paragraph: schema.element.textBlock(),
    },
    root: schema.content.types(['grid', 'paragraph', 'box'], {
      default: { type: 'paragraph' },
    }),
  }
);
const ReadOnlyCellSchema = defineEditorSchema(
  'grid-removal-contract-read-only-cell',
  {
    elements: {
      ...gridAndRow,
      cell: { ...paragraphCell, readOnly: true },
      paragraph: schema.element.textBlock(),
    },
    root: gridRoot,
  }
);
const LockedCellSchema = defineEditorSchema(
  'grid-removal-contract-locked-cell',
  {
    elements: {
      ...gridAndRow,
      cell: paragraphCell,
      lockedCell: { ...paragraphCell, readOnly: true },
      paragraph: schema.element.textBlock(),
      row: {
        content: schema.content.types(['cell', 'lockedCell'], {
          default: { type: 'cell' },
          min: 1,
        }),
        structure: { kind: 'grid', role: 'row' },
      },
    },
    root: gridRoot,
  }
);
const AtomCellSchema = defineEditorSchema('grid-removal-contract-atom-cell', {
  elements: {
    ...gridAndRow,
    cell: { ...paragraphCell, atom: true },
    paragraph: schema.element.textBlock(),
  },
  root: gridRoot,
});
const NamedRootSchema = defineEditorSchema('grid-removal-contract-named-root', {
  elements: {
    ...gridAndRow,
    cell: paragraphCell,
    paragraph: schema.element.textBlock(),
  },
  root: gridRoot,
  roots: { header: gridRoot, z: gridRoot },
});
const TextlessGridSchema = defineEditorSchema(
  'grid-removal-contract-textless-grid',
  {
    elements: {
      ...gridAndRow,
      box: {
        content: schema.content.types(['paragraph', 'grid'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      cell: {
        content: schema.content.type('paragraph', { min: 0 }),
        structure: { kind: 'grid', role: 'cell' },
      },
      paragraph: schema.element.textBlock(),
    },
    root: schema.content.types(['grid', 'paragraph', 'box'], {
      default: { type: 'paragraph' },
    }),
  }
);
const NotesSchema = defineEditorSchema('grid-removal-contract-notes', {
  elements: {
    ...gridAndRow,
    cell: paragraphCell,
    endnote: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      slice: { endMatter: true },
    },
    image: { void: 'block' },
    paragraph: schema.element.textBlock(),
  },
  root: schema.content.types(['grid', 'paragraph', 'endnote'], {
    default: { type: 'paragraph' },
  }),
});

const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});
const paragraphOf = (...children: Descendant[]): Element => ({
  children,
  type: 'paragraph',
});
const bold = (text: string) => ({ bold: true, text });
const box = (...children: Descendant[]): Element => ({
  children,
  type: 'box',
});
const leaf = (type: string, text = ''): Element => ({
  children: [{ text }],
  type,
});
const image = () => leaf('image');
const point = (path: number[], offset: number): Point => ({ offset, path });
const caret = (path: number[], offset: number): Range => ({
  anchor: point(path, offset),
  focus: point(path, offset),
});
const span = (
  anchorPath: number[],
  anchorOffset: number,
  focusPath: number[],
  focusOffset: number
): Range => ({
  anchor: point(anchorPath, anchorOffset),
  focus: point(focusPath, focusOffset),
});
const cellOf = (...children: Element[]): Element => ({
  children,
  type: 'cell',
});
const cell = (text: string): Element => cellOf(paragraph(text));
const grid = (
  rows: ReadonlyArray<ReadonlyArray<Element | string>>
): Element => ({
  children: rows.map((row) => ({
    children: row.map((entry) =>
      typeof entry === 'string' ? cell(entry) : entry
    ),
    type: 'row',
  })),
  type: 'grid',
});
const createGridEditor = (initialValue: Descendant[]) =>
  createEditor({ initialValue, plugins: [GridSchema] });
const textSlice = (text: string) =>
  ContentSlice.fromJSON({ content: [{ text }], openEnd: 0, openStart: 0 });
const row = (...cells: Array<Element | string>): Element => ({
  children: cells.map((entry) =>
    typeof entry === 'string' ? cell(entry) : entry
  ),
  type: 'row',
});
const gridOf = (...rows: Element[]): Element => ({
  children: rows,
  type: 'grid',
});
const spanned = (entry: Element, rowSpan: number): Element => ({
  ...entry,
  rowSpan,
});
const spanGrid = () =>
  gridOf(
    row('w', 'v'),
    row(
      spanned(cellOf(paragraph('ab'), paragraph('cd')), 2),
      spanned(cell('x'), 2)
    ),
    row()
  );

type ContractSchema =
  | typeof BoxSchema
  | typeof ChildlessBoxSchema
  | typeof ChipCellSchema
  | typeof ContainerSchema
  | typeof AtomCellSchema
  | typeof GridSchema
  | typeof LockedCellSchema
  | typeof OptionalCellSchema
  | typeof PrefixSchema
  | typeof ReadOnlyBoxSchema
  | typeof ReadOnlyCellSchema
  | typeof ReadOnlyGridSchema
  | typeof SpanSchema
  | typeof TextlessGridSchema
  | typeof UneditableCellSchema;

const unlessRefused = (edit: () => void) => {
  try {
    edit();
  } catch (error) {
    if (!(error instanceof EditorSchemaValidationError)) throw error;
  }
};

const edited = (
  plugin: ContractSchema,
  initialValue: Descendant[],
  at: Range,
  edit: 'delete' | 'paste' | 'type'
) => {
  const editor = createEditor({ initialValue, plugins: [plugin] });

  editor.update((tx) => {
    if (edit === 'delete') {
      tx.text.delete({ at });
    } else if (edit === 'paste') {
      tx.slice.replace(textSlice('W'), { at });
    } else {
      tx.text.insert('W', { at });
    }
  });

  return editor.read.children();
};

describe('range removal across a declared grid edge', () => {
  it('keeps every row and cell when a range runs from a paragraph into the first cell', () => {
    const editor = createGridEditor([
      paragraph('p'),
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 0, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      grid([
        ['', 'b'],
        ['c', 'd'],
      ]),
    ]);
  });

  it('removes a grid whole when the range starts at its first point and reaches past it', () => {
    const editor = createGridEditor([
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [paragraph('r')],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      }
    );
  });

  it('keeps both grids when a range runs from a cell of one grid into a cell of another', () => {
    const editor = createGridEditor([
      paragraph('p'),
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('m'),
      grid([
        ['e', 'f'],
        ['g', 'h'],
      ]),
      paragraph('z'),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [1, 0, 1, 0, 0] },
          focus: { offset: 1, path: [3, 1, 0, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('p'),
      grid([
        ['a', ''],
        ['', ''],
      ]),
      paragraph(''),
      grid([
        ['', ''],
        ['', 'h'],
      ]),
      paragraph('z'),
    ]);
  });

  it('clears a row-spanning cell at the edge once and keeps its span', () => {
    const editor = createGridEditor([
      {
        children: [
          {
            children: [cell('a'), { ...cell('B'), rowSpan: 2 }],
            type: 'row',
          },
          { children: [cell('c')], type: 'row' },
        ],
        type: 'grid',
      },
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      {
        children: [
          {
            children: [cell('a'), { ...cell(''), rowSpan: 2 }],
            type: 'row',
          },
          { children: [cell('')], type: 'row' },
        ],
        type: 'grid',
      },
      paragraph('r'),
    ]);
  });

  it('inserts a text node over a range from a cell into trailing text at the removal caret', () => {
    const editor = createGridEditor([
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.nodes.insert(
        { text: 'x' },
        {
          at: {
            anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
            focus: { offset: 1, path: [1, 0] },
          },
        }
      );
    });

    assert.deepEqual(editor.read.children(), [
      grid([
        ['a', 'x'],
        ['', ''],
      ]),
      paragraph('r'),
    ]);
  });

  it('breaks at the removal caret when a range from a cell ends at the start of trailing text', () => {
    const editor = createGridEditor([
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
      tx.break.insert();
    });

    assert.deepEqual(editor.read.children(), [
      {
        children: [
          {
            children: [
              cell('a'),
              { children: [paragraph(''), paragraph('')], type: 'cell' },
            ],
            type: 'row',
          },
          { children: [cell(''), cell('')], type: 'row' },
        ],
        type: 'grid',
      },
      paragraph('qr'),
    ]);
  });

  it('keeps a grid and clears its cells when a range spans exactly that grid', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('after'),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [1, 0, 0, 0, 0] },
          focus: { offset: 1, path: [1, 1, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      grid([
        ['', ''],
        ['', ''],
      ]),
      paragraph('after'),
    ]);
  });

  it('removes the whole blocks a range covers when it ends at the last point of a grid', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('after'),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 1, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [paragraph('after')]);
  });

  it('lands a paste after two grids it removes whole at the start of what follows', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([['a', 'b']]),
      grid([['c', 'd']]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.slice.replace(textSlice('W'), {
        at: {
          anchor: { offset: 0, path: [1, 0, 0, 0, 0] },
          focus: { offset: 1, path: [3, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      paragraph('Wr'),
    ]);
  });

  it('keeps every row and leaves the caret before a removed link when a range runs from the link out of the grid', () => {
    const editor = createGridEditor([
      grid([
        [
          'a',
          {
            children: [
              {
                children: [
                  { text: 'Say' },
                  { children: [{ text: 'Hello' }], type: 'link' },
                  { text: 'World' },
                ],
                type: 'paragraph',
              },
            ],
            type: 'cell',
          },
        ],
        ['c', 'd'],
      ]),
      paragraph('qr'),
    ]);
    const range = {
      anchor: { offset: 0, path: [0, 0, 1, 0, 1, 0] },
      focus: { offset: 1, path: [1, 0] },
    };

    editor.update((tx) => {
      tx.selection.set(range);
      tx.text.delete({ at: range });
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [
          grid([
            ['a', 'Say'],
            ['', ''],
          ]),
          paragraph('r'),
        ],
        selection: {
          anchor: { offset: 3, path: [0, 0, 1, 0, 0] },
          focus: { offset: 3, path: [0, 0, 1, 0, 0] },
        },
      }
    );
  });

  it('keeps the text after a grid outside it when nodes merge over a range from a cell', () => {
    const editor = createGridEditor([
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({
        at: {
          anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
          focus: { offset: 1, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      grid([
        ['a', ''],
        ['', ''],
      ]),
      paragraph('r'),
    ]);
  });

  it('clears a covered cell that holds only a void', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([
        [
          {
            children: [{ children: [{ text: '' }], type: 'image' }],
            type: 'cell',
          },
          'b',
        ],
        ['c', 'd'],
      ]),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      grid([
        ['', ''],
        ['c', 'd'],
      ]),
    ]);
  });

  it('pastes over a hanging range that ends at the first cell start in the paragraph before the grid', () => {
    const editor = createGridEditor([
      paragraph('pq'),
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('z'),
    ]);

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 1, path: [2, 0] },
        focus: { offset: 1, path: [2, 0] },
      });
      tx.slice.replace(textSlice('W'), {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [1, 0, 0, 0, 0] },
        },
        hanging: true,
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('W'),
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('z'),
    ]);
  });

  it('keeps an empty cell beside a cell whose text runs a delete removes', () => {
    const linked: Element = {
      children: [
        {
          children: [
            { text: 'Say' },
            { children: [{ text: 'Hello' }], type: 'link' },
            { text: 'World' },
          ],
          type: 'paragraph',
        },
      ],
      type: 'cell',
    };
    const editor = createGridEditor([
      grid([
        [linked, ''],
        ['c', 'd'],
      ]),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 5, path: [0, 0, 0, 0, 2] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      grid([
        ['', ''],
        ['c', 'd'],
      ]),
    ]);
  });

  it('leaves one empty paragraph when a range covers a document of grids', () => {
    const editor = createGridEditor([grid([['a', 'b']]), grid([['c', 'd']])]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 1, path: [1, 0, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [paragraph('')]);
  });

  it('inserts a text node into the one paragraph left when a range covers a document of grids', () => {
    const editor = createGridEditor([grid([['a', 'b']]), grid([['c', 'd']])]);

    editor.update((tx) => {
      tx.nodes.insert(
        { text: 'W' },
        { at: span([0, 0, 0, 0, 0], 0, [1, 0, 1, 0, 0], 1) }
      );
    });

    assert.deepEqual(editor.read.children(), [paragraph('W')]);
  });

  it('refuses to move text whose removal would keep a grid', () => {
    const value = [
      grid([
        ['a', 'b'],
        ['c', 'd'],
      ]),
      paragraph('qr'),
      paragraph('z'),
    ];
    const editor = createEditor({
      initialValue: value,
      plugins: [GridSchema, transfer()],
    });

    const outcome = editor.api.transfer.move({
      range: {
        anchor: { offset: 0, path: [0, 0, 1, 0, 0] },
        focus: { offset: 1, path: [1, 0] },
      },
      to: { point: { offset: 1, path: [2, 0] } },
    });

    assert.deepEqual(
      { children: editor.read.children(), outcome },
      { children: value, outcome: { reason: 'lossy', status: 'refused' } }
    );
  });

  it('keeps every block of an untouched cell when the edge cell loses text across runs', () => {
    const linked = cellOf({
      children: [
        { text: 'x' },
        { children: [{ text: 'l' }], type: 'link' },
        { text: 'yz' },
      ],
      type: 'paragraph',
    });
    const twoBlocks = cellOf(paragraph('keep'), paragraph(''));
    const editor = createGridEditor([
      paragraph('before'),
      grid([[linked, twoBlocks]]),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 0, 0, 2] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      grid([['z', twoBlocks]]),
    ]);
  });

  it('types at the start of what follows over an explicit range that removes two grids whole', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([['a', 'b']]),
      grid([['c', 'd']]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.text.insert('W', {
        at: {
          anchor: { offset: 0, path: [1, 0, 0, 0, 0] },
          focus: { offset: 1, path: [3, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      paragraph('Wr'),
    ]);
  });

  it('keeps a required text property on the text of the cells a range clears', () => {
    const LangSchema = defineEditorSchema('grid-removal-contract-lang', {
      elements: {
        ...gridAndRow,
        cell: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          structure: { kind: 'grid', role: 'cell' },
        },
        paragraph: { content: schema.content.text() },
      },
      properties: [
        schema.textProperty('lang', property.string({ required: true })),
      ],
      root: gridRoot,
    });
    const french = (text: string): Element => ({
      children: [{ lang: 'fr', text }],
      type: 'paragraph',
    });
    const frenchGrid = (texts: readonly string[]): Element => ({
      children: [
        {
          children: texts.map((text) => cellOf(french(text))),
          type: 'row',
        },
      ],
      type: 'grid',
    });
    const editor = createEditor({
      initialValue: [french('before'), frenchGrid(['a', 'b', 'c'])],
      plugins: [LangSchema],
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      french(''),
      frenchGrid(['', '', 'c']),
    ]);
  });

  it('empties a covered cell whose content needs no child and names no default', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('pq'),
        grid([
          [
            cellOf(
              { children: [{ text: '' }], type: 'image' },
              paragraph('secret')
            ),
            't',
            'u',
          ],
        ]),
      ],
      plugins: [OptionalCellSchema],
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      grid([[cellOf(), '', 'u']]),
    ]);
  });

  it('merges what follows into the block before a grid that a range removes whole', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([['a', 'b']]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({
        at: {
          anchor: { offset: 0, path: [1, 0, 0, 0, 0] },
          focus: { offset: 1, path: [2, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [paragraph('beforer')]);
  });

  it('keeps a one-cell grid when a range spans exactly its only cell', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([[cellOf(paragraph('a'), paragraph('b'))]]),
      paragraph('after'),
    ]);

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [1, 0, 0, 0, 0] },
          focus: { offset: 1, path: [1, 0, 0, 1, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      grid([['']]),
      paragraph('after'),
    ]);
  });

  it('removes an empty atom from a cell a range covers', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('pq'),
        grid([[cellOf({ children: [{ text: '' }], type: 'chip' }), 't', 'u']]),
      ],
      plugins: [UneditableCellSchema],
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      grid([['', '', 'u']]),
    ]);
  });

  it('removes a read-only block whole from a cell a range covers', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('pq'),
        grid([
          [cellOf({ children: [{ text: 'keep' }], type: 'locked' }), 't', 'u'],
        ]),
      ],
      plugins: [UneditableCellSchema],
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [1, 0, 1, 0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      grid([['', '', 'u']]),
    ]);
  });
});

describe('range removal next to a grid', () => {
  it('removes an empty paragraph before a grid on a forward delete and keeps every cell', () => {
    const editor = createGridEditor([paragraph(''), grid([['a', 'b']])]);

    editor.update((tx) => {
      tx.selection.set(caret([0, 0], 0));
      tx.text.delete();
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      { children: [grid([['a', 'b']])], selection: caret([0, 0, 0, 0, 0], 0) }
    );
  });

  it('removes a grid whole and leaves the caret at the start of what follows when a hanging range ends at the next paragraph start', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([['a', 'b']]),
      paragraph('qr'),
    ]);

    editor.update((tx) => {
      tx.selection.set(caret([2, 0], 1));
      tx.text.delete({
        at: span([1, 0, 0, 0, 0], 0, [2, 0], 0),
        hanging: true,
      });
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [paragraph('before'), paragraph('qr')],
        selection: caret([1, 0], 0),
      }
    );
  });

  it('empties only the first cell when a delete runs from its paragraph start to the start of the next cell', () => {
    assert.deepEqual(
      edited(
        GridSchema,
        [grid([['ab', 'cd']])],
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 0),
        'delete'
      ),
      [grid([['', 'cd']])]
    );
  });

  it('keeps the first cell untouched when a range runs from an image in a later cell through the paragraph after the grid', () => {
    const value = [
      grid([['', cellOf(image(), paragraph('secret')), 'u']]),
      paragraph('qr'),
    ];
    const at = span([0, 0, 1, 0, 0], 0, [1, 0], 1);

    assert.deepEqual(
      {
        deleted: edited(GridSchema, value, at, 'delete'),
        pasted: edited(GridSchema, value, at, 'paste'),
      },
      {
        deleted: [grid([['', '', '']]), paragraph('r')],
        pasted: [grid([['', 'W', '']]), paragraph('r')],
      }
    );
  });

  it('keeps the cell before untouched when an in-cell range starts inside a block atom at the cell start', () => {
    const editor = createEditor({
      initialValue: [grid([['x', cellOf(leaf('chip', 'k'), paragraph('ab'))]])],
      plugins: [UneditableCellSchema],
    });

    editor.update((tx) => {
      tx.text.delete({ at: span([0, 0, 1, 0, 0], 0, [0, 0, 1, 1, 0], 1) });
    });

    assert.deepEqual(editor.read.children(), [
      grid([['x', cellOf(leaf('chip', 'k'), paragraph('b'))]]),
    ]);
  });

  it('keeps both grids and empties the nested cells when a range spans exactly a grid nested in a one-cell grid', () => {
    assert.deepEqual(
      edited(
        SpanSchema,
        [
          paragraph('before'),
          gridOf(row(cellOf(grid([['a', 'b']])))),
          paragraph('after'),
        ],
        span([1, 0, 0, 0, 0, 0, 0, 0], 0, [1, 0, 0, 0, 0, 1, 0, 0], 1),
        'delete'
      ),
      [
        paragraph('before'),
        gridOf(row(cellOf(grid([['', '']])))),
        paragraph('after'),
      ]
    );
  });

  it('moves all the text out of a one-cell grid and keeps the emptied cell', () => {
    const editor = createEditor({
      initialValue: [grid([['hello']]), paragraph('z')],
      plugins: [GridSchema, transfer()],
    });

    const outcome = editor.api.transfer.move({
      range: span([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 5),
      to: { point: point([1, 0], 1) },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      { children: [grid([['']]), paragraph('zhello')], status: 'moved' }
    );
  });

  it('lands the caret at a text before a whole-block removal when the block after it is a grid with no text', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('k'),
        paragraph('a'),
        paragraph('b'),
        grid([[cellOf(), cellOf()]]),
      ],
      plugins: [OptionalCellSchema],
    });

    editor.update((tx) => {
      tx.selection.set(span([1, 0], 0, [2, 0], 1));
      tx.text.delete();
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [paragraph('k'), grid([[cellOf(), cellOf()]])],
        selection: caret([0, 0], 1),
      }
    );
  });
});

describe('range removal in a grid whose last row is covered by row spans', () => {
  it('reads the end of the grid at its last text', () => {
    const editor = createEditor({
      initialValue: [paragraph('before'), spanGrid()],
      plugins: [SpanSchema],
    });

    assert.deepEqual(
      {
        end: editor.read.points.end([1]),
        isEnd: editor.read.points.isEnd(point([1, 1, 1, 0, 0], 1), [1]),
      },
      { end: point([1, 1, 1, 0, 0], 1), isEnd: true }
    );
  });

  it('removes text across the blocks of one cell and keeps every row', () => {
    assert.deepEqual(
      edited(
        SpanSchema,
        [paragraph('before'), spanGrid()],
        span([1, 1, 0, 0, 0], 0, [1, 1, 0, 1, 0], 1),
        'delete'
      ),
      [
        paragraph('before'),
        gridOf(
          row('w', 'v'),
          row(spanned(cell('d'), 2), spanned(cell('x'), 2)),
          row()
        ),
      ]
    );
  });

  it('removes the grid whole and leaves the caret at the start of the paragraph after it', () => {
    const editor = createEditor({
      initialValue: [paragraph('before'), spanGrid(), paragraph('qr')],
      plugins: [SpanSchema],
    });

    editor.update((tx) => {
      tx.selection.set(span([1, 0, 0, 0, 0], 0, [2, 0], 1));
      tx.text.delete();
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [paragraph('before'), paragraph('r')],
        selection: caret([1, 0], 0),
      }
    );
  });

  it('moves text out of a cell and keeps the emptied cell', () => {
    const editor = createEditor({
      initialValue: [
        gridOf(row(spanned(cell('ab'), 2), spanned(cell('x'), 2)), row()),
        paragraph('z'),
      ],
      plugins: [SpanSchema, transfer()],
    });

    const outcome = editor.api.transfer.move({
      range: span([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 2),
      to: { point: point([1, 0], 1) },
    });

    assert.deepEqual(
      { children: editor.read.children(), status: outcome.status },
      {
        children: [
          gridOf(row(spanned(cell(''), 2), spanned(cell('x'), 2)), row()),
          paragraph('zab'),
        ],
        status: 'moved',
      }
    );
  });

  it('keeps the grid when fragment.delete runs from a paragraph to its last text', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('before'),
        gridOf(row(spanned(cell('ab'), 2)), row()),
      ],
      plugins: [SpanSchema],
    });

    editor.update.fragment.delete({ at: span([0, 0], 0, [1, 0, 0, 0, 0], 2) });

    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      gridOf(row(spanned(cell(''), 2)), row()),
    ]);
  });

  it('keeps the grid when the typing command runs from a paragraph to its last text', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('before'),
        gridOf(row(spanned(cell('ab'), 2)), row()),
      ],
      plugins: [SpanSchema],
    });

    editor.update.text.insert('W', {
      at: span([0, 0], 0, [1, 0, 0, 0, 0], 2),
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('W'),
      gridOf(row(spanned(cell(''), 2)), row()),
    ]);
  });
});

describe('merges after a range removal next to a grid', () => {
  it('keeps the next grid whole when a merge removes the grid before it', () => {
    const editor = createGridEditor([
      paragraph('pq'),
      grid([['a', 'b']]),
      grid([['c', 'd']]),
      paragraph('z'),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({ at: span([0, 0], 1, [1, 0, 1, 0, 0], 1) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('p'),
      grid([['c', 'd']]),
      paragraph('z'),
    ]);
  });

  it('keeps the first cell of the next grid when the removal lands on it', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([['a', 'b']]),
      paragraph('m'),
      grid([['c', 'd']]),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({ at: span([1, 0, 0, 0, 0], 0, [2, 0], 1) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      grid([['c', 'd']]),
    ]);
  });

  it('keeps a grid whole when an ordinary removal before it lands in its first cell', () => {
    const editor = createGridEditor([
      paragraph('before'),
      paragraph('x'),
      paragraph('y'),
      grid([['c', 'd']]),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({ at: span([1, 0], 0, [2, 0], 1) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      grid([['c', 'd']]),
    ]);
  });

  it('keeps the first cell when a merge range ends at its start', () => {
    const editor = createGridEditor([paragraph('before'), grid([['c', 'd']])]);

    editor.update((tx) => {
      tx.nodes.merge({ at: span([0, 0], 3, [1, 0, 0, 0, 0], 0) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('bef'),
      grid([['c', 'd']]),
    ]);
  });
});

describe('range removal next to cells that may hold nothing', () => {
  const cleared = () => [paragraph(''), grid([[cellOf(), '', 'u']])];

  it('empties an image-first cell and leaves the caret in the next cell', () => {
    const editor = createEditor({
      initialValue: [
        paragraph('pq'),
        grid([[cellOf(image(), paragraph('secret')), 'tv', 'u']]),
      ],
      plugins: [OptionalCellSchema],
    });

    editor.update((tx) => {
      tx.selection.set(span([1, 0, 0, 0, 0], 0, [1, 0, 1, 0, 0], 1));
      tx.text.delete();
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [paragraph('pq'), grid([[cellOf(), 'v', 'u']])],
        selection: caret([1, 0, 1, 0, 0], 0),
      }
    );
  });

  it('deletes a range that starts before a grid and covers a childless cell', () => {
    assert.deepEqual(
      edited(
        OptionalCellSchema,
        cleared(),
        span([0, 0], 0, [1, 0, 2, 0, 0], 1),
        'delete'
      ),
      [paragraph('')]
    );
  });

  it('pastes over a range that starts before a grid and covers a childless cell', () => {
    assert.deepEqual(
      edited(
        OptionalCellSchema,
        cleared(),
        span([0, 0], 0, [1, 0, 2, 0, 0], 1),
        'paste'
      ),
      [paragraph('W')]
    );
  });

  it('empties the remaining cells beside a childless cell', () => {
    assert.deepEqual(
      edited(
        OptionalCellSchema,
        cleared(),
        span([1, 0, 1, 0, 0], 0, [1, 0, 2, 0, 0], 1),
        'delete'
      ),
      [paragraph(''), grid([[cellOf(), '', '']])]
    );
  });

  it('gives a covered cell holding a childless container its default paragraph', () => {
    assert.deepEqual(
      edited(
        ChildlessBoxSchema,
        [paragraph('pq'), grid([[cellOf(box()), 't', 'u']])],
        span([0, 0], 0, [1, 0, 1, 0, 0], 1),
        'delete'
      ),
      [paragraph(''), grid([['', '', 'u']])]
    );
  });

  it('refuses typing and pastes over cells that clear to nothing and changes nothing', () => {
    const value = [
      grid([[cellOf(leaf('chip', 'a')), cellOf(leaf('chip', 'b'))]]),
      leaf('locked', 'L'),
      paragraph('z'),
    ];
    const at = span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1);
    const blocks = createEditor({
      initialValue: value,
      plugins: [ChipCellSchema],
    });

    blocks.update((tx) => {
      tx.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('W'), paragraph('V')],
          openEnd: 1,
          openStart: 1,
        }),
        { at }
      );
    });

    assert.deepEqual(
      {
        pasted: edited(ChipCellSchema, value, at, 'paste'),
        pastedBlocks: blocks.read.children(),
        typed: edited(ChipCellSchema, value, at, 'type'),
      },
      { pasted: value, pastedBlocks: value, typed: value }
    );
  });

  it('clears cells that clear to nothing on a delete and writes nothing else', () => {
    assert.deepEqual(
      edited(
        ChipCellSchema,
        [
          grid([[cellOf(leaf('chip', 'a')), cellOf(leaf('chip', 'b'))]]),
          leaf('locked', 'L'),
          paragraph('z'),
        ],
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1),
        'delete'
      ),
      [grid([[cellOf(), cellOf()]]), leaf('locked', 'L'), paragraph('z')]
    );
  });

  it('gives a covered cell its default paragraph when its container requires a block before its text', () => {
    assert.deepEqual(
      edited(
        PrefixSchema,
        [
          paragraph('pq'),
          grid([
            [cellOf(box(paragraph('required'), { text: 'tail' })), 't', 'u'],
          ]),
        ],
        span([0, 0], 0, [1, 0, 1, 0, 0], 1),
        'delete'
      ),
      [paragraph(''), grid([['', '', 'u']])]
    );
  });

  it('removes a grid of childless cells between the range start and a later grid', () => {
    assert.deepEqual(
      edited(
        OptionalCellSchema,
        [
          paragraph('intro'),
          grid([[cellOf(), cellOf()]]),
          grid([['ab', 'keep']]),
        ],
        span([0, 0], 0, [2, 0, 0, 0, 0], 2),
        'delete'
      ),
      [paragraph(''), grid([['', 'keep']])]
    );
  });

  it('removes a grid of childless cells between an earlier grid and the range end', () => {
    assert.deepEqual(
      edited(
        OptionalCellSchema,
        [
          grid([['ab', 'keep']]),
          grid([[cellOf(), cellOf()]]),
          paragraph('outro'),
        ],
        span([0, 0, 1, 0, 0], 1, [2, 0], 5),
        'delete'
      ),
      [grid([['ab', 'k']]), paragraph('')]
    );
  });
});

describe('range removal from a container into a grid', () => {
  const removedAndPasted = (value: Descendant[], at: Range) => ({
    deleted: edited(BoxSchema, value, at, 'delete'),
    pasted: edited(BoxSchema, value, at, 'paste'),
  });

  it('keeps the grid when the container paragraph the range starts in has marked runs', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(paragraphOf(bold('x'), { text: 'y' }), grid([['a', '']]))],
        span([0, 0, 0], 0, [0, 1, 0, 0, 0, 0], 1)
      ),
      {
        deleted: [box(paragraph(''), grid([['', '']]))],
        pasted: [box(paragraph('W'), grid([['', '']]))],
      }
    );
  });

  it('keeps the grid when the range starts at two depths before it', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(paragraph('x'), box(paragraph('y')), grid([['a', 'b']]))],
        span([0, 0, 0], 0, [0, 2, 0, 0, 0, 0], 1)
      ),
      {
        deleted: [box(paragraph(''), grid([['', 'b']]))],
        pasted: [box(paragraph('W'), grid([['', 'b']]))],
      }
    );
  });

  it('keeps the grid when the range starts in a nested first block', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(box(paragraph('x')), paragraph('y'), grid([['a', '']]))],
        span([0, 0, 0, 0], 0, [0, 2, 0, 0, 0, 0], 1)
      ),
      {
        deleted: [box(box(paragraph('')), grid([['', '']]))],
        pasted: [box(box(paragraph('W')), grid([['', '']]))],
      }
    );
  });

  it('keeps the grid and lands in its cell when the range ends in a nested trailing block', () => {
    const editor = createEditor({
      initialValue: [
        box(grid([['', 'a']]), box(paragraph('y')), paragraph('z')),
      ],
      plugins: [BoxSchema],
    });

    editor.update((tx) => {
      tx.selection.set(span([0, 0, 0, 1, 0, 0], 0, [0, 2, 0], 1));
      tx.text.delete();
    });

    assert.deepEqual(
      {
        deleted: {
          children: editor.read.children(),
          selection: editor.read.selection(),
        },
        pasted: edited(
          BoxSchema,
          [box(grid([['', 'a']]), box(paragraph('y')), paragraph('z'))],
          span([0, 0, 0, 1, 0, 0], 0, [0, 2, 0], 1),
          'paste'
        ),
      },
      {
        deleted: {
          children: [box(grid([['', '']]), box(paragraph('')))],
          selection: caret([0, 0, 0, 1, 0, 0], 0),
        },
        pasted: [box(grid([['', 'W']]), box(paragraph('')))],
      }
    );
  });

  it('keeps the grid and one empty text when the range ends in a marked trailing paragraph', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(grid([['', 'a']]), paragraphOf(bold('z'), { text: 'w' }))],
        span([0, 0, 0, 1, 0, 0], 0, [0, 1, 1], 1)
      ),
      {
        deleted: [box(grid([['', '']]), paragraph(''))],
        pasted: [box(grid([['', 'W']]), paragraph(''))],
      }
    );
  });

  it('keeps the grid when the range passes a nested image before an emptied first cell', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(paragraph('x'), box(image()), grid([['a', '']]))],
        span([0, 0, 0], 0, [0, 2, 0, 0, 0, 0], 1)
      ),
      {
        deleted: [box(paragraph(''), grid([['', '']]))],
        pasted: [box(paragraph('W'), grid([['', '']]))],
      }
    );
  });

  it('keeps every cell the range does not reach when it passes a nested image', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(paragraph('x'), box(image()), grid([['a', 'b']]))],
        span([0, 0, 0], 0, [0, 2, 0, 0, 0, 0], 1)
      ),
      {
        deleted: [box(paragraph(''), grid([['', 'b']]))],
        pasted: [box(paragraph('W'), grid([['', 'b']]))],
      }
    );
  });

  it('keeps the grid when the range starts in a nested box and passes an image', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(box(paragraph('x')), image(), grid([['a', 'b']]))],
        span([0, 0, 0, 0], 0, [0, 2, 0, 0, 0, 0], 1)
      ),
      {
        deleted: [box(box(paragraph('')), grid([['', 'b']]))],
        pasted: [box(box(paragraph('W')), grid([['', 'b']]))],
      }
    );
  });

  it('keeps every cell when the range runs from a cell past a read-only block into a nested box', () => {
    assert.deepEqual(
      removedAndPasted(
        [box(grid([['ka', '']]), leaf('locked', 'L'), box(paragraph('z')))],
        span([0, 0, 0, 0, 0, 0], 1, [0, 2, 0, 0], 1)
      ),
      {
        deleted: [box(grid([['k', '']]))],
        pasted: [box(grid([['kW', '']]))],
      }
    );
  });

  it('keeps a grid that sits after the range end in the same box', () => {
    assert.deepEqual(
      edited(
        BoxSchema,
        [box(paragraph('x'), box(paragraph('y'), grid([['']])))],
        span([0, 0, 0], 0, [0, 1, 0, 0], 1),
        'delete'
      ),
      [box(paragraph(''), box(grid([['']])))]
    );
  });
});

describe('typing and pastes over a range that reaches a grid', () => {
  const typedAndPasted = (
    plugin: ContractSchema,
    value: Descendant[],
    at: Range
  ) => ({
    pasted: edited(plugin, value, at, 'paste'),
    typed: edited(plugin, value, at, 'type'),
  });

  it('writes into the tail text of a container that requires a paragraph first', () => {
    const expected = [
      box(paragraph('required'), { text: 'tW' }),
      grid([['b', 'cd']]),
    ];

    assert.deepEqual(
      typedAndPasted(
        PrefixSchema,
        [box(paragraph('required'), { text: 'tail' }), grid([['ab', 'cd']])],
        span([0, 1], 1, [1, 0, 0, 0, 0], 1)
      ),
      { pasted: expected, typed: expected }
    );
  });

  it('writes into the tail text of a cell container that requires a paragraph first', () => {
    const expected = [
      grid([[cellOf(box(paragraph('header'), { text: 'xW' })), 'b', 'keep']]),
    ];

    assert.deepEqual(
      typedAndPasted(
        PrefixSchema,
        [
          grid([
            [cellOf(box(paragraph('header'), { text: 'xy' })), 'ab', 'keep'],
          ]),
        ],
        span([0, 0, 0, 0, 1], 1, [0, 0, 1, 0, 0], 1)
      ),
      { pasted: expected, typed: expected }
    );
  });

  it('leaves one paragraph with the pasted text over a document of grids', () => {
    assert.deepEqual(
      edited(
        GridSchema,
        [grid([['a', 'b']]), grid([['c', 'd']])],
        span([0, 0, 0, 0, 0], 0, [1, 0, 1, 0, 0], 1),
        'paste'
      ),
      [paragraph('W')]
    );
  });

  it('writes after the paragraph before two grids it removes whole', () => {
    assert.deepEqual(
      typedAndPasted(
        GridSchema,
        [paragraph('before'), grid([['a', 'b']]), grid([['c', 'd']])],
        span([1, 0, 0, 0, 0], 0, [2, 0, 1, 0, 0], 1)
      ),
      { pasted: [paragraph('beforeW')], typed: [paragraph('beforeW')] }
    );
  });

  it('writes into the first cleared cell of a kept grid after a grid it removes whole', () => {
    const expected = [paragraph('before'), grid([['W', '', 'e']])];

    assert.deepEqual(
      typedAndPasted(
        GridSchema,
        [paragraph('before'), grid([['a', 'b']]), grid([['c', 'd', 'e']])],
        span([1, 0, 0, 0, 0], 0, [2, 0, 1, 0, 0], 1)
      ),
      { pasted: expected, typed: expected }
    );
  });

  it('writes at a range start that sits on an inline void', () => {
    const expected = [paragraph('W'), grid([['', 'b']])];

    assert.deepEqual(
      typedAndPasted(
        BoxSchema,
        [
          paragraphOf({ text: '' }, leaf('mention'), { text: 'x' }),
          grid([['a', 'b']]),
        ],
        span([0, 1, 0], 0, [1, 0, 0, 0, 0], 1)
      ),
      { pasted: expected, typed: expected }
    );
  });

  it('keeps an image a range starts on when the range holds nothing else in its cell', () => {
    const expected = [grid([[cellOf(paragraph('x'), image()), 'Wd']])];

    assert.deepEqual(
      typedAndPasted(
        GridSchema,
        [grid([[cellOf(paragraph('x'), image()), 'cd']])],
        span([0, 0, 0, 1, 0], 0, [0, 0, 1, 0, 0], 1)
      ),
      { pasted: expected, typed: expected }
    );
  });

  it('writes into an empty covered cell between cells that clear to nothing', () => {
    const expected = [grid([[cellOf(), cell('W'), cellOf(), cell('keep')]])];

    assert.deepEqual(
      typedAndPasted(
        ChipCellSchema,
        [
          grid([
            [
              cellOf(leaf('chip', 'a')),
              cell(''),
              cellOf(leaf('chip', 'b')),
              cell('keep'),
            ],
          ]),
        ],
        span([0, 0, 0, 0, 0], 0, [0, 0, 2, 0, 0], 1)
      ),
      { pasted: expected, typed: expected }
    );
  });
});

describe('range removal inside one block of a container', () => {
  it('keeps an untouched empty box beside a paragraph a delete crosses runs in', () => {
    assert.deepEqual(
      edited(
        ContainerSchema,
        [
          box(
            paragraphOf({ text: 'x' }, bold('y'), { text: 'z' }),
            box(paragraph(''))
          ),
        ],
        span([0, 0, 0], 0, [0, 0, 1], 1),
        'delete'
      ),
      [box(paragraph('z'), box(paragraph('')))]
    );
  });

  it('keeps an untouched empty paragraph beside a paragraph a delete empties across runs', () => {
    assert.deepEqual(
      edited(
        ContainerSchema,
        [box(paragraphOf({ text: 'a' }, bold('b')), paragraph(''))],
        span([0, 0, 0], 0, [0, 0, 1], 1),
        'delete'
      ),
      [box(paragraph(''), paragraph(''))]
    );
  });

  it('keeps an untouched empty paragraph after nested boxes a delete crosses', () => {
    assert.deepEqual(
      edited(
        ContainerSchema,
        [box(box(paragraph('ab'), box(paragraph('cd'))), paragraph(''))],
        span([0, 0, 0, 0], 1, [0, 0, 1, 0, 0], 1),
        'delete'
      ),
      [box(box(paragraph('a'), box(paragraph('d'))), paragraph(''))]
    );
  });

  it('keeps the block where a delete started when the delete empties a nested box', () => {
    const editor = createEditor({
      initialValue: [
        box(box(paragraph('ab'), box(paragraph('cd'))), paragraph('z')),
      ],
      plugins: [ContainerSchema],
    });

    editor.update((tx) => {
      tx.selection.set(span([0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 2));
      tx.text.delete();
    });

    assert.deepEqual(
      { children: editor.read.children(), selection: editor.read.selection() },
      {
        children: [box(box(paragraph('')), paragraph('z'))],
        selection: caret([0, 0, 0, 0], 0),
      }
    );
  });
});

describe('whole-document typing over a leading block', () => {
  const typedOverAll = (
    plugin: ContractSchema,
    value: Descendant[],
    all: Range
  ) => {
    const editor = createEditor({ initialValue: value, plugins: [plugin] });

    unlessRefused(() =>
      editor.update((tx) => {
        tx.selection.set(all);
        tx.text.insert('W');
      })
    );

    return editor.read.children();
  };

  it('changes nothing when typing over a whole box that holds only a read-only paragraph', () => {
    assert.deepEqual(
      typedOverAll(
        BoxSchema,
        [box(leaf('locked', 'secret'))],
        span([0, 0, 0], 0, [0, 0, 0], 6)
      ),
      [box(leaf('locked', 'secret'))]
    );
  });

  it('changes nothing when typing over a whole grid whose one cell holds a read-only paragraph', () => {
    assert.deepEqual(
      typedOverAll(
        UneditableCellSchema,
        [grid([[cellOf(leaf('locked', 'old'))]])],
        span([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 3)
      ),
      [grid([[cellOf(leaf('locked', 'old'))]])]
    );
  });
});

describe('a hanging delete that runs from a block start to the next block start', () => {
  const hangingDelete = (initialValue: Descendant[], at: Range) => {
    const editor = createEditor({ initialValue, plugins: [ContainerSchema] });

    editor.update((tx) => {
      tx.text.delete({ at, hanging: true });
    });

    return editor.read.children();
  };

  it('empties the start block and keeps the next paragraph', () => {
    assert.deepEqual(
      hangingDelete(
        [paragraph('a'), paragraph('x'), paragraph('yz')],
        span([1, 0], 0, [2, 0], 0)
      ),
      [paragraph('a'), paragraph(''), paragraph('yz')]
    );
  });
});

describe('a delete that runs out of a box to the end of the document', () => {
  it('keeps the paragraph after a box when a delete runs from a later line of the box to the end of the document', () => {
    const editor = createEditor({
      initialValue: [box(paragraph('a'), paragraph('x')), paragraph('')],
      plugins: [ContainerSchema],
    });

    unlessRefused(() =>
      editor.update((tx) => {
        tx.text.delete({ at: span([0, 1, 0], 0, [1, 0], 0) });
      })
    );

    const children = editor.read.children();

    assert.equal(children.length, 2);
    assert.deepEqual(children[1], paragraph(''));
  });
});

describe('typing and pastes over cells inside non-editable structure', () => {
  const writeOver = (
    plugin: ContractSchema,
    initialValue: Descendant[],
    at: Range
  ) => {
    const pasted = createEditor({ initialValue, plugins: [plugin] });
    let accepted = false;

    pasted.update((tx) => {
      accepted = tx.slice.replace(textSlice('W'), { at });
    });

    return {
      accepted,
      pasted: pasted.read.children(),
      typed: edited(plugin, initialValue, at, 'type'),
    };
  };
  const refused = (value: Descendant[]) => ({
    accepted: false,
    pasted: value,
    typed: value,
  });

  it('refuses typing and pastes over read-only cells', () => {
    const value = [grid([['a', 'b', 'keep']])];

    assert.deepEqual(
      writeOver(
        ReadOnlyCellSchema,
        value,
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1)
      ),
      refused(value)
    );
  });

  it('refuses typing and pastes over atom cells', () => {
    const value = [grid([['a', 'b', 'keep']])];

    assert.deepEqual(
      writeOver(
        AtomCellSchema,
        value,
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1)
      ),
      refused(value)
    );
  });

  it('writes into the first cleared cell over editable cells', () => {
    const written = [grid([['W', '', 'keep']])];

    assert.deepEqual(
      writeOver(
        GridSchema,
        [grid([['a', 'b', 'keep']])],
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1)
      ),
      { accepted: true, pasted: written, typed: written }
    );
  });
});

describe('range removal over non-editable grid structure', () => {
  const everyEdit = (
    plugin: ContractSchema,
    initialValue: Descendant[],
    at: Range
  ) => {
    const pasted = createEditor({ initialValue, plugins: [plugin] });
    let accepted = false;

    pasted.update((tx) => {
      accepted = tx.slice.replace(textSlice('W'), { at });
    });

    return {
      accepted,
      deleted: edited(plugin, initialValue, at, 'delete'),
      pasted: pasted.read.children(),
      typed: edited(plugin, initialValue, at, 'type'),
    };
  };

  it('removes a read-only grid as one unit and writes into the paragraph after it', () => {
    const value = [grid([['ab', 'cd']]), paragraph('after')];

    assert.deepEqual(
      everyEdit(
        ReadOnlyGridSchema,
        value,
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 2)
      ),
      {
        accepted: false,
        deleted: [paragraph('after')],
        pasted: value,
        typed: [paragraph('Wafter')],
      }
    );
  });

  it('removes a read-only box holding a grid as one unit and writes into the paragraph after it', () => {
    const value = [box(grid([['ab', 'cd']])), paragraph('after')];

    assert.deepEqual(
      everyEdit(
        ReadOnlyBoxSchema,
        value,
        span([0, 0, 0, 0, 0, 0], 0, [0, 0, 0, 1, 0, 0], 2)
      ),
      {
        accepted: false,
        deleted: [paragraph('after')],
        pasted: value,
        typed: [paragraph('Wafter')],
      }
    );
  });

  it('keeps read-only cells a delete covers', () => {
    const value = [grid([['a', 'b', 'keep']])];

    assert.deepEqual(
      edited(
        ReadOnlyCellSchema,
        value,
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1),
        'delete'
      ),
      value
    );
  });

  it('keeps atom cells a delete covers', () => {
    const value = [grid([['a', 'b', 'keep']])];

    assert.deepEqual(
      edited(
        AtomCellSchema,
        value,
        span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1),
        'delete'
      ),
      value
    );
  });

  it('keeps the text of a read-only cell a delete starts in and clears the editable cells after it', () => {
    const locked = { children: [paragraph('ab')], type: 'lockedCell' };

    assert.deepEqual(
      edited(
        LockedCellSchema,
        [grid([[locked, 'cd', 'ef']]), paragraph('after')],
        span([0, 0, 0, 0, 0], 1, [1, 0], 2),
        'delete'
      ),
      [grid([[locked, '', '']]), paragraph('ter')]
    );
  });
});

describe('merges over a range whose removal leaves nothing to join', () => {
  it('keeps a grid whose cells a merge clears to nothing', () => {
    const editor = createEditor({
      initialValue: [
        grid([[cellOf(leaf('chip', 'ab')), cellOf(leaf('chip', 'cd'))]]),
      ],
      plugins: [ChipCellSchema],
    });

    editor.update((tx) => {
      tx.nodes.merge({ at: span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 2) });
    });

    assert.deepEqual(editor.read.children(), [grid([[cellOf(), cellOf()]])]);
  });

  it('keeps the grid when a highest-mode merge removes text inside one cell', () => {
    const editor = createGridEditor([
      paragraph('before'),
      grid([['ab', 'cd']]),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({
        at: span([1, 0, 0, 0, 0], 0, [1, 0, 0, 0, 0], 1),
        mode: 'highest',
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('before'),
      grid([['b', 'cd']]),
    ]);
  });

  it('keeps the block a merge range ends in once the removal has joined it', () => {
    const editor = createGridEditor([
      paragraph('ab'),
      paragraph('cd'),
      paragraph('ef'),
    ]);

    editor.update((tx) => {
      tx.nodes.merge({ at: span([0, 0], 1, [1, 0], 1) });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('ad'),
      paragraph('ef'),
    ]);
  });
});

describe('range removal across a grid edge in a named root', () => {
  for (const root of ['header', 'z'] as const) {
    const rooted = (path: number[], offset: number): Point => ({
      offset,
      path,
      root,
    });
    const editAt = (at: Range, edit: 'delete' | 'type') => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('main')],
          roots: { [root]: [paragraph('before'), grid([['ab', 'cd']])] },
        },
        plugins: [NamedRootSchema],
      });

      editor.update((tx) => {
        if (edit === 'delete') {
          tx.text.delete({ at });
        } else {
          tx.text.insert('W', { at });
        }
      });

      return editor.read.root(root);
    };

    it(`removes the first cell's text from a paragraph into it in root ${root}`, () => {
      assert.deepEqual(
        editAt(
          { anchor: rooted([0, 0], 0), focus: rooted([1, 0, 0, 0, 0], 2) },
          'delete'
        ),
        [paragraph(''), grid([['', 'cd']])]
      );
    });

    it(`types into the first cell over an exact grid span in root ${root}`, () => {
      assert.deepEqual(
        editAt(
          {
            anchor: rooted([1, 0, 0, 0, 0], 0),
            focus: rooted([1, 0, 1, 0, 0], 2),
          },
          'type'
        ),
        [paragraph('before'), grid([['W', '']])]
      );
    });
  }

  it('reads a node end in a named root with that root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { header: [paragraph('h'), grid([['ab', 'cd']])] },
      },
      plugins: [NamedRootSchema],
    });

    assert.deepEqual(editor.read.points.end(editor.read.root('header')[1]), {
      offset: 2,
      path: [1, 0, 1, 0, 0],
      root: 'header',
    });
  });
});

describe('range removal that reaches a node only at its nearest text', () => {
  it('keeps a textless grid after the range end in the same box', () => {
    assert.deepEqual(
      edited(
        TextlessGridSchema,
        [
          paragraph('x'),
          box(paragraph('y'), grid([[cellOf(), cellOf()]])),
          paragraph('z'),
        ],
        span([0, 0], 0, [1, 0, 0], 1),
        'delete'
      ),
      [paragraph(''), box(grid([[cellOf(), cellOf()]])), paragraph('z')]
    );
  });

  it('removes a box whole when the range ends at its last leaf', () => {
    assert.deepEqual(
      edited(
        TextlessGridSchema,
        [paragraph('x'), box(paragraph('y')), paragraph('z')],
        span([0, 0], 0, [1, 0, 0], 1),
        'delete'
      ),
      [paragraph('z')]
    );
  });

  it('keeps an empty last cell of a grid whose last text the range reaches', () => {
    assert.deepEqual(
      edited(
        OptionalCellSchema,
        [paragraph('before'), grid([['a', cellOf()]]), paragraph('after')],
        span([0, 0], 0, [1, 0, 0, 0, 0], 1),
        'delete'
      ),
      [paragraph(''), grid([['', cellOf()]]), paragraph('after')]
    );
  });

  it('keeps a textless block after the last text of a cell the range reaches', () => {
    assert.deepEqual(
      edited(
        ChildlessBoxSchema,
        [paragraph('before'), grid([[cellOf(paragraph('a'), box()), 'b']])],
        span([0, 0], 0, [1, 0, 0, 0, 0], 1),
        'delete'
      ),
      [paragraph(''), grid([[cellOf(paragraph(''), box()), 'b']])]
    );
  });

  it('keeps a textless grid after the last text when typing replaces that text', () => {
    assert.deepEqual(
      edited(
        TextlessGridSchema,
        [paragraph('ab'), grid([[cellOf(), cellOf()]])],
        span([0, 0], 0, [0, 0], 2),
        'type'
      ),
      [paragraph('W'), grid([[cellOf(), cellOf()]])]
    );
  });
});

describe('a paste with end matter over grids it removes', () => {
  it('lands the body before the end matter when the paste removes every grid', () => {
    const editor = createEditor({
      initialValue: [grid([['a', 'b']]), grid([['c', 'd']])],
      plugins: [NotesSchema],
    });
    let accepted = false;

    editor.update((tx) => {
      accepted = tx.slice.replace(
        ContentSlice.fromJSON({
          content: [
            paragraph('W'),
            { children: [paragraph('n')], type: 'endnote' },
          ],
          openEnd: 0,
          openStart: 0,
        }),
        { at: span([0, 0, 0, 0, 0], 0, [1, 0, 1, 0, 0], 1) }
      );
    });

    assert.deepEqual(
      { accepted, children: editor.read.children() },
      {
        accepted: true,
        children: [
          paragraph('W'),
          { children: [paragraph('n')], type: 'endnote' },
        ],
      }
    );
  });

  it('refuses and changes nothing when the body fits nowhere after the grid removal and the end matter ran', () => {
    const value = [grid([['a', 'b']]), paragraph('z')];
    const editor = createEditor({
      initialValue: value,
      plugins: [NotesSchema],
    });
    let accepted = true;

    editor.update((tx) => {
      accepted = tx.slice.replace(
        ContentSlice.fromJSON({
          content: [image(), { children: [paragraph('n')], type: 'endnote' }],
          openEnd: 0,
          openStart: 0,
        }),
        { at: span([0, 0, 0, 0, 0], 0, [0, 0, 1, 0, 0], 1) }
      );
    });

    assert.deepEqual(
      { accepted, children: editor.read.children() },
      { accepted: false, children: value }
    );
  });
});

describe('range removal inside one cell across block depths', () => {
  it('joins the deeper end block into the start block', () => {
    assert.deepEqual(
      edited(
        ChildlessBoxSchema,
        [grid([[cellOf(paragraph('ab'), box(paragraph('cd'))), 'z']])],
        span([0, 0, 0, 0, 0], 1, [0, 0, 0, 1, 0, 0], 1),
        'delete'
      ),
      [grid([[cellOf(paragraph('ad')), 'z']])]
    );
  });
});
