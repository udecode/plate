import {
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  defineDocumentMigrations,
  migrateDocument,
} from 'platejs';
import { type Element, property, schema, target } from 'plitejs';

import { migratePlateV54, migratePlateV55 } from './index';

const MigrationSchema = { id: 'plate', version: 55 } as const;
const requiredRef = property.string({ required: true });
const BaseDatePlugin = defineBasePlugin('date', {
  schema: {
    element: {
      properties: { value: property.string({ required: true }) },
      void: 'inline',
    },
  },
});
const BaseMentionPlugin = defineBasePlugin('mention', {
  schema: {
    element: {
      properties: { label: property.string(), ref: requiredRef },
      void: 'inline',
    },
  },
});
const BaseDetailsSummaryPlugin = defineBasePlugin('detailsSummary', {
  schema: {
    element: { ...schema.element.textBlock(), type: 'summary' },
  },
});
const BaseDetailsPlugin = defineBasePlugin('details', {
  dependencies: [BaseDetailsSummaryPlugin, BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.any(
        [
          schema.content.type('summary').allowed,
          plugins.blockContent().allowed,
        ],
        { default: { type: 'summary' }, min: 1 }
      ),
    },
  }),
});
const BaseFootnotePlugin = defineBasePlugin('footnote', {
  schema: {
    element: {
      properties: { ref: requiredRef },
      type: 'footnoteReference',
      void: 'inline',
    },
  },
});
const BaseFootnoteDefinitionPlugin = defineBasePlugin('footnoteDefinition', {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: { ref: requiredRef },
    },
  }),
});
const BaseInlineEquationPlugin = defineBasePlugin('inlineEquation', {
  schema: {
    element: {
      properties: {
        latex: property.string({ default: '', omitDefault: false }),
      },
      void: 'inline',
    },
  },
});
const BaseEquationPlugin = defineBasePlugin('equation', {
  schema: {
    element: {
      properties: {
        latex: property.string({ default: '', omitDefault: false }),
      },
      void: 'block',
    },
  },
});
const BaseColumnItemPlugin = defineBasePlugin('column', {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      blockContent: false,
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: { width: property.string({ required: true }) },
    },
  }),
});
const BaseColumnPlugin = defineBasePlugin('columnGroup', {
  dependencies: [BaseColumnItemPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseColumnItemPlugin, { min: 2 }),
    },
  },
});
const mediaElement = (
  properties: Record<string, ReturnType<typeof property.string>>
) =>
  schema.element.textBlock({
    properties: {
      ...properties,
      url: property.string({ required: true }),
    },
  });
const BaseFilePlugin = defineBasePlugin('file', {
  schema: {
    element: mediaElement({ name: property.string() }),
  },
});
const BaseImagePlugin = defineBasePlugin('image', {
  schema: {
    element: schema.element.textBlock({
      properties: {
        naturalHeight: property.number(),
        naturalWidth: property.number(),
        url: property.string({ required: true }),
      },
    }),
  },
});
const BaseMediaEmbedPlugin = defineBasePlugin('mediaEmbed', {
  schema: { element: mediaElement({}) },
});
const BaseCodeDrawingPlugin = defineBasePlugin('codeDrawing', {
  schema: {
    element: {
      properties: {
        code: property.string({ default: '', omitDefault: false }),
        language: property.enum(
          ['flowchart', 'graphviz', 'mermaid', 'plantuml'],
          { default: 'mermaid', omitDefault: false }
        ),
        view: property.enum(['code', 'preview', 'split'], {
          default: 'split',
          omitDefault: false,
        }),
      },
      void: 'block',
    },
  },
});
const BaseTableCellPlugin = defineBasePlugin('tableCell', {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      blockContent: false,
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: {
        borders: property.json(),
        colSpan: property.number(),
        rowSpan: property.number(),
      },
    },
  }),
});
const BaseTableRowPlugin = defineBasePlugin('tableRow', {
  dependencies: [BaseTableCellPlugin],
  schema: {
    element: {
      blockContent: false,
      content: schema.content.element(BaseTableCellPlugin, { min: 0 }),
      properties: { height: property.number() },
    },
  },
});
const BaseTablePlugin = defineBasePlugin('table', {
  dependencies: [BaseTableRowPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseTableRowPlugin, { min: 1 }),
      properties: { columnWidths: property.json() },
    },
  },
});
const BaseIndentPlugin = defineBasePlugin('indent', {
  schema: {
    properties: {
      indent: schema.elementProperty(property.number(), {
        target: target.elements([BaseParagraphPlugin, BaseDetailsPlugin]),
      }),
    },
  },
});
const BaseListPlugin = defineBasePlugin('list', {
  schema: {
    properties: {
      checked: schema.elementProperty(property.boolean(), {
        target: target.elements([BaseParagraphPlugin, BaseDetailsPlugin]),
      }),
      listRestart: schema.elementProperty(property.number(), {
        target: target.elements([BaseParagraphPlugin, BaseDetailsPlugin]),
      }),
      listStart: schema.elementProperty(property.number(), {
        target: target.elements([BaseParagraphPlugin, BaseDetailsPlugin]),
      }),
      listStyle: schema.elementProperty(property.string(), {
        target: target.elements([BaseParagraphPlugin, BaseDetailsPlugin]),
      }),
      listType: schema.elementProperty(
        property.enum(['bulleted', 'numbered', 'task']),
        { target: target.elements([BaseParagraphPlugin, BaseDetailsPlugin]) }
      ),
    },
  },
});
const BaseTextAlignPlugin = defineBasePlugin('textAlign', {
  schema: {
    properties: {
      textAlign: schema.elementProperty(
        property.enum(['center', 'end', 'justify', 'left', 'right', 'start']),
        {
          target: target.elements([
            BaseParagraphPlugin,
            BaseDetailsSummaryPlugin,
          ]),
        }
      ),
    },
  },
});
const BaseElementIdPlugin = defineBasePlugin('elementId', {
  schema: {
    properties: {
      id: schema.elementProperty(property.string(), {
        target: target.element(BaseDetailsPlugin),
      }),
    },
  },
});
const plugins = [
  BaseParagraphPlugin,
  BaseDetailsPlugin,
  BaseDatePlugin,
  BaseMentionPlugin,
  BaseFootnotePlugin,
  BaseFootnoteDefinitionPlugin,
  BaseInlineEquationPlugin,
  BaseEquationPlugin,
  BaseColumnPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseCodeDrawingPlugin,
  BaseTablePlugin,
  BaseIndentPlugin,
  BaseListPlugin,
  BaseTextAlignPlugin,
  BaseElementIdPlugin,
] as const;

const createMigrationEditor = (unversioned: 53 | 54) => {
  const migrations = defineDocumentMigrations(MigrationSchema, {
    steps: { 54: migratePlateV54, 55: migratePlateV55 },
    unversioned,
  });
  const editor = createEditor({
    migrations,
    plugins,
    schema: MigrationSchema,
    skipInitialization: true,
  });

  return { editor, migrations };
};

describe('migratePlateV55 profile', () => {
  it('migrates every accepted v54 AST contract and fits the v55 schema', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              { text: 'On ' },
              {
                children: [{ text: '' }],
                rawDate: 'sometime next week',
                type: 'date',
              },
              { text: ' ask ' },
              {
                children: [{ text: '' }],
                key: 'user:42',
                type: 'mention',
                value: 'Ada',
              },
              { text: ' about ' },
              {
                children: [{ text: '' }],
                identifier: '1',
                type: 'footnoteReference',
              },
              { text: ' and ' },
              {
                children: [{ text: '' }],
                texExpression: 'E = mc^2',
                type: 'inlineEquation',
              },
              { text: ' plus ' },
              {
                children: [{ text: '' }],
                ref: '',
                type: 'footnoteReference',
              },
            ],
            indent: 2.9,
            listRestart: -2.8,
            listStart: 1.9,
            listType: 'numbered',
            textAlign: 'match-parent',
            type: 'paragraph',
          },
          {
            children: [{ children: [{ text: 'Footnote' }], type: 'paragraph' }],
            identifier: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [{ text: '' }],
            data: {
              code: 'graph TD; A-->B',
              drawingMode: 'Both',
              drawingType: 'Mermaid',
            },
            type: 'codeDrawing',
          },
          {
            children: [{ text: '' }],
            texExpression: 'x^2',
            type: 'equation',
          },
          {
            children: [
              {
                children: [{ children: [{ text: 'Left' }], type: 'paragraph' }],
                type: 'column',
              },
              {
                children: [
                  { children: [{ text: 'Right' }], type: 'paragraph' },
                ],
                type: 'column',
                width: '60%',
              },
            ],
            layout: [50, 60],
            type: 'columnGroup',
          },
          {
            children: [{ text: '' }],
            name: 'image.png',
            naturalHeight: -1,
            naturalWidth: 640.4,
            type: 'image',
            url: 'https://platejs.org/image.png',
          },
          {
            children: [{ text: '' }],
            name: 'report.pdf',
            type: 'file',
            url: 'https://platejs.org/report.pdf',
          },
          {
            children: [{ text: '' }],
            name: 'embed',
            type: 'mediaEmbed',
            url: 'https://platejs.org/embed',
          },
          {
            children: [
              {
                children: [
                  {
                    borders: { bottom: { width: -1 } },
                    children: [
                      { children: [{ text: 'Cell' }], type: 'paragraph' },
                    ],
                    colSpan: 0,
                    rowSpan: 1.5,
                    type: 'tableCell',
                  },
                ],
                height: -20,
                type: 'tableRow',
              },
            ],
            columnWidths: [80, 0],
            type: 'table',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(() => editor.read.schema.assertDocument(result)).not.toThrow();
    expect(result.children).toMatchObject([
      {
        children: [
          { text: 'On ' },
          { type: 'date', value: 'sometime next week' },
          { text: ' ask ' },
          { label: 'Ada', ref: 'user:42', type: 'mention' },
          { text: ' about ' },
          { ref: '1', type: 'footnoteReference' },
          { text: ' and ' },
          { latex: 'E = mc^2', type: 'inlineEquation' },
          { text: ' plus ' },
          {
            ref: 'unresolved:main.0.children.9',
            type: 'footnoteReference',
          },
        ],
        indent: 2,
        listRestart: -2,
        listStart: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      { ref: '1', type: 'footnoteDefinition' },
      {
        code: 'graph TD; A-->B',
        language: 'mermaid',
        type: 'codeDrawing',
        view: 'split',
      },
      { latex: 'x^2', type: 'equation' },
      {
        children: [{ width: '50%' }, { width: '60%' }],
        type: 'columnGroup',
      },
      { naturalWidth: 640, type: 'image' },
      { name: 'report.pdf', type: 'file' },
      { type: 'mediaEmbed' },
      {
        children: [
          {
            children: [{ borders: { bottom: { width: 0 } } }],
            type: 'tableRow',
          },
        ],
        columnWidths: [80, null],
        type: 'table',
      },
    ]);
  });

  it('runs v53 then v54 then v55 through one ascending chain', () => {
    const { editor, migrations } = createMigrationEditor(53);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                key: 'user:42',
                type: 'mention',
                value: 'Ada',
              },
              {
                children: [{ text: '' }],
                texExpression: 'x',
                type: 'inline_equation',
              },
            ],
            listStart: -3,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'zero' }],
            listRestart: 0,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'A' }], type: 'paragraph' },
                    ],
                    type: 'td',
                  },
                  {
                    children: [
                      { children: [{ text: 'B' }], type: 'paragraph' },
                    ],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            colSizes: [80, 0],
            type: 'table',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(() => editor.read.schema.assertDocument(result)).not.toThrow();
    expect(result.children).toMatchObject([
      {
        children: [
          { label: 'Ada', ref: 'user:42', type: 'mention' },
          { latex: 'x', type: 'inlineEquation' },
        ],
        listStart: -3,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'zero' }],
        listType: 'numbered',
        type: 'paragraph',
      },
      { columnWidths: [80, null], type: 'table' },
    ]);
    expect(result.children[1]).not.toHaveProperty('listRestart');
  });

  it('fails closed when legacy and destination fields conflict', () => {
    const { editor, migrations } = createMigrationEditor(54);

    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [{ text: '' }],
              rawDate: 'sometime next week',
              type: 'date',
              value: '2026-08-18',
            },
          ],
        },
        { editor, migrations }
      )
    ).toThrow(/migration collision.*value/i);

    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [{ text: '' }],
              date: '2026-08-18',
              rawDate: 'sometime next week',
              type: 'date',
            },
          ],
        },
        { editor, migrations }
      )
    ).toThrow(/migration collision.*rawDate.*date/i);

    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'Column' }], type: 'paragraph' },
                  ],
                  type: 'column',
                  width: '60%',
                },
              ],
              layout: [40],
              type: 'columnGroup',
            },
          ],
        },
        { editor, migrations }
      )
    ).toThrow(/migration collision.*layout width.*width/i);
  });

  it('preserves canonical table references on a structural no-op', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const document = {
      children: [
        {
          children: [
            {
              children: [
                {
                  borders: { bottom: { width: 0 } },
                  children: [
                    { children: [{ text: 'Cell' }], type: 'paragraph' },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          columnWidths: [80, null],
          type: 'table',
        },
      ],
    };

    expect(migrateDocument(document, { editor, migrations }).document).toBe(
      document
    );
  });

  it('drops nonpositive legacy layout widths', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  { children: [{ text: 'Column' }], type: 'paragraph' },
                ],
                type: 'column',
              },
              {
                children: [
                  { children: [{ text: 'Second' }], type: 'paragraph' },
                ],
                type: 'column',
              },
            ],
            layout: [-20, 0],
            type: 'columnGroup',
          },
        ],
      },
      { editor, migrations }
    ).document;
    const columnGroup = result.children[0];

    expect(columnGroup).not.toHaveProperty('layout');
    expect(columnGroup.children).toMatchObject([
      { width: '50%' },
      { width: '50%' },
    ]);
  });

  it('preserves mention labels when invalid refs degrade to text', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                label: 'Ada',
                ref: '',
                type: 'mention',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      { children: [{ text: '@Ada' }], type: 'paragraph' },
    ]);
  });

  it('preserves finite numeric legacy mention keys as refs', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                key: 42,
                type: 'mention',
                value: 'Ada',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      {
        children: [{ label: 'Ada', ref: '42', type: 'mention' }],
        type: 'paragraph',
      },
    ]);

    const degraded = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                key: { id: 42 },
                type: 'mention',
                value: 'Ada',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(degraded.children).toMatchObject([
      { children: [{ text: '@Ada' }], type: 'paragraph' },
    ]);

    const preserved = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                key: { id: 42 },
                label: 'Ada',
                ref: 'user:42',
                type: 'mention',
                value: '',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(preserved.children).toMatchObject([
      {
        children: [{ label: 'Ada', ref: 'user:42', type: 'mention' }],
        type: 'paragraph',
      },
    ]);

    const hybrid = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                ref: 'user:42',
                type: 'mention',
                value: 'Ada',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(hybrid.children).toMatchObject([
      {
        children: [{ label: 'Ada', ref: 'user:42', type: 'mention' }],
        type: 'paragraph',
      },
    ]);
  });

  it('allocates collision-free unresolved footnote refs', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                type: 'footnoteReference',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              { children: [{ text: 'Definition' }], type: 'paragraph' },
            ],
            identifier: 'unresolved:main.0.children.0',
            type: 'footnoteDefinition',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      {
        children: [
          { ref: 'unresolved:main.0.children.0:1', type: 'footnoteReference' },
        ],
      },
      {
        ref: 'unresolved:main.0.children.0',
        type: 'footnoteDefinition',
      },
    ]);
  });

  it('recovers usable legacy values over empty destination fields', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                rawDate: 'next week',
                type: 'date',
                value: '',
              },
              {
                children: [{ text: '' }],
                key: 'user:42',
                label: '',
                ref: ' ',
                type: 'mention',
                value: 'Ada',
              },
              {
                children: [{ text: '' }],
                latex: '',
                texExpression: 'x',
                type: 'inlineEquation',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      {
        children: [
          { type: 'date', value: 'next week' },
          { label: 'Ada', ref: 'user:42', type: 'mention' },
          { latex: 'x', type: 'inlineEquation' },
        ],
      },
    ]);
  });

  it('preserves canonical Code Drawing fields when legacy data is partial', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: '' }],
            code: '',
            data: { code: 'x' },
            language: 'graphviz',
            type: 'codeDrawing',
            view: 'preview',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      {
        code: 'x',
        language: 'graphviz',
        type: 'codeDrawing',
        view: 'preview',
      },
    ]);
  });

  it('sanitizes malformed legacy border descriptors', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    borders: {
                      bottom: { color: 'red', extra: true, width: '1' },
                      diagonal: { width: 2 },
                      left: null,
                      right: { width: -2 },
                    },
                    children: [
                      { children: [{ text: 'Cell' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations }
    ).document;
    const table = result.children[0];
    const row = table.children[0] as Element;
    const cell = row.children[0] as Element;

    expect(cell.borders).toEqual({
      bottom: { color: 'red' },
      right: { width: 0 },
    });
  });

  it('removes malformed optional labels and column width vectors', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: '' }],
                label: 42,
                ref: 'user:42',
                type: 'mention',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'Cell' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            columnWidths: { first: 80 },
            type: 'table',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children[0].children[0]).not.toHaveProperty('label');
    expect(result.children[1]).not.toHaveProperty('columnWidths');
  });

  it('converts nested flat Toggles into semantic Details without crossing a shallower sibling', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'Outer title' }],
            id: 'outer',
            textAlign: 'center',
            type: 'toggle',
          },
          {
            children: [{ text: 'Outer body' }],
            indent: 1,
            type: 'paragraph',
          },
          {
            children: [{ text: 'Nested title' }],
            indent: 1,
            type: 'toggle',
          },
          {
            children: [{ text: 'Nested body' }],
            indent: 2,
            type: 'paragraph',
          },
          { children: [{ text: 'After' }], type: 'paragraph' },
        ],
      },
      { editor, migrations }
    ).document;

    expect(() => editor.read.schema.assertDocument(result)).not.toThrow();
    expect(result.children).toMatchObject([
      {
        children: [
          {
            children: [{ text: 'Outer title' }],
            textAlign: 'center',
            type: 'summary',
          },
          { children: [{ text: 'Outer body' }], type: 'paragraph' },
          {
            children: [
              {
                children: [{ text: 'Nested title' }],
                type: 'summary',
              },
              { children: [{ text: 'Nested body' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
        id: 'outer',
        type: 'details',
      },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
  });

  it('uses list effective depth and preserves list-relative indentation', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          { children: [{ text: 'Title' }], type: 'toggle' },
          {
            children: [{ text: 'Inside list' }],
            indent: 2,
            listType: 'bulleted',
            type: 'paragraph',
          },
          {
            children: [{ text: 'Outside list' }],
            indent: 1,
            listType: 'bulleted',
            type: 'paragraph',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { indent: 1, listType: 'bulleted', type: 'paragraph' },
        ],
        type: 'details',
      },
      { indent: 1, listType: 'bulleted', type: 'paragraph' },
    ]);
  });

  it('does not enclose an unindented peer after a zero-indent list Toggle', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'Title' }],
            indent: 0,
            listType: 'bulleted',
            type: 'toggle',
          },
          { children: [{ text: 'After' }], type: 'paragraph' },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toMatchObject([
      {
        children: [{ children: [{ text: 'Title' }], type: 'summary' }],
        indent: 0,
        listType: 'bulleted',
        type: 'details',
      },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
  });

  it('normalizes nested zero indentation before final schema validation', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const result = migrateDocument(
      {
        children: [
          { children: [{ text: 'Outer' }], type: 'toggle' },
          {
            children: [
              { children: [{ text: 'Nested' }], type: 'summary' },
              {
                children: [{ text: 'Body' }],
                indent: 0,
                type: 'paragraph',
              },
            ],
            indent: 1,
            type: 'details',
          },
        ],
      },
      { editor, migrations }
    ).document;

    expect(() => editor.read.schema.assertDocument(result)).not.toThrow();
    expect(result.children[0].children[1]?.children[1]).not.toHaveProperty(
      'indent'
    );
  });

  it('converts Toggles in named roots and fails closed on unsafe input', () => {
    const { editor, migrations } = createMigrationEditor(54);
    const converted = migrateDocument(
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        roots: {
          sidebar: [
            { children: [{ text: 'Title' }], type: 'toggle' },
            {
              children: [{ text: 'Body' }],
              indent: 1,
              type: 'paragraph',
            },
          ],
        },
      },
      { editor, migrations }
    ).document;

    expect(converted.roots?.sidebar).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);

    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [{ text: 'Title' }],
              mystery: true,
              type: 'toggle',
            },
          ],
        },
        { editor, migrations }
      )
    ).toThrow(/neither Details nor Summary owns property "mystery"/);

    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [{ text: 'Title' }],
              indent: Number.NaN,
              type: 'toggle',
            },
          ],
        },
        { editor, migrations }
      )
    ).toThrow(/indentation must be finite/);

    const missingMigrations = defineDocumentMigrations(MigrationSchema, {
      steps: { 55: migratePlateV55 },
      unversioned: 54,
    });
    const missingEditor = createEditor({
      migrations: missingMigrations,
      plugins: [BaseParagraphPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });

    expect(() =>
      migrateDocument(
        {
          children: [{ children: [{ text: 'Title' }], type: 'toggle' }],
        },
        { editor: missingEditor, migrations: missingMigrations }
      )
    ).toThrow(/Details and DetailsSummary must be installed/);
  });
});
