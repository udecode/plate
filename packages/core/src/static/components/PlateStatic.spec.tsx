/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import ReactDOMServer from 'react-dom/server';

import type { Value } from '@platejs/plite';
import { render } from '@testing-library/react';

import { type BaseEditor, createBaseEditor, createBasePlugin } from '../../lib';
import { PlateStatic } from './PlateStatic';
import { PliteElement, PliteLeaf } from './plite-nodes';

const components = {
  bold: LeafStaticMock,
  p: ElementStaticMock,
};

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
} = {}) =>
  createBaseEditor({
    components,
    plugins: [createBasePlugin({ key: 'bold', node: { isLeaf: true } })],
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value,
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
} = {}) =>
  createBaseEditor({
    components,
    plugins: [createBasePlugin({ key: 'bold', node: { isLeaf: true } })],
    value,
  });

// Memoization tests intentionally mutate the live root reference.
const readMutableRoot = (editor: BaseEditor) => editor.read.children() as Value;

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

  it('does not re-render if only text changes since element is memoized', () => {
    const editor = createEditor();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // This will mutate the text only
    readMutableRoot(editor)[0].children[1].text = 'New text';

    // Re-render with the updated children
    // (the reference changed as well as the text)
    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('only re-render modified element and leaf when editing a single element', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);

    // Modify only the second paragraph
    readMutableRoot(editor)[1] = {
      ...readMutableRoot(editor)[1],
      children: [
        readMutableRoot(editor)[1].children[0],
        readMutableRoot(editor)[1].children[1],
        { bold: true, text: 'Modified' },
      ],
    };

    // Re-render with the modified editor
    rerender(<PlateStatic editor={editor} />);

    // We expect only one element to re-render (the modified one)
    expect(getElementRenderCount()).toBe(3);
    // We expect only one leaf to re-render (the new bold leaf)
    expect(getLeafRenderCount()).toBe(3);

    readMutableRoot(editor)[1] = {
      ...readMutableRoot(editor)[1],
      children: [
        readMutableRoot(editor)[1].children[0],
        readMutableRoot(editor)[1].children[1],
        // Node equals
        {
          ...readMutableRoot(editor)[1].children[2],
          text: 'Modified',
        },
      ],
    };
    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(4);
    expect(getLeafRenderCount()).toBe(3);
  });

  it('preserve memoization when adding and removing new elements', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Add a new paragraph
    readMutableRoot(editor).push({
      children: [{ text: 'New Paragraph' }],
      type: 'p',
    });

    rerender(<PlateStatic editor={editor} />);

    // We expect only the new element to render
    expect(getElementRenderCount()).toBe(3);

    readMutableRoot(editor).pop();

    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(3);
  });

  it('use _memo property for memoization when available', () => {
    const editor = createEditor();

    readMutableRoot(editor)[0]._memo = 'memo-value';

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Modify element but keep same _memo
    readMutableRoot(editor)[0] = {
      ...readMutableRoot(editor)[0],
      children: [
        { text: 'different text' },
        { bold: true, text: 'still' },
        { text: 'same memo' },
      ],
    };

    rerender(<PlateStatic editor={editor} />);

    // Should not re-render because _memo is the same
    expect(getElementRenderCount()).toBe(1);
  });

  it('re-render when _memo changes', () => {
    const editor = createEditor();

    readMutableRoot(editor)[0]._memo = 'memo-value';

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Change _memo value
    readMutableRoot(editor)[0] = {
      ...readMutableRoot(editor)[0],
      _memo: 'new-memo-value',
    };

    rerender(<PlateStatic editor={editor} />);

    // Should re-render because _memo changed
    expect(getElementRenderCount()).toBe(2);
  });

  describe('when rendering unknown element type', () => {
    it('does not crash when encountering an element with an unknown type', () => {
      const editor = createBaseEditor({
        plugins: [createBasePlugin({ key: 'bold', node: { isLeaf: true } })],
        value: [
          {
            id: '1',
            children: [
              {
                text: 'This content is of an unknown type and should not crash the editor.',
              },
            ],
            type: 'unknown-element-type', // This type has no corresponding plugin
          },
        ],
      });

      // This assertion will fail if the bug exists, as render() will throw.
      // If the bug is fixed, render() should not throw.
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
    });
    const editor = createBaseEditor({
      plugins: [TonePlugin],
      value: [
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
