import { BaseParagraphPlugin, createEditor, definePlugin } from 'platejs';

import { type Element, property, schema, target } from '../core';
import { BaseExcalidrawPlugin } from '../excalidraw';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
} from '../features/basic-styles';
import { BaseDatePlugin } from '../features/date';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../features/details';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '../features/footnote';
import { BaseIndentPlugin } from '../features/indent';
import {
  BaseColumnGroupPlugin,
  BaseColumnItemPlugin,
} from '../features/layout';
import { BaseListPlugin } from '../features/list';
import {
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
} from '../features/media';
import { BaseMentionPlugin } from '../features/mention';
import { BaseTablePlugin } from '../features/table';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../math';
import { LineHeightPlugin } from '../react/features/basic-styles/BasicStylePlugins';
import {
  defineDocumentMigrations,
  type DocumentMigrations,
  migrateDocument as runDocumentMigration,
} from './documentMigrations';
import { migrateV54 } from './index';

const MigrationSchema = { id: 'plate', version: 54 } as const;
const DetailsIdPlugin = definePlugin('detailsId', {
  schema: {
    properties: {
      id: schema.elementProperty(property.string(), {
        target: target.element(BaseDetailsPlugin),
      }),
    },
  },
});
const SidebarPlugin = definePlugin('sidebar', {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      contentRoots: {
        body: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  }),
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
  BaseColumnGroupPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseExcalidrawPlugin,
  BaseTablePlugin,
  BaseIndentPlugin.configure({
    targetPlugins: [
      BaseParagraphPlugin,
      BaseDetailsPlugin,
      BaseExcalidrawPlugin,
    ],
  }),
  BaseListPlugin.configure({
    targetPlugins: [BaseParagraphPlugin, BaseDetailsPlugin],
  }),
  BaseTextAlignPlugin.configure({
    targetPlugins: [BaseParagraphPlugin, BaseDetailsSummaryPlugin],
  }),
  DetailsIdPlugin,
] as const;

const createMigrationEditor = () => {
  const migrations = defineDocumentMigrations({
    plugins,
    schema: MigrationSchema,
    steps: { 54: migrateV54 },
  });
  const editor = createEditor({
    plugins,
    schema: MigrationSchema,
    skipInitialization: true,
  });

  return { editor, migrations };
};

const migrateDocument = (
  input: unknown,
  options: Readonly<{
    editor?: unknown;
    migrations: DocumentMigrations;
  }>
) =>
  runDocumentMigration(input, {
    migrations: options.migrations,
    ...(!input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    !Object.hasOwn(input, 'document')
      ? { source: 53 as const }
      : {}),
  }).output;

describe('migratePlateV54 AST contracts', () => {
  it('migrates every accepted AST contract and fits the v54 schema', () => {
    const { editor, migrations } = createMigrationEditor();
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
    expect(result.children[0]).toMatchObject({
      indent: 2,
      listRestart: -2,
      listStart: 1,
      listType: 'numbered',
      type: 'paragraph',
    });
    expect(result.children[0]?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'date', value: 'sometime next week' }),
        expect.objectContaining({
          label: 'Ada',
          ref: 'user:42',
          type: 'mention',
        }),
        expect.objectContaining({ latex: 'E = mc^2', type: 'inlineEquation' }),
      ])
    );
    expect(result.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ref: '1', type: 'footnoteDefinition' }),
        expect.objectContaining({ latex: 'x^2', type: 'equation' }),
        expect.objectContaining({ naturalWidth: 640, type: 'image' }),
        expect.objectContaining({ name: 'report.pdf', type: 'file' }),
        expect.objectContaining({ type: 'mediaEmbed' }),
        expect.objectContaining({
          columnWidths: [80, null],
          type: 'table',
        }),
      ])
    );
  });

  it('runs the complete v53-to-v54 migration in one step', () => {
    const { editor, migrations } = createMigrationEditor();
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
    expect(result.children[0]).toMatchObject({
      listStart: -3,
      listType: 'numbered',
      type: 'paragraph',
    });
    expect(result.children[0]?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Ada',
          ref: 'user:42',
          type: 'mention',
        }),
        expect.objectContaining({ latex: 'x', type: 'inlineEquation' }),
      ])
    );
    expect(result.children[2]).toMatchObject({
      columnWidths: [80, null],
      type: 'table',
    });
    expect(result.children[1]).not.toHaveProperty('listRestart');
  });

  it('fails closed when legacy and destination fields conflict', () => {
    const { editor, migrations } = createMigrationEditor();

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
    const { editor, migrations } = createMigrationEditor();
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

    expect(migrateDocument(document, { editor, migrations }).document).toEqual(
      document
    );
  });

  it('drops nonpositive legacy layout widths', () => {
    const { editor, migrations } = createMigrationEditor();
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
    const { editor, migrations } = createMigrationEditor();
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
    const { editor, migrations } = createMigrationEditor();
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

    expect(result.children[0]?.children[1]).toMatchObject({
      label: 'Ada',
      ref: '42',
      type: 'mention',
    });

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

    expect(preserved.children[0]?.children[1]).toMatchObject({
      label: 'Ada',
      ref: 'user:42',
      type: 'mention',
    });

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

    expect(hybrid.children[0]?.children[1]).toMatchObject({
      label: 'Ada',
      ref: 'user:42',
      type: 'mention',
    });
  });

  it('allocates collision-free unresolved footnote refs', () => {
    const { editor, migrations } = createMigrationEditor();
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

    expect(result.children[0]?.children[1]).toMatchObject({
      ref: 'unresolved:main.0.children.0:1',
      type: 'footnoteReference',
    });
    expect(result.children[1]).toMatchObject({
      ref: 'unresolved:main.0.children.0',
      type: 'footnoteDefinition',
    });
  });

  it('recovers usable legacy values over empty destination fields', () => {
    const { editor, migrations } = createMigrationEditor();
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

    expect(result.children[0]?.children[1]).toMatchObject({
      type: 'date',
      value: 'next week',
    });
    expect(result.children[0]?.children[3]).toMatchObject({
      label: 'Ada',
      ref: 'user:42',
      type: 'mention',
    });
    expect(result.children[0]?.children[5]).toMatchObject({
      latex: 'x',
      type: 'inlineEquation',
    });
  });

  describe('v1 dates', () => {
    // Bun tests run in UTC when TZ is unset, and deleting TZ stops Bun from
    // applying a later change, so restore a value instead.
    const originalTimeZone = process.env.TZ ?? 'UTC';

    afterEach(() => {
      process.env.TZ = originalTimeZone;
    });

    const migrateDate = (properties: Readonly<Record<string, string>>) =>
      migrateDocument(
        {
          children: [
            {
              children: [
                { children: [{ text: '' }], type: 'date', ...properties },
              ],
              type: 'paragraph',
            },
          ],
        },
        { migrations: createMigrationEditor().migrations }
      ).document.children[0]?.children;

    it('converts a v1 toDateString date into a day', () => {
      expect(migrateDate({ date: 'Mon Mar 23 2026' })).toMatchObject([
        {},
        { type: 'date', value: '2026-03-23' },
        {},
      ]);
    });

    it('keeps a v1 rawDate as written', () => {
      expect(migrateDate({ rawDate: 'Mon Mar 23 2026' })).toMatchObject([
        {},
        { type: 'date', value: 'Mon Mar 23 2026' },
        {},
      ]);
    });

    it('keeps a v1 date naming an impossible day as written', () => {
      expect(migrateDate({ date: 'Fri Feb 30 2026' })).toMatchObject([
        {},
        { type: 'date', value: 'Fri Feb 30 2026' },
        {},
      ]);
    });

    it('keeps a v1 date that is already a day', () => {
      expect(migrateDate({ date: '2026-03-24' })).toMatchObject([
        {},
        { type: 'date', value: '2026-03-24' },
        {},
      ]);
    });

    it('accepts a value equal to the raw v1 date and stores the day', () => {
      expect(
        migrateDate({ date: 'Mon Mar 23 2026', value: 'Mon Mar 23 2026' })
      ).toMatchObject([{}, { type: 'date', value: '2026-03-23' }, {}]);
    });

    it('converts a day the host zone skipped', () => {
      process.env.TZ = 'Pacific/Apia';

      expect(migrateDate({ date: 'Fri Dec 30 2011' })).toMatchObject([
        {},
        { type: 'date', value: '2011-12-30' },
        {},
      ]);
    });
  });

  it('sanitizes malformed legacy border descriptors', () => {
    const { editor, migrations } = createMigrationEditor();
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
    const { editor, migrations } = createMigrationEditor();
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

  it('drops a legacy drawing width the target does not declare', () => {
    const { editor, migrations } = createMigrationEditor();
    const result = migrateDocument(
      {
        children: [
          { children: [{ text: '' }], type: 'excalidraw', width: '50%' },
        ],
      },
      { editor, migrations }
    ).document;

    expect(result.children).toEqual([
      { children: [{ text: '' }], type: 'excalidraw' },
    ]);
  });

  it('keeps a drawing width the target declares only outside the primary root', () => {
    const SidebarDrawingWidthPlugin = definePlugin('sidebarDrawingWidth', {
      schema: {
        properties: {
          width: schema.elementProperty(property.string(), {
            target: target.and(
              target.element(BaseExcalidrawPlugin),
              target.not(target.root())
            ),
          }),
        },
      },
    });
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, SidebarPlugin, SidebarDrawingWidthPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const sidebar = {
      childRoots: { body: 'sidebar' },
      children: [{ text: '' }],
      type: 'sidebar',
    };
    const drawing = {
      children: [{ text: '' }],
      type: 'excalidraw',
      width: '50%',
    };
    const result = migrateDocument(
      { children: [sidebar, drawing], roots: { sidebar: [drawing] } },
      { migrations }
    ).document;

    expect(result).toEqual({
      children: [sidebar, { children: [{ text: '' }], type: 'excalidraw' }],
      roots: { sidebar: [drawing] },
    });
  });

  it('converts stored line heights to numbers and drops the ones it cannot read', () => {
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, BaseLineHeightPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const stored = [
      '107%',
      '133.3%',
      '1.38',
      '150%',
      '1.5em',
      'normal',
      '12pt',
      0,
      -1,
    ];
    const result = migrateDocument(
      {
        children: stored.map((lineHeight) => ({
          children: [{ text: String(lineHeight) }],
          lineHeight,
          type: 'p',
        })),
      },
      { migrations }
    ).document;

    expect(
      result.children.map((block) =>
        Object.hasOwn(block, 'lineHeight') ? block.lineHeight : 'dropped'
      )
    ).toEqual([
      1.07,
      1.333,
      1.38,
      1.5,
      1.5,
      'dropped',
      'dropped',
      'dropped',
      'dropped',
    ]);
  });

  it('converts a stored line height outside the primary root', () => {
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, SidebarPlugin, BaseLineHeightPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const sidebar = {
      childRoots: { body: 'sidebar' },
      children: [{ text: '' }],
      type: 'sidebar',
    };
    const result = migrateDocument(
      {
        children: [sidebar],
        roots: {
          sidebar: [
            { children: [{ text: 'note' }], lineHeight: '115%', type: 'p' },
          ],
        },
      },
      { migrations }
    ).document;

    expect(result.roots).toEqual({
      sidebar: [
        { children: [{ text: 'note' }], lineHeight: 1.15, type: 'paragraph' },
      ],
    });
  });

  it('converts layout values only on properties the layout plugins declare', () => {
    const ChartPlugin = definePlugin('chart', {
      schema: {
        element: schema.element.textBlock({
          properties: {
            indent: property.string(),
            lineHeight: property.string(),
            listStart: property.string(),
            textAlign: property.string(),
          },
        }),
      },
    });
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, BaseLineHeightPlugin, ChartPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const chart = {
      children: [{ text: 'chart' }],
      indent: 'wide',
      lineHeight: '150%',
      listStart: 'seven',
      textAlign: 'domain',
      type: 'chart',
    };
    const result = migrateDocument(
      {
        children: [
          chart,
          { children: [{ text: 'note' }], lineHeight: '150%', type: 'p' },
        ],
      },
      { migrations }
    ).document;

    expect(result.children).toEqual([
      chart,
      { children: [{ text: 'note' }], lineHeight: 1.5, type: 'paragraph' },
    ]);
  });

  it.each([
    [
      'configured',
      BaseLineHeightPlugin.configure({ targetPlugins: [BaseParagraphPlugin] }),
    ],
    ['React', LineHeightPlugin],
  ] as const)(
    'converts line heights the %s line height plugin declares',
    (_kind, lineHeightPlugin) => {
      const migrations = defineDocumentMigrations({
        plugins: [BaseParagraphPlugin, lineHeightPlugin],
        schema: MigrationSchema,
        steps: { 54: migrateV54 },
      });
      const result = migrateDocument(
        {
          children: [
            { children: [{ text: 'note' }], lineHeight: '150%', type: 'p' },
          ],
        },
        { migrations }
      ).document;

      expect(result.children).toEqual([
        { children: [{ text: 'note' }], lineHeight: 1.5, type: 'paragraph' },
      ]);
    }
  );

  it('keeps the values of an app plugin that reuses a layout plugin name', () => {
    const AppLineHeightPlugin = definePlugin('lineHeight', {
      schema: {
        properties: {
          lineHeight: schema.elementProperty(property.string(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      },
    });
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, AppLineHeightPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const result = migrateDocument(
      {
        children: [
          { children: [{ text: 'note' }], lineHeight: '150%', type: 'p' },
        ],
      },
      { migrations }
    ).document;

    expect(result.children).toEqual([
      { children: [{ text: 'note' }], lineHeight: '150%', type: 'paragraph' },
    ]);
  });

  it('refuses a migration target copied outside defineDocumentMigrations', () => {
    const migrations = defineDocumentMigrations({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
      schema: MigrationSchema,
      steps: {
        54: (context) =>
          migrateV54({ ...context, target: { ...context.target } }),
      },
    });

    expect(() =>
      migrateDocument(
        {
          children: [
            { children: [{ text: 'x' }], lineHeight: '150%', type: 'p' },
          ],
        },
        { migrations }
      )
    ).toThrow(/migration target from defineDocumentMigrations/);
  });

  it('keeps a media name the target declares only under one parent', () => {
    const ColumnImageNamePlugin = definePlugin('columnImageName', {
      schema: {
        properties: {
          name: schema.elementProperty(property.string(), {
            target: target.and(
              target.element(BaseImagePlugin),
              target.parent(target.element(BaseColumnItemPlugin))
            ),
          }),
        },
      },
    });
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, ColumnImageNamePlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const image = {
      children: [{ text: '' }],
      name: 'photo.png',
      type: 'image',
      url: 'https://example.com/photo.png',
    };
    const secondColumn = {
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
      type: 'column',
      width: '50%',
    };
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              { children: [image], type: 'column', width: '50%' },
              secondColumn,
            ],
            type: 'columnGroup',
          },
          image,
        ],
      },
      { migrations }
    ).document;

    expect(result.children).toEqual([
      {
        children: [
          { children: [image], type: 'column', width: '50%' },
          secondColumn,
        ],
        type: 'columnGroup',
      },
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://example.com/photo.png',
      },
    ]);
  });

  it('converts nested flat Toggles into semantic Details without crossing a shallower sibling', () => {
    const { editor, migrations } = createMigrationEditor();
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
    const { editor, migrations } = createMigrationEditor();
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
    const { editor, migrations } = createMigrationEditor();
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
    const { editor, migrations } = createMigrationEditor();
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

  it('keeps a drawing width the target declares under Details in a converted Toggle body', () => {
    const DetailsDrawingWidthPlugin = definePlugin('detailsDrawingWidth', {
      schema: {
        properties: {
          width: schema.elementProperty(property.string(), {
            target: target.and(
              target.element(BaseExcalidrawPlugin),
              target.parent(target.element(BaseDetailsPlugin))
            ),
          }),
        },
      },
    });
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, DetailsDrawingWidthPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const result = migrateDocument(
      {
        children: [
          { children: [{ text: 'Title' }], type: 'toggle' },
          {
            children: [{ text: '' }],
            indent: 1,
            type: 'excalidraw',
            width: '50%',
          },
          { children: [{ text: '' }], type: 'excalidraw', width: '50%' },
        ],
      },
      { migrations }
    ).document;

    expect(result.children).toEqual([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          {
            children: [{ text: '' }],
            indent: 0,
            type: 'excalidraw',
            width: '50%',
          },
        ],
        type: 'details',
      },
      { children: [{ text: '' }], type: 'excalidraw' },
    ]);
  });

  it('converts a Toggle outside the primary root whose Details property is root-scoped and summary property is Details-scoped', () => {
    const ScopedTogglePropertiesPlugin = definePlugin(
      'scopedToggleProperties',
      {
        schema: {
          properties: {
            accent: schema.elementProperty(property.string(), {
              target: target.and(
                target.element(BaseDetailsPlugin),
                target.not(target.root())
              ),
            }),
            heading: schema.elementProperty(property.string(), {
              target: target.and(
                target.element(BaseDetailsSummaryPlugin),
                target.parent(target.element(BaseDetailsPlugin))
              ),
            }),
          },
        },
      }
    );
    const migrations = defineDocumentMigrations({
      plugins: [...plugins, SidebarPlugin, ScopedTogglePropertiesPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const result = migrateDocument(
      {
        children: [
          {
            childRoots: { body: 'sidebar' },
            children: [{ text: '' }],
            type: 'sidebar',
          },
        ],
        roots: {
          sidebar: [
            {
              accent: 'blue',
              children: [{ text: 'Title' }],
              heading: 'h3',
              type: 'toggle',
            },
          ],
        },
      },
      { migrations }
    ).document;

    expect(result.roots).toEqual({
      sidebar: [
        {
          accent: 'blue',
          children: [
            { children: [{ text: 'Title' }], heading: 'h3', type: 'summary' },
          ],
          type: 'details',
        },
      ],
    });
  });

  it('rejects undeclared roots and fails closed on unsafe Toggle input', () => {
    const { editor, migrations } = createMigrationEditor();
    expect(() =>
      migrateDocument(
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
      )
    ).toThrow(/Undeclared editor root "sidebar"/);

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
    ).toThrow(/JSON-compatible data/);

    const missingMigrations = defineDocumentMigrations({
      plugins: [BaseParagraphPlugin],
      schema: MigrationSchema,
      steps: { 54: migrateV54 },
    });
    const missingEditor = createEditor({
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
