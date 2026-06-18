import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import type { Descendant } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';

import { createReactEditor, Editable, Slate } from '../src';

const getFirstElement = (container: HTMLElement) => {
  const element = container.querySelector('[data-slate-node="element"]');

  if (!(element instanceof HTMLElement)) {
    throw new Error('Expected the editor to render a block element.');
  }

  return element;
};

const getElementByPath = (container: HTMLElement, path: string) => {
  const element = container.querySelector(
    `[data-slate-node="element"][data-slate-path="${path}"]`
  );

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected Slate element at path ${path}.`);
  }

  return element;
};

const getTextByPath = (container: HTMLElement, path: string) => {
  const element = container.querySelector(
    `[data-slate-node="text"][data-slate-path="${path}"]`
  );

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected Slate text at path ${path}.`);
  }

  return element;
};

const getZeroWidthLineBreaks = (element: HTMLElement) =>
  Array.from(element.querySelectorAll('[data-slate-zero-width="n"]')).filter(
    (zeroWidth) => zeroWidth.querySelector('br')
  );

describe('rendered DOM shape contract', () => {
  test('custom element and text renderers include mounted path metadata', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'path metadata' }],
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          id="rendered-dom-shape-path-metadata"
          renderElement={({ attributes, children }) => (
            <p {...attributes}>{children}</p>
          )}
          renderLeaf={({ attributes, children }) => (
            <span {...attributes}>{children}</span>
          )}
        />
      </Slate>
    );
    const block = getFirstElement(rendered.container);
    const text = rendered.container.querySelector('[data-slate-node="text"]');

    expect(block.getAttribute('data-slate-path')).toBe('0');
    expect(text?.getAttribute('data-slate-path')).toBe('0,0');
  });

  test('editing one block preserves unaffected sibling DOM identity', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'bravo' }],
        },
      ],
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable id="rendered-dom-shape-unaffected-sibling-identity" />
      </Slate>
    );
    const untouchedBlock = getElementByPath(rendered.container, '1');
    const untouchedText = getTextByPath(rendered.container, '1,0');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
      });
    });

    expect(getTextByPath(rendered.container, '0,0').textContent).toContain(
      'alpha!'
    );
    expect(getElementByPath(rendered.container, '1')).toBe(untouchedBlock);
    expect(getTextByPath(rendered.container, '1,0')).toBe(untouchedText);
  });

  test('non-empty blocks do not render empty marked leaves as visual line breaks', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'This is editable ' },
            { bold: true, text: 'rich' },
            { text: ' text, ' },
            { italic: true, text: 'much' },
            { text: ' ' },
            { code: true, text: '' },
            { text: '' },
          ],
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable id="rendered-dom-shape-invalid-empty-leaves" />
      </Slate>
    );
    const block = getFirstElement(rendered.container);

    expect(block.textContent?.replaceAll('\uFEFF', '')).toBe(
      'This is editable rich text, much '
    );
    expect(getZeroWidthLineBreaks(block)).toHaveLength(0);
  });

  test('empty inline elements inside non-empty blocks do not render visual line breaks', () => {
    const editor = createReactEditor();

    editor.extend({
      elements: [{ inline: true, type: 'link' }],
      name: 'rendered-dom-shape-inline-link',
    });

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'Hello ' },
            {
              type: 'link',
              children: [{ text: '' }],
            },
            { text: ' world' },
          ],
        },
      ] as Descendant[],
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          id="rendered-dom-shape-empty-inline"
          renderElement={({ attributes, children, element }) => {
            if (element.type === 'link') {
              return <a {...attributes}>{children}</a>;
            }

            return <p {...attributes}>{children}</p>;
          }}
        />
      </Slate>
    );
    const block = getFirstElement(rendered.container);
    const inline = rendered.container.querySelector(
      'a[data-slate-inline="true"]'
    );

    expect(inline).toBeTruthy();
    expect(getZeroWidthLineBreaks(block)).toHaveLength(0);
    expect(getZeroWidthLineBreaks(inline as HTMLElement)).toHaveLength(0);
  });

  test('empty blocks still render one line-break placeholder', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable id="rendered-dom-shape-empty-block" />
      </Slate>
    );
    const block = getFirstElement(rendered.container);

    expect(getZeroWidthLineBreaks(block)).toHaveLength(1);
  });

  test('custom placeholder height contributes to editable root height', async () => {
    const editor = createReactEditor();
    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;

    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.matches('[data-slate-placeholder="true"]')) {
        return {
          bottom: 86,
          height: 86,
          left: 0,
          right: 200,
          top: 0,
          width: 200,
          x: 0,
          y: 0,
          toJSON() {
            return this;
          },
        } as DOMRect;
      }

      return originalGetBoundingClientRect.call(this);
    };

    try {
      Editor.replace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        selection: null,
      });

      const rendered = render(
        <Slate editor={editor}>
          <Editable
            id="rendered-dom-shape-custom-placeholder-height"
            placeholder="Type something"
            renderPlaceholder={({ attributes, children }) => (
              <div {...attributes}>
                <p>{children}</p>
                <pre>custom placeholder</pre>
              </div>
            )}
          />
        </Slate>
      );
      const editable = rendered.container.querySelector(
        '[data-slate-editor="true"]'
      ) as HTMLElement | null;

      await waitFor(() => {
        expect(editable?.style.minHeight).toBe('86px');
      });
    } finally {
      HTMLElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
    }
  });

  test('custom placeholder restores children and height after deleting text', async () => {
    const editor = createReactEditor();
    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;

    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.matches('[data-slate-placeholder="true"]')) {
        return {
          bottom: 86,
          height: 86,
          left: 0,
          right: 200,
          top: 0,
          width: 200,
          x: 0,
          y: 0,
          toJSON() {
            return this;
          },
        } as DOMRect;
      }

      return originalGetBoundingClientRect.call(this);
    };

    try {
      Editor.replace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        selection: null,
      });

      const rendered = render(
        <Slate editor={editor}>
          <Editable
            id="rendered-dom-shape-custom-placeholder-delete-empty"
            placeholder="Type something"
            renderPlaceholder={({ attributes, children }) => (
              <div {...attributes}>
                <p>{children}</p>
                <pre>custom placeholder</pre>
              </div>
            )}
          />
        </Slate>
      );
      const editable = rendered.container.querySelector(
        '[data-slate-editor="true"]'
      ) as HTMLElement | null;

      await waitFor(() => {
        const placeholder = rendered.container.querySelector(
          '[data-slate-placeholder="true"]'
        );

        expect(placeholder?.textContent).toContain('Type something');
        expect(editable?.style.minHeight).toBe('86px');
      });

      await act(async () => {
        editor.update((tx) => {
          tx.text.insert('abc', { at: { path: [0, 0], offset: 0 } });
        });
      });

      await waitFor(() => {
        expect(
          rendered.container.querySelector('[data-slate-placeholder="true"]')
        ).toBeNull();
        expect(editable?.style.minHeight).toBe('');
      });

      await act(async () => {
        editor.update((tx) => {
          tx.text.delete({
            at: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 3 },
            },
          });
        });
      });

      await waitFor(() => {
        const placeholder = rendered.container.querySelector(
          '[data-slate-placeholder="true"]'
        );

        expect(placeholder?.textContent).toContain('Type something');
        expect(editable?.style.minHeight).toBe('86px');
      });
    } finally {
      HTMLElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
    }
  });
});
