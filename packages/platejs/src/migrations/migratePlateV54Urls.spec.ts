import { AuthoredPlugin, projectAuthoredReview } from '../authored';
import {
  createEditor,
  type Descendant,
  definePlugin,
  type EditorDocumentValue,
  type Element,
  property,
  schema,
} from '../core';
import type { RuntimePluginReference } from '../facade';
import { BaseCodeBlockPlugin } from '../features/code-block';
import { BaseLinkPlugin } from '../features/link';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from '../features/media';
import {
  defineDocumentMigrations,
  migrateDocument,
} from './documentMigrations';
import { migrateV54 } from './migratePlateV54';

const MigrationSchema = { id: 'plate', version: 54 } as const;
const v53Schema = {
  fingerprint: 'plate-v53',
  id: MigrationSchema.id,
  kind: 'named',
  version: 53,
} as const;
const urlPlugins = [
  BaseAudioPlugin,
  BaseCodeBlockPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseLinkPlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
] as const;

const defineV54Migrations = (plugins: readonly RuntimePluginReference[]) =>
  defineDocumentMigrations({
    plugins,
    schema: MigrationSchema,
    sourceFingerprints: { 53: 'plate-v53' },
    steps: { 54: migrateV54 },
  });

const migrations = defineV54Migrations(urlPlugins);

/** Migrate v53 children, then prove the output reloads as a current document. */
const migrateLegacy = (children: readonly unknown[]) => {
  const { output } = migrateDocument({ children }, { migrations, source: 53 });

  expect(migrateDocument(output, { migrations }).output).toEqual(output);

  return output.document.children;
};

const p = (...children: Descendant[]): Element => ({ children, type: 'p' });
const a = (url: string, text: string): Element => ({
  children: [{ text }],
  type: 'a',
  url,
});
const caption = (text: string) => [p({ text })];
const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('migratePlateV54 unsafe URLs', () => {
  it('keeps safe and empty legacy URLs', () => {
    expect(
      migrateLegacy([
        p(
          { text: 'See ' },
          a('https://example.com', 'web'),
          { text: ', ' },
          a('/docs#intro', 'relative'),
          { text: ', ' },
          a('mailto:team@example.com', 'mail'),
          { text: ' and ' },
          a('', 'unresolved'),
          { text: '' }
        ),
        {
          children: [{ text: '' }],
          type: 'img',
          url: 'data:image/png;base64,iVBORw0KGgo=',
        },
        { children: [{ text: '' }], type: 'audio' },
        {
          children: [{ text: '' }],
          type: 'video',
          url: 'blob:https://example.com/0f6a',
        },
        {
          children: [{ text: '' }],
          name: 'report.pdf',
          type: 'file',
          url: '/files/report.pdf',
        },
        {
          children: [{ text: '' }],
          sourceUrl: 'https://youtu.be/abc',
          type: 'media_embed',
          url: 'https://www.youtube.com/embed/abc',
        },
      ])
    ).toEqual([
      {
        children: [
          { text: 'See ' },
          {
            children: [{ text: 'web' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: ', ' },
          {
            children: [{ text: 'relative' }],
            type: 'link',
            url: '/docs#intro',
          },
          { text: ', ' },
          {
            children: [{ text: 'mail' }],
            type: 'link',
            url: 'mailto:team@example.com',
          },
          { text: ' and ' },
          { children: [{ text: 'unresolved' }], type: 'link', url: '' },
          { text: '' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'data:image/png;base64,iVBORw0KGgo=',
      },
      { children: [{ text: '' }], type: 'audio', url: '' },
      {
        children: [{ text: '' }],
        type: 'video',
        url: 'blob:https://example.com/0f6a',
      },
      {
        children: [{ text: '' }],
        name: 'report.pdf',
        type: 'file',
        url: '/files/report.pdf',
      },
      {
        children: [{ text: '' }],
        sourceUrl: 'https://youtu.be/abc',
        type: 'mediaEmbed',
        url: 'https://www.youtube.com/embed/abc',
      },
    ]);
  });

  it('unwraps a link with an unsafe URL to its label', () => {
    expect(
      migrateLegacy([
        p(
          { text: 'Run ' },
          a('javascript:alert(1)', 'this'),
          { text: ', ' },
          a('java\tscript:alert(1)', 'that'),
          { text: ' or ' },
          a('data:text/html,<script>alert(1)</script>', 'those'),
          { text: '' }
        ),
        {
          caption: [p({ text: 'Source: ' }, a('vbscript:msgbox(1)', 'lab'))],
          children: [{ text: '' }],
          type: 'img',
          url: 'https://example.com/chart.png',
        },
      ])
    ).toEqual([
      paragraph('Run this, that or those'),
      {
        children: [{ text: 'Source: lab' }],
        type: 'image',
        url: 'https://example.com/chart.png',
      },
    ]);
  });

  it.each([
    {
      media: {
        alt: 'Sales chart',
        caption: caption('Q3 sales'),
        type: 'img',
        url: 'data:image/svg+xml;base64,PHN2Zz4=',
      },
      text: 'Q3 sales',
    },
    {
      media: { alt: 'Sales chart', type: 'img', url: 'javascript:alert(1)' },
      text: 'Sales chart',
    },
    {
      media: {
        caption: caption('Interview'),
        type: 'audio',
        url: 'javascript:alert(1)',
      },
      text: 'Interview',
    },
    {
      media: {
        caption: caption('Demo'),
        type: 'video',
        url: 'data:video/mp4;base64,AAAA',
      },
      text: 'Demo',
    },
    {
      media: {
        caption: caption('Q3 report'),
        name: 'report.pdf',
        type: 'file',
        url: 'mailto:team@example.com',
      },
      text: 'Q3 report',
    },
    {
      media: {
        name: 'report.pdf',
        type: 'file',
        url: 'data:application/pdf;base64,JVBERi0=',
      },
      text: 'report.pdf',
    },
    {
      media: {
        caption: caption('Walkthrough'),
        type: 'media_embed',
        url: '/embed/walkthrough',
      },
      text: 'Walkthrough',
    },
  ])(
    'keeps $media.type caption, alt text or file name when its URL is unsafe',
    ({ media, text }) => {
      expect(
        migrateLegacy([
          p({ text: 'Before' }),
          { children: [{ text: '' }], ...media },
          p({ text: 'After' }),
        ])
      ).toEqual([paragraph('Before'), paragraph(text), paragraph('After')]);
    }
  );

  it('removes media with an unsafe URL and no caption, alt text or file name', () => {
    expect(
      migrateLegacy([
        p({ text: 'Before' }),
        { children: [{ text: '' }], type: 'img', url: 'javascript:alert(1)' },
        {
          alt: '',
          caption: caption(''),
          children: [{ text: '' }],
          type: 'video',
          url: 'javascript:alert(1)',
        },
        {
          children: [{ text: '' }],
          name: '',
          type: 'file',
          url: 'javascript:alert(1)',
        },
        p({ text: 'After' }),
      ])
    ).toEqual([paragraph('Before'), paragraph('After')]);
  });

  it('omits an unsafe source URL and keeps the media', () => {
    expect(
      migrateLegacy([
        {
          children: [{ text: '' }],
          sourceUrl: 'javascript:alert(1)',
          type: 'media_embed',
          url: 'https://www.youtube.com/embed/abc',
        },
        {
          children: [{ text: '' }],
          sourceUrl: 'data:text/html,<script>alert(1)</script>',
          type: 'video',
          url: 'https://example.com/clip.mp4',
        },
      ])
    ).toEqual([
      {
        children: [{ text: '' }],
        type: 'mediaEmbed',
        url: 'https://www.youtube.com/embed/abc',
      },
      {
        children: [{ text: '' }],
        type: 'video',
        url: 'https://example.com/clip.mp4',
      },
    ]);
  });

  it('maps a persisted selection into an unwrapped link label', () => {
    const { output } = migrateDocument(
      {
        document: {
          children: [
            p({ text: 'Intro' }),
            p({ text: 'Go ' }, a('javascript:alert(1)', 'there'), { text: '' }),
          ],
        },
        schema: v53Schema,
        selection: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 4, path: [1, 1, 0] },
          kind: 'text',
        },
      },
      { migrations }
    );

    expect(output.document.children).toEqual([
      paragraph('Intro'),
      paragraph('Go there'),
    ]);
    expect(output.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 7, path: [1, 0] },
      kind: 'text',
    });
  });

  it('maps code-line selections after removed media moves the block', () => {
    const { output } = migrateDocument(
      {
        document: {
          children: [
            {
              children: [{ text: '' }],
              type: 'img',
              url: 'javascript:alert(1)',
            },
            {
              children: [
                { children: [{ text: 'one' }], type: 'code_line' },
                { children: [{ text: 'two' }], type: 'code_line' },
              ],
              type: 'code_block',
            },
          ],
        },
        schema: v53Schema,
        selection: {
          anchor: { offset: 1, path: [1, 1, 0] },
          focus: { offset: 2, path: [1, 1, 0] },
          kind: 'text',
        },
      },
      { migrations }
    );

    expect(output.document.children).toEqual([
      { children: [{ text: 'one\ntwo' }], type: 'codeBlock' },
    ]);
    expect(output.selection).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
      kind: 'text',
    });
  });

  it('neutralizes unsafe URLs in every legacy suggestion revision', () => {
    const plugins = [BaseLinkPlugin, AuthoredPlugin];
    const { output } = migrateDocument(
      {
        children: [
          p(
            { text: 'Open ' },
            {
              children: [
                { text: 'docs' },
                {
                  suggestion: true,
                  suggestion_page: {
                    createdAt: 1,
                    id: 'page',
                    type: 'insert',
                    userId: 'alice',
                  },
                  text: ' page',
                },
              ],
              type: 'a',
              url: 'javascript:alert(1)',
            },
            { text: '' }
          ),
        ],
      },
      { migrations: defineV54Migrations(plugins), source: 53 }
    );
    const review = projectAuthoredReview(
      createEditor({
        initialValue: output.document,
        plugins,
        schema: MigrationSchema,
      }).read.value()
    );

    expect(review.accepted.children).toEqual([paragraph('Open docs')]);
    expect(review.proposed.children).toEqual([paragraph('Open docs page')]);
    expect(review.changes).toMatchObject([{ authorId: 'alice', id: 'page' }]);
    expect(JSON.stringify(output)).not.toContain('javascript:');
  });

  it('fails closed on stored documents that bypass the migration', () => {
    expect(() =>
      migrateDocument(
        {
          children: [
            {
              children: [
                { text: '' },
                {
                  children: [{ text: 'current' }],
                  type: 'link',
                  url: 'javascript:alert(1)',
                },
                { text: '' },
              ],
              type: 'paragraph',
            },
          ],
        },
        { migrations, source: 'current' }
      )
    ).toThrow(
      'Editor element property "url" fails custom property validation.'
    );

    const UnvalidatedLinkPlugin = definePlugin('link', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
          properties: {
            target: property.string(),
            url: property.string({ required: true }),
          },
        },
      },
    });
    const document: EditorDocumentValue = {
      children: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'stored' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    };
    const stored = migrateDocument(document, {
      migrations: defineV54Migrations([UnvalidatedLinkPlugin]),
      source: 'current',
    }).output;
    const current = defineV54Migrations([BaseLinkPlugin]);

    expect(
      migrateDocument(document, { migrations: current, source: 'current' })
        .output.document
    ).toEqual(stored.document);
    expect(() => migrateDocument(stored, { migrations: current })).toThrow(
      'Unknown schema fingerprint for plate@54.'
    );
  });
});
