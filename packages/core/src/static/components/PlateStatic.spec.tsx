/// <reference types="@testing-library/jest-dom" />

// If your actual memoized components are named "ElementStatic" and "LeafStatic",
// you can wrap them with a mock or rename them in test for clarity.

import React from 'react';

import { render } from '@testing-library/react';

import { createSlateEditor, createSlatePlugin } from '../../lib';
// We assume these are your real components (memoized) imported:
import { PlateStatic } from './PlateStatic';
import { SlateElement, SlateLeaf } from './slate-nodes';

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
  createSlateEditor({
    components,
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
    components,
    plugins: [createSlatePlugin({ key: 'bold', node: { isLeaf: true } })],
    value,
  });

let elementRenderCount = 0;

function ElementStaticMock(props: Parameters<typeof SlateElement>[0]) {
  elementRenderCount++;

  return <SlateElement {...props} />;
}

/** Expose the render count so our tests can read it */
function getElementRenderCount() {
  return elementRenderCount;
}

function resetElementRenderCount() {
  elementRenderCount = 0;
}

let leafRenderCount = 0;

function LeafStaticMock(props: Parameters<typeof SlateLeaf>[0]) {
  leafRenderCount++;

  return <SlateLeaf {...props} />;
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

  it('should render elements/leaves initially', () => {
    const editor = createEditor();

    render(<PlateStatic editor={editor} />);

    // We expect at least 1 element (the <p>...) and 1 leaf
    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('should NOT re-render elements/leaves if the same `value` reference is passed', () => {
    const editor = createEditor();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Re-render with the **same** editor.children reference:
    rerender(<PlateStatic editor={editor} />);

    // Expect no additional renders of elements/leaves
    expect(getElementRenderCount()).toEqual(1);
    expect(getLeafRenderCount()).toEqual(1);
  });

  it('should re-render elements/leaves if `value` changes by reference', () => {
    const editor = createEditor();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Create a new array reference with the same content (just to test reference changes)
    const newValueRef = [
      {
        children: [{ text: 'Hello world' }], // same text, but new object
        type: 'p',
      },
    ];

    // Re-render with a new reference:
    rerender(<PlateStatic value={newValueRef} editor={editor} />);

    // Now we expect re-renders because the array reference changed
    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('should re-render if slate mutation', () => {
    const editor = createEditor();

    render(<PlateStatic editor={editor} />);

    // This will mutate the text but also element reference
    editor.tf.insertText('+');

    // Re-render with the updated children
    // (the reference changed as well as the text)
    render(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(2);
    expect(getLeafRenderCount()).toBe(2);
  });

  it('should not re-render if only text changes since element is memoized', () => {
    const editor = createEditor();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // This will mutate the text only
    editor.children[0].children[1].text = 'New text';

    // Re-render with the updated children
    // (the reference changed as well as the text)
    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(1);
    expect(getLeafRenderCount()).toBe(1);
  });

  it('should only re-render modified element and leaf when editing a single element', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<PlateStatic editor={editor} />);

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
    rerender(<PlateStatic editor={editor} />);

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
    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(4);
    expect(getLeafRenderCount()).toBe(3);
  });

  it('should preserve memoization when adding and removing new elements', () => {
    const editor = createEditorWithMultipleElements();

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Add a new paragraph
    editor.children.push({
      children: [{ text: 'New Paragraph' }],
      type: 'p',
    });

    rerender(<PlateStatic editor={editor} />);

    // We expect only the new element to render
    expect(getElementRenderCount()).toBe(3);

    editor.children.pop();

    rerender(<PlateStatic editor={editor} />);

    expect(getElementRenderCount()).toBe(3);
  });

  it('should use _memo property for memoization when available', () => {
    const editor = createEditor();

    editor.children[0]._memo = 'memo-value';

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Modify element but keep same _memo
    editor.children[0] = {
      ...editor.children[0],
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

  it('should re-render when _memo changes', () => {
    const editor = createEditor();

    editor.children[0]._memo = 'memo-value';

    const { rerender } = render(<PlateStatic editor={editor} />);

    // Change _memo value
    editor.children[0] = {
      ...editor.children[0],
      _memo: 'new-memo-value',
    };

    rerender(<PlateStatic editor={editor} />);

    // Should re-render because _memo changed
    expect(getElementRenderCount()).toBe(2);
  });

  describe('when rendering unknown element type', () => {
    it('should not crash when encountering an element with an unknown type', () => {
      const editor = createSlateEditor({
        plugins: [createSlatePlugin({ key: 'bold', node: { isLeaf: true } })],
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
});
