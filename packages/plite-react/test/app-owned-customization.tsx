import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import type React from 'react';
import {
  type Descendant,
  type EditorUpdateOptions,
  NodeApi,
} from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';

import {
  createReactEditor,
  Editable,
  EditableElement,
  Plite,
  type PliteDecorationSource,
  usePliteDecorationSource,
  usePliteRangeDecorationSource,
} from '../src';
import { createDecorationSource } from '../src/decoration-source';

const createChildren = (left = 'alpha', right = 'beta'): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: left }],
  },
  {
    type: 'paragraph',
    children: [{ text: right }],
  },
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

const remoteSelectionOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'skip-scroll-into-view', 'skip-selection-focus'],
} satisfies EditorUpdateOptions;

describe('plite-react app-owned customization', () => {
  test('usePliteDecorationSource owns source lifecycle while reading latest options', async () => {
    const editor = createReactEditor({ initialValue: createChildren() });
    const sources: PliteDecorationSource<{ token: string }>[] = [];

    const Probe = ({ token }: { token: string }) => {
      const source = usePliteDecorationSource<{ token: string }>(editor, {
        id: 'hook-source',
        read: () => [
          {
            data: { token },
            key: 'hook-source-token',
            range: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 5 },
            },
          },
        ],
      });

      sources.push(source);

      return (
        <Plite decorationSources={[source]} editor={editor}>
          <Editable
            renderSegment={(segment, children) => {
              const token = segment.slices[0]?.data?.token;

              return token ? (
                <span data-hook-token={token}>{children}</span>
              ) : (
                children
              );
            }}
          />
        </Plite>
      );
    };

    const rendered = render(<Probe token="one" />);

    expect(
      rendered.container.querySelector('[data-hook-token="one"]')?.textContent
    ).toBe('alpha');

    rendered.rerender(<Probe token="two" />);
    expect(sources[0]).toBe(sources[1]);

    await act(async () => {
      sources[0]?.refresh({ forceInvalidate: true });
    });

    expect(
      rendered.container.querySelector('[data-hook-token="two"]')?.textContent
    ).toBe('alpha');
  });

  test('usePliteDecorationSource refreshes from explicit deps', async () => {
    const editor = createReactEditor({ initialValue: createChildren() });
    const sources: PliteDecorationSource<{ token: string }>[] = [];

    const Probe = ({ token }: { token: string }) => {
      const source = usePliteDecorationSource<{ token: string }>(editor, {
        deps: [token],
        dirtiness: ['text', 'node'],
        id: 'hook-deps-source',
        read: () => [
          {
            data: { token },
            key: 'hook-deps-token',
            range: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 5 },
            },
          },
        ],
      });

      sources.push(source);

      return (
        <Plite decorationSources={[source]} editor={editor}>
          <Editable
            renderSegment={(segment, children) => {
              const token = segment.slices[0]?.data?.token;

              return token ? (
                <span data-deps-token={token}>{children}</span>
              ) : (
                children
              );
            }}
          />
        </Plite>
      );
    };

    const rendered = render(<Probe token="one" />);

    expect(
      rendered.container.querySelector('[data-deps-token="one"]')?.textContent
    ).toBe('alpha');

    await act(async () => {
      rendered.rerender(<Probe token="two" />);
    });

    expect(sources[0]).toBe(sources[1]);
    expect(
      rendered.container.querySelector('[data-deps-token="two"]')?.textContent
    ).toBe('alpha');
  });

  test('usePliteRangeDecorationSource maps ranges and refreshes from deps', async () => {
    const editor = createReactEditor({ initialValue: createChildren() });
    const sources: PliteDecorationSource<{ token: string }>[] = [];

    const Probe = ({ token }: { token: string }) => {
      const source = usePliteRangeDecorationSource<{ token: string }>(editor, {
        data: { token },
        deps: [token],
        dirtiness: ['text', 'node'],
        id: 'range-hook-source',
        read: ({ snapshot }) =>
          NodeApi.findTextRanges({ children: snapshot.children }, 'alpha'),
      });

      sources.push(source);

      return (
        <Plite decorationSources={[source]} editor={editor}>
          <Editable
            renderSegment={(segment, children) => {
              const token = segment.slices[0]?.data?.token;

              return token ? (
                <span data-range-token={token}>{children}</span>
              ) : (
                children
              );
            }}
          />
        </Plite>
      );
    };

    const rendered = render(<Probe token="one" />);

    expect(
      rendered.container.querySelector('[data-range-token="one"]')?.textContent
    ).toBe('alpha');

    await act(async () => {
      rendered.rerender(<Probe token="two" />);
    });

    expect(sources[0]).toBe(sources[1]);
    expect(
      rendered.container.querySelector('[data-range-token="two"]')?.textContent
    ).toBe('alpha');
  });

  test('usePliteRangeDecorationSource stays subscribed after StrictMode effect replay', async () => {
    const editor = createReactEditor({ initialValue: createChildren('alpha') });

    const Probe = () => {
      const source = usePliteRangeDecorationSource<{ token: string }>(editor, {
        data: { token: 'alpha' },
        dirtiness: 'text',
        id: 'strict-range-hook-source',
        read: ({ snapshot }) =>
          NodeApi.findTextRanges({ children: snapshot.children }, 'alpha'),
      });

      return (
        <Plite decorationSources={[source]} editor={editor}>
          <Editable
            renderSegment={(segment, children) => {
              const token = segment.slices[0]?.data?.token;

              return token ? (
                <span data-strict-range={token}>{children}</span>
              ) : (
                children
              );
            }}
          />
        </Plite>
      );
    };

    const rendered = render(
      <StrictMode>
        <Probe />
      </StrictMode>
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        tx.text.insert('x');
      });
    });

    const highlighted = rendered.container.querySelector(
      '[data-strict-range="alpha"]'
    );

    expect(highlighted?.textContent).toBe('alpha');
  });

  test('Editable supports app-owned markdown preview projections', async () => {
    const editor = createReactEditor();

    const collectMarkdownProjections = (text: string, path: number[]) => {
      const projections: Array<{
        key: string;
        range: {
          anchor: { path: number[]; offset: number };
          focus: { path: number[]; offset: number };
        };
        data: { type: string };
      }> = [];

      const pushProjection = (type: string, start: number, end: number) => {
        if (start === end) {
          return;
        }

        projections.push({
          data: { type },
          key: `${path.join('.')}:${type}:${start}:${end}`,
          range: {
            anchor: { path, offset: start },
            focus: { path, offset: end },
          },
        });
      };

      if (/^#{1,6}\s.+/.test(text)) {
        pushProjection('title', 0, text.length);
      }

      for (const match of text.matchAll(/\*\*[^*]+\*\*/g)) {
        if (match.index != null) {
          pushProjection('bold', match.index, match.index + match[0].length);
        }
      }

      return projections;
    };

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Hello **bold**' }],
        },
      ],
      selection: null,
    });

    const markdownSource = createDecorationSource<{ type: string }>(editor, {
      id: 'markdown-preview',
      read: ({ snapshot }) =>
        (snapshot.children[0] &&
        'children' in snapshot.children[0] &&
        snapshot.children[0].children[0] &&
        'text' in snapshot.children[0].children[0]
          ? collectMarkdownProjections(
              snapshot.children[0].children[0].text,
              [0, 0]
            )
          : []) as any,
    });

    const rendered = render(
      <Plite decorationSources={[markdownSource]} editor={editor}>
        <Editable
          id="markdown-preview-runtime"
          renderSegment={(segment, children) => {
            const type = segment.slices[0]?.data?.type;

            return type ? <span data-token={type}>{children}</span> : children;
          }}
        />
      </Plite>
    );

    expect(
      rendered.container.querySelector('[data-token="bold"]')?.textContent
    ).toBe('**bold**');

    await act(async () => {
      Editor.replace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: '## Heading' }],
          },
        ],
        selection: null,
      });
    });

    expect(
      rendered.container.querySelector('[data-token="title"]')?.textContent
    ).toBe('## Heading');

    markdownSource.destroy();
  });

  test('Editable supports app-owned markdown shortcuts', async () => {
    const editor = createReactEditor();
    const applyShortcut = (type: 'block-quote' | 'list-item', at: number[]) => {
      editor.update((tx) => {
        if (type === 'list-item') {
          tx.nodes.set({ type: 'list-item' }, { at });
          tx.nodes.wrap({
            type: 'bulleted-list',
            children: [],
          } as never);
          return;
        }

        tx.nodes.set({ type } as never, { at });
      });
    };

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: '>' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '-' }],
        },
      ],
      selection: {
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
            case 'block-quote':
              return <blockquote>{children}</blockquote>;
            case 'bulleted-list':
              return <ul>{children}</ul>;
            case 'list-item':
              return <li>{children}</li>;
            default:
              return <EditableElement>{children}</EditableElement>;
          }
        }}
      />
    );

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        });
        tx.text.delete();
        applyShortcut('block-quote', [0]);
      });
    });

    expect(rendered.container.querySelectorAll('blockquote').length).toBe(1);

    await act(async () => {
      Editor.replace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: '-' }],
          },
        ],
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        });
        tx.text.delete();
        applyShortcut('list-item', [0]);
      });
    });

    expect(rendered.container.querySelectorAll('ul li').length).toBe(1);
  });

  test('Editable supports app-owned forced layout enforcement', async () => {
    const editor = createReactEditor();

    const createTitle = () =>
      ({
        type: 'title',
        children: [{ text: 'Untitled' }],
      }) as Descendant;

    const createParagraph = () =>
      ({
        type: 'paragraph',
        children: [{ text: '' }],
      }) as Descendant;

    const originalNormalizeNode = editor.normalizeNode;

    const getNodeText = (node: Descendant): string =>
      'text' in node
        ? node.text.replace(/\uFEFF/g, '')
        : node.children.map(getNodeText).join('');

    Editor.replace(editor, {
      children: [createTitle(), createParagraph()],
      selection: null,
    });

    editor.normalizeNode = (entry, options) => {
      const [node] = entry;

      if (
        node &&
        Editor.isEditor(node) &&
        Array.isArray((node as any).children) &&
        node.children.length >= 2
      ) {
        const first = node.children[0];
        const second = node.children[1];

        if (
          first &&
          'children' in first &&
          first.type === 'title' &&
          getNodeText(first) === '' &&
          second &&
          getNodeText(second as Descendant) === ''
        ) {
          Editor.replace(editor, {
            children: [createTitle(), createParagraph()],
            selection: null,
          });
          return;
        }
      }

      originalNormalizeNode(entry, options);
    };

    const rendered = render(
      <TestEditorSurface
        editor={editor}
        id="forced-layout-runtime"
        renderElement={({ children, element }) => {
          switch (element.type) {
            case 'title':
              return <h2>{children}</h2>;
            default:
              return <EditableElement>{children}</EditableElement>;
          }
        }}
      />
    );

    expect(rendered.container.querySelectorAll('h2').length).toBe(1);
    expect(
      rendered.container.querySelectorAll('div[data-plite-node="element"]')
        .length
    ).toBeGreaterThan(0);

    await act(async () => {
      Editor.replace(editor, {
        children: [
          {
            type: 'title',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ],
        selection: null,
      });
    });

    expect(rendered.container.querySelectorAll('h2').length).toBe(1);
  });

  test('Editable forwards scrollSelectionIntoView to app-owned code', async () => {
    const editor = createReactEditor();
    const seen: string[] = [];

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
    });

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
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 4 },
        });
      });
    });

    expect(seen).toEqual(['eta']);
  });

  test('Editable skips scrollSelectionIntoView for remote collaboration selection updates', async () => {
    const editor = createReactEditor();
    const seen: string[] = [];

    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
    });

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
      editor.update((tx) => {
        tx.selection.set({
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 4 },
        });
      }, remoteSelectionOptions);
    });

    expect(seen).toEqual([]);
  });
});
