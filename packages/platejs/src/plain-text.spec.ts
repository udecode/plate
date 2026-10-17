import { describe, expect, it } from 'bun:test';

import { ContentSlice, defineEditorSchema, definePlugin, schema } from './core';
import { writeDataTransferFragment } from './dom';
import { BaseHorizontalRulePlugin } from './features/basic-nodes';
import { BaseLinkPlugin } from './features/link';
import { BaseListPlugin, ListType } from './features/list';
import { BaseImagePlugin } from './features/media';
import { BaseMentionPlugin } from './features/mention';
import { BaseTablePlugin } from './features/table';
import { createEditor } from './lib/editor';
import { BaseParagraphPlugin } from './lib/plugins/paragraph';
import { BaseEquationPlugin } from './math';
import { serializePlainText } from './plain-text';

const plugins = [
  BaseParagraphPlugin,
  BaseHorizontalRulePlugin,
  BaseLinkPlugin,
  BaseListPlugin,
  BaseImagePlugin,
  BaseMentionPlugin,
  BaseTablePlugin,
  BaseEquationPlugin,
] as const;

const document = {
  children: [
    {
      children: [
        { text: 'Visit ' },
        {
          children: [{ text: 'Plate' }],
          type: 'link',
          url: 'https://platejs.org',
        },
        { text: ' with ' },
        { children: [{ text: '' }], label: 'Ada', ref: 'ada', type: 'mention' },
      ],
      type: 'paragraph',
    },
    {
      children: [{ text: 'First' }],
      indent: 1,
      listType: ListType.Numbered,
      type: 'paragraph',
    },
    {
      checked: true,
      children: [{ text: 'Nested' }],
      indent: 2,
      listType: ListType.Task,
      type: 'paragraph',
    },
    {
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: 'A' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [{ children: [{ text: 'B' }], type: 'paragraph' }],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [{ children: [{ text: 'C' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [{ children: [{ text: 'D' }], type: 'paragraph' }],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    },
    { children: [{ text: '' }], type: 'horizontalRule' },
    { children: [{ text: '' }], latex: 'x^2', type: 'equation' },
    {
      alt: 'Architecture',
      children: [{ text: '' }],
      type: 'image',
      url: 'https://example.com/architecture.png',
    },
  ],
} as const;

const ContentRootSchema = defineEditorSchema('plain-text-content-roots', {
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    portal: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.types(['paragraph', 'portal'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'shared',
        },
      },
    },
  },
  id: 'plain-text-content-roots',
  root: schema.content.types(['paragraph', 'portal'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const numbered = (text: string, extra: Record<string, unknown> = {}) => ({
  children: [{ text }],
  indent: 1,
  listType: ListType.Numbered,
  type: 'paragraph',
  ...extra,
});

describe('serializePlainText', () => {
  it('uses feature-owned structural formats', () => {
    const editor = createEditor({ initialValue: document, plugins });
    const result = serializePlainText(editor);

    expect(result).toEqual({
      data: [
        'Visit Plate (https://platejs.org) with @Ada',
        '1. First',
        '  - [x] Nested',
        'A\tB',
        'C\tD',
        '---',
        'x^2',
        'Architecture (https://example.com/architecture.png)',
      ].join('\n'),
      diagnostics: [],
    });
  });

  it('backs clipboard egress with the same serializer', () => {
    const clipboardDocument = {
      ...document,
      children: document.children.filter((node) => node.type !== 'equation'),
    };
    const editor = createEditor({ initialValue: clipboardDocument, plugins });
    const output = new DataTransfer();
    const result = serializePlainText(editor);

    writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed(editor.read.children())
    );

    expect(output.getData('text/plain')).toBe(result.data);
  });

  it('serializes detached documents with the same configuration', () => {
    const editor = createEditor({ initialValue: document, plugins });

    expect(serializePlainText(document, { plugins })).toEqual(
      serializePlainText(editor)
    );
  });

  it('diagnoses cyclic content roots without recursing forever', () => {
    const cyclicDocument = {
      children: [
        {
          childRoots: { body: 'shared:1' },
          children: [{ text: '' }],
          type: 'portal',
        },
      ],
      roots: {
        'shared:1': [
          {
            childRoots: { body: 'shared:1' },
            children: [{ text: '' }],
            type: 'portal',
          },
        ],
      },
    } as const;
    const editor = createEditor({
      initialValue: cyclicDocument,
      plugins: [ContentRootSchema],
    });

    expect(serializePlainText(editor)).toEqual({
      data: '',
      diagnostics: [
        {
          code: 'plain-text-unsupported-root',
          message:
            'Plain text omits cyclic reference to document root "shared:1".',
          root: 'shared:1',
          severity: 'warning',
        },
      ],
    });
  });

  it('numbers a run from its first item start', () => {
    const editor = createEditor({
      initialValue: [numbered('A', { listStart: 3 }), numbered('B')],
      plugins,
    });

    expect(serializePlainText(editor).data).toBe('3. A\n4. B');
  });

  it('numbers a partial copy from its first copied item', () => {
    const editor = createEditor({
      initialValue: ['A', 'B', 'C', 'D'].map((text) => numbered(text)),
      plugins,
    });
    const output = new DataTransfer();

    writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed(editor.read.children().slice(2))
    );

    const html = new DOMParser().parseFromString(
      output.getData('text/html'),
      'text/html'
    );

    expect(output.getData('text/plain')).toBe('1. C\n2. D');
    expect(
      [...html.querySelectorAll('ol')].map((list) => list.getAttribute('start'))
    ).toEqual(['1', '2']);
  });

  it('numbers a list in a content root', () => {
    const RootHolderPlugin = definePlugin('plainTextRootHolder', {
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.element(BaseParagraphPlugin, {
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createEditor({
      initialValue: {
        children: [
          {
            childRoots: { body: 'body' },
            children: [{ text: '' }],
            type: 'plainTextRootHolder',
          },
        ],
        roots: { body: [numbered('One'), numbered('Two')] },
      },
      plugins: [...plugins, RootHolderPlugin],
    });

    expect(serializePlainText(editor).data).toBe('1. One\n2. Two');
  });
});
