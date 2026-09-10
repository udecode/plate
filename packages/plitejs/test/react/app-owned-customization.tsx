import { act, render } from '@testing-library/react';
import {
  TextApi,
  defineExtension,
  type Descendant,
  type EditorUpdateTransaction,
} from 'plitejs';
import type React from 'react';

import { replace as editorReplace } from '../../src/internal';
import {
  createEditor,
  Editable,
  PliteElement,
  Plite,
  PliteReactUpdatePolicy,
} from '../../src/react';

const createChildren = (left = 'alpha', right = 'beta'): Descendant[] => [
  { type: 'paragraph', children: [{ text: left }] },
  { type: 'paragraph', children: [{ text: right }] },
];

const TestEditorSurface = ({
  editor,
  ...props
}: React.ComponentProps<typeof Editable> & {
  editor: React.ComponentProps<typeof Plite>['editor'];
}) => (
  <Plite editor={editor}>
    <Editable {...props} />
  </Plite>
);

describe('plite-react app-owned customization', () => {
  test('Editable supports app-owned markdown shortcuts', async () => {
    const editor = createEditor();
    const applyShortcut = (
      tx: EditorUpdateTransaction,
      type: 'block-quote' | 'list-item',
      at: number[]
    ) => {
      if (type === 'list-item') {
        tx.nodes.set({ type: 'list-item' }, { at });
        tx.nodes.wrap({ type: 'bulleted-list', children: [] });
        return;
      }

      tx.nodes.set({ type } as never, { at });
    };

    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: '>' }] },
        { type: 'paragraph', children: [{ text: '-' }] },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    const rendered = render(
      <TestEditorSurface
        editor={editor}
        id="markdown-shortcuts-runtime"
        renderElement={({ children, element }) => {
          switch (element.type) {
            case 'block-quote': {
              return <blockquote>{children}</blockquote>;
            }
            case 'bulleted-list': {
              return <ul>{children}</ul>;
            }
            case 'list-item': {
              return <li>{children}</li>;
            }
            default: {
              return (
                <PliteElement style={{ position: 'relative' }}>
                  {children}
                </PliteElement>
              );
            }
          }
        }}
      />
    );

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        });
        tx.text.delete();
        applyShortcut(tx, 'block-quote', [0]);
      });
    });

    expect(rendered.container.querySelectorAll('blockquote')).toHaveLength(1);

    await act(async () => {
      editorReplace(editor, {
        children: [{ type: 'paragraph', children: [{ text: '-' }] }],
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        });
        tx.text.delete();
        applyShortcut(tx, 'list-item', [0]);
      });
    });

    expect(rendered.container.querySelectorAll('ul li')).toHaveLength(1);
  });

  test('Editable supports app-owned forced layout enforcement', async () => {
    const editor = createEditor();
    const createTitle = () =>
      ({ type: 'title', children: [{ text: 'Untitled' }] }) as Descendant;
    const createParagraph = () =>
      ({ type: 'paragraph', children: [{ text: '' }] }) as Descendant;
    const getNodeText = (node: Descendant): string =>
      TextApi.isText(node)
        ? node.text.replace(/\uFEFF/g, '')
        : node.children.map(getNodeText).join('');

    editorReplace(editor, {
      children: [createTitle(), createParagraph()],
      selection: null,
    });
    editor.install(
      defineExtension('forced-layout', {
        corrections: [
          {
            correct({ tx }) {
              const [first, second] = tx.value().children;

              if (
                first &&
                'children' in first &&
                first.type === 'title' &&
                getNodeText(first) === '' &&
                second &&
                getNodeText(second) === ''
              ) {
                tx.nodes.replaceChildren([createTitle(), createParagraph()], {
                  at: [],
                });
              }
            },
            event: 'content',
            query: 'root',
          },
        ],
      })
    );

    const rendered = render(
      <TestEditorSurface
        editor={editor}
        id="forced-layout-runtime"
        renderElement={({ children, element }) =>
          element.type === 'title' ? (
            <h2>{children}</h2>
          ) : (
            <PliteElement style={{ position: 'relative' }}>
              {children}
            </PliteElement>
          )
        }
      />
    );

    expect(rendered.container.querySelectorAll('h2')).toHaveLength(1);
    expect(
      rendered.container.querySelectorAll('div[data-plite-node="element"]')
        .length
    ).toBeGreaterThan(0);

    await act(async () => {
      editorReplace(editor, {
        children: [
          { type: 'title', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: '' }] },
        ],
        selection: null,
      });
    });

    expect(rendered.container.querySelectorAll('h2')).toHaveLength(1);
  });

  test('Editable forwards scrollSelectionIntoView to app-owned code', async () => {
    const editor = createEditor();
    const seen: string[] = [];

    editorReplace(editor, { children: createChildren(), selection: null });
    render(
      <TestEditorSurface
        editor={editor}
        id="scroll-forwarding"
        scrollSelectionIntoView={(_editor, domRange) => {
          seen.push(domRange.toString());
        }}
      />
    );

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 4 },
        });
      });
    });

    expect(seen).toEqual(['eta']);
  });

  test('Editable skips scrolling for remote selection updates', async () => {
    const editor = createEditor();
    const seen: string[] = [];

    editorReplace(editor, { children: createChildren(), selection: null });
    render(
      <TestEditorSurface
        editor={editor}
        id="remote-scroll-skip"
        scrollSelectionIntoView={(_editor, domRange) => {
          seen.push(domRange.toString());
        }}
      />
    );

    await act(async () => {
      editor.update(PliteReactUpdatePolicy.preserveSelection, (tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 4 },
        });
      });
    });

    expect(seen).toEqual([]);
  });
});
