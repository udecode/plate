import {
  BaseParagraphPlugin,
  type BasePluginInput,
  createEditor as createProductEditor,
  definePlugin,
} from 'platejs';

import { ElementApi, property, schema, target } from '../core';
import { BaseHeadingPlugin } from '../features/basic-nodes';
import { BaseCodeBlockPlugin } from '../features/code-block';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../features/details';
import { BaseListPlugin } from '../features/list';
import {
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from '../features/media';
import { BaseTableCellPlugin, BaseTablePlugin } from '../features/table';
import { registerFirstPartyPlugin } from '../internal/plugin/firstPartyPlugin';
import {
  defineDocumentMigrations,
  type DocumentMigrations,
  migrateDocument as runDocumentMigration,
} from './documentMigrations';
import { migrateV54 } from './migratePlateV54';
import {
  V53_ELEMENT_TYPE_OWNERS,
  V53_FIRST_PARTY_IDENTITIES,
  V53_PROFILE_SOURCE,
} from './v53-manifest.internal';

const MigrationSchema = { id: 'plate', version: 54 } as const;

const elementPlugin = (name: string) =>
  definePlugin(name, {
    schema: { element: schema.element.textBlock() },
  });

const firstPartyStandIns: BasePluginInput[] = [
  ...new Set(
    Object.values(V53_ELEMENT_TYPE_OWNERS).filter(
      (type) => type !== 'paragraph'
    )
  ),
].map(elementPlugin);
firstPartyStandIns.push(
  definePlugin('script', {
    schema: { mark: property.enum(['sub', 'sup'] as const) },
  })
);
firstPartyStandIns.forEach(registerFirstPartyPlugin);

const defineV54Migrations = (plugins: readonly BasePluginInput[]) =>
  defineDocumentMigrations({
    plugins,
    schema: MigrationSchema,
    sourceFingerprints: { 53: 'plate-v53' },
    steps: { 54: migrateV54 },
  });

const migrationPlan = defineV54Migrations(firstPartyStandIns);

const createEditor = ({
  plugins = firstPartyStandIns,
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
    plugins: firstPartyStandIns,
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
      plugins: [BaseTablePlugin, firstPartyStandIns.at(-1)!],
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
        ...firstPartyStandIns,
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
      plugins: [
        ...firstPartyStandIns,
        CustomChartPlugin,
        CustomSubscriptPlugin,
      ],
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
      plugins: [...firstPartyStandIns, CustomStepPlugin],
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
      ...firstPartyStandIns,
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
      plugins: [
        ...firstPartyStandIns,
        CustomLegacyPlugin,
        CustomSubscriptPlugin,
      ],
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
