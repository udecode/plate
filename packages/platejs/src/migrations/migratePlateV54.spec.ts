import {
  BaseParagraphPlugin,
  type BasePluginInput,
  createEditor as createProductEditor,
  definePlugin,
  type PersistedDocumentInput,
} from 'platejs';

import { ElementApi, property, schema, target } from '../core';
import {
  BaseBoldPlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseScriptPlugin,
} from '../features/basic-nodes';
import { BaseCodeBlockPlugin } from '../features/code-block';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../features/details';
import { BaseFootnotePlugin } from '../features/footnote';
import { BaseColumnGroupPlugin } from '../features/layout';
import { BaseLinkPlugin } from '../features/link';
import { BaseListPlugin } from '../features/list';
import {
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../features/media';
import { BaseTableCellPlugin, BaseTablePlugin } from '../features/table';
import { BaseInlineEquationPlugin } from '../math';
import {
  defineDocumentMigrations,
  type DocumentMigrations,
  migrateDocument as runDocumentMigration,
} from './documentMigrations';
import { migrateV54 } from './migratePlateV54';
import {
  V53_FIRST_PARTY_IDENTITIES,
  V53_PROFILE_SOURCE,
} from './v53-manifest.internal';

const MigrationSchema = { id: 'plate', version: 54 } as const;

const builtInPlugins: BasePluginInput[] = [
  BaseCodeBlockPlugin,
  BaseColumnGroupPlugin,
  BaseFootnotePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseImagePlugin,
  BaseInlineEquationPlugin,
  BaseLinkPlugin,
  BaseMediaEmbedPlugin,
  BaseScriptPlugin,
  BaseTablePlugin,
];

const defineV54Migrations = (plugins: readonly BasePluginInput[]) =>
  defineDocumentMigrations({
    plugins,
    schema: MigrationSchema,
    sourceFingerprints: { 53: 'plate-v53' },
    steps: { 54: migrateV54 },
  });

const migrationPlan = defineV54Migrations(builtInPlugins);

const createEditor = ({
  plugins = builtInPlugins,
}: Readonly<{
  plugins?: readonly BasePluginInput[];
  [key: string]: unknown;
}>) => ({
  migrations: defineV54Migrations(plugins),
});

const migrateDocument = (
  input: unknown,
  options: Readonly<{
    editor?: Readonly<{ migrations: DocumentMigrations }>;
    migrations: DocumentMigrations;
  }>
) =>
  runDocumentMigration(input, {
    migrations: options.editor?.migrations ?? options.migrations,
    ...(!input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    !Object.hasOwn(input, 'document')
      ? { source: 53 as const }
      : {}),
  }).output;

const createMigrationEditor = () =>
  createEditor({
    plugins: builtInPlugins,
  });

describe('migratePlateV54 profile', () => {
  it('classifies every first-party v53 identity exactly once', () => {
    expect(V53_PROFILE_SOURCE).toEqual({
      commit: '2f87593f95',
      packageVersion: '53.3.6',
    });
    expect(V53_FIRST_PARTY_IDENTITIES).toHaveLength(54);
    expect(
      new Set(V53_FIRST_PARTY_IDENTITIES.map(({ identity }) => identity)).size
    ).toBe(54);
  });

  it('preserves table header semantics and migrates marks and properties', () => {
    const editor = createEditor({
      plugins: [BaseTablePlugin, BaseScriptPlugin],
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ subscript: true, text: 'header' }],
            type: 'th',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [{ script: 'sub', text: 'header' }],
                  type: 'paragraph',
                },
              ],
              header: true,
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    });
  });

  it('fails property collisions closed', () => {
    const editor = createMigrationEditor();
    expect(() =>
      migrateDocument(
        {
          children: [
            {
              align: 'left',
              children: [{ text: '' }],
              textAlign: 'right',
              type: 'p',
            },
          ],
        },
        { editor, migrations: migrationPlan }
      )
    ).toThrow(/properties "align" and "textAlign" are both present/);
  });

  it('preserves legacy-looking properties owned by the current schema', () => {
    const CurrentElementPlugin = definePlugin('currentElement', {
      schema: {
        element: schema.element.textBlock({
          properties: { align: property.string() },
        }),
      },
    });
    const CurrentSubscriptPlugin = definePlugin('currentSubscript', {
      schema: {
        mark: {
          key: 'subscript',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [
        ...builtInPlugins,
        CurrentElementPlugin,
        CurrentSubscriptPlugin,
      ],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const document = {
      children: [
        {
          align: 'domain',
          children: [{ subscript: true, text: 'current' }],
          type: 'currentElement',
        },
      ],
    } as const;
    const result = migrateDocument(document, {
      editor,
      migrations: migrationPlan,
    });

    expect(result.document).toEqual(document);
  });

  it('does not reinterpret properties on custom element types', () => {
    const CustomChartPlugin = definePlugin('chart', {
      schema: {
        element: schema.element.textBlock({
          properties: { align: property.string() },
        }),
      },
    });
    const CustomSubscriptPlugin = definePlugin('customSubscript', {
      schema: {
        mark: {
          key: 'subscript',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [...builtInPlugins, CustomChartPlugin, CustomSubscriptPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const document = {
      children: [
        {
          align: 'domain',
          children: [{ subscript: true, text: 'custom' }],
          type: 'chart',
        },
      ],
    } as const;
    const result = migrateDocument(document, {
      editor,
      migrations: migrationPlan,
    });

    expect(result.document).toEqual(document);
  });

  it('preserves canonical-looking list properties on custom elements', () => {
    const CustomStepPlugin = definePlugin('step', {
      schema: {
        element: schema.element.textBlock({
          properties: {
            indent: property.number(),
            listStart: property.number(),
            listType: property.string(),
          },
        }),
      },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [...builtInPlugins, CustomStepPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const document = {
      children: [
        {
          children: [{ text: 'Seven' }],
          indent: 1,
          listStart: 7,
          listType: 'numbered',
          type: 'step',
        },
        {
          children: [{ text: 'Eight' }],
          indent: 1,
          listStart: 8,
          listType: 'numbered',
          type: 'step',
        },
      ],
    } as const;

    expect(
      migrateDocument(document, {
        editor,
        migrations: migrationPlan,
      }).document
    ).toEqual(document);
  });

  it('keeps a list style an app declares only outside the primary root', () => {
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
    const SidebarListStylePlugin = definePlugin('sidebarListStyle', {
      schema: {
        properties: {
          listStyleType: schema.elementProperty(property.string(), {
            target: target.not(target.root()),
          }),
        },
      },
    });
    const migrations = defineV54Migrations([
      ...builtInPlugins,
      BaseListPlugin,
      SidebarPlugin,
      SidebarListStylePlugin,
    ]);
    const sidebar = {
      childRoots: { body: 'sidebar' },
      children: [{ text: '' }],
      type: 'sidebar',
    };
    const result = migrateDocument(
      {
        children: [
          sidebar,
          {
            children: [{ text: 'main' }],
            listStyleType: 'upper-roman',
            type: 'p',
          },
        ],
        roots: {
          sidebar: [
            {
              children: [{ text: 'note' }],
              listStyleType: 'upper-roman',
              type: 'p',
            },
          ],
        },
      },
      { migrations }
    ).document;

    expect(result).toEqual({
      children: [
        sidebar,
        {
          children: [{ text: 'main' }],
          listStyle: 'upper-roman',
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      roots: {
        sidebar: [
          {
            children: [{ text: 'note' }],
            listStyleType: 'upper-roman',
            type: 'paragraph',
          },
        ],
      },
    });
  });

  it('does not reinterpret a legacy alias claimed by the current schema', () => {
    const CustomLegacyPlugin = definePlugin('customLegacy', {
      schema: {
        element: {
          ...schema.element.textBlock({
            properties: { align: property.string() },
          }),
          type: 'p',
        },
      },
    });
    const CustomSubscriptPlugin = definePlugin('customSubscript', {
      schema: {
        mark: {
          key: 'subscript',
          property: property.boolean({ default: false, omitDefault: true }),
        },
      },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [...builtInPlugins, CustomLegacyPlugin, CustomSubscriptPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const document = {
      children: [
        {
          align: 'domain',
          children: [{ subscript: true, text: 'custom' }],
          type: 'p',
        },
      ],
    } as const;
    const result = migrateDocument(document, {
      editor,
      migrations: migrationPlan,
    });

    expect(result.document).toEqual(document);
  });

  it('is an exact structural no-op for canonical documents', () => {
    const editor = createMigrationEditor();
    const document = {
      children: [{ children: [{ text: 'current' }], type: 'paragraph' }],
    } as const;
    const result = migrateDocument(document, {
      editor,
      migrations: migrationPlan,
    });

    expect(result.document).toEqual(document);
  });

  it('migrates the complete final Plate AST profile in one pass', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [
        BaseHeadingPlugin,
        BaseCodeBlockPlugin,
        BaseTablePlugin,
        BaseListPlugin,
        BaseImagePlugin,
        BaseVideoPlugin,
        BaseFilePlugin,
      ],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          { children: [{ text: 'Heading' }], type: 'h2' },
          {
            children: [
              { children: [{ text: 'const x = 1' }], type: 'code_line' },
            ],
            lang: 'typescript',
            type: 'code_block',
          },
          {
            children: [
              {
                children: [
                  {
                    background: 'red',
                    borders: { top: { color: 'blue', size: 2 } },
                    children: [{ children: [{ text: 'A' }], type: 'p' }],
                    size: 60,
                    type: 'td',
                  },
                  {
                    children: [{ children: [{ text: 'B' }], type: 'p' }],
                    size: 100,
                    type: 'td',
                  },
                ],
                size: 36,
                type: 'tr',
              },
            ],
            type: 'table',
          },
          {
            children: [{ text: 'Four' }],
            indent: 1,
            listStart: 4,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Five' }],
            indent: 1,
            listStart: 5,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Nine' }],
            indent: 1,
            listRestart: 9,
            listStart: 6,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'One again' }],
            indent: 1,
            listRestart: 1,
            listStart: 10,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            checked: false,
            children: [{ text: 'Task' }],
            indent: 1,
            listStart: 10,
            listStyleType: 'todo',
            type: 'p',
          },
          {
            children: [{ text: '' }],
            isUpload: true,
            type: 'video',
            url: '/video.mp4',
          },
          {
            children: [{ text: '' }],
            initialHeight: 360,
            initialWidth: 640,
            isUpload: true,
            type: 'img',
            url: '/image.png',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children).toEqual([
      {
        children: [{ text: 'Heading' }],
        level: 2,
        type: 'heading',
      },
      {
        children: [{ text: 'const x = 1' }],
        language: 'typescript',
        type: 'codeBlock',
      },
      {
        children: [
          {
            children: [
              {
                backgroundColor: 'red',
                borders: { top: { color: 'blue', width: 2 } },
                children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            height: 36,
            type: 'tableRow',
          },
        ],
        columnWidths: [60, 100],
        type: 'table',
      },
      {
        children: [{ text: 'Four' }],
        indent: 1,
        listStart: 4,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Five' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nine' }],
        indent: 1,
        listRestart: 9,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'One again' }],
        indent: 1,
        listRestart: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        checked: false,
        children: [{ text: 'Task' }],
        indent: 1,
        listType: 'task',
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        provider: 'file',
        type: 'video',
        url: '/video.mp4',
      },
      {
        children: [{ text: '' }],
        naturalHeight: 360,
        naturalWidth: 640,
        type: 'image',
        url: '/image.png',
      },
    ]);
  });

  it('drops derived numbering when a sequence returns from nested indentation', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseListPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'One' }],
            indent: 1,
            listStart: 1,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Nested' }],
            indent: 2,
            listStyleType: 'disc',
            type: 'p',
          },
          {
            children: [{ text: 'Two' }],
            indent: 1,
            listStart: 2,
            listStyleType: 'decimal',
            type: 'p',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children).toMatchObject([
      { listType: 'numbered' },
      { listType: 'bulleted' },
      { listType: 'numbered' },
    ]);
    expect(result.children[2]).not.toHaveProperty('listStart');
  });

  it('keeps one non-heading list sequence across element types', () => {
    const QuotePlugin = definePlugin('blockquote', {
      schema: { element: schema.element.textBlock() },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [
        QuotePlugin,
        BaseListPlugin.configure({
          targetPlugins: [BaseParagraphPlugin, QuotePlugin],
        }),
      ],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'One' }],
            indent: 1,
            listStart: 1,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Two' }],
            indent: 1,
            listStart: 2,
            listStyleType: 'decimal',
            type: 'blockquote',
          },
          {
            children: [{ text: 'Three' }],
            indent: 1,
            listStart: 3,
            listStyleType: 'decimal',
            type: 'p',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children).toMatchObject([
      { listType: 'numbered', type: 'paragraph' },
      { listType: 'numbered', type: 'blockquote' },
      { listType: 'numbered', type: 'paragraph' },
    ]);
    expect(result.children).not.toContainEqual(
      expect.objectContaining({ listStart: expect.any(Number) })
    );
  });

  it('derives table widths from the first usable legacy row', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseTablePlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const cell = (text: string, size?: number) => ({
      children: [{ children: [{ text }], type: 'p' }],
      ...(size === undefined ? {} : { size }),
      type: 'td',
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              { children: [cell('A'), cell('B')], type: 'tr' },
              { children: [cell('C', 80), cell('D', 120)], type: 'tr' },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({
      columnWidths: [80, 120],
      type: 'table',
    });
  });

  it('preserves schema-owned cell size without skipping border migration', () => {
    const CellSizePlugin = definePlugin('cellSize', {
      schema: ({ targetElementTypes }) => ({
        properties: {
          size: schema.elementProperty(property.number(), {
            target: target.types(targetElementTypes),
          }),
        },
      }),
      targetPlugins: [BaseTableCellPlugin],
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseTablePlugin, CellSizePlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    borders: { top: { color: 'blue', size: 2 } },
                    children: [{ children: [{ text: 'A' }], type: 'p' }],
                    size: 80,
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;
    const table = result.children[0];

    expect(table).not.toHaveProperty('columnWidths');
    expect(
      ElementApi.isElement(table) ? table.children[0] : undefined
    ).toMatchObject({
      children: [
        {
          borders: { top: { color: 'blue', width: 2 } },
          size: 80,
          type: 'tableCell',
        },
      ],
    });
  });

  it('retains partial legacy table widths', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseTablePlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: 'A' }], type: 'p' }],
                    size: 80,
                    type: 'td',
                  },
                  {
                    children: [{ children: [{ text: 'B' }], type: 'p' }],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({
      columnWidths: [80, null],
      type: 'table',
    });
  });

  it('subtracts known widths before migrating a colspan total', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseTablePlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: 'A' }], type: 'p' }],
                    size: 80,
                    type: 'td',
                  },
                  {
                    children: [{ children: [{ text: 'B' }], type: 'p' }],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: 'C' }], type: 'p' }],
                    colSpan: 2,
                    size: 200,
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({
      columnWidths: [80, 120],
      type: 'table',
    });
  });

  it('places migrated widths in logical columns across row spans', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseTablePlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ children: [{ text: 'A' }], type: 'p' }],
                    rowSpan: 2,
                    size: 80,
                    type: 'td',
                  },
                  {
                    children: [{ children: [{ text: 'B' }], type: 'p' }],
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
              {
                children: [
                  {
                    children: [{ children: [{ text: 'C' }], type: 'p' }],
                    size: 120,
                    type: 'td',
                  },
                ],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({
      columnWidths: [80, 120],
      type: 'table',
    });
  });

  it('finds a fully open logical span for migrated colspans', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseTablePlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const cell = (
      text: string,
      options: { colSpan?: number; rowSpan?: number; size?: number } = {}
    ) => ({
      children: [{ children: [{ text }], type: 'p' }],
      ...options,
      type: 'td',
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [
                  cell('A', { size: 50 }),
                  cell('B', { rowSpan: 2, size: 80 }),
                  cell('C'),
                  cell('D'),
                ],
                type: 'tr',
              },
              {
                children: [cell('E', { colSpan: 2, size: 200 })],
                type: 'tr',
              },
            ],
            type: 'table',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({
      columnWidths: [50, 80, 100, 100],
      type: 'table',
    });
  });

  it('keeps the start of a numbered item that opens a page', () => {
    const PagePlugin = definePlugin('page', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
        },
      }),
    });
    const editor = createEditor({
      plugins: [PagePlugin, BaseListPlugin],
    });
    const page = (text: string, listStart?: number) => ({
      children: [
        {
          children: [{ text }],
          indent: 1,
          ...(listStart === undefined ? {} : { listStart }),
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
      type: 'page',
    });
    const result = migrateDocument(
      { children: [page('One'), page('Two', 2)] },
      { editor, migrations: migrationPlan }
    ).document;
    const secondPage = result.children[1];

    expect(
      ElementApi.isElement(secondPage) ? secondPage.children[0] : undefined
    ).toMatchObject({ listStart: 2, listType: 'numbered' });

    const live = createProductEditor({
      initialValue: result.children,
      plugins: [PagePlugin, BaseListPlugin],
    });
    const livePage = live.read.children()[1];

    expect(
      ElementApi.isElement(livePage) &&
        ElementApi.isElement(livePage.children[0])
        ? live.read.list.ordinal(livePage.children[0])
        : undefined
    ).toBe(2);
  });

  it('preserves list boundaries across page containers', () => {
    const PagePlugin = definePlugin('page', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
        },
      }),
    });
    const editor = createEditor({
      plugins: [PagePlugin, BaseListPlugin],
    });
    const page = (
      text: string,
      listStart: number,
      listRestartPolite?: number
    ) => ({
      children: [
        {
          children: [{ text }],
          indent: 1,
          ...(listRestartPolite === undefined ? {} : { listRestartPolite }),
          listStart,
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
      type: 'page',
    });
    const result = migrateDocument(
      { children: [page('One', 1), page('Two', 2, 5)] },
      { editor, migrations: migrationPlan }
    ).document;
    const secondPage = result.children[1];

    expect(secondPage).toMatchObject({
      children: [{ listType: 'numbered' }],
      type: 'page',
    });
    expect(
      ElementApi.isElement(secondPage) ? secondPage.children[0] : undefined
    ).toHaveProperty('listStart', 5);

    const separated = migrateDocument(
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'One' }],
                indent: 1,
                listStart: 1,
                listStyleType: 'decimal',
                type: 'p',
              },
              { children: [{ text: 'Break' }], type: 'p' },
            ],
            type: 'page',
          },
          {
            children: [
              { children: [{ text: 'Break' }], type: 'p' },
              {
                children: [{ text: 'Five' }],
                indent: 1,
                listStart: 5,
                listStyleType: 'decimal',
                type: 'p',
              },
            ],
            type: 'page',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;
    const separatedSecondPage = separated.children[1];

    expect(
      ElementApi.isElement(separatedSecondPage)
        ? separatedSecondPage.children[1]
        : undefined
    ).toHaveProperty('listStart', 5);
  });

  it.each([
    [
      {
        children: [{ text: '' }],
        language: 'tsx',
        lang: 'ts',
        type: 'code_block',
      },
      /properties "lang" and "language"/,
    ],
    [
      { children: [{ text: '' }], level: 1, type: 'h2' },
      /heading "h2" conflicts with level "1"/,
    ],
    [
      {
        children: [{ text: '' }],
        isUpload: true,
        provider: 'youtube',
        type: 'video',
        url: '/video.mp4',
      },
      /isUpload conflicts with provider/,
    ],
    [
      {
        children: [{ text: '' }],
        initialWidth: 640,
        naturalWidth: 320,
        type: 'img',
        url: '/image.png',
      },
      /properties "initialWidth" and "naturalWidth"/,
    ],
    [
      {
        children: [{ text: '' }],
        indent: 1,
        listStyle: 'lower-alpha',
        listStyleType: 'decimal',
        type: 'p',
      },
      /listStyleType "decimal" conflicts with listStyle "lower-alpha"/,
    ],
    [
      {
        children: [{ text: '' }],
        indent: 1,
        listStart: '6',
        listStyleType: 'decimal',
        type: 'p',
      },
      /Legacy list start .* must be a finite number/,
    ],
  ])('fails final-profile collisions closed', (node, error) => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [
        BaseHeadingPlugin,
        BaseCodeBlockPlugin,
        BaseImagePlugin,
        BaseListPlugin,
        BaseVideoPlugin,
      ],
      schema: MigrationSchema,
      skipInitialization: true,
    });

    expect(() =>
      migrateDocument(
        { children: [node] },
        { editor, migrations: migrationPlan }
      )
    ).toThrow(error);
  });

  it('omits an equivalent canonical default marker during list migration', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseListPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'One' }],
            indent: 1,
            listStyle: 'decimal',
            listStyleType: 'decimal',
            type: 'p',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({ listType: 'numbered' });
    expect(result.children[0]).not.toHaveProperty('listStyle');
  });

  it('drops zero-valued legacy restarts that v53 ignored', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseListPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'One' }],
            indent: 1,
            listStart: 1,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Two' }],
            indent: 1,
            listRestart: 0,
            listStart: 2,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Three' }],
            indent: 1,
            listRestartPolite: 0,
            listStart: 3,
            listStyleType: 'decimal',
            type: 'p',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[1]).toMatchObject({ listType: 'numbered' });
    expect(result.children[1]).not.toHaveProperty('listRestart');
    expect(result.children[1]).not.toHaveProperty('listStart');
    expect(result.children[2]).toMatchObject({ listType: 'numbered' });
    expect(result.children[2]).not.toHaveProperty('listRestart');
    expect(result.children[2]).not.toHaveProperty('listStart');
  });

  it('preserves conditional v53 restart intent independently from derived starts', () => {
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [BaseListPlugin],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const result = migrateDocument(
      {
        children: [
          {
            children: [{ text: 'Five' }],
            indent: 1,
            listStart: 5,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Six' }],
            indent: 1,
            listRestartPolite: 2,
            listStart: 6,
            listStyleType: 'decimal',
            type: 'p',
          },
          {
            children: [{ text: 'Seven' }],
            indent: 1,
            listRestart: 7,
            listStart: 7,
            listStyleType: 'decimal',
            type: 'p',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[1]).toMatchObject({
      listStart: 2,
      listType: 'numbered',
    });
    expect(result.children[1]).not.toHaveProperty('listRestart');
    expect(result.children[2]).toMatchObject({
      listRestart: 7,
      listType: 'numbered',
    });
    expect(result.children[2]).not.toHaveProperty('listStart');
  });

  it('keeps v53 starts latent beside a forced restart and on bullets and tasks', () => {
    const editor = createEditor({ plugins: [BaseListPlugin] });
    const legacyItem = (
      text: string,
      listStyleType: string,
      starts: Readonly<{ listRestart?: number; listRestartPolite?: number }>
    ) => ({
      children: [{ text }],
      indent: 1,
      listStyleType,
      type: 'p',
      ...starts,
    });
    const result = migrateDocument(
      {
        children: [
          legacyItem('Forced', 'decimal', {
            listRestart: 7,
            listRestartPolite: 2,
          }),
          { children: [{ text: 'Break' }], type: 'p' },
          legacyItem('Bullet', 'disc', { listRestart: 4 }),
          { children: [{ text: 'Break' }], type: 'p' },
          legacyItem('Task', 'todo', { listRestartPolite: 3 }),
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toMatchObject({ listRestart: 7, listStart: 2 });
    expect(result.children[2]).toMatchObject({
      listRestart: 4,
      listType: 'bulleted',
    });
    expect(result.children[4]).toMatchObject({
      listStart: 3,
      listType: 'task',
    });

    const live = createProductEditor({
      initialValue: result.children.map((child, index) =>
        index === 0 ? child : { ...child, listId: `list-${index}` }
      ),
      plugins: [BaseListPlugin],
    });
    const ordinal = (index: number) =>
      live.read.list.ordinal(live.read.children()[index]);

    expect(ordinal(0)).toBe(7);
    live.update.list.continue({ at: [0] });
    expect(ordinal(0)).toBe(2);

    live.update.list.toggle({ at: [2], type: 'numbered' });
    live.update.list.toggle({ at: [4], type: 'numbered' });
    expect([ordinal(2), ordinal(4)]).toEqual([4, 3]);
  });
});

describe('migratePlateV54 selection', () => {
  it('keeps a caret in the paragraph before a converted Toggle', () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseDetailsSummaryPlugin,
        BaseDetailsPlugin,
      ],
    });
    const result = migrateDocument(
      {
        document: {
          children: [
            { children: [{ text: 'before' }], type: 'p' },
            { children: [{ text: 'Title' }], type: 'toggle' },
            { children: [{ text: 'after' }], type: 'p' },
          ],
        },
        schema: {
          fingerprint: 'plate-v53',
          id: MigrationSchema.id,
          kind: 'named',
          version: 53,
        },
        selection: {
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
          kind: 'text',
        },
      },
      { editor, migrations: editor.migrations }
    );

    expect(result.selection).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
      kind: 'text',
    });
  });
});

type Json = Record<string, unknown>;

const readWeight = (weight: unknown) => {
  const value = String(weight).trim().toLowerCase();

  if (value === 'bold' || value === 'bolder') return 'heavy';
  if (value === 'normal' || value === 'lighter') return 'light';
  if (!/^\+?(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(value)) return null;

  const number = Number(value);

  if (number >= 1 && number <= 1000) return number >= 600 ? 'heavy' : 'light';

  return null;
};

const boldBlocks = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'th']);

const touchesWeight = (change: Json) =>
  change.key === 'fontWeight' ||
  ['properties', 'newProperties'].some((key) =>
    Object.hasOwn(change[key] ?? {}, 'fontWeight')
  );

const stripLeaf = (node: Json, mayDrawBold: boolean): Json => {
  const pending = [
    ...Object.entries(node)
      .filter(([key]) => key.startsWith('suggestion_'))
      .map(([, value]) => value as Json)
      .filter((value) => value?.type === 'update'),
    ...((Array.isArray(node.authored) ? node.authored : []) as Json[]).filter(
      (mark) => mark?.kind === 'format'
    ),
  ];

  if (
    pending.length > 0 &&
    (Object.hasOwn(node, 'fontWeight') || pending.some(touchesWeight))
  ) {
    throw new Error(
      'Settle format changes on weighted text before the upgrade.'
    );
  }
  if (!Object.hasOwn(node, 'fontWeight')) return node;

  const { bold: _bold, fontWeight, ...rest } = node;
  const weight = readWeight(fontWeight);

  if (!weight || (weight === 'light' && mayDrawBold)) {
    throw new Error('Bold cannot keep how v53 drew this font weight.');
  }

  return weight === 'heavy' ? { ...rest, bold: true } : rest;
};

const stripTree = (node: Json, mayDrawBold: boolean): Json => {
  if (typeof node.text === 'string') return stripLeaf(node, mayDrawBold);

  const inside = mayDrawBold || boldBlocks.has(node.type as string);
  const next = { ...node };

  for (const key of ['children', 'caption']) {
    if (Array.isArray(node[key])) {
      next[key] = (node[key] as Json[]).map((child) =>
        stripTree(child, inside)
      );
    }
  }

  return next;
};

const stripNode = (node: Json) => stripTree(node, false);

const stripEnvelope = (stored: Json): Json => {
  const document = { ...(stored.document as Json) };
  const selection = stored.selection as Json | null | undefined;

  const strip = (node: Json) => stripTree(node, true);

  document.children = (document.children as Json[]).map(strip);
  if (document.roots) {
    document.roots = Object.fromEntries(
      Object.entries(document.roots as Record<string, Json[]>).map(
        ([name, children]) => [name, children.map(strip)]
      )
    );
  }

  return {
    ...stored,
    document,
    ...(selection?.marks
      ? {
          selection: {
            ...selection,
            marks: stripLeaf(selection.marks as Json, true),
          },
        }
      : {}),
  };
};

describe('migratePlateV54 font weight', () => {
  const boldOnly = defineV54Migrations([
    BaseParagraphPlugin,
    BaseBoldPlugin,
    BaseImagePlugin,
  ]);
  const weighted = (leaf: Json) => [{ children: [leaf], type: 'p' }];
  const settle = 'Settle format changes on weighted text before the upgrade.';
  const v53Schema = {
    fingerprint: 'plate-v53',
    id: MigrationSchema.id,
    kind: 'named',
    version: 53,
  };

  it('refuses a saved weight in a target with only bold', () => {
    expect(() =>
      runDocumentMigration(weighted({ fontWeight: '700', text: 'x' }), {
        migrations: boldOnly,
        source: 53,
      })
    ).toThrow('Unknown text property "fontWeight" in closed editor schema.');
  });

  it('keeps every saved weight in a target that declares one', () => {
    const value = [
      {
        children: [
          { bold: true, fontWeight: '400', text: 'a' },
          { fontWeight: '800', text: 'b' },
          { fontWeight: 'bolder', text: 'c' },
        ],
        type: 'p',
      },
    ];
    const migrated = runDocumentMigration(value, {
      migrations: defineV54Migrations([
        BaseParagraphPlugin,
        BaseBoldPlugin,
        definePlugin('fontWeight', { schema: { mark: property.string() } }),
      ]),
      source: 53,
    }).output.document;

    expect(migrated.children[0].children).toEqual(value[0].children);
  });

  describe("the guide's pre-pass", () => {
    it.each([
      {
        leaf: { fontWeight: '800', text: 'x' },
        stored: { bold: true },
        title: 'turns a heavy weight into bold',
      },
      {
        leaf: { bold: true, fontWeight: '400', text: 'x' },
        stored: {},
        title: 'drops a light weight and the bold beside it',
      },
      {
        leaf: { fontWeight: ' BOLD ', text: 'x' },
        stored: { bold: true },
        title: 'reads a weight in any letter case',
      },
    ])('$title', ({ leaf, stored }) => {
      const migrated = runDocumentMigration(weighted(leaf).map(stripNode), {
        migrations: boldOnly,
        source: 53,
      }).output.document;

      expect(migrated.children[0].children).toEqual([{ ...stored, text: 'x' }]);
    });

    it.each([
      {
        node: weighted({ fontWeight: 'var(--missing-weight, 700)', text: 'x' }),
        title: 'a weight it cannot read',
      },
      {
        node: weighted({ bold: true, fontWeight: 'not-a-weight', text: 'x' }),
        title: 'an invalid weight beside bold',
      },
      {
        node: weighted({ fontWeight: '0x2bc', text: 'x' }),
        title: 'a JavaScript numeral that CSS rejects',
      },
      {
        node: [{ children: [{ fontWeight: '400', text: 'x' }], type: 'h1' }],
        title: 'a light weight inside a heading',
      },
      {
        node: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ fontWeight: 'lighter', text: 'x' }],
                    type: 'p',
                  },
                ],
                type: 'th',
              },
            ],
            type: 'tr',
          },
        ],
        title: 'a light weight inside a table header cell',
      },
    ])('refuses $title', ({ node }) => {
      expect(() => node.map(stripNode)).toThrow(
        'Bold cannot keep how v53 drew this font weight.'
      );
    });

    it('turns a heavy weight inside a heading into bold', () => {
      expect(
        stripNode({
          children: [{ fontWeight: '700', text: 'x' }],
          type: 'h1',
        })
      ).toEqual({ children: [{ bold: true, text: 'x' }], type: 'h1' });
    });

    it('converts a weighted v53 image caption', () => {
      const value = [
        {
          caption: [
            { children: [{ fontWeight: '700', text: 'cap' }], type: 'p' },
          ],
          children: [{ text: '' }],
          type: 'img',
          url: 'https://example.com/a.png',
        },
      ];
      const migrated = runDocumentMigration(value.map(stripNode), {
        migrations: boldOnly,
        source: 53,
      }).output.document;

      expect(migrated.children[0].children).toEqual([
        { bold: true, text: 'cap' },
      ]);
    });

    it('refuses a weighted leaf with a pending format change', () => {
      const value = weighted({
        bold: true,
        fontWeight: '700',
        suggestion: true,
        suggestion_b: {
          createdAt: 1,
          id: 'b',
          newProperties: { bold: true },
          properties: {},
          type: 'update',
          userId: 'alice',
        },
        text: 'x',
      });

      expect(() =>
        runDocumentMigration(value.map(stripNode), {
          migrations: boldOnly,
          source: 53,
        })
      ).toThrow(settle);
    });

    it('refuses a pending weight change on a leaf without a weight', () => {
      const stored = {
        document: {
          children: weighted({
            authored: [
              { id: 'w:fontWeight', key: 'fontWeight', kind: 'format' },
            ],
            text: 'x',
          }),
        },
        schema: v53Schema,
      };

      expect(() =>
        runDocumentMigration(stripEnvelope(stored) as PersistedDocumentInput, {
          migrations: boldOnly,
        })
      ).toThrow(settle);
    });

    it.each([
      {
        stored: {
          document: {
            children: [
              {
                children: [{ fontWeight: '400', text: 'x' }],
                level: 1,
                type: 'heading',
              },
            ],
          },
          schema: v53Schema,
        },
        title: 'a light weight in a v2 heading',
      },
      {
        stored: {
          document: {
            children: [
              { children: [{ text: 'x' }], level: 1, type: 'heading' },
            ],
          },
          schema: v53Schema,
          selection: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
            kind: 'text',
            marks: { fontWeight: '400' },
          },
        },
        title: 'a light insertion weight in a v2 heading',
      },
      {
        stored: {
          document: { children: [{ children: [{ text: 'x' }], type: 'h1' }] },
          schema: v53Schema,
          selection: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
            kind: 'text',
            marks: { fontWeight: '400' },
          },
        },
        title: 'a light insertion weight in an h1',
      },
      {
        stored: {
          document: { children: weighted({ fontWeight: '400', text: 'x' }) },
          schema: v53Schema,
        },
        title: 'a light weight in a paragraph',
      },
    ])('refuses $title in an envelope', ({ stored }) => {
      expect(() => stripEnvelope(stored)).toThrow(
        'Bold cannot keep how v53 drew this font weight.'
      );
    });

    it('converts an envelope and keeps its metadata', () => {
      const stored = {
        document: {
          children: weighted({ fontWeight: '700', text: 'x' }),
          meta: { theme: { fontWeight: '700' } },
        },
        schema: v53Schema,
        selection: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
          kind: 'text',
          marks: { fontWeight: '700' },
        },
      };
      const { output } = runDocumentMigration(
        stripEnvelope(stored) as PersistedDocumentInput,
        { migrations: boldOnly }
      );

      expect({
        meta: output.document.meta,
        selection: output.selection,
        text: output.document.children[0].children,
      }).toEqual({
        meta: { theme: { fontWeight: '700' } },
        selection: { ...stored.selection, marks: { bold: true } },
        text: [{ bold: true, text: 'x' }],
      });
    });
  });
});
