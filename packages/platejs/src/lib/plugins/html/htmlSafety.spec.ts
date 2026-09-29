import { describe, expect, it } from 'bun:test';

import { property, schema } from '../../../facade';
import { BaseLinkPlugin } from '../../../features/link/lib/BaseLinkPlugin';
import { BaseVideoPlugin } from '../../../features/media/lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../../../features/media/lib/image/BaseImagePlugin';
import { createEditor, type Editor } from '../../editor';
import { definePlugin } from '../../plugin';
import { compileHtmlElementDecoder, type HtmlMappingLoss } from './HtmlPlugin';

// A parent mapping that reads a descendant before its children decode.
const CaptureParagraph = definePlugin('captureParagraph', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { captured: property.string() },
    },
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) => ({
          captured:
            element.querySelector('a')?.getAttribute('href') ?? 'ABSENT',
        }),
        decodeOnly: true,
        match: [{ tag: 'p' }],
        priority: 100,
      },
    }),
});

const unsafe = (
  impact: 'lossless' | 'lossy',
  kind: 'attribute' | 'element' | 'style' | 'url',
  message: string,
  action: 'removed' | 'unwrapped' = 'removed'
) => ({
  action,
  code: 'html-unsafe-content' as const,
  impact,
  kind,
  message,
});

// A link that loses its destination keeps its label.
const unwrappedHref = (impact: 'lossless' | 'lossy', message: string) =>
  unsafe(impact, 'url', message, 'unwrapped');

describe('HTML source safety', () => {
  it('removes a control-obfuscated href in the source pass and keeps its label', () => {
    const editor = createEditor({ plugins: [CaptureParagraph] });

    for (const lossPolicy of ['allow', 'reject'] as const) {
      expect(
        editor.api.html.parseSlice(
          '<p>Before <a href="java&#9;script:alert(1)">LABEL</a> After</p>',
          { lossPolicy }
        )
      ).toMatchObject({
        diagnostics: [
          {
            ...unwrappedHref(
              'lossless',
              'Removed unsafe HTML attribute "href" from <a>.'
            ),
            severity: 'warning',
            source: { kind: 'source' },
          },
        ],
        ok: true,
        slice: {
          content: [
            {
              captured: 'ABSENT',
              children: [{ text: 'Before LABEL After' }],
              type: 'captureParagraph',
            },
          ],
        },
      });
    }
  });

  it('keeps the video figure mapping from reading an unsafe child source', () => {
    const editor = createEditor({ plugins: [BaseVideoPlugin] });
    const figure = (src: string) =>
      `<figure class="editor-video"><video src="${src}"></video><figcaption>CAPTION</figcaption></figure>`;

    expect(
      editor.api.html.parseSlice(figure('java&#9;script:alert(1)'))
    ).toMatchObject({
      diagnostics: [
        unsafe(
          'lossless',
          'url',
          'Removed unsafe HTML attribute "src" from <video>.'
        ),
      ],
      ok: true,
      slice: {
        content: [{ children: [{ text: 'CAPTION' }], type: 'paragraph' }],
      },
    });
    // A disallowed media source drops media a reader would have seen.
    expect(
      editor.api.html.parseSlice(figure('data:video/mp4;base64,AAAA'))
    ).toMatchObject({
      diagnostics: [
        {
          ...unsafe(
            'lossy',
            'url',
            'Removed unsafe HTML attribute "src" from <video>.'
          ),
          severity: 'error',
        },
      ],
      ok: false,
    });
    expect(
      editor.api.html.parseSlice(figure('data:video/mp4;base64,AAAA'), {
        lossPolicy: 'allow',
      })
    ).toMatchObject({
      diagnostics: [{ ...unsafe('lossy', 'url', expect.any(String)) }],
      ok: true,
      slice: {
        content: [{ children: [{ text: 'CAPTION' }], type: 'paragraph' }],
      },
    });
  });

  it('keeps the alt text of an image whose source is removed', () => {
    const editor = createEditor({ plugins: [BaseImagePlugin] });

    expect(
      editor.api.html.parseSlice(
        '<p>See <img alt="Chart" src="javascript:alert(1)"> here</p>'
      )
    ).toMatchObject({
      diagnostics: [
        unsafe(
          'lossless',
          'url',
          'Removed unsafe HTML attribute "src" from <img>.'
        ),
      ],
      ok: true,
      slice: {
        content: [
          { children: [{ text: 'See Chart here' }], type: 'paragraph' },
        ],
      },
    });
    expect(
      editor.api.html.parseSlice(
        '<p>See <img alt="Chart" src="data:image/svg+xml;base64,PHN2Zz4="> here</p>',
        { lossPolicy: 'allow' }
      )
    ).toMatchObject({
      diagnostics: [unsafe('lossy', 'url', expect.any(String))],
      ok: true,
      slice: {
        content: [
          { children: [{ text: 'See Chart here' }], type: 'paragraph' },
        ],
      },
    });
  });

  it('reads URL attributes without their surrounding HTML whitespace', () => {
    const editor = createEditor({ plugins: [BaseLinkPlugin] });

    expect(
      editor.api.html.parseSlice(
        '<p><a href="&#10; https://example.com/a &#9;">LABEL</a></p>'
      )
    ).toMatchObject({
      diagnostics: [],
      ok: true,
      slice: {
        content: [
          {
            children: [
              {
                children: [{ text: 'LABEL' }],
                type: 'link',
                url: 'https://example.com/a',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
    });
  });

  it('keeps the label of a meaningful destination it removes, with a lossy warning', () => {
    for (const lossPolicy of ['allow', 'reject'] as const) {
      expect(
        createEditor().api.html.parseSlice(
          '<p><a href="//example.com/page">LABEL</a></p>',
          { lossPolicy }
        )
      ).toMatchObject({
        diagnostics: [
          {
            ...unwrappedHref(
              'lossy',
              'Removed unsafe HTML attribute "href" from <a>.'
            ),
            severity: 'warning',
          },
        ],
        ok: true,
      });
    }
  });

  it('removes resource-bearing CSS even when an escape spells the function', () => {
    const editor = createEditor();
    const removed = editor.api.html.parseSlice(
      String.raw`<p style="background: u\72 l(https://example.com/pixel.png)">A</p><p style="background-image: image-set('https://example.com/pixel.png' 1x)">B</p>`,
      { lossPolicy: 'allow' }
    );

    expect(removed).toMatchObject({
      diagnostics: [
        unsafe(
          'lossy',
          'style',
          'Removed unsafe HTML attribute "style" from <p>.'
        ),
        unsafe(
          'lossy',
          'style',
          'Removed unsafe HTML attribute "style" from <p>.'
        ),
      ],
      ok: true,
    });
    expect(
      editor.api.html.parseSlice(
        String.raw`<p style="font-family: '\5FAE\8F6F\96C5\9ED1'">Font</p>`
      )
    ).toMatchObject({ diagnostics: [], ok: true });
  });

  it('sanitizes again after preparation writes active content', () => {
    const PreparedParagraph = definePlugin('preparedParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { captured: property.string() },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => ({
              captured:
                element.querySelector('a')?.getAttribute('href') ?? 'ABSENT',
            }),
            decodeOnly: true,
            match: [{ tag: 'p' }],
            prepareDocument: ({ document }) => {
              document.body
                .querySelector('a')
                ?.setAttribute('href', 'javascript:alert(1)');
              document.body.append(document.createElement('script'));
            },
            priority: 100,
          },
        }),
    });
    const editor = createEditor({ plugins: [PreparedParagraph] });

    expect(
      editor.api.html.parseSlice(
        '<p>Before <a href="https://example.com/">LABEL</a> After</p>'
      )
    ).toMatchObject({
      diagnostics: [
        {
          ...unwrappedHref(
            'lossless',
            'Removed unsafe HTML attribute "href" from <a>.'
          ),
          source: { kind: 'tree', path: [0, 1], tag: 'a' },
        },
        {
          ...unsafe(
            'lossless',
            'element',
            'Removed unsafe HTML element <script>.'
          ),
          source: { kind: 'tree', path: [1], tag: 'script' },
        },
      ],
      ok: true,
      slice: {
        content: [
          {
            captured: 'ABSENT',
            children: [{ text: 'Before LABEL After' }],
            type: 'preparedParagraph',
          },
        ],
      },
    });
  });
});

describe('compiled element decoder safety', () => {
  const decode = (editor: Editor, html: string) => {
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const losses: HtmlMappingLoss[] = [];
    const nodes = editor.read((state) =>
      compileHtmlElementDecoder(editor, state)(body, {
        onLoss: (loss) => losses.push(loss),
      })
    );

    return { losses, nodes };
  };

  it('sanitizes live DOM before a parent mapping reads its descendants', () => {
    expect(
      decode(
        createEditor({ plugins: [CaptureParagraph] }),
        '<p>Before <a href="javascript:alert(1)">LABEL</a> After</p>'
      )
    ).toEqual({
      losses: [
        {
          action: 'unwrapped',
          kind: 'attribute',
          message: 'Removed unsafe HTML attribute "href" from <a>.',
          owner: 'plate:html',
          source: { kind: 'tree', path: [0, 1], tag: 'a' },
        },
      ],
      nodes: [
        {
          captured: 'ABSENT',
          children: [{ text: 'Before LABEL After' }],
          type: 'captureParagraph',
        },
      ],
    });
  });

  it('reports a lossy removal as dropped content', () => {
    expect(
      decode(createEditor(), '<p>Kept</p><svg><text>Chart</text></svg>').losses
    ).toEqual([
      {
        action: 'dropped',
        kind: 'element',
        message: 'Removed unsafe HTML element <svg>.',
        owner: 'plate:html',
        source: { kind: 'tree', path: [1], tag: 'svg' },
      },
    ]);
  });
});

describe('HTML output safety', () => {
  const ActiveOutput = definePlugin('activeOutput', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: {
          sinkName: property.string(),
          sinkValue: property.string(),
        },
      },
    },
    formats: ({ defineFormats }) =>
      defineFormats({
        html: {
          decode: () => ({}),
          encode: ({ content, node, preserve }) => {
            preserve('sinkName', 'sinkValue');

            return {
              attributes: { [String(node.sinkName)]: node.sinkValue },
              children: [{ children: content, tag: 'span' }],
              tag: 'div',
            };
          },
          match: [{ tag: 'div' }],
        },
      }),
  });
  const editor = createEditor({ plugins: [ActiveOutput] });
  const serialize = (
    sinkName: string,
    sinkValue: string,
    lossPolicy: 'allow' | 'reject' = 'reject'
  ) =>
    editor.api.html.serialize({
      document: {
        children: [
          {
            children: [{ text: 'LABEL' }],
            sinkName,
            sinkValue,
            type: 'activeOutput',
          },
        ],
      },
      lossPolicy,
    });

  it('removes an emitted attribute that fails its sink and reports it', () => {
    expect(serialize('href', 'data:text/html;base64,SGVsbG8=')).toEqual({
      data: '<div><span>LABEL</span></div>',
      diagnostics: [
        {
          ...unwrappedHref(
            'lossless',
            'Removed unsafe HTML attribute "href" from <div>.'
          ),
          model: { path: [0], root: 'main' },
          severity: 'warning',
        },
      ],
      ok: true,
    });
    for (const sinkName of ['action', 'formaction', 'srcset']) {
      expect(serialize(sinkName, 'https://example.com/')).toMatchObject({
        data: '<div><span>LABEL</span></div>',
        diagnostics: [unsafe('lossless', 'url', expect.any(String))],
        ok: true,
      });
    }
    expect(
      serialize('style', 'background: url(https://example.com/a.png)', 'allow')
    ).toMatchObject({
      data: '<div><span>LABEL</span></div>',
      diagnostics: [unsafe('lossy', 'style', expect.any(String))],
      ok: true,
    });
  });

  it('applies the loss policy to a lossy output removal', () => {
    expect(serialize('src', '//cdn.example.com/a.mp4')).toMatchObject({
      diagnostics: [
        {
          ...unsafe(
            'lossy',
            'url',
            'Removed unsafe HTML attribute "src" from <div>.'
          ),
          severity: 'error',
        },
      ],
      ok: false,
    });
    expect(serialize('src', '//cdn.example.com/a.mp4', 'allow')).toMatchObject({
      data: '<div><span>LABEL</span></div>',
      ok: true,
    });
    expect(serialize('src', 'https://cdn.example.com/a.mp4')).toMatchObject({
      data: '<div src="https://cdn.example.com/a.mp4"><span>LABEL</span></div>',
      diagnostics: [],
      ok: true,
    });
  });
});
