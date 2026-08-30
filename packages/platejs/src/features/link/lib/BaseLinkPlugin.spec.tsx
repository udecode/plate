/** @jsx jsxt */

import { jsxt, type TestEditor } from '#platejs-test-internal';

import {
  createEditor as createProductEditor,
  defineBasePlugin,
  getPlateRuntime,
  NodeApi,
  property,
  type Point,
  type Selection,
  type Value,
} from '../../../core';
import type { LinkDefinition } from '../../../react/features/link/LinkPlugin';
import {
  BaseLinkPlugin,
  type BaseLinkDefinition,
  type LinkElement,
} from './BaseLinkPlugin';

jsxt;

describe('BaseLinkPlugin', () => {
  const createEditor = () =>
    createProductEditor({
      plugins: [BaseLinkPlugin],
    });

  it('parses valid anchors with a default target', () => {
    const editor = createEditor();
    const fragment = editor.api.html.deserialize({
      element: '<a href="https://example.com">Link</a>',
    });
    const link = Array.from(
      NodeApi.elements({ children: fragment ?? [], type: 'root' }),
      ([node]) => node
    ).find((node) => node.type === editor.plugin(BaseLinkPlugin).schema.type);

    expect(link).toMatchObject({
      children: [{ text: 'Link' }],
      target: '_blank',
      type: editor.plugin(BaseLinkPlugin).schema.type,
      url: 'https://example.com',
    });
  });

  it('rejects missing and unsafe href values', () => {
    const editor = createEditor();
    const fragment = editor.api.html.deserialize({
      element: '<a>No href</a><a href="javascript:alert(1)">Bad</a>',
    });
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

    expect(anchor?.getAttribute('href')).toBe('https://example.com/');
    expect(anchor?.getAttribute('target')).toBe('_self');
    expect(anchor?.textContent).toBe('Link');
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

  describe('when url is invalid and skipSanitization is true', () => {
    const editorWithSkipSanitization = createApiEditor({
      dangerouslySkipSanitization: true,
    });

    const link: LinkElement = {
      ...baseLink,
      target: '_self',
      url: 'pageKey',
    };

    it('keeps href when sanitization is skipped', () => {
      expect(
        editorWithSkipSanitization
          .plugin(BaseLinkPlugin)
          .api.getAttributes(link)
      ).toEqual({
        href: 'pageKey',
        rel: 'noopener noreferrer',
        target: '_self',
      });
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

describe('BaseLinkPlugin.api.validateUrl', () => {
  const createTestEditor = (
    options: Partial<BaseLinkDefinition['initialState']> = {}
  ) =>
    createProductEditor({
      plugins: [
        BaseLinkPlugin.configure({
          initialState: options,
        }),
      ],
    });

  describe('internal links', () => {
    it('validates paths starting with /', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('/internal/path')
      ).toBe(true);
    });

    it('lets a custom isUrl reject paths starting with /', () => {
      const editor = createTestEditor({
        isUrl: (url) => !url.startsWith('/'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('/internal/path')
      ).toBe(false);
    });

    it('rejects protocol-relative URLs starting with //', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('//example.com')
      ).toBe(false);
    });

    it('validates anchor links starting with #', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#section-name')
      ).toBe(true);
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#top')).toBe(true);
    });

    it('lets a custom isUrl reject anchor links', () => {
      const editor = createTestEditor({
        isUrl: (url) => !url.startsWith('#'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#section-name')
      ).toBe(false);
    });
  });

  describe('markdown headings', () => {
    it.each([
      '# heading1',
      '## heading2',
      '### heading3',
      '#### heading4',
      '##### heading5',
      '###### heading6',
      '# My Title',
      '## 2.3 Section',
      '### Hello World!',
    ])('rejects %s', (value) => {
      const editor = createTestEditor();

      expect(editor.plugin(BaseLinkPlugin).api.validateUrl(value)).toBe(false);
    });
  });

  describe('external links', () => {
    it.each(['http://example.com', 'https://example.com'])(
      'validates %s',
      (url) => {
        const editor = createTestEditor();

        expect(editor.plugin(BaseLinkPlugin).api.validateUrl(url)).toBe(true);
      }
    );

    it('uses a custom isUrl function', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url) => url.startsWith('custom://'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('custom://example')
      ).toBe(true);
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('http://example.com')
      ).toBe(false);
    });

    it('still sanitizes URLs accepted by custom isUrl', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url) =>
          url.startsWith('javascript:') || url.startsWith('custom://'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('javascript:alert("XSS")')
      ).toBe(false);
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('custom://example')
      ).toBe(true);
    });

    it('can explicitly skip sanitization', () => {
      const editor = createTestEditor({
        dangerouslySkipSanitization: true,
        isUrl: (url) => url.startsWith('javascript:'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('javascript:alert("XSS")')
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('validates an empty anchor', () => {
      const editor = createTestEditor();

      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#')).toBe(true);
    });

    it.each(['#heading1', '##heading2'])(
      'validates anchor-like value %s',
      (value) => {
        const editor = createTestEditor();

        expect(editor.plugin(BaseLinkPlugin).api.validateUrl(value)).toBe(true);
      }
    );
  });

  it('uses configured URL options during HTML parsing', () => {
    const editor = createTestEditor({
      allowedSchemes: ['mailto'],
      isUrl: () => true,
    });
    const fragment = editor.api.html.deserialize({
      element: '<a href="https://example.com">Link</a>',
    });

    expect(
      Array.from(
        NodeApi.elements({ children: fragment ?? [], type: 'root' }),
        ([node]) => node
      ).some((node) => node.type === editor.plugin(BaseLinkPlugin).schema.type)
    ).toBe(false);
  });
});

const mark = (name: string) =>
  defineBasePlugin(name, {
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

  it('inserts text when requested inside an existing link', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 1, 0] },
        focus: { offset: 3, path: [0, 1, 0] },
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
      insertTextInLink: true,
      url: ' appended',
    });

    expect(findLink(editor)).toMatchObject({
      children: [{ text: 'old appended' }],
      url: 'https://old.dev',
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

  it('rejects invalid URLs unless validation is skipped', () => {
    const editor = createEditingEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      value: [{ children: [{ text: 'test' }], type: 'paragraph' }],
    });

    expect(editor.update.link.upsert({ url: 'not a url' })).toBeUndefined();
    expect(findLink(editor)).toBeUndefined();

    expect(
      editor.update.link.upsert({ skipValidation: true, url: 'not a url' })
    ).toBe(true);
    expect(findLink(editor)?.url).toBe('not a url');
  });

  it('honors a custom URL validator', () => {
    const editor = createEditingEditor({
      options: { isUrl: (url) => url.startsWith('/custom') },
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(editor.update.link.upsert({ url: '/internal' })).toBeUndefined();
    expect(editor.update.link.upsert({ url: '/custom/value' })).toBe(true);
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
    focus: Point;
    linked: string;
    plain: string;
  }> = [
    {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
      linked: 'abcd',
      plain: 'efy',
    },
    {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 2, path: [0, 1, 0] },
      linked: 'ab',
      plain: 'cdefy',
    },
    {
      anchor: { offset: 4, path: [0, 1, 0] },
      focus: { offset: 1, path: [0, 2] },
      linked: 'abcd',
      plain: 'efy',
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
    'preserves the linked fragment in split mode',
    (fixture) => {
      const editor = createUnwrapEditor(fixture.anchor, fixture.focus);

      editor.update.link.unwrap({ split: true });

      expect(editor.read.children()).toEqual([
        {
          children: [
            { text: 'x' },
            {
              children: [{ text: fixture.linked }],
              type: 'link',
              url: 'https://example.com',
            },
            { text: fixture.plain },
          ],
          type: 'paragraph',
        },
      ]);
    }
  );

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

describe('editor.update.link.wrap', () => {
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
