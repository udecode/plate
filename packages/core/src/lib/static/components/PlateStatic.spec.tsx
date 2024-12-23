// If your actual memoized components are named "ElementStatic" and "LeafStatic",
// you can wrap them with a mock or rename them in test for clarity.

import React from 'react';

// We assume these are your real components (memoized) imported:
import { ElementStatic as RealElementStatic } from './PlateStatic';
import { LeafStatic as RealLeafStatic } from './PlateStatic';

let elementRenderCount = 0;

function ElementStaticMock(props: Parameters<typeof RealElementStatic>[0]) {
  elementRenderCount++;

  return <RealElementStatic {...props} />;
}

/** Expose the render count so our tests can read it */
export function getElementRenderCount() {
  return elementRenderCount;
}

export function resetElementRenderCount() {
  elementRenderCount = 0;
}

let leafRenderCount = 0;

function LeafStaticMock(props: Parameters<typeof RealLeafStatic>[0]) {
  leafRenderCount++;

  return <RealLeafStatic {...props} />;
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
    const editor = createPlateEditor({
      // minimal config
      // or supply your real plugins
      plugins: [],
      value: [
        {
          children: [{ text: 'Hello world' }],
          type: 'p',
        },
      ],
    });

    render(
      <PlateStatic
        value={editor.children}
        components={{}} // Provide your NodeComponents if you have them
        editor={editor}
      />
    );

    // We expect at least 1 element (the <p>...) and 1 leaf
    expect(getElementRenderCount()).toBeGreaterThan(0);
    expect(getLeafRenderCount()).toBeGreaterThan(0);
  });

  it('should NOT re-render elements/leaves if the same `value` reference is passed', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: [
        {
          children: [{ text: 'Hello world' }],
          type: 'p',
        },
      ],
    });

    const { rerender } = render(
      <PlateStatic
        value={editor.children} // same array reference
        components={{}}
        editor={editor}
      />
    );
    const initialElementCount = getElementRenderCount();
    const initialLeafCount = getLeafRenderCount();

    // Re-render with the **same** editor.children reference:
    act(() => {
      rerender(
        <PlateStatic
          value={editor.children} // same reference as before
          components={{}}
          editor={editor}
        />
      );
    });

    // Expect no additional renders of elements/leaves
    expect(getElementRenderCount()).toEqual(initialElementCount);
    expect(getLeafRenderCount()).toEqual(initialLeafCount);
  });

  it('should re-render elements/leaves if `value` changes by reference', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: [
        {
          children: [{ text: 'Hello world' }],
          type: 'p',
        },
      ],
    });

    const { rerender } = render(
      <PlateStatic value={editor.children} components={{}} editor={editor} />
    );

    const initialElementCount = getElementRenderCount();
    const initialLeafCount = getLeafRenderCount();

    // Create a new array reference with the same content (just to test reference changes)
    const newValueRef = [
      {
        children: [{ text: 'Hello world' }], // same text, but new object
        type: 'p',
      },
    ];

    // Re-render with a new reference:
    act(() => {
      rerender(
        <PlateStatic value={newValueRef} components={{}} editor={editor} />
      );
    });

    // Now we expect re-renders because the array reference changed
    expect(getElementRenderCount()).toBeGreaterThan(initialElementCount);
    expect(getLeafRenderCount()).toBeGreaterThan(initialLeafCount);
  });

  it('should re-render if text changes', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: [
        {
          children: [{ text: 'First text' }],
          type: 'p',
        },
      ],
    });

    render(
      <PlateStatic value={editor.children} components={{}} editor={editor} />
    );

    const initialElementCount = getElementRenderCount();
    const initialLeafCount = getLeafRenderCount();

    // Now we mutate the text in editor.children (like simulating a user edit),
    // or create a brand-new array with updated text.
    editor.children = [
      {
        children: [{ text: 'New text' }],
        type: 'p',
      },
    ];

    // Re-render with the updated children
    // (the reference changed as well as the text)
    render(
      <PlateStatic value={editor.children} components={{}} editor={editor} />
    );

    expect(getElementRenderCount()).toBeGreaterThan(initialElementCount);
    expect(getLeafRenderCount()).toBeGreaterThan(initialLeafCount);
  });
});
