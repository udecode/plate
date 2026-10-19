import commonmarkSpec from 'commonmark-spec';
import type { Root } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import {
  getMarkdownTagRepair,
  type MarkdownTagRegistry,
  remarkMarkdownTags,
  trimIncompleteMarkdownTag,
} from './markdownTags';

const tags: MarkdownTagRegistry = new Map([
  ['callout', 'block'],
  ['column', 'block'],
  ['columnGroup', 'block'],
  ['del', 'inline'],
  ['details', 'block'],
  ['img', 'block'],
  ['summary', 'block'],
  ['toc', 'block'],
  ['u', 'inline'],
]);

const plain = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const tagged = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkMarkdownTags, { tags });

const parsePlain = (source: string) => plain.runSync(plain.parse(source));
const parse = (source: string) => tagged.runSync(tagged.parse(source), source);

type AnyNode = {
  attributes?: Array<{ name: string; value: unknown }>;
  children?: AnyNode[];
  name?: string;
  position?: { end: { offset?: number }; start: { offset?: number } };
  type: string;
  value?: string;
};

const strip = (node: AnyNode): unknown => {
  const {
    data: _data,
    position: _position,
    ...rest
  } = node as AnyNode & {
    data?: unknown;
  };

  return rest.children ? { ...rest, children: rest.children.map(strip) } : rest;
};
const shape = (source: string) => strip(parse(source) as AnyNode);

const elements = (node: AnyNode): AnyNode[] => [
  ...(node.type.startsWith('mdxJsx') ? [node] : []),
  ...(node.children ?? []).flatMap(elements),
];

describe('registered Markdown tags', () => {
  // CommonMark 0.31.2 examples from the `commonmark-spec` package
  // (CC-BY-SA-4.0, https://spec.commonmark.org). The package spells tabs `→`.
  it('parses every CommonMark example like plain CommonMark unless it uses a registered tag', () => {
    const registered = new RegExp(
      `</?(?:${[...tags.keys()].join('|')})[\\s/>]`
    );
    const unexpected: number[] = [];

    for (const { markdown, number } of commonmarkSpec.tests) {
      const source = markdown.replaceAll('→', '\t');

      if (registered.test(source)) continue;
      if (
        JSON.stringify(parsePlain(source)) !== JSON.stringify(parse(source))
      ) {
        unexpected.push(number);
      }
    }

    expect(unexpected).toEqual([]);
  });

  it('accepts every string', () => {
    const alphabet = [
      '<',
      '>',
      '/',
      '"',
      "'",
      '{',
      '}',
      '=',
      ' ',
      '\n',
      '\n\n',
      '\t',
      'callout',
      'u',
      'details',
      'summary',
      'column',
      'div',
      'x',
      '*',
      '-',
      '> ',
      '`',
      '|',
      '&quot;',
      'icon',
      '    ',
      '$$',
    ];
    let seed = 7;
    const next = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31;

      return seed / 2 ** 31;
    };

    for (let sample = 0; sample < 2000; sample++) {
      const source = Array.from(
        { length: 1 + Math.floor(next() * 30) },
        () => alphabet[Math.floor(next() * alphabet.length)]
      ).join('');

      expect(() => parse(source)).not.toThrow();
    }
  });

  it('keeps ordinary Markdown that MDX rejects', () => {
    expect(shape('Array<string> and x<y and {name}')).toEqual(
      strip(parsePlain('Array<string> and x<y and {name}') as AnyNode)
    );
    expect(shape('see <https://example.com>')).toEqual(
      strip(parsePlain('see <https://example.com>') as AnyNode)
    );
    expect(shape('text\n\n    const x = 1;')).toMatchObject({
      children: [
        { type: 'paragraph' },
        { type: 'code', value: 'const x = 1;' },
      ],
    });
  });

  it('nests block tags without blank lines or indentation', () => {
    expect(
      shape(
        '<columnGroup>\n<column width="50%">\nleft **bold**\n</column>\n<column>\nright\n</column>\n</columnGroup>'
      )
    ).toMatchObject({
      children: [
        {
          children: [
            {
              attributes: [{ name: 'width', value: '50%' }],
              children: [{ type: 'paragraph' }],
              name: 'column',
              type: 'mdxJsxFlowElement',
            },
            { name: 'column', type: 'mdxJsxFlowElement' },
          ],
          name: 'columnGroup',
          type: 'mdxJsxFlowElement',
        },
      ],
    });
  });

  it('treats a line holding only a block element as a block', () => {
    expect(
      shape('<details>\n<summary>Title</summary>\nbody\n</details>')
    ).toMatchObject({
      children: [
        {
          children: [
            {
              children: [{ children: [{ value: 'Title' }], type: 'paragraph' }],
              name: 'summary',
              type: 'mdxJsxFlowElement',
            },
            { children: [{ value: 'body' }], type: 'paragraph' },
          ],
          name: 'details',
        },
      ],
    });
    expect(shape('<callout icon="💡">hello</callout>')).toMatchObject({
      children: [{ name: 'callout', type: 'mdxJsxFlowElement' }],
    });
  });

  it('repairs unbalanced tags without losing content', () => {
    const unclosed = parse('<callout>\n\nhello **wor') as AnyNode;
    const [callout] = elements(unclosed);

    expect(getMarkdownTagRepair(callout as never)).toMatchObject({
      atEnd: true,
      repair: 'unclosed',
    });

    const stray = parse('text </callout> more') as AnyNode;
    const html = stray.children![0].children!.find(
      (node) => node.type === 'html'
    )!;

    expect(html.value).toBe('</callout>');
    expect(getMarkdownTagRepair(html as never)).toMatchObject({
      atEnd: false,
      repair: 'unmatched',
    });

    const misplaced = parse('a <callout>b</callout> c') as AnyNode;
    const paragraph = misplaced.children![0];

    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children!.map((node) => node.value ?? node.type)).toEqual([
      'a ',
      '<callout>',
      'b',
      '</callout>',
      ' c',
    ]);
    expect(getMarkdownTagRepair(paragraph.children![1] as never)).toMatchObject(
      {
        atEnd: false,
        repair: 'misplaced',
      }
    );
  });

  it('never lets a registered name open a raw HTML block', () => {
    expect(
      shape('<details>\n<summary>x</summary>\n\nbody\n\n</details>')
    ).toMatchObject({
      children: [{ name: 'details', type: 'mdxJsxFlowElement' }],
    });
    expect(shape('<div>\nraw\n</div>')).toEqual(
      strip(parsePlain('<div>\nraw\n</div>') as AnyNode)
    );
  });

  it('slices element positions exactly to their source', () => {
    const source =
      'Intro.\n\n<columnGroup>\n  <column width="50%">\n    Left **bold**\n  </column>\n</columnGroup>\n\nsee <u>under</u> and <del>gone</del>';
    const tree = parse(source) as AnyNode;

    for (const element of elements(tree)) {
      const slice = source.slice(
        element.position!.start.offset,
        element.position!.end.offset
      );

      expect(slice.startsWith(`<${element.name}`)).toBe(true);
      expect(slice.endsWith(`</${element.name}>`)).toBe(true);
    }
  });

  it('reads legacy MDX output that indents children', () => {
    const source =
      '<columnGroup>\n  <column width="50%">\n    Left **bold**\n  </column>\n  <column width="50%">\n    <callout icon="🔥">\n      Deep\n    </callout>\n  </column>\n</columnGroup>';
    const tree = parse(source) as AnyNode;
    const [group] = tree.children!;

    expect(strip(group)).toMatchObject({
      children: [
        {
          children: [
            {
              children: [{ value: 'Left ' }, { type: 'strong' }],
              type: 'paragraph',
            },
          ],
          name: 'column',
        },
        {
          children: [
            {
              children: [{ children: [{ value: 'Deep' }], type: 'paragraph' }],
              name: 'callout',
            },
          ],
          name: 'column',
        },
      ],
      name: 'columnGroup',
    });

    const bold = group.children![0].children![0].children![1];

    expect(
      source.slice(bold.position!.start.offset, bold.position!.end.offset)
    ).toBe('**bold**');
  });

  it('writes tags that read back, escaping literals and attribute values', () => {
    const writer = unified()
      .use(remarkMarkdownTags, { tags })
      .use(remarkStringify);
    const tree: Root = {
      children: [
        {
          attributes: [
            { name: 'icon', type: 'mdxJsxAttribute', value: 'a"b&c\nd' },
          ],
          children: [
            {
              children: [{ type: 'text', value: 'hi <callout> </del>' }],
              type: 'paragraph',
            },
          ],
          name: 'callout',
          type: 'mdxJsxFlowElement',
        },
      ],
      type: 'root',
    };
    const markdown = writer.stringify(tree);

    expect(markdown).toBe(
      '<callout icon="a&quot;b&amp;c&#10;d">hi \\<callout> \\</del></callout>\n'
    );
    expect(shape(markdown)).toEqual({
      children: [
        {
          attributes: [
            { name: 'icon', type: 'mdxJsxAttribute', value: 'a"b&c\nd' },
          ],
          children: [
            {
              children: [{ type: 'text', value: 'hi <callout> </del>' }],
              type: 'paragraph',
            },
          ],
          name: 'callout',
          type: 'mdxJsxFlowElement',
        },
      ],
      type: 'root',
    });
  });

  it('trims only an incomplete trailing registered tag for previews', () => {
    expect(trimIncompleteMarkdownTag('text <cal', tags)).toBe('text ');
    expect(trimIncompleteMarkdownTag('text <callout icon="x', tags)).toBe(
      'text '
    );
    expect(trimIncompleteMarkdownTag('text </co', tags)).toBe('text ');
    expect(trimIncompleteMarkdownTag('Map<string', tags)).toBe('Map<string');
    expect(trimIncompleteMarkdownTag('a <callout>b', tags)).toBe(
      'a <callout>b'
    );
  });
});
