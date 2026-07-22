/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { property, schema, target, type Value } from '@platejs/plite';
import { render } from '@testing-library/react';

import { type BaseEditor, createBaseEditor, createBasePlugin } from '../../lib';
import { PlateStatic } from './PlateStatic';
import { PliteElement, PliteLeaf } from './plite-nodes';

const components = {
  bold: LeafStaticMock,
  p: ElementStaticMock,
};

const RevisionPlugin = createBasePlugin({
  key: 'revision',
  schema: {
    properties: [
      schema.elementProperty('revision', property.number(), {
        target: target.type('p'),
      }),
    ],
  },
});

const createEditor = ({
  value = [
    {
      children: [
        { text: 'one' },
        { bold: true, text: 'two' },
        { text: 'three' },
      ],
      type: 'p',
    },
  ],
}: {
  value?: Value;
} = {}) =>
  createBaseEditor({
    components,
    plugins: [
      createBasePlugin({
        key: 'bold',
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      }),
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
      type: 'p',
    },
    {
      children: [{ text: '4' }, { bold: true, text: '5' }, { text: '6' }],
      type: 'p',
    },
  ],
}: {
  value?: Value;
} = {}) =>
  createBaseEditor({
    components,
    plugins: [
      createBasePlugin({
        key: 'bold',
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
      }),
      RevisionPlugin,
    ],
    initialValue: value,
  });

const replaceRoot = (editor: BaseEditor, children: Value) => {
  editor.update.value.replace({
    children,
    selection: editor.read.selection(),
  });
};

let elementRenderCount = 0;

function ElementStaticMock(props: Parameters<typeof PliteElement>[0]) {
  elementRenderCount++;

  return <PliteElement {...props} />;
}

/** Expose the render count so our tests can read it */
function getElementRenderCount() {
  return elementRenderCount;
}

function resetElementRenderCount() {
  elementRenderCount = 0;
}

let leafRenderCount = 0;

function LeafStaticMock(props: Parameters<typeof PliteLeaf>[0]) {
  leafRenderCount++;

  return <PliteLeaf {...props} />;
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

    render(<PlateStatic editor={editor} />);

    // We expect at least 1 element (the <p>...) and 1 leaf
    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('does not re-render elements/leaves if the same `value` reference is passed', () => {
    const editor = createEditor();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Re-render with the **same** editor.read.children() reference:
    rerender(<PlateStatic editor={editor} />);

    // Expect no additional renders of elements/leaves
    expect(getElementRenderCount()).toEqual(1);
    expect(getLeafRenderCount()).toEqual(1);
  });

  it('re-render elements/leaves if editor children changes by reference', () => {
    const editor = createEditor();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Create a new array reference with the same content (just to test reference changes)
    const newValueRef = [
      {
        children: [{ text: 'Hello world' }], // same text, but new object
        type: 'p',
      },
    ];

    replaceRoot(editor, newValueRef);
    rerender(<PlateStatic editor={editor} />);

    // Now we expect re-renders because the array reference changed
    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('re-render if Plite mutation', () => {
    const editor = createEditor();

    render(<PlateStatic editor={editor} />);

    // This will mutate the text but also element reference
    editor.update.text.insert('+');

    // Re-render with the updated children
    // (the reference changed as well as the text)
    render(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);
  });

  it('only re-render modified element and leaf when editing a single element', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);

    editor.update.nodes.set({ bold: true, text: 'Modified' }, { at: [1, 2] });

    // Re-render with the modified editor
    rerender(<PlateStatic editor={editor} />);

    // We expect only one element to re-render (the modified one)
    expect(getElementRenderCount()).toBe(3);
    // We expect only one leaf to re-render (the new bold leaf)
    expect(getLeafRenderCount()).toBe(3);

    editor.update.nodes.set({ revision: 1 }, { at: [1] });
    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(4);
    expect(getLeafRenderCount()).toBe(3);
  });

  it('preserve memoization when adding and removing new elements', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<PlateStatic editor={editor} />);

    const initialValue = editor.read.children();

    replaceRoot(editor, [
      ...initialValue,
      { children: [{ text: 'New Paragraph' }], type: 'p' },
    ]);

    rerender(<PlateStatic editor={editor} />);

    // We expect only the new element to render
    expect(getElementRenderCount()).toBe(3);

    replaceRoot(editor, [...initialValue]);

    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(3);
  });

  describe('when rendering an element without a component', () => {
    it('uses the registered element fallback', () => {
      const editor = createBaseEditor({
        plugins: [
          createBasePlugin({
            key: 'fallback-element',
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
            type: 'fallback-element',
          },
        ],
      });

      expect(() => {
        render(<PlateStatic editor={editor} />);
      }).not.toThrow();
    });
  });

  it('renders text node injections when the path is already known', () => {
    const TonePlugin = createBasePlugin({
      inject: {
        nodeProps: {
          nodeKey: 'tone',
          styleKey: 'color',
        },
      },
      key: 'tone',
      schema: { mark: { property: property.string() } },
    });
    const editor = createBaseEditor({
      plugins: [TonePlugin],
      initialValue: [
        {
          children: [{ text: 'hi', tone: 'red' }],
          type: 'p',
        },
      ],
    });
    const markup = ReactDOMServer.renderToStaticMarkup(
      <PlateStatic editor={editor} />
    );

    expect(markup).toContain('color:red');
  });
});
