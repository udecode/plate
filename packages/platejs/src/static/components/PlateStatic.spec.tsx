/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { authored } from '../../authored';
import {
  createEditorView,
  NodeApi,
  property,
  schema,
  target,
  TextApi,
  type Value,
} from '../../core';
import { BaseHeadingPlugin } from '../../features/basic-nodes/lib/BaseHeadingPlugins';
import { BaseListPlugin } from '../../features/list/lib/BaseListPlugin';
import { BaseTocPlugin } from '../../features/toc/lib/BaseTocPlugin';
import {
  BaseParagraphPlugin,
  type Editor,
  createEditor as createHeadlessEditor,
  definePlugin,
} from '../../lib';
import { getEditorLiveSelection } from '../../testing';
import { renderStaticHtml } from '../renderStaticHtml';
import { EditorStatic } from './PlateStatic';
import { EditorElement, EditorLeaf } from './plite-nodes';

const RevisionPlugin = definePlugin('revision', {
  schema: {
    properties: {
      revision: schema.elementProperty(property.number(), {
        target: target.type('paragraph'),
      }),
    },
  },
});

it('composes base plugin content attributes on the static root without editing-only paint', () => {
  const BasePaint = definePlugin('baseContentPaint', {
    render: {
      contentAttributes: {
        className: 'base',
        style: { color: 'red', backgroundColor: 'white' },
        'data-feature': 'base',
      },
    },
  });
  const editor = createHeadlessEditor({
    initialValue: [
      { children: [{ text: 'static content' }], type: 'paragraph' },
    ],
    plugins: [
      BasePaint,
      definePlugin('secondStaticContentPaint', {
        render: {
          contentAttributes: { className: 'second', 'data-feature': 'second' },
        },
      }),
      definePlugin('staticEditingPaint', {
        editOnly: { render: true },
        render: { contentAttributes: { className: 'editing' } },
      }),
      definePlugin('disabledStaticContentPaint', {
        enabled: false,
        render: { contentAttributes: { className: 'disabled' } },
      }),
    ],
  });
  const { container } = render(
    <EditorStatic
      editor={editor}
      className="consumer"
      style={{ color: 'blue' }}
      data-feature="consumer"
    />
  );
  const root = container.firstElementChild!;
  expect(root).toHaveAttribute('data-editor-node', 'value');
  expect(root.className).toBe('editor-editor base second consumer');
  expect(root).toHaveStyle({ color: 'blue', backgroundColor: 'white' });
  expect(root).toHaveAttribute('data-feature', 'consumer');
  expect(root.textContent).toBe('static content');
});

it('renders feature-owned decoration attributes without observing the source', () => {
  const observe = mock(() => () => {});
  const plugin = definePlugin('staticPaint', {
    decorate: {
      observe,
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node)
          ? [
              {
                attributes: { 'data-feature': 'static', className: 'semantic' },
                key: 'static-paint',
                range: {
                  anchor: { offset: 0, path },
                  focus: { offset: node.text.length, path },
                },
              },
            ]
          : [],
    },
  }).configure({
    decorate: {
      attributes: { className: 'feature-paint', style: { color: 'red' } },
    },
  });
  const editor = createHeadlessEditor({
    initialValue: [{ children: [{ text: 'annotated' }], type: 'paragraph' }],
    plugins: [plugin],
  });
  const html = ReactDOMServer.renderToStaticMarkup(
    <EditorStatic editor={editor} />
  );

  expect(html).toContain('class="semantic feature-paint"');
  expect(html).toContain('data-feature="static"');
  expect(html).toContain('color:red');
  expect(observe).not.toHaveBeenCalled();
});

const createEditor = ({
  value = [
    {
      children: [
        { text: 'one' },
        { bold: true, text: 'two' },
        { text: 'three' },
      ],
      type: 'paragraph',
    },
  ],
}: {
  value?: Value;
} = {}) =>
  createHeadlessEditor({
    plugins: [
      definePlugin('bold', {
        component: LeafStaticMock,
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      }),
      BaseParagraphPlugin.configure({ component: ElementStaticMock }),
      RevisionPlugin,
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: value,
  });

const createEditorWithMultipleElements = ({
  value = [
    {
      children: [
        { text: 'one' },
        { bold: true, text: 'two' },
        { text: 'three' },
      ],
      type: 'paragraph',
    },
    {
      children: [{ text: '4' }, { bold: true, text: '5' }, { text: '6' }],
      type: 'paragraph',
    },
  ],
}: {
  value?: Value;
} = {}) =>
  createHeadlessEditor({
    plugins: [
      definePlugin('bold', {
        component: LeafStaticMock,
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      }),
      BaseParagraphPlugin.configure({ component: ElementStaticMock }),
      RevisionPlugin,
    ],
    initialValue: value,
  });

const replaceRoot = (editor: Editor, children: Value) => {
  editor.update.value.replace({
    children,
    selection: getEditorLiveSelection(editor),
  });
};

let elementRenderCount = 0;

function ElementStaticMock(props: Parameters<typeof EditorElement>[0]) {
  elementRenderCount += 1;

  return <EditorElement {...props} />;
}

/** Expose the render count so our tests can read it */
function getElementRenderCount() {
  return elementRenderCount;
}

function resetElementRenderCount() {
  elementRenderCount = 0;
}

let leafRenderCount = 0;

function LeafStaticMock(props: Parameters<typeof EditorLeaf>[0]) {
  leafRenderCount += 1;

  return <EditorLeaf {...props} />;
}

function getLeafRenderCount() {
  return leafRenderCount;
}

function resetLeafRenderCount() {
  leafRenderCount = 0;
}

describe('PlateStatic Memoization', () => {
  beforeEach(() => {
    resetElementRenderCount();
    resetLeafRenderCount();
  });

  it('render elements/leaves initially', () => {
    const editor = createEditor();

    render(<EditorStatic editor={editor} />);

    // We expect at least 1 element (the <p>...) and 1 leaf
    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('does not re-render elements/leaves if the same `value` reference is passed', () => {
    const editor = createEditor();

    const { rerender } = render(<EditorStatic editor={editor} />);

    // Re-render with the **same** editor.read.children() reference:
    rerender(<EditorStatic editor={editor} />);

    // Expect no additional renders of elements/leaves
    expect(getElementRenderCount()).toEqual(1);
    expect(getLeafRenderCount()).toEqual(1);
  });

  it('re-render elements/leaves if editor children changes by reference', () => {
    const editor = createEditor();

    const { rerender } = render(<EditorStatic editor={editor} />);

    // Create a new array reference with the same content (just to test reference changes)
    const newValueRef = [
      {
        // same text, but new object
        children: [{ text: 'Hello world' }],
        type: 'paragraph',
      },
    ];

    replaceRoot(editor, newValueRef);
    rerender(<EditorStatic editor={editor} />);

    // Now we expect re-renders because the array reference changed
    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('re-render if Plite mutation', () => {
    const editor = createEditor();

    render(<EditorStatic editor={editor} />);

    // This will mutate the text but also element reference
    editor.update.text.insert('+');

    // Re-render with the updated children
    // (the reference changed as well as the text)
    render(<EditorStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);
  });

  it('only re-render modified element and leaf when editing a single element', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<EditorStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);

    editor.update.nodes.set({ bold: true, text: 'Modified' }, { at: [1, 2] });

    // Re-render with the modified editor
    rerender(<EditorStatic editor={editor} />);

    // We expect only one element to re-render (the modified one)
    expect(getElementRenderCount()).toBe(3);
    // We expect only one leaf to re-render (the new bold leaf)
    expect(getLeafRenderCount()).toBe(3);

    editor.update.nodes.set({ revision: 1 }, { at: [1] });
    rerender(<EditorStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(4);
    expect(getLeafRenderCount()).toBe(3);
  });

  it('preserve memoization when adding and removing new elements', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<EditorStatic editor={editor} />);

    const initialValue = editor.read.children();

    replaceRoot(editor, [
      ...initialValue,
      { children: [{ text: 'New Paragraph' }], type: 'paragraph' },
    ]);

    rerender(<EditorStatic editor={editor} />);

    // We expect only the new element to render
    expect(getElementRenderCount()).toBe(3);

    replaceRoot(editor, [...initialValue]);

    rerender(<EditorStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(3);
  });

  describe('when rendering an element without a component', () => {
    it('uses the registered element fallback', () => {
      const editor = createHeadlessEditor({
        plugins: [
          definePlugin('fallbackElement', {
            schema: {
              element: {
                content: schema.content.text({ default: 'text', min: 1 }),
              },
            },
          }),
        ],
        initialValue: [
          {
            children: [
              {
                text: 'This registered element has no component.',
              },
            ],
            type: 'fallbackElement',
          },
        ],
      });

      expect(() => {
        render(<EditorStatic editor={editor} />);
      }).not.toThrow();
    });
  });

  it('renders text node injections when the path is already known', () => {
    const TonePlugin = definePlugin('tone', {
      schema: { mark: { property: property.string() } },
      inject: {
        nodeProps: {
          nodeKey: 'tone',
          styleKey: 'color',
        },
      },
    });
    const editor = createHeadlessEditor({
      plugins: [TonePlugin],
      initialValue: [
        {
          children: [{ text: 'hi', tone: 'red' }],
          type: 'paragraph',
        },
      ],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      <EditorStatic editor={editor} />
    );

    expect(markup).toContain('color:red');
  });

  it('renders and refreshes element-owned content roots through ordinary components', () => {
    const editor = createHeadlessEditor({
      plugins: [
        definePlugin('figure', {
          component: ({ slots }) => (
            <figure>
              <figcaption>{slots.contentRoot('caption')}</figcaption>
            </figure>
          ),
          schema: {
            element: {
              contentRoots: {
                caption: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
              blockContent: true,
              void: 'block',
            },
          },
        }),
        BaseParagraphPlugin.configure({
          component: (props) => (
            <EditorElement
              {...props}
              attributes={{
                ...props.attributes,
                'data-caption-block': true,
              }}
            />
          ),
        }),
      ],
      initialValue: {
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: {
          'caption:1': [
            { children: [{ text: 'First caption' }], type: 'paragraph' },
          ],
        },
      },
    });
    const view = render(<EditorStatic editor={editor} />);
    const caption = view
      .getByText('First caption')
      .closest('[data-caption-block]');
    const captionText = view
      .getByText('First caption')
      .closest('[data-editor-node="text"]');

    expect(view.getByText('First caption')).toBeInTheDocument();
    expect(caption).toBeInTheDocument();
    expect(caption?.getAttribute('data-editor-node-key')).toBeNull();
    expect(caption?.getAttribute('data-editor-path')).toBe('0');
    expect(caption?.getAttribute('data-editor-root')).toBe('caption:1');
    expect(captionText?.getAttribute('data-editor-path')).toBe('0,0');
    expect(captionText?.getAttribute('data-editor-root')).toBe('caption:1');

    editor.update((tx) => {
      tx.roots.replace('caption:1', [
        { children: [{ text: 'Updated caption' }], type: 'paragraph' },
      ]);
    });
    view.rerender(<EditorStatic editor={editor} />);

    expect(view.getByText('Updated caption')).toBeInTheDocument();
    expect(view.queryByText('First caption')).not.toBeInTheDocument();
  });

  it('reads every callback inside a content root through that root', () => {
    const readers: string[] = [];
    const paragraph = (text: string) => ({
      children: [{ text }],
      type: 'paragraph',
    });
    const item = (text: string) => ({
      ...paragraph(text),
      indent: 1,
      listType: 'numbered',
    });
    const editor = createHeadlessEditor({
      plugins: [
        definePlugin('figure', {
          component: ({ slots }) => (
            <figure>
              <figcaption>{slots.contentRoot('caption')}</figcaption>
            </figure>
          ),
          schema: {
            element: {
              contentRoots: {
                caption: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
              blockContent: true,
              void: 'block',
            },
          },
        }),
        definePlugin('own', {
          decorate: {
            read: ({ editor: reader, entry: [node, path] }) =>
              TextApi.isText(node) && reader.read.nodes.get(path)?.[0] === node
                ? [
                    {
                      attributes: { 'data-own': node.text },
                      key: `own:${path.join(',')}`,
                      range: {
                        anchor: { offset: 0, path },
                        focus: { offset: 1, path },
                      },
                    },
                  ]
                : [],
          },
        }),
        BaseListPlugin.configure({
          slots: {
            wrapNodeChildren: ({ element }) =>
              element.listType === 'numbered'
                ? (props) => (
                    <ol
                      start={props.editor
                        .plugin(BaseListPlugin)
                        .read.ordinal(props.path)}
                    >
                      <li>{props.children}</li>
                    </ol>
                  )
                : undefined,
          },
        }),
        BaseParagraphPlugin.configure({
          component: (props) => {
            readers.push(
              props.editor.read.nodes.get(props.path)?.[0] === props.element
                ? 'same'
                : 'other'
            );

            return <EditorElement {...props} />;
          },
        }),
      ],
      initialValue: {
        children: [
          paragraph('Main'),
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: { 'caption:1': [item('One'), item('Two')] },
      },
    });
    const document = {
      children: [
        paragraph('Body'),
        {
          childRoots: { caption: 'caption:1' },
          children: [{ text: '' }],
          type: 'figure',
        },
      ],
      roots: { 'caption:1': [item('Uno'), item('Dos'), item('Tres')] },
    };
    const renders = [
      render(<EditorStatic editor={editor} />),
      render(<EditorStatic document={document} editor={editor} />),
    ];
    const [live, preview] = renders.map(({ container }) => ({
      marked: [...container.querySelectorAll('[data-own]')].map((element) =>
        element.getAttribute('data-own')
      ),
      starts: [...container.querySelectorAll('ol')].map((element) =>
        element.getAttribute('start')
      ),
    }));

    expect(readers).not.toContain('other');
    expect(live).toEqual({
      marked: ['Main', 'One', 'Two'],
      starts: ['1', '2'],
    });
    expect(preview).toEqual({
      marked: ['Body', 'Uno', 'Dos', 'Tres'],
      starts: ['1', '2', '3'],
    });
    expect(editor.read.root('caption:1')).toEqual([item('One'), item('Two')]);
  });

  it('renders content roots in the current authored mode of the rendering view', () => {
    const editor = createHeadlessEditor({
      plugins: [
        definePlugin('figure', {
          component: ({ slots }) => (
            <figure>
              <figcaption>{slots.contentRoot('caption')}</figcaption>
            </figure>
          ),
          schema: {
            element: {
              contentRoots: {
                caption: {
                  content: schema.content.type('paragraph', {
                    default: { type: 'paragraph' },
                    min: 1,
                  }),
                  ownership: 'exclusive',
                },
              },
              blockContent: true,
              void: 'block',
            },
          },
        }),
        authored({ authorId: 'alice' }),
      ],
      initialValue: {
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: {
          'caption:1': [{ children: [{ text: 'Foot' }], type: 'paragraph' }],
        },
      },
    });
    const proposed = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    createEditorView(proposed, { root: 'caption:1' }).update.text.insert(
      ' draft',
      { at: { offset: 4, path: [0, 0] } }
    );

    const view = render(<EditorStatic editor={proposed} />);

    expect(view.container.textContent).toBe('Foot draft');

    proposed.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    view.rerender(<EditorStatic editor={proposed} />);

    expect(view.container.textContent).toBe('Foot');
  });
});

describe('PlateStatic render slots', () => {
  it('does not invoke dynamic editable sibling slots', () => {
    let siblingRenderCount = 0;
    const DynamicSibling = () => {
      siblingRenderCount += 1;

      return <span data-testid="dynamic-sibling" />;
    };
    const editor = createHeadlessEditor({
      initialValue: [{ children: [{ text: 'static' }], type: 'paragraph' }],
      plugins: [
        definePlugin('dynamicSibling', {
          slots: {
            afterEditable: DynamicSibling,
            beforeEditable: DynamicSibling,
          },
        }),
      ],
    });
    const view = render(<EditorStatic editor={editor} />);

    expect(view.queryByTestId('dynamic-sibling')).not.toBeInTheDocument();
    expect(siblingRenderCount).toBe(0);
  });
});

describe('EditorStatic document', () => {
  it('renders a document through the editor plugins without editing the editor', () => {
    const editor = createHeadlessEditor({
      initialValue: [
        { children: [{ text: 'Own content' }], type: 'paragraph' },
      ],
    });
    const value = editor.read.value();
    const commit = editor.read.lastCommit();
    const html = ReactDOMServer.renderToStaticMarkup(
      <EditorStatic
        document={{
          children: [{ children: [{ text: 'Preview' }], type: 'paragraph' }],
        }}
        editor={editor}
      />
    );

    expect(html).toContain('Preview');
    expect(html).not.toContain('Own content');
    expect(editor.read.value()).toEqual(value);
    expect(editor.read.lastCommit()).toBe(commit);
  });

  it('renders a table of contents from the document', async () => {
    const heading = (text: string) => ({
      children: [{ text }],
      level: 1,
      type: 'heading',
    });
    const editor = createHeadlessEditor({
      initialValue: [heading('Source')],
      plugins: [
        BaseHeadingPlugin,
        BaseTocPlugin.configure({
          component: ({ editor: rendered }) => (
            <aside>
              {rendered
                .plugin(BaseTocPlugin)
                .read.headings()
                .map((item) => item.title)
                .join(',')}
            </aside>
          ),
        }),
      ],
    });
    const document = {
      children: [{ children: [{ text: '' }], type: 'toc' }, heading('Preview')],
    };

    expect(
      ReactDOMServer.renderToStaticMarkup(
        <EditorStatic document={document} editor={editor} />
      )
    ).toContain('<aside>Preview</aside>');
    const exported = await renderStaticHtml(editor, { document });

    expect(exported.data).toContain('<aside>Preview</aside>');
  });

  it('renders again only from the first changed block of another document', () => {
    const renders: string[] = [];
    const editor = createHeadlessEditor({
      plugins: [
        BaseParagraphPlugin.configure({
          // Reads the block before it, as list numbering does.
          component: (props) => {
            const children = props.editor.read.children();
            const previous = children[children.indexOf(props.element) - 1];

            renders.push(NodeApi.string(props.element));

            return (
              <EditorElement {...props}>
                {previous ? NodeApi.string(previous) : ''}&gt;
                {props.children};
              </EditorElement>
            );
          },
        }),
      ],
    });
    const paragraph = (text: string) => ({
      children: [{ text }],
      type: 'paragraph',
    });
    const [a, b, c] = [paragraph('a'), paragraph('b'), paragraph('c')];
    const view = render(
      <EditorStatic document={{ children: [a, b] }} editor={editor} />
    );

    renders.length = 0;
    view.rerender(
      <EditorStatic document={{ children: [a, b, c] }} editor={editor} />
    );

    expect(renders).toEqual(['c']);

    renders.length = 0;
    view.rerender(
      <EditorStatic
        document={{ children: [paragraph('A'), b, c] }}
        editor={editor}
      />
    );

    expect(renders).toEqual(['A', 'b', 'c']);
    expect(view.container.textContent).toBe('>A;A>b;b>c;');
  });

  it('renders a table of contents again when a later heading arrives', () => {
    const heading = (text: string) => ({
      children: [{ text }],
      level: 1,
      type: 'heading',
    });
    const editor = createHeadlessEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseTocPlugin.configure({
          component: ({ editor: rendered }) => (
            <aside>
              {rendered
                .plugin(BaseTocPlugin)
                .read.headings()
                .map((item) => item.title)
                .join(',')}
            </aside>
          ),
        }),
      ],
    });
    const toc = { children: [{ text: '' }], type: 'toc' };
    const one = heading('One');
    const view = render(
      <EditorStatic document={{ children: [toc, one] }} editor={editor} />
    );

    view.rerender(
      <EditorStatic
        document={{ children: [toc, one, heading('Two')] }}
        editor={editor}
      />
    );

    expect(view.container.querySelector('aside')?.textContent).toBe('One,Two');
  });

  it('renders a table of contents inside another block again when a later heading arrives', () => {
    const heading = (text: string) => ({
      children: [{ text }],
      level: 1,
      type: 'heading',
    });
    const editor = createHeadlessEditor({
      plugins: [
        BaseHeadingPlugin,
        BaseTocPlugin.configure({
          component: ({ editor: rendered }) => (
            <aside>
              {rendered
                .plugin(BaseTocPlugin)
                .read.headings()
                .map((item) => item.title)
                .join(',')}
            </aside>
          ),
        }),
        definePlugin('box', {
          schema: { element: { content: { allowed: { kind: 'open' } } } },
        }),
      ],
    });
    const box = {
      children: [{ children: [{ text: '' }], type: 'toc' }],
      type: 'box',
    };
    const one = heading('One');
    const view = render(
      <EditorStatic document={{ children: [box, one] }} editor={editor} />
    );

    view.rerender(
      <EditorStatic
        document={{ children: [box, one, heading('Two')] }}
        editor={editor}
      />
    );

    expect(view.container.querySelector('aside')?.textContent).toBe('One,Two');
  });

  it('marks only the last text when a reused block stops being last', () => {
    const LastTextPlugin = definePlugin('lastText', {
      decorate: {
        read: ({ editor: rendered, entry: [node, path] }) =>
          TextApi.isText(node) &&
          NodeApi.last(
            { children: rendered.read.children(), type: '' },
            []
          )[0] === node
            ? [
                {
                  attributes: { 'data-last': '' },
                  key: 'last',
                  range: {
                    anchor: { offset: 0, path },
                    focus: { offset: node.text.length, path },
                  },
                },
              ]
            : [],
      },
    });
    const editor = createHeadlessEditor({ plugins: [LastTextPlugin] });
    const paragraph = (text: string) => ({
      children: [{ text }],
      type: 'paragraph',
    });
    const [a, b] = [paragraph('a'), paragraph('b')];
    const view = render(
      <EditorStatic document={{ children: [a, b] }} editor={editor} />
    );

    view.rerender(
      <EditorStatic
        document={{ children: [a, b, paragraph('c')] }}
        editor={editor}
      />
    );

    expect(
      [...view.container.querySelectorAll('[data-last]')].map(
        (node) => node.textContent
      )
    ).toEqual(['c']);
  });

  it('refuses a leaf render that reads the source editor', () => {
    let source: Editor | undefined;
    const editor = createHeadlessEditor({
      plugins: [
        definePlugin('count', {
          schema: {
            mark: property.boolean({ default: false, omitDefault: true }),
          },
          render: {
            mark: {
              leafAttributes: () => ({
                'data-blocks': String(source?.read.children().length),
              }),
            },
          },
        }),
      ],
    });
    source = editor;

    expect(() =>
      ReactDOMServer.renderToStaticMarkup(
        <EditorStatic
          document={{
            children: [
              { children: [{ count: true, text: 'a' }], type: 'paragraph' },
            ],
          }}
          editor={editor}
        />
      )
    ).toThrow(/while a document view was reading/);
  });
});
