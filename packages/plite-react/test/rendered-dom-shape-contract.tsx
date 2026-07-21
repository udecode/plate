import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import {
  defineEditorSchema,
  type Descendant,
  element,
  schema,
} from '@platejs/plite';
import { replace as editorReplace } from '@platejs/plite/internal';

import { createReactEditor, Editable, Plite } from '../src';

const inlineLinkSchema = defineEditorSchema({
  elements: { link: element({ inline: true }) },
  id: 'rendered-dom-shape-inline-link',
  root: schema.root({ content: schema.content.not(schema.content.text()) }),
  unknown: 'preserve',
  version: 1,
});

const getFirstElement = (container: HTMLElement) => {
  const element = container.querySelector('[data-plite-node="element"]');

  if (!(element instanceof HTMLElement)) {
    throw new Error('Expected the editor to render a block element.');
  }

  return element;
};

const getElementByPath = (container: HTMLElement, path: string) => {
  const element = container.querySelector(
    `[data-plite-node="element"][data-plite-path="${path}"]`
  );

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected Plite element at path ${path}.`);
  }

  return element;
};

const getTextByPath = (container: HTMLElement, path: string) => {
  const element = container.querySelector(
    `[data-plite-node="text"][data-plite-path="${path}"]`
  );

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected Plite text at path ${path}.`);
  }

  return element;
};

const getZeroWidthLineBreaks = (element: HTMLElement) =>
  Array.from(element.querySelectorAll('[data-plite-zero-width="n"]')).filter(
    (zeroWidth) => zeroWidth.querySelector('br')
  );

const getRenderedShape = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-plite-node]')).map((node) => ({
    inline: node.getAttribute('data-plite-inline'),
    node: node.getAttribute('data-plite-node'),
    path: node.getAttribute('data-plite-path'),
    tag: node.tagName.toLowerCase(),
    text: node.textContent?.replaceAll('\uFEFF', '') ?? '',
    void: node.getAttribute('data-plite-void'),
    zeroWidthLines: getZeroWidthLineBreaks(node as HTMLElement).length,
  }));

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed >>> 0;

  return () => {
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;

    return seed / 0x1_00_00_00_00;
  };
};

describe('rendered DOM shape contract', () => {
  test('custom element and text renderers include mounted path metadata', () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'path metadata' }],
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          id="rendered-dom-shape-path-metadata"
          renderElement={({ attributes, children }) => (
            <p {...attributes}>{children}</p>
          )}
          renderLeaf={({ attributes, children }) => (
            <span {...attributes}>{children}</span>
          )}
        />
      </Plite>
    );
    const block = getFirstElement(rendered.container);
    const text = rendered.container.querySelector('[data-plite-node="text"]');

    expect(block.getAttribute('data-plite-path')).toBe('0');
    expect(text?.getAttribute('data-plite-path')).toBe('0,0');
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
      <Plite editor={editor}>
        <Editable id="rendered-dom-shape-unaffected-sibling-identity" />
      </Plite>
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

    editorReplace(editor, {
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
      <Plite editor={editor}>
        <Editable id="rendered-dom-shape-invalid-empty-leaves" />
      </Plite>
    );
    const block = getFirstElement(rendered.container);

    expect(block.textContent?.replaceAll('\uFEFF', '')).toBe(
      'This is editable rich text, much '
    );
    expect(getZeroWidthLineBreaks(block)).toHaveLength(0);
  });

  test('empty inline elements inside non-empty blocks do not render visual line breaks', () => {
    const editor = createReactEditor();

    editor.extend(inlineLinkSchema);

    editorReplace(editor, {
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
      <Plite editor={editor}>
        <Editable
          id="rendered-dom-shape-empty-inline"
          renderElement={({ attributes, children, element }) => {
            if (element.type === 'link') {
              return <a {...attributes}>{children}</a>;
            }

            return <p {...attributes}>{children}</p>;
          }}
        />
      </Plite>
    );
    const block = getFirstElement(rendered.container);
    const inline = rendered.container.querySelector(
      'a[data-plite-inline="true"]'
    );

    expect(inline).toBeTruthy();
    expect(getZeroWidthLineBreaks(block)).toHaveLength(0);
    expect(getZeroWidthLineBreaks(inline as HTMLElement)).toHaveLength(0);
  });

  test('empty blocks still render one line-break placeholder', () => {
    const editor = createReactEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
      selection: null,
    });

    const rendered = render(
      <Plite editor={editor}>
        <Editable id="rendered-dom-shape-empty-block" />
      </Plite>
    );
    const block = getFirstElement(rendered.container);

    expect(getZeroWidthLineBreaks(block)).toHaveLength(1);
  });

  test('custom placeholder height contributes to editable root height', async () => {
    const editor = createReactEditor();
    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;

    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.matches('[data-plite-placeholder="true"]')) {
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
      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        selection: null,
      });

      const rendered = render(
        <Plite editor={editor}>
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
        </Plite>
      );
      const editable = rendered.container.querySelector(
        '[data-plite-editor="true"]'
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
      if (this.matches('[data-plite-placeholder="true"]')) {
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
      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        selection: null,
      });

      const rendered = render(
        <Plite editor={editor}>
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
        </Plite>
      );
      const editable = rendered.container.querySelector(
        '[data-plite-editor="true"]'
      ) as HTMLElement | null;

      await waitFor(() => {
        const placeholder = rendered.container.querySelector(
          '[data-plite-placeholder="true"]'
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
          rendered.container.querySelector('[data-plite-placeholder="true"]')
        ).toBeNull();
        expect(editable?.style.minHeight).toBe('');
      });

      await act(async () => {
        editor.update((tx) => {
          tx.text.delete({
            at: {
              kind: 'text',
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 3 },
            },
          });
        });
      });

      await waitFor(() => {
        const placeholder = rendered.container.querySelector(
          '[data-plite-placeholder="true"]'
        );

        expect(placeholder?.textContent).toContain('Type something');
        expect(editable?.style.minHeight).toBe('86px');
      });
    } finally {
      HTMLElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
    }
  });

  test('incremental DOM matches fresh rendering across deterministic edit traces', async () => {
    const seeds = [0x27_01_d0_0d, 0x27_02_d0_0d, 0x27_03_d0_0d];

    for (const seed of seeds) {
      const random = createSeededRandom(seed);
      const editor = createReactEditor({
        initialValue: Array.from({ length: 4 }, (_, index) => ({
          type: 'paragraph',
          children: [{ text: `seed-${seed}-block-${index}` }],
        })),
      });
      const incremental = render(
        <Plite editor={editor}>
          <Editable id={`rendered-dom-differential-${seed}`} />
        </Plite>
      );
      const trace: string[] = [];

      try {
        for (let step = 0; step < 80; step++) {
          const value = editor.read.value();
          const blockIndex = Math.floor(random() * value.children.length);
          const text = (
            value.children[blockIndex]!.children[0] as { text: string }
          ).text;
          const edit = Math.floor(random() * 5);
          const preservesPaths = edit <= 2;
          const untouchedIndex =
            preservesPaths && value.children.length > 1
              ? (blockIndex + 1) % value.children.length
              : null;
          const untouchedElement =
            untouchedIndex === null
              ? null
              : getElementByPath(incremental.container, String(untouchedIndex));
          const untouchedText =
            untouchedIndex === null
              ? null
              : getTextByPath(incremental.container, `${untouchedIndex},0`);

          await act(async () => {
            editor.update((tx) => {
              if (edit === 0 || (edit === 1 && text.length === 0)) {
                const offset = Math.floor(random() * (text.length + 1));
                const inserted = String.fromCharCode(
                  97 + Math.floor(random() * 26)
                );

                tx.text.insert(inserted, {
                  at: { offset, path: [blockIndex, 0] },
                });
                trace.push(
                  `${step}:insert-text:${blockIndex}:${offset}:${inserted}`
                );
                return;
              }

              if (edit === 1) {
                const offset = Math.floor(random() * text.length);

                tx.text.delete({
                  at: {
                    kind: 'text',
                    anchor: { offset, path: [blockIndex, 0] },
                    focus: { offset: offset + 1, path: [blockIndex, 0] },
                  },
                });
                trace.push(`${step}:delete-text:${blockIndex}:${offset}`);
                return;
              }

              if (edit === 2) {
                const rank = Math.floor(random() * 1000);

                tx.nodes.set({ rank }, { at: [blockIndex] });
                trace.push(`${step}:set-node:${blockIndex}:${rank}`);
                return;
              }

              if (edit === 3 || value.children.length <= 2) {
                const at = Math.floor(random() * (value.children.length + 1));

                tx.nodes.insert(
                  {
                    type: 'paragraph',
                    children: [{ text: `inserted-${seed}-${step}` }],
                  },
                  { at: [at] }
                );
                trace.push(`${step}:insert-node:${at}`);
                return;
              }

              tx.nodes.remove({ at: [blockIndex] });
              trace.push(`${step}:remove-node:${blockIndex}`);
            });
          });

          if (untouchedIndex !== null) {
            expect(
              getElementByPath(incremental.container, String(untouchedIndex))
            ).toBe(untouchedElement);
            expect(
              getTextByPath(incremental.container, `${untouchedIndex},0`)
            ).toBe(untouchedText);
          }

          const freshEditor = createReactEditor({
            initialValue: structuredClone(editor.read.value().children),
          });
          const fresh = render(
            <Plite editor={freshEditor}>
              <Editable id={`rendered-dom-fresh-${seed}-${step}`} />
            </Plite>
          );

          expect(getRenderedShape(incremental.container)).toEqual(
            getRenderedShape(fresh.container)
          );
          fresh.unmount();
        }
      } catch (error) {
        throw new Error(
          `Rendered DOM differential failed for seed ${seed}. Trace: ${trace.slice(-30).join(' | ')}`,
          { cause: error }
        );
      } finally {
        incremental.unmount();
      }
    }
  }, 20_000);
});
