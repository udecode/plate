import {
  BaseParagraphPlugin,
  createEditor,
  type BasePluginInput,
  defineBasePlugin,
  defineDocumentMigrations,
  migrateDocument,
} from 'platejs';
import { ElementApi, PathApi, property, schema, target } from 'plitejs';

import { BaseHeadingPlugin } from '../features/basic-nodes';
import { BaseCodeBlockPlugin } from '../features/code-block';
import { BaseListPlugin } from '../features/list';
import {
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from '../features/media';
import { BaseTableCellPlugin, BaseTablePlugin } from '../features/table';
import { migratePlateV54 } from './index';
import {
  V53_ELEMENT_TYPE_OWNERS,
  V53_FIRST_PARTY_IDENTITIES,
  V53_PROFILE_SOURCE,
} from './v53-manifest';

const MigrationSchema = { id: 'plate', version: 54 } as const;
const migrationPlan = defineDocumentMigrations(MigrationSchema, {
  steps: { 54: migratePlateV54 },
  unversioned: 53,
});

const elementPlugin = (name: string) =>
  defineBasePlugin(name, {
    schema: { element: schema.element.textBlock() },
  });

const migrationPlugins: BasePluginInput[] = [
  ...new Set(
    Object.values(V53_ELEMENT_TYPE_OWNERS).filter(
      (type) => type !== 'paragraph'
    )
  ),
].map(elementPlugin);
migrationPlugins.push(
  defineBasePlugin('script', {
    schema: { mark: property.enum(['sub', 'sup'] as const) },
  })
);

const createMigrationEditor = () =>
  createEditor({
    migrations: migrationPlan,
    plugins: migrationPlugins,
    schema: MigrationSchema,
    skipInitialization: true,
  });

describe('migratePlateV54 profile', () => {
  it('covers every v53 first-party element identity rename', () => {
    const editor = createMigrationEditor();
    const input = {
      children: Object.keys(V53_ELEMENT_TYPE_OWNERS)
        .filter((type) => type !== 'th')
        .map((type) => ({
          children: [{ text: type }],
          type,
        })),
    };
    const result = migrateDocument(input, {
      editor,
      migrations: migrationPlan,
    }).document;

    expect(result.children.map(({ type }) => type)).toEqual(
      Object.entries(V53_ELEMENT_TYPE_OWNERS)
        .filter(([type]) => type !== 'th')
        .map(([, innerTarget]) => innerTarget)
    );
  });

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
    const editor = createMigrationEditor();
    const result = migrateDocument(
      {
        children: [
          {
            align: 'center',
            children: [{ subscript: true, text: 'header' }],
            type: 'th',
          },
        ],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]).toEqual({
      children: [{ script: 'sub', text: 'header' }],
      header: true,
      textAlign: 'center',
      type: 'tableCell',
    });
  });

  it('preserves nested domain JSON and fails property collisions closed', () => {
    const editor = createMigrationEditor();
    const metadata = { nested: { align: 'domain', type: 'p' } };
    const result = migrateDocument(
      {
        children: [{ children: [{ text: '' }], metadata, type: 'p' }],
      },
      { editor, migrations: migrationPlan }
    ).document;

    expect(result.children[0]?.metadata).toBe(metadata);
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
    const CurrentElementPlugin = defineBasePlugin('currentElement', {
      schema: {
        element: schema.element.textBlock({
          properties: { align: property.string() },
        }),
      },
    });
    const CurrentSubscriptPlugin = defineBasePlugin('currentSubscript', {
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
        ...migrationPlugins,
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

    expect(result.document).toBe(document);
  });

  it('does not reinterpret properties on custom element types', () => {
    const CustomChartPlugin = defineBasePlugin('chart', {
      schema: { element: schema.element.textBlock() },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [...migrationPlugins, CustomChartPlugin],
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

    expect(result.document).toBe(document);
  });

  it('preserves canonical-looking list properties on custom elements', () => {
    const CustomStepPlugin = defineBasePlugin('step', {
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
      plugins: [...migrationPlugins, CustomStepPlugin],
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
    ).toBe(document);
  });

  it('does not reinterpret a legacy alias claimed by the current schema', () => {
    const CustomLegacyPlugin = defineBasePlugin('customLegacy', {
      schema: {
        element: {
          ...schema.element.textBlock(),
          type: 'p',
        },
      },
    });
    const editor = createEditor({
      migrations: migrationPlan,
      plugins: [...migrationPlugins, CustomLegacyPlugin],
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

    expect(result.document).toBe(document);
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

    expect(result.document).toBe(document);
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
        children: [{ children: [{ text: 'const x = 1' }], type: 'codeLine' }],
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
    const QuotePlugin = defineBasePlugin('blockquote', {
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
    const CellSizePlugin = defineBasePlugin('cellSize', {
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
      columnWidths: [80, 0],
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

  it('normalizes derived starts across configured page traversal', () => {
    const PagePlugin = defineBasePlugin('page', {
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
      migrations: migrationPlan,
      plugins: [
        PagePlugin,
        BaseListPlugin.configure({
          initialState: {
            getSiblingListOptions: {
              getPreviousEntry: ([, path], state) => {
                if (PathApi.hasPrevious(path)) {
                  return state.nodes.get(PathApi.previous(path), {
                    match: ElementApi.isElement,
                  });
                }
                if (path[0] === 0) return undefined;

                const pagePath = [path[0] - 1];
                const page = state.nodes.get(pagePath, {
                  match: ElementApi.isElement,
                })?.[0];
                const child = page?.children.at(-1);

                return page && child && ElementApi.isElement(child)
                  ? [child, [...pagePath, page.children.length - 1]]
                  : undefined;
              },
            },
          },
        }),
      ],
      schema: MigrationSchema,
      skipInitialization: true,
    });
    const page = (text: string, listStart: number) => ({
      children: [
        {
          children: [{ text }],
          indent: 1,
          listStart,
          listStyleType: 'decimal',
          type: 'p',
        },
      ],
      type: 'page',
    });
    const result = migrateDocument(
      { children: [page('One', 1), page('Two', 2)] },
      { editor, migrations: migrationPlan }
    ).document;
    const secondPage = result.children[1];
    const secondItem = ElementApi.isElement(secondPage)
      ? secondPage.children[0]
      : undefined;

    expect(secondItem).toMatchObject({ listType: 'numbered' });
    expect(secondItem).not.toHaveProperty('listStart');
  });

  it('preserves boundaries when custom page traversal does not continue', () => {
    const PagePlugin = defineBasePlugin('page', {
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
      migrations: migrationPlan,
      plugins: [
        PagePlugin,
        BaseListPlugin.configure({
          initialState: {
            getSiblingListOptions: {
              getPreviousEntry: () => undefined,
            },
          },
        }),
      ],
      schema: MigrationSchema,
      skipInitialization: true,
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
});
