import { migratePlateAstIdentities, PLUGINS } from './plate-keys';

describe('PLUGINS', () => {
  it('publishes first-party capability names', () => {
    expect(PLUGINS.paragraph).toBe('paragraph');
    expect(PLUGINS.bold).toBe('bold');
  });
});

describe('migratePlateAstIdentities', () => {
  const migration = {
    properties: { align: 'textAlign' },
    types: {
      a: 'link',
      code_block: 'codeBlock',
      code_drawing: 'codeDrawing',
      code_line: 'codeLine',
      code_syntax: 'codeSyntax',
      column_group: 'columnGroup',
      emoji_input: 'emojiInput',
      hr: 'horizontalRule',
      img: 'image',
      inline_equation: 'inlineEquation',
      li: 'listItem',
      lic: 'listItemContent',
      media_embed: 'mediaEmbed',
      mention_input: 'mentionInput',
      ol: 'numberedList',
      p: 'paragraph',
      search_highlight: 'searchHighlight',
      slash_input: 'slashInput',
      td: 'tableCell',
      th: 'tableCell',
      tr: 'tableRow',
      action_item: 'todoList',
      ul: 'bulletedList',
    },
  } as const;

  it('covers the exact 23 first-party persisted type migrations', () => {
    const legacyTypes = Object.keys(migration.types);
    const result = migratePlateAstIdentities(
      legacyTypes.map((type) => ({ children: [{ text: type }], type })),
      migration
    );

    expect(legacyTypes).toHaveLength(23);
    expect(result.map((node) => node.type)).toEqual(
      legacyTypes.map(
        (type) => migration.types[type as keyof typeof migration.types]
      )
    );
  });

  it('migrates primary and named roots without touching nested domain JSON', () => {
    const metadata = {
      nested: { align: 'domain', type: 'code_block' },
    };
    const input = {
      children: [
        {
          align: 'center',
          children: [
            {
              children: [{ text: 'link' }],
              metadata,
              type: 'a',
              url: '/docs',
            },
          ],
          type: 'p',
        },
      ],
      meta: { schema: 1 },
      roots: {
        header: [{ children: [{ text: 'code' }], type: 'code_block' }],
      },
    } as const;

    const result = migratePlateAstIdentities(input, migration);

    expect(result).toEqual({
      children: [
        {
          children: [
            {
              children: [{ text: 'link' }],
              metadata,
              type: 'link',
              url: '/docs',
            },
          ],
          textAlign: 'center',
          type: 'paragraph',
        },
      ],
      meta: { schema: 1 },
      roots: {
        header: [{ children: [{ text: 'code' }], type: 'codeBlock' }],
      },
    });
    expect(result.children[0]?.children[0]?.metadata).toBe(metadata);
    expect(input.children[0]).toHaveProperty('align');
  });

  it('reports old/new property collisions with root and path', () => {
    expect(() =>
      migratePlateAstIdentities(
        {
          children: [],
          roots: {
            header: [
              {
                align: 'left',
                children: [{ text: '' }],
                textAlign: 'right',
                type: 'p',
              },
            ],
          },
        },
        migration
      )
    ).toThrow(/root "header" path \[0\].*"align".*"textAlign"/);
  });

  it('reports collisions between two migrated property keys', () => {
    expect(() =>
      migratePlateAstIdentities(
        [{ children: [{ text: 'script', sub: true, sup: true }], type: 'p' }],
        {
          properties: { sub: 'script', sup: 'script' },
          types: {},
        }
      )
    ).toThrow(/root "main" path \[0, 0\].*target "script"/);
  });
});
