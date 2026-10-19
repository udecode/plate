import JSZip from 'jszip';
import React from 'react';

import { AuthoredPlugin } from '../../../authored';
import {
  createEditor,
  createEditorView,
  definePlugin,
  property,
  type Value,
} from '../../../core';
import { BaseBlockquotePlugin } from '../../../features/basic-nodes';
import {
  BaseFootnotePlugin,
  BaseFootnoteDefinitionPlugin,
} from '../../../features/footnote';
import { BaseListPlugin } from '../../../features/list';
import { BaseImagePlugin } from '../../../features/media';
import { BaseParagraphPlugin } from '../../../lib';
import type { DocxComment } from '../../internal/types';
import { exportDocx } from './exportDocx';

const EditingOnly = (): React.ReactNode => {
  throw new Error('Editing component rendered during export.');
};

const StaticQuote = BaseBlockquotePlugin.configure({
  component: ({ attributes, children }) => (
    <blockquote {...attributes}>{children}</blockquote>
  ),
});

const AiMarkPlugin = definePlugin('ai', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  render: { mark: { placement: 'text' } },
});

const commentOn = (body: Value): DocxComment => ({
  author: null,
  body,
  createdAt: null,
  durableId: null,
  id: 'comment-1',
  parentId: null,
  resolved: null,
  target: {
    range: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
    },
  },
});

const readPart = async (blob: Blob, part: string) => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());

  return zip.file(part)!.async('string');
};

describe('exportDocx presentation', () => {
  it('keeps footnote labels and note text without dangling Word hyperlinks', async () => {
    const presentation = [
      BaseFootnotePlugin.configure({
        component: ({ children, editor, element, path }) => {
          const anchor = editor
            .plugin(BaseFootnotePlugin)
            .read.anchor({ path });
          return (
            <sup>
              {children}
              <a id={anchor?.id} href={`#${anchor?.target}`}>
                [{element.ref}]
              </a>
            </sup>
          );
        },
      }),
      BaseFootnoteDefinitionPlugin.configure({
        component: ({ children, editor, element, path }) => {
          const anchor = editor
            .plugin(BaseFootnotePlugin)
            .read.anchor({ path });
          return (
            <div id={anchor?.id}>
              <div>{element.ref}</div>
              <div>{children}</div>
              {anchor?.target && <a href={`#${anchor.target}`}>↩</a>}
            </div>
          );
        },
      }),
    ];
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
      ],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Claim' },
            { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
            { text: '.' },
          ],
        },
        {
          type: 'footnoteDefinition',
          ref: '1',
          children: [
            { type: 'paragraph', children: [{ text: 'Source text' }] },
          ],
        },
      ],
    });
    const result = await exportDocx(editor, {
      presentation,
      projection: 'proposed',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const xml = await readPart(result.blob, 'word/document.xml');
    expect(xml).toContain('[1]');
    expect(xml).toContain('Source text');
    expect(xml).not.toContain('<w:hyperlink');
  });

  it('writes review revisions through the static presentation', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin.configure({ component: EditingOnly }),
        AuthoredPlugin,
      ],
      initialValue: [
        {
          children: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
      userId: 'alice',
    });

    createEditorView(editor, {
      authored: { intent: 'propose' },
    }).update.text.insert('XY', {
      at: {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 0] },
      },
    });

    const result = await exportDocx(editor, {
      presentation: [StaticQuote],
      projection: 'review',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const documentXml = await readPart(result.blob, 'word/document.xml');

    expect([
      documentXml.match(/<w:ins\b/g)?.length,
      documentXml.match(/<w:del\b/g)?.length,
    ]).toEqual([1, 1]);
  });

  it('draws comment bodies through the static presentation', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseBlockquotePlugin.configure({ component: EditingOnly }),
      ],
      initialValue: [
        { children: [{ text: 'Review this sentence.' }], type: 'paragraph' },
      ],
    });

    const result = await exportDocx(editor, {
      comments: [
        {
          author: null,
          body: [
            {
              children: [
                { children: [{ text: 'Quoted reply' }], type: 'paragraph' },
              ],
              type: 'blockquote',
            },
          ],
          createdAt: null,
          durableId: null,
          id: 'comment-1',
          parentId: null,
          resolved: null,
          target: {
            range: {
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 6, path: [0, 0] },
            },
          },
        },
      ],
      presentation: [StaticQuote],
      projection: 'proposed',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await readPart(result.blob, 'word/comments.xml')).toContain(
      'Quoted reply'
    );
  });

  const image = {
    children: [{ text: 'Chart' }],
    type: 'image',
    url: 'https://platejs.org/chart.png',
  };
  const numbered = {
    children: [{ text: 'Step' }],
    indent: 1,
    listType: 'numbered',
    type: 'paragraph',
  };
  const highlighted = {
    children: [{ ai: true, text: 'Suggested' }],
    type: 'paragraph',
  };

  it.each([
    {
      block: image,
      live: BaseImagePlugin.configure({ component: EditingOnly }),
      place: 'body',
    },
    {
      block: image,
      live: BaseImagePlugin.configure({ component: EditingOnly }),
      place: 'comment',
    },
    {
      block: numbered,
      live: BaseListPlugin.configure({
        slots: { wrapNodeChildren: () => EditingOnly },
      }),
      place: 'body',
    },
    {
      block: highlighted,
      live: AiMarkPlugin.configure({ component: EditingOnly }),
      place: 'body',
    },
    {
      block: highlighted,
      live: AiMarkPlugin.configure({ component: EditingOnly }),
      place: 'comment',
    },
  ])(
    'counts a missing $live.name drawing in the $place as lost content',
    async ({ block, live, place }) => {
      const editor = createEditor({
        plugins: [BaseParagraphPlugin, live],
        initialValue:
          place === 'body'
            ? [block]
            : [
                {
                  children: [{ text: 'Review this sentence.' }],
                  type: 'paragraph',
                },
              ],
      });
      const options = {
        comments: place === 'body' ? [] : [commentOn([block])],
        presentation: [],
        projection: 'proposed',
      } as const;

      const allowed = await exportDocx(editor, {
        ...options,
        lossPolicy: 'allow',
      });
      const rejected = await exportDocx(editor, options);

      expect({
        allowed: allowed.ok,
        diagnostics: allowed.diagnostics,
        rejected: rejected.ok,
      }).toMatchObject({
        allowed: true,
        diagnostics: [
          {
            code: 'missing-static-presentation',
            plugin: live.name,
            severity: 'warning',
          },
        ],
        rejected: false,
      });
    }
  );

  it('ignores comment bodies the accepted projection omits', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        AiMarkPlugin.configure({ component: EditingOnly }),
        AuthoredPlugin,
      ],
      initialValue: [{ children: [{ text: 'ABC' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(editor, {
      authored: { intent: 'propose' },
    }).update.text.insert('XY', { at: { offset: 3, path: [0, 0] } });

    const result = await exportDocx(editor, {
      comments: [
        {
          ...commentOn([
            { children: [{ ai: true, text: 'Suggested' }], type: 'paragraph' },
          ]),
          target: {
            range: {
              anchor: { offset: 0, path: [0, 1] },
              focus: { offset: 2, path: [0, 1] },
            },
          },
        },
      ],
      presentation: [],
      projection: 'accepted',
    });

    expect(result.ok).toBe(true);
  });
});
