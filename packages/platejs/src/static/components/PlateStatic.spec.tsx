/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { property, schema, target, TextApi, type Value } from '../../core';
import {
  BaseParagraphPlugin,
  type Editor,
  createEditor as createHeadlessEditor,
  definePlugin,
} from '../../lib';
import { getEditorLiveSelection } from '../../testing';
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
