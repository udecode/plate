/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt, type TestEditor } from '#platejs-test-internal';

import {
  createEditor as createProductEditor,
  definePlugin,
  NodeApi,
  property,
  type Point,
  type Selection,
  type Value,
} from '../../../core';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import type { LinkDefinition } from '../../../react/features/link/LinkPlugin';
import { BaseCodeBlockPlugin } from '../../code-block/lib/BaseCodeBlockPlugin';
import { BaseMentionPlugin } from '../../mention/lib/BaseMentionPlugin';
import {
  BaseLinkPlugin,
  type BaseLinkDefinition,
  getLinkHref,
  type LinkElement,
} from './BaseLinkPlugin';

jsxt;

describe('BaseLinkPlugin', () => {
  const createEditor = () =>
    createProductEditor({
      plugins: [BaseLinkPlugin],
    });

  it('parses valid anchors and keeps an absent target absent', () => {
    const editor = createEditor();
    const fragment = parseHtmlSliceContent(
      editor,
      '<a href="https://example.com">Link</a>'
    );
    const link = Array.from(
      NodeApi.elements({ children: fragment ?? [], type: 'root' }),
      ([node]) => node
    ).find((node) => node.type === editor.plugin(BaseLinkPlugin).schema.type);

    expect(link).toEqual({
      children: [{ text: 'Link' }],
      type: editor.plugin(BaseLinkPlugin).schema.type,
      url: 'https://example.com',
    });
  });

  it('rejects missing and unsafe href values', () => {
    const editor = createEditor();
    const fragment = parseHtmlSliceContent(
      editor,
      '<a>No href</a><a href="javascript:alert(1)">Bad</a>'
    );
    const hasLink = Array.from(
      NodeApi.elements({ children: fragment ?? [], type: 'root' }),
      ([node]) => node
    ).some((node) => node.type === editor.plugin(BaseLinkPlugin).schema.type);

    expect(hasLink).toBe(false);
  });

  it('encodes links with their semantic attributes', () => {
    const editor = createProductEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'Link' }],
              target: '_self',
              type: 'link',
              url: 'https://example.com',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const anchor = new DOMParser()
      .parseFromString(data.getData('text/html'), 'text/html')
      .body.querySelector('a');

    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_self');
    expect(anchor?.textContent).toBe('Link');
  });

  it('exports a stored destination the app no longer allows', () => {
    const editor = createProductEditor({
      plugins: [BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'File' }],
              type: 'link',
              url: 'ftp://example.com/file',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    expect(
      new DOMParser()
        .parseFromString(data.getData('text/html'), 'text/html')
        .body.querySelector('a')
        ?.getAttribute('href')
    ).toBe('ftp://example.com/file');
  });

  it('registers no input rules by default', () => {
    const editor = createEditor();

    expect(
      getPlateRuntime(editor).inputRules.plugins[BaseLinkPlugin.name].rules
    ).toEqual([]);
  });
});

const baseLink = {
  children: [{ text: 'Link text' }],
  type: 'link',
} as const;

const defaultOptions: Partial<LinkDefinition['initialState']> = {
  defaultLinkAttributes: {
    rel: 'noopener noreferrer',
  },
};

const createApiEditor = (
  options: Partial<LinkDefinition['initialState']> = {}
) =>
  createProductEditor({
    plugins: [
      BaseLinkPlugin.configure({
        initialState: {
          ...defaultOptions,
          ...options,
        },
      }),
    ],
  });

describe('BaseLinkPlugin.api.getAttributes', () => {
  const editor = createApiEditor();

  describe('when url is valid', () => {
    const link: LinkElement = {
      ...baseLink,
      target: '_self',
      url: 'https://example.com/',
    };

    it('include href, target and default attributes', () => {
      expect(editor.plugin(BaseLinkPlugin).api.getAttributes(link)).toEqual({
        href: 'https://example.com/',
        rel: 'noopener noreferrer',
        target: '_self',
      });
    });
  });

  describe('when url is invalid', () => {
    const link: LinkElement = {
      ...baseLink,
      target: '_self',

      url: 'javascript://example.com/',
    };

    it('omits href for invalid URLs', () => {
      const attributes = editor.plugin(BaseLinkPlugin).api.getAttributes(link);

      expect(attributes).toEqual({
        rel: 'noopener noreferrer',
        target: '_self',
      });
      expect(attributes).not.toHaveProperty('href');
    });
  });

  describe('when url is relative', () => {
    const link: LinkElement = {
      ...baseLink,
      target: '_self',
      url: 'pageKey',
    };

    it('keeps it as the href', () => {
      expect(
        createApiEditor().plugin(BaseLinkPlugin).api.getAttributes(link)
      ).toEqual({
        href: 'pageKey',
        rel: 'noopener noreferrer',
        target: '_self',
      });
    });
  });

  describe('when allowed schemes widen navigation', () => {
    it('renders an app deep link but never a script URL', () => {
      const deepLinkEditor = createApiEditor({
        allowedSchemes: ['https', 'vscode', 'javascript'],
      });
      const { getAttributes } = deepLinkEditor.plugin(BaseLinkPlugin).api;

      expect(
        getAttributes({ ...baseLink, url: 'vscode://file/a.ts' }).href
      ).toBe('vscode://file/a.ts');
      expect(
        getAttributes({ ...baseLink, url: 'javascript:alert(1)' }).href
      ).toBeUndefined();
    });
  });

  describe('when a default href is configured', () => {
    it('omits it for a URL the app does not allow', () => {
      const fallbackEditor = createApiEditor({
        defaultLinkAttributes: { href: 'https://fallback.example.com' },
      });

      expect(
        fallbackEditor
          .plugin(BaseLinkPlugin)
          .api.getAttributes({ ...baseLink, url: 'ftp://example.com' })
      ).not.toHaveProperty('href');
    });
  });

  describe('when target is not set', () => {
    const link: LinkElement = {
      ...baseLink,
      url: 'https://example.com/',
    };

    it('omits target when it is not set', () => {
      const linkAttributes = editor
        .plugin(BaseLinkPlugin)
        .api.getAttributes(link);
      expect(linkAttributes).toEqual({
        href: 'https://example.com/',
        rel: 'noopener noreferrer',
      });
      expect(linkAttributes).not.toHaveProperty('target');
    });
  });
});

describe('getLinkHref', () => {
  it('allows the link plugin default schemes unless the caller widens them', () => {
    expect([
      getLinkHref('https://example.com'),
      getLinkHref('http://example.com'),
      getLinkHref('mailto:team@example.com'),
      getLinkHref('tel:+15550100'),
      getLinkHref('/docs'),
      getLinkHref('https://example.com', { allowedSchemes: [] }),
      getLinkHref('/docs', { allowedSchemes: [] }),
      getLinkHref('ws://example.com'),
      getLinkHref('ws://example.com', {}),
      getLinkHref('ws://example.com', { allowedSchemes: undefined }),
      getLinkHref('ftp://example.com'),
      getLinkHref(' ftp://example.com ', { allowedSchemes: ['ftp'] }),
    ]).toEqual([
      'https://example.com',
      'http://example.com',
      'mailto:team@example.com',
      'tel:+15550100',
      '/docs',
      undefined,
      '/docs',
      undefined,
      undefined,
      undefined,
      undefined,
      'ftp://example.com',
    ]);
  });
});

describe('BaseLinkPlugin admission on import', () => {
  const createImportEditor = (
    options: Partial<BaseLinkDefinition['initialState']> = {}
  ) =>
    createProductEditor({
      plugins: [BaseLinkPlugin.configure({ initialState: options })],
    });
  const importedUrls = (
    editor: ReturnType<typeof createImportEditor>,
    html: string
  ) =>
    Array.from(
      NodeApi.elements({
        children: parseHtmlSliceContent(editor, html) ?? [],
        type: 'root',
      }),
      ([node]) => node
    )
      .filter((node) => node.type === editor.plugin(BaseLinkPlugin).schema.type)
      .map((node) => node.url);

  it('keeps tel and relative destinations on HTML import', () => {
    const editor = createImportEditor();

    expect(
      importedUrls(
        editor,
        '<a href="tel:+15551234">Call</a><a href="docs/page.html">Docs</a>'
      )
    ).toEqual(['tel:+15551234', 'docs/page.html']);
  });

  it('reports a destination the allowed schemes refuse during HTML parsing', () => {
    const editor = createImportEditor({ allowedSchemes: ['mailto'] });
    const source = '<a href="https://example.com">Link</a>';
    // The label stays, so the lost destination warns under every policy.
    const parsed = editor.api.html.parseSlice(source);

    expect(parsed).toMatchObject({
      diagnostics: [
        {
          action: 'unwrapped',
          code: 'html-unsupported-content',
          kind: 'attribute',
          severity: 'warning',
        },
      ],
      ok: true,
    });
    if (!parsed.ok) throw new Error('Expected a slice.');
    expect(
      NodeApi.string({ children: parsed.slice.content, type: 'root' })
    ).toBe('Link');
    expect(importedUrls(editor, source)).toEqual([]);
  });
});

const mark = (name: string) =>
  definePlugin(name, {
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

const createEditingEditor = ({
  options,
  selection,
  value,
}: {
  selection?: Selection;
  value: Value;
  options?: Partial<BaseLinkDefinition['initialState']>;
}) =>
  createProductEditor({
    plugins: [
      mark('bold'),
      mark('italic'),
      options
        ? BaseLinkPlugin.configure({ initialState: options })
        : BaseLinkPlugin,
    ],
    selection,
    initialValue: value,
  });

const findLink = (
  editor: ReturnType<typeof createEditingEditor>
): LinkElement | undefined =>
  editor.read.nodes.find({
    at: [],
    type: BaseLinkPlugin,
  })?.[0];

describe('editor.update.link.upsert', () => {
  it('inserts a URL at a collapsed selection', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(editor.update.link.upsert({ url: 'https://example.com' })).toBe(
      true
    );
    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'https://example.com' }],
      url: 'https://example.com',
    });
  });

  it('uses custom text and preserves focused leaf marks', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ bold: true, text: 'test' }], type: 'paragraph' }],
    });

    editor.update.link.upsert({
      text: 'Example',
      url: 'https://example.com',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ bold: true, text: 'Example' }],
      url: 'https://example.com',
    });
  });

  it('updates URL, target, and text inside an existing link', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'old' }],
              type: 'link',
              url: 'https://old.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.link.upsert({
      target: '_blank',
      text: 'new',
      url: 'https://new.dev',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'new' }],
      target: '_blank',
      url: 'https://new.dev',
    });
  });

  it('uses the URL when replacement text is empty', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: 'old' }],
              type: 'link',
              url: 'https://old.dev',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.link.upsert({ text: '', url: 'https://new.dev' });

    expect(findLink(editor)?.children).toEqual([{ text: 'https://new.dev' }]);
  });

  it('wraps an expanded selection and can replace its text', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [
        {
          children: [{ italic: true, text: 'hello world' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.link.upsert({
      text: 'Example',
      url: 'https://example.com',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ italic: true, text: 'Example' }],
      url: 'https://example.com',
    });
    expect(editor.read.text.string([0])).toBe('Example world');
  });

  it('replaces only the selected part of each link the selection touches', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 5, 0] },
      },
      value: [
        {
          children: [
            { text: 'a ' },
            {
              children: [{ text: 'one' }],
              type: 'link',
              url: 'https://one.example',
            },
            { text: ' b ' },
            {
              children: [{ text: 'two' }],
              type: 'link',
              url: 'https://two.example',
            },
            { text: ' c ' },
            {
              children: [{ text: 'old' }],
              type: 'link',
              url: 'https://old.example',
            },
            { text: ' tail' },
          ],
          type: 'paragraph',
        },
      ],
    });

    expect(editor.update.link.upsert({ url: 'https://new.example' })).toBe(
      true
    );
    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'a ' },
          {
            children: [{ text: 'o' }],
            type: 'link',
            url: 'https://one.example',
          },
          { text: '' },
          {
            children: [{ text: 'ne b two c ol' }],
            type: 'link',
            url: 'https://new.example',
          },
          { text: '' },
          {
            children: [{ text: 'd' }],
            type: 'link',
            url: 'https://old.example',
          },
          { text: ' tail' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('links text whose selection only touches the links around it', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 3, 0] },
      },
      value: [
        {
          children: [
            { text: 'a ' },
            {
              children: [{ text: 'one' }],
              type: 'link',
              url: 'https://one.example',
            },
            { text: ' mid ' },
            {
              children: [{ text: 'two' }],
              type: 'link',
              url: 'https://two.example',
            },
            { text: ' tail' },
          ],
          type: 'paragraph',
        },
      ],
    });

    expect(editor.update.link.upsert({ url: 'https://new.example' })).toBe(
      true
    );
    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'a ' },
          {
            children: [{ text: 'one' }],
            type: 'link',
            url: 'https://one.example',
          },
          { text: '' },
          {
            children: [{ text: ' mid ' }],
            type: 'link',
            url: 'https://new.example',
          },
          { text: '' },
          {
            children: [{ text: 'two' }],
            type: 'link',
            url: 'https://two.example',
          },
          { text: ' tail' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('links nothing over a selection that holds only a line break', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      value: [
        { children: [{ text: 'a' }], type: 'paragraph' },
        { children: [{ text: 'b' }], type: 'paragraph' },
      ],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.upsert({ url: 'https://new.example' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('links nothing when the only block that can hold a link is empty', () => {
    const editor = createProductEditor({
      plugins: [BaseCodeBlockPlugin, BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [2, 0] },
      },
      initialValue: [
        { children: [{ text: 'a' }], type: 'codeBlock' },
        { children: [{ text: '' }], type: 'paragraph' },
        { children: [{ text: 'b' }], type: 'codeBlock' },
      ],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.upsert({ url: 'https://new.example' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('refuses a selection that starts right before a mention', () => {
    const editor = createProductEditor({
      plugins: [BaseMentionPlugin, BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'a ' },
            { children: [{ text: '' }], label: 'x', ref: 'x', type: 'mention' },
            { text: ' b' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.upsert({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('refuses a selection that ends right after a mention', () => {
    const editor = createProductEditor({
      plugins: [BaseMentionPlugin, BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'a ' },
            { children: [{ text: '' }], label: 'x', ref: 'x', type: 'mention' },
            { text: ' b' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.upsert({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('refuses an expanded selection in a block that cannot hold a link', () => {
    const editor = createProductEditor({
      plugins: [BaseCodeBlockPlugin, BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'code here' }], type: 'codeBlock' }],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.upsert({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('refuses to wrap text around an inline a link cannot hold', () => {
    const editor = createProductEditor({
      plugins: [BaseMentionPlugin, BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'a ' },
            { children: [{ text: '' }], label: 'x', ref: 'x', type: 'mention' },
            { text: ' b' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.upsert({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('links only the blocks of a selection that can hold a link', () => {
    const editor = createProductEditor({
      plugins: [BaseCodeBlockPlugin, BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: 'code' }], type: 'codeBlock' },
      ],
    });
    const codeBlock = editor.read.children()[1];

    expect(editor.update.link.upsert({ url: 'https://example.com' })).toBe(
      true
    );
    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'o' },
          {
            children: [{ text: 'ne' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
      codeBlock,
    ]);
  });

  it.each([
    ['tel:+15551234', undefined],
    ['vscode://settings/editor', ['https', 'vscode']],
  ])('admits %s when its scheme is allowed', (url, allowedSchemes) => {
    const editor = createEditingEditor({
      options: allowedSchemes ? { allowedSchemes } : undefined,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(editor.update.link.upsert({ url })).toBe(true);
    expect(findLink(editor)?.url).toBe(url);
  });

  it('refuses a URL whose scheme the app does not allow', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(
      editor.update.link.upsert({ url: 'ftp://example.com' })
    ).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();
  });

  it('does nothing without a selection', () => {
    const editor = createEditingEditor({
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(
      editor.update.link.upsert({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();
  });
});

describe('editor.update.link.unwrap', () => {
  const value = [
    {
      children: [
        { text: 'x' },
        {
          children: [{ text: 'abcdef' }],
          type: 'link',
          url: 'https://example.com',
        },
        { text: 'y' },
      ],
      type: 'paragraph',
    },
  ] as const;
  const createUnwrapEditor = (anchor: Point, focus: Point) =>
    createProductEditor({
      plugins: [BaseLinkPlugin],
      selection: { kind: 'text', anchor, focus },
      initialValue: value,
    });
  const splitCases: Array<{
    anchor: Point;
    children: unknown[];
    focus: Point;
  }> = [
    {
      anchor: { offset: 1, path: [0, 0] },
      children: [
        { text: 'xab' },
        {
          children: [{ text: 'cdef' }],
          type: 'link',
          url: 'https://example.com',
        },
        { text: 'y' },
      ],
      focus: { offset: 2, path: [0, 1, 0] },
    },
    {
      anchor: { offset: 4, path: [0, 1, 0] },
      children: [
        { text: 'x' },
        {
          children: [{ text: 'abcd' }],
          type: 'link',
          url: 'https://example.com',
        },
        { text: 'efy' },
      ],
      focus: { offset: 1, path: [0, 2] },
    },
  ];

  it('unwraps an entire link when split mode is off', () => {
    const editor = createUnwrapEditor(
      { offset: 0, path: [0, 1, 0] },
      { offset: 6, path: [0, 1, 0] }
    );

    editor.update.link.unwrap();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'xabcdefy' }], type: 'paragraph' },
    ]);
  });

  it.each(splitCases)(
    'keeps the unselected part linked in split mode',
    (fixture) => {
      const editor = createUnwrapEditor(fixture.anchor, fixture.focus);

      editor.update.link.unwrap({ split: true });

      expect(editor.read.children()).toEqual([
        { children: fixture.children, type: 'paragraph' },
      ]);
    }
  );

  it.each([
    ['a caret', { offset: 2, path: [0, 1, 0] }, undefined],
    [
      'an explicit point',
      { offset: 0, path: [0, 0] },
      { offset: 2, path: [0, 1, 0] },
    ],
  ])('unwraps the whole link at %s in split mode', (_, caret, at) => {
    const editor = createUnwrapEditor(caret, caret);

    expect(editor.update.link.unwrap({ at, split: true })).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'xabcdefy' }], type: 'paragraph' },
    ]);
  });

  it('unwraps only the selected middle fragment in split mode', () => {
    const editor = createUnwrapEditor(
      { offset: 2, path: [0, 1, 0] },
      { offset: 4, path: [0, 1, 0] }
    );

    editor.update.link.unwrap({ split: true });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: 'ab' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: 'cd' },
          {
            children: [{ text: 'ef' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: 'y' },
        ],
        type: 'paragraph',
      },
    ]);
  });
});

describe('editor.update.link.upsertText', () => {
  const createUpsertTextEditor = () =>
    createProductEditor({
      plugins: [mark('bold'), BaseLinkPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1, 0] },
        focus: { offset: 3, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ bold: true, text: 'old' }, { text: ' tail' }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ],
    });

  it('replaces children and preserves first-leaf marks', () => {
    const editor = createUpsertTextEditor();

    editor.update.link.upsertText({
      text: 'new value',
      url: 'https://example.com',
    });

    expect(editor.read.nodes.find({ type: 'link' })?.[0]).toMatchObject({
      children: [{ bold: true, text: 'new value' }],
      type: 'link',
    });
  });

  it('does nothing without different replacement text', () => {
    const editor = createUpsertTextEditor();
    const before = editor.read.children();

    editor.update.link.upsertText({
      text: 'old tail',
      url: 'https://example.com',
    });
    editor.update.link.upsertText({ url: 'https://example.com' });

    expect(editor.read.children()).toEqual(before);
  });
});

describe('editor.update.link.insert', () => {
  it('refuses a URL whose scheme the app does not allow', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(
      editor.update.link.insert({ text: 'file', url: 'ftp://example.com' })
    ).toBeUndefined();
    expect(editor.read.text.string([0])).toBe('test');
  });
});

describe('editor.update.link.wrap', () => {
  it('refuses a URL whose scheme the app does not allow', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(
      editor.update.link.wrap({ url: 'ftp://example.com' })
    ).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();
  });

  it('refuses a wrap without split that would take a link the selection only touches', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { text: 'plain ' },
            {
              children: [{ text: 'old' }],
              type: 'link',
              url: 'https://old.example',
            },
            { text: ' tail' },
          ],
          type: 'paragraph',
        },
      ],
    });
    const before = editor.read.lastCommit();

    expect(
      editor.update.link.wrap({ split: false, url: 'https://new.example' })
    ).toBeUndefined();
    expect(editor.read.lastCommit()).toBe(before);
  });

  it('returns undefined when there is no selection to wrap', () => {
    const editor = createEditingEditor({
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(
      editor.update.link.wrap({ url: 'https://example.com' })
    ).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();
  });

  it('wraps selected text and preserves surrounding content', () => {
    const input = (
      <editor>
        <hp>
          hello <anchor />
          world
          <focus />!
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createProductEditor({
      plugins: [BaseLinkPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.link.wrap({
      target: '_self',
      url: 'https://example.com',
    });

    expect(editor.read.children()).toEqual(
      (
        <editor>
          <hp>
            hello{' '}
            <ha target="_self" url="https://example.com">
              world
            </ha>
            !
          </hp>
        </editor>
      ).children
    );
  });
});

const createRuntimeEditor = (value: Value) =>
  createProductEditor({
    plugins: [BaseLinkPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 4, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    },
    initialValue: value,
  });

describe('BaseLinkPlugin runtime', () => {
  it('creates and selects a text leaf after a terminal link', () => {
    const editor = createRuntimeEditor([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'link',
            url: 'https://example.com',
          },
        ],
        type: 'paragraph',
      },
    ]);

    editor.update.value.repair();
    editor.update.text.insert('x');

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: 'x' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 1, path: [0, 2] },
      focus: { offset: 1, path: [0, 2] },
    });
  });

  it('selects the existing text leaf after a link', () => {
    const editor = createRuntimeEditor([
      {
        children: [
          { text: 'Before ' },
          {
            children: [{ text: 'link' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: ' after' },
        ],
        type: 'paragraph',
      },
    ]);

    editor.update.value.repair();
    editor.update.text.insert('x');

    expect(editor.read.text.string([0])).toBe('Before linkx after');
    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { text: 'Before ' },
        { children: [{ text: 'link' }], type: 'link' },
        { text: 'x after' },
      ],
    });
  });
});
