/* eslint-disable testing-library/no-render-in-lifecycle */
// If your actual memoized components are named "ElementStatic" and "LeafStatic",
// you can wrap them with a mock or rename them in test for clarity.

import React from 'react';

import { render } from '@testing-library/react';

import { createSlateEditor } from '../../editor';
import { createSlatePlugin } from '../../plugin';
// We assume these are your real components (memoized) imported:
import { PlateStatic } from './PlateStatic';
import { SlateElement } from './SlateElement';
import { SlateLeaf } from './SlateLeaf';

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
  createSlateEditor({
    plugins: [createSlatePlugin({ key: 'bold', node: { isLeaf: true } })],
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
  createSlateEditor({
    plugins: [createSlatePlugin({ key: 'bold', node: { isLeaf: true } })],
    value,
  });

const components = {
  bold: LeafStaticMock,
  p: ElementStaticMock,
};

let elementRenderCount = 0;

function ElementStaticMock(props: Parameters<typeof SlateElement>[0]) {
  elementRenderCount++;

  return <SlateElement {...props} />;
}

/** Expose the render count so our tests can read it */
export function getElementRenderCount() {
  return elementRenderCount;
}

export function resetElementRenderCount() {
  elementRenderCount = 0;
}

let leafRenderCount = 0;

function LeafStaticMock(props: Parameters<typeof SlateLeaf>[0]) {
  leafRenderCount++;

  return <SlateLeaf {...props} />;
}

export function getLeafRenderCount() {
  return leafRenderCount;
}

export function resetLeafRenderCount() {
  leafRenderCount = 0;
}

describe('PlateStatic Memoization', () => {
  beforeEach(() => {
    resetElementRenderCount();
    resetLeafRenderCount();
  });

  it('should render elements/leaves initially', () => {
    const editor = createEditor();

    render(<PlateStatic components={components} editor={editor} />);

    // We expect at least 1 element (the <p>...) and 1 leaf
    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('should NOT re-render elements/leaves if the same `value` reference is passed', () => {
    const editor = createEditor();

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    // Re-render with the **same** editor.children reference:
    rerender(<PlateStatic components={components} editor={editor} />);

    // Expect no additional renders of elements/leaves
    expect(getElementRenderCount()).toEqual(1);
    expect(getLeafRenderCount()).toEqual(1);
  });

  it('should re-render elements/leaves if `value` changes by reference', () => {
    const editor = createEditor();

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    // Create a new array reference with the same content (just to test reference changes)
    const newValueRef = [
      {
        children: [{ text: 'Hello world' }], // same text, but new object
        type: 'p',
      },
    ];

    // Re-render with a new reference:
    rerender(
      <PlateStatic
        value={newValueRef}
        components={components}
        editor={editor}
      />
    );

    // Now we expect re-renders because the array reference changed
    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('should re-render if slate mutation', () => {
    const editor = createEditor();

    render(<PlateStatic components={components} editor={editor} />);

    // This will mutate the text but also element reference
    editor.tf.insertText('+');

    // Re-render with the updated children
    // (the reference changed as well as the text)
    render(<PlateStatic components={components} editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);
  });

  it('should not re-render if only text changes since element is memoized', () => {
    const editor = createEditor();

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    // This will mutate the text only
    editor.children[0].children[1].text = 'New text';

    // Re-render with the updated children
    // (the reference changed as well as the text)
    rerender(<PlateStatic components={components} editor={editor} />);

    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('should only re-render modified element and leaf when editing a single element', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);

    // Modify only the second paragraph
    editor.children[1] = {
      ...editor.children[1],
      children: [
        editor.children[1].children[0],
        editor.children[1].children[1],
        { bold: true, text: 'Modified' },
      ],
    };

    // Re-render with the modified editor
    rerender(<PlateStatic components={components} editor={editor} />);

    // We expect only one element to re-render (the modified one)
    expect(getElementRenderCount()).toBe(3);
    // We expect only one leaf to re-render (the new bold leaf)
    expect(getLeafRenderCount()).toBe(3);

    editor.children[1] = {
      ...editor.children[1],
      children: [
        editor.children[1].children[0],
        editor.children[1].children[1],
        // Node equals
        { ...editor.children[1].children[2], text: 'Modified' },
      ],
    };
    rerender(<PlateStatic components={components} editor={editor} />);

    expect(getElementRenderCount()).toBe(4);
    expect(getLeafRenderCount()).toBe(3);
  });

  it('should preserve memoization when adding and removing new elements', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    // Add a new paragraph
    editor.children.push({
      children: [{ text: 'New Paragraph' }],
      type: 'p',
    });

    rerender(<PlateStatic components={components} editor={editor} />);

    // We expect only the new element to render
    expect(getElementRenderCount()).toBe(3);

    editor.children.pop();

    rerender(<PlateStatic components={components} editor={editor} />);

    expect(getElementRenderCount()).toBe(3);
  });

  it('should use _memo property for memoization when available', () => {
    const editor = createEditor();

    editor.children[0]._memo = 'memo-value';

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    // Modify element but keep same _memo
    editor.children[0] = {
      ...editor.children[0],
      children: [
        { text: 'different text' },
        { bold: true, text: 'still' },
        { text: 'same memo' },
      ],
    };

    rerender(<PlateStatic components={components} editor={editor} />);

    // Should not re-render because _memo is the same
    expect(getElementRenderCount()).toBe(1);
  });

  it('should re-render when _memo changes', () => {
    const editor = createEditor();

    editor.children[0]._memo = 'memo-value';

    const { rerender } = render(
      <PlateStatic components={components} editor={editor} />
    );

    // Change _memo value
    editor.children[0] = {
      ...editor.children[0],
      _memo: 'new-memo-value',
    };

    rerender(<PlateStatic components={components} editor={editor} />);

    // Should re-render because _memo changed
    expect(getElementRenderCount()).toBe(2);
  });
});
