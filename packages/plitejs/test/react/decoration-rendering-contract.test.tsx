import { act, render, waitFor } from '@testing-library/react';
import { TextApi } from 'plitejs';
import { history } from 'plitejs/history';
import { StrictMode } from 'react';

import { getNodeKey as editorGetNodeKey } from '../../src/internal';
import {
  createEditor,
  Editable,
  Plite,
  type PliteDecorationSource,
} from '../../src/react';
import { ImperativeTextFlowContext } from '../../src/react/components/editable-text-flow';
import { useRegisterPliteDecorationSource } from '../../src/react/decoration-context';
import { getMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

test.each([2, 4])(
  'refreshes one changed block once per source across %s views and keeps another editor independent',
  async (viewCount) => {
    const createFixture = () => {
      const editor = createEditor({
        initialValue: Array.from({ length: 20 }, (_, index) =>
          paragraph(`block ${index}: alpha`)
        ),
      });
      const reads: string[] = [];
      const observations = [0, 0, 0];
      const cleanups = [0, 0, 0];
      const sources: Array<PliteDecorationSource<typeof editor>> = [
        'syntax',
        'search',
        'annotation',
      ].map((id, index) => ({
        id,
        observe: () => {
          observations[index] += 1;
          return () => {
            cleanups[index] += 1;
          };
        },
        read: ({ entry: [node, path] }) => {
          if (!TextApi.isText(node)) return [];
          reads.push(`${id}:${path[0]}:${node.text}`);
          return [
            {
              attributes: { [`data-${id}`]: node.text },
              key: `${id}:${path[0]}`,
              range: {
                anchor: { path, offset: index },
                focus: { path, offset: node.text.length - index },
              },
            },
          ];
        },
      }));
      return { editor, reads, observations, cleanups, sources };
    };
    const active = createFixture();
    const other = createFixture();
    const rendered = render(
      <>
        <Plite decorations={active.sources} editor={active.editor}>
          {Array.from({ length: viewCount }, (_, index) => (
            <div hidden={index === viewCount - 1} key={index}>
              <Editable data-testid={`active-${index}`} />
            </div>
          ))}
        </Plite>
        <Plite decorations={other.sources} editor={other.editor}>
          <Editable data-testid="independent" />
        </Plite>
      </>
    );
    expect(active.observations).toEqual([1, 1, 1]);
    expect(other.observations).toEqual([1, 1, 1]);
    expect(active.reads).toHaveLength(60);
    expect(other.reads).toHaveLength(60);
    const roots = Array.from({ length: viewCount }, (_, index) =>
      rendered.getByTestId(`active-${index}`)
    );
    const unchanged = roots.map((root) =>
      root.querySelector('[data-syntax="block 19: alpha"]')
    );
    const independent = rendered.getByTestId('independent');
    const independentHTML = independent.innerHTML;
    active.reads.length = 0;
    other.reads.length = 0;

    await act(async () => {
      active.editor.update({ tags: 'native-text-input' }, (tx) => {
        tx.text.insert('X', { at: { path: [10, 0], offset: 15 } });
      });
    });
    await waitFor(() => {
      for (const root of roots) {
        expect(
          root.querySelector('[data-syntax="block 10: alphaX"]')
        ).not.toBeNull();
      }
    });
    expect(active.reads).toEqual([
      'syntax:10:block 10: alphaX',
      'search:10:block 10: alphaX',
      'annotation:10:block 10: alphaX',
    ]);
    expect(other.reads).toEqual([]);
    expect(independent.innerHTML).toBe(independentHTML);
    roots.forEach((root, index) => {
      expect(root.querySelector('[data-syntax="block 19: alpha"]')).toBe(
        unchanged[index]
      );
      expect(
        root.querySelector(
          '[data-syntax="block 10: alphaX"] [data-search] [data-annotation]'
        )?.textContent
      ).toBe('ock 10: alph');
    });
    expect(active.observations).toEqual([1, 1, 1]);
    rendered.unmount();
    expect(active.cleanups).toEqual([1, 1, 1]);
    expect(other.cleanups).toEqual([1, 1, 1]);
  }
);

test('matches complete rendering and exact layer precedence through randomized range and text changes', async () => {
  let text = 'aé🙂bc\ndefghijklmnopqrstuvwxyz\n';
  const editor = createEditor({ initialValue: [paragraph(text)] });
  let seed = 0x51_ce;
  const random = (max: number) => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed % max;
  };
  let ranges = [
    { key: 'outer', start: 0, end: text.length - 1, revision: 0 },
    { key: 'inner-a', start: 4, end: 8, revision: 0 },
    { key: 'inner-b', start: 14, end: 18, revision: 0 },
  ];
  const refreshes: Array<
    Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
  > = [];
  const sources: Array<PliteDecorationSource<typeof editor>> = [
    'first',
    'second',
  ].map((id, sourceIndex) => ({
    id,
    observe: ({ refresh }) => {
      refreshes[sourceIndex] = refresh;
      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? ranges.flatMap((range, index) =>
            index % 2 === sourceIndex &&
            range.end <= node.text.length &&
            range.end > range.start
              ? [
                  {
                    attributes: {
                      'data-layer': `${range.key}:${range.revision}`,
                    },
                    key: range.key,
                    range: {
                      anchor: { path, offset: range.start },
                      focus: { path, offset: range.end },
                    },
                  },
                ]
              : []
          )
        : [],
  }));
  const rendered = render(
    <Plite editor={editor} decorations={sources}>
      <Editable data-testid="retained" />
      <ImperativeTextFlowContext.Provider value={false}>
        <Editable data-testid="complete" />
      </ImperativeTextFlowContext.Provider>
    </Plite>
  );
  const readCharacters = (root: HTMLElement) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const characters: Array<{ text: string; layers: string[] }> = [];
    let node = walker.nextNode();

    while (node) {
      const layers: string[] = [];

      for (
        let element = node.parentElement;
        element && element !== root;
        element = element.parentElement
      ) {
        const layer = element.getAttribute('data-layer');

        if (layer) layers.unshift(layer);
      }
      for (const character of (node.nodeValue ?? '').split('')) {
        characters.push({ text: character, layers });
      }
      node = walker.nextNode();
    }
    if (text.endsWith('\n')) characters.pop();
    return characters;
  };
  const assertPaint = () => {
    const ordered = [0, 1].flatMap((sourceIndex) =>
      ranges.filter(
        (range, index) => index % 2 === sourceIndex && range.end <= text.length
      )
    );
    const expected = text.split('').map((character, offset) => ({
      text: character,
      layers: ordered
        .filter((range) => range.start <= offset && offset < range.end)
        .map((range) => `${range.key}:${range.revision}`),
    }));

    expect(readCharacters(rendered.getByTestId('retained'))).toEqual(expected);
    expect(readCharacters(rendered.getByTestId('complete'))).toEqual(expected);
  };

  assertPaint();
  for (let iteration = 0; iteration < 64; iteration++) {
    await act(async () => {
      if (iteration % 4 === 0) {
        const offset = random(text.length);
        const inserted = ['X', 'é', '🙂', '\n'][random(4)];

        text = text.slice(0, offset) + inserted + text.slice(offset);
        editor.update.text.insert(inserted, { at: { path: [0, 0], offset } });
      } else if (iteration % 4 === 1 && text.length > 8) {
        const offset = random(text.length - 1);

        text = text.slice(0, offset) + text.slice(offset + 1);
        editor.update.text.delete({
          at: {
            anchor: { path: [0, 0], offset },
            focus: { path: [0, 0], offset: offset + 1 },
          },
        });
      } else {
        const index = random(ranges.length);
        const start = random(text.length - 1);

        ranges = ranges.map((range, current) =>
          current === index
            ? {
                ...range,
                start,
                end: start + 1 + random(text.length - start),
                revision: iteration,
              }
            : range
        );
      }
      refreshes.forEach((refresh) => refresh({ nodeKeys: 'all' }));
    });
    assertPaint();
  }
  rendered.unmount();
});

test('keeps a changed run before the next model text in the same host', async () => {
  const editor = createEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'abcdef', bold: true },
          { text: 'uvwxyz', italic: true },
        ],
      },
    ],
  });
  let end = 3;
  let refresh:
    | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    | undefined;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'multi-text',
    observe: ({ refresh: nextRefresh }) => {
      refresh = nextRefresh;
      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [
            {
              attributes: { 'data-layer': path.join(',') },
              key: path.join(','),
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: path[1] === 0 ? end : 3 },
              },
            },
          ]
        : [],
  };
  const rendered = render(
    <Plite editor={editor} decorations={[source]}>
      <Editable />
    </Plite>
  );
  const root = rendered.container.querySelector('[data-plite-editor]')!;

  for (const nextEnd of [6, 2, 5, 1]) {
    await act(async () => {
      end = nextEnd;
      refresh?.({ nodeKeys: 'all' });
    });
    expect(root.textContent).toBe('abcdefuvwxyz');
    expect(root.querySelector('[data-layer="0,0"]')?.textContent).toBe(
      'abcdef'.slice(0, end)
    );
    expect(root.querySelector('[data-layer="0,1"]')?.textContent).toBe('uvw');
  }
  rendered.unmount();
});

test('compiles and binds only the changed syntax window in an observed flow', async () => {
  const editor = createEditor({ initialValue: [paragraph('x '.repeat(200))] });
  const path = Object.freeze([0, 0]);
  let ranges = Array.from({ length: 200 }, (_, index) =>
    Object.freeze({
      attributes: Object.freeze({ 'data-token': index }),
      key: String(index),
      range: Object.freeze({
        anchor: Object.freeze({ path, offset: index * 2 }),
        focus: Object.freeze({ path, offset: index * 2 + 1 }),
      }),
    })
  );
  let refresh:
    | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    | undefined;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'syntax-window',
    observe: ({ refresh: nextRefresh }) => {
      refresh = nextRefresh;
      return () => {};
    },
    read: ({ entry: [node] }) => (TextApi.isText(node) ? ranges : []),
  };
  const rendered = render(
    <Plite editor={editor} decorations={[source]}>
      <Editable />
    </Plite>
  );
  await act(async () => {
    editor.update.text.insert('x', { at: { path: [0, 0], offset: 400 } });
  });
  const flow = rendered.container.querySelector('[data-plite-text-flow]')!;
  const first = flow.querySelector('[data-token="0"]')!;
  const last = flow.querySelector('[data-token="199"]')!;
  const firstText = first.firstChild;
  const lastText = last.firstChild;
  const attributes = vi.spyOn(first, 'getAttribute');

  await act(async () => {
    ranges = ranges.map((range, index) =>
      index === 100
        ? Object.freeze({
            ...range,
            range: Object.freeze({
              ...range.range,
              focus: Object.freeze({ path, offset: 202 }),
            }),
          })
        : range
    );
    refresh?.({ nodeKeys: 'all' });
  });
  expect(attributes).not.toHaveBeenCalled();
  attributes.mockRestore();
  expect(
    Number(flow.getAttribute('data-plite-text-flow-boundary-visits'))
  ).toBeLessThanOrEqual(6);
  expect(flow.querySelector('[data-token="100"]')?.textContent).toBe('x ');
  expect(flow.querySelector('[data-token="0"]')).toBe(first);
  expect(flow.querySelector('[data-token="199"]')).toBe(last);
  expect(first.firstChild).toBe(firstText);
  expect(last.firstChild).toBe(lastText);
  rendered.unmount();
});

test.each([true, false])(
  'shares source observation and keeps ordered attributes independent (imperative=%s)',
  async (imperative) => {
    const editor = createEditor({ initialValue: [paragraph('Hello world')] });
    let className = 'match-before';
    let refresh:
      | Parameters<
          NonNullable<PliteDecorationSource<typeof editor>['observe']>
        >[0]['refresh']
      | null = null;
    let observeCount = 0;
    let cleanupCount = 0;
    const match: PliteDecorationSource<typeof editor> = {
      id: 'match',
      observe: ({ refresh: nextRefresh }) => {
        observeCount += 1;
        refresh = nextRefresh;

        return () => {
          cleanupCount += 1;
        };
      },
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node) && node.text === 'Hello world'
          ? [
              {
                attributes: {
                  className,
                  'data-match': 'primary',
                  'data-priority': 'first',
                  style: { backgroundColor: 'red', color: 'red' },
                },
                key: 'match:hello',
                range: {
                  anchor: { path, offset: 0 },
                  focus: { path, offset: 5 },
                },
              },
            ]
          : [],
    };
    const emphasis: PliteDecorationSource<typeof editor> = {
      id: 'emphasis',
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node) && node.text === 'Hello world'
          ? [
              {
                attributes: {
                  className: 'emphasis',
                  'data-emphasis': 'secondary',
                  'data-priority': 'second',
                  style: { color: 'blue', fontWeight: 700 },
                },
                key: 'emphasis:hello',
                range: {
                  anchor: { path, offset: 0 },
                  focus: { path, offset: 5 },
                },
              },
            ]
          : [],
    };
    const tail: PliteDecorationSource<typeof editor> = {
      id: 'tail',
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node) && node.text === 'Hello world'
          ? [
              {
                attributes: { 'data-tail': 'single' },
                key: 'tail:world',
                range: {
                  anchor: { path, offset: 6 },
                  focus: { path, offset: 11 },
                },
              },
            ]
          : [],
    };
    const rendered = render(
      <ImperativeTextFlowContext.Provider value={imperative}>
        <Plite decorations={[match, emphasis, tail]} editor={editor}>
          <Editable data-testid="first" />
          <Editable data-testid="second" />
        </Plite>
      </ImperativeTextFlowContext.Provider>
    );

    expect(observeCount).toBe(1);
    expect(rendered.container.querySelectorAll('.match-before')).toHaveLength(
      2
    );
    const matches = Array.from(
      rendered.container.querySelectorAll('[data-match]')
    );
    const emphasisNodes = matches.map((outer) =>
      outer.querySelector('[data-emphasis]')
    );
    const textNodes = emphasisNodes.map((inner) => inner?.firstChild);

    matches.forEach((outer, index) => {
      const inner = emphasisNodes[index];

      expect(outer).toHaveClass('match-before');
      expect(outer).not.toHaveClass('emphasis');
      expect(outer).not.toHaveAttribute('data-emphasis');
      expect(outer).not.toHaveAttribute('data-plite-string');
      expect(outer).toHaveAttribute('data-priority', 'first');
      expect(outer).toHaveStyle({
        backgroundColor: 'red',
        color: 'red',
      });
      expect(inner?.parentElement).toBe(outer);
      expect(inner).toHaveClass('emphasis');
      expect(inner).toHaveAttribute('data-priority', 'second');
      expect(inner).toHaveAttribute('data-plite-string', 'true');
      expect(inner).not.toHaveAttribute('data-match');
      expect(inner).toHaveStyle({ color: 'blue', fontWeight: 700 });
      expect(outer.textContent).toBe('Hello');
    });
    expect(
      rendered.container.querySelectorAll('[data-tail][data-plite-string]')
    ).toHaveLength(2);

    await act(async () => {
      className = 'match-after';
      refresh?.({ nodeKeys: 'all' });
    });

    expect(rendered.container.querySelectorAll('.match-before')).toHaveLength(
      0
    );
    expect(rendered.container.querySelectorAll('.match-after')).toHaveLength(2);
    rendered.container
      .querySelectorAll('[data-match]')
      .forEach((outer, index) => {
        const inner = outer.querySelector('[data-emphasis]');

        expect(outer).toBe(matches[index]);
        expect(inner).toBe(emphasisNodes[index]);
        expect(inner?.firstChild).toBe(textNodes[index]);
        expect(outer).toHaveAttribute('data-priority', 'first');
        expect(inner).toHaveAttribute('data-priority', 'second');
      });

    rendered.unmount();
    expect(cleanupCount).toBe(1);
  }
);

test.each([true, false])(
  'preserves overlapping identities through edits, history, and source removal (imperative=%s)',
  async (imperative) => {
    const editor = createEditor({
      extensions: [history()],
      initialValue: [paragraph('abcdefghij')],
    });
    const first = editor.anchor(
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 7 },
      },
      { association: 'inward', deletion: 'nearest' }
    );
    const second = editor.anchor(
      {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 9 },
      },
      { association: 'inward', deletion: 'nearest' }
    );
    let includeSecond = true;
    let refresh:
      | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
      | undefined;
    const source: PliteDecorationSource<typeof editor> = {
      id: 'overlap',
      observe: ({ refresh: nextRefresh }) => {
        refresh = nextRefresh;

        return () => {
          refresh = undefined;
        };
      },
      read: ({ entry: [node] }) => {
        if (!TextApi.isText(node)) return [];

        return [
          { anchor: first, id: 'first' },
          ...(includeSecond ? [{ anchor: second, id: 'second' }] : []),
        ].flatMap(({ anchor, id }) => {
          const range = anchor.resolve();

          return range && range.anchor.offset < range.focus.offset
            ? [{ attributes: { 'data-comment-id': id }, key: id, range }]
            : [];
        });
      },
    };
    const rendered = render(
      <ImperativeTextFlowContext.Provider value={imperative}>
        <Plite decorations={[source]} editor={editor}>
          <Editable />
        </Plite>
      </ImperativeTextFlowContext.Provider>
    );
    const textFor = (id: string) =>
      Array.from(
        rendered.container.querySelectorAll(`[data-comment-id="${id}"]`)
      )
        .map((element) => element.textContent)
        .join('');
    const expectPaint = (
      firstText: string,
      secondText: string,
      overlap: string
    ) => {
      expect(textFor('first')).toBe(firstText);
      expect(textFor('second')).toBe(secondText);
      expect(
        rendered.container.querySelector(
          '[data-comment-id="first"] > [data-comment-id="second"]'
        )?.textContent ?? ''
      ).toBe(overlap);
    };

    expectPaint('bcdefg', 'efghi', 'efg');

    await act(async () => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.insert('X', { at: { path: [0, 0], offset: 5 } });
      });
    });
    expectPaint('bcdeXfg', 'eXfghi', 'eXfg');

    await act(async () => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.delete({
          at: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 5 },
            focus: { path: [0, 0], offset: 6 },
          },
        });
      });
    });
    expectPaint('bcdefg', 'efghi', 'efg');

    for (let cycle = 0; cycle < 10; cycle++) {
      await act(async () => {
        editor.update((tx) => tx.history.undo());
      });
      expectPaint('bcdeXfg', 'eXfghi', 'eXfg');

      await act(async () => {
        editor.update((tx) => tx.history.redo());
      });
      expectPaint('bcdefg', 'efghi', 'efg');
    }

    await act(async () => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.delete({
          at: {
            kind: 'text',
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 9 },
          },
        });
      });
    });
    expectPaint('', '', '');
    expect(
      rendered.container.querySelector('[data-plite-editor]')?.textContent
    ).toBe('aj');
    expect(
      rendered.container.querySelectorAll('[data-comment-id]')
    ).toHaveLength(0);

    await act(async () => {
      editor.update((tx) => tx.history.undo());
    });
    expectPaint('bcdefg', 'efghi', 'efg');

    await act(async () => {
      includeSecond = false;
      refresh?.({ nodeKeys: 'all' });
    });
    expectPaint('bcdefg', '', '');
    expect(
      rendered.container.querySelectorAll('[data-comment-id="first"]')
    ).toHaveLength(1);

    await act(async () => {
      includeSecond = true;
      refresh?.({ nodeKeys: 'all' });
    });
    expectPaint('bcdefg', 'efghi', 'efg');

    rendered.unmount();
    first.release();
    second.release();
  }
);

test('reconciles retained decorated text from model commits', async () => {
  const editor = createEditor({ initialValue: [paragraph('Hello world')] });
  const source: PliteDecorationSource<typeof editor> = {
    id: 'retained-text-commit',
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [
            {
              attributes: { 'data-retained-token': 'true' },
              key: 'retained:hello',
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: Math.min(5, node.text.length) },
              },
            },
          ]
        : [],
  };
  const rendered = render(
    <Plite decorations={[source]} editor={editor}>
      <Editable />
    </Plite>
  );
  const editable = rendered.container.querySelector('[data-plite-editor]');

  expect(
    editable?.querySelector('[data-plite-text-flow="true"]')
  ).not.toBeNull();
  expect(editable?.textContent).toBe('Hello world');

  act(() => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 6 } });
    });
  });

  await waitFor(() => expect(editable?.textContent).toBe('Hello !world'));
  const token = editable?.querySelector('[data-retained-token]');

  expect(token?.textContent).toBe('Hello');
  expect(token).toHaveAttribute('data-plite-string', 'true');
  expect(
    editable
      ?.querySelector('[data-plite-text-flow]')
      ?.getAttribute('data-plite-text-flow-incremental-text-changes')
  ).toBe('1');
});

test('repairs dirty syntax in one Editable without validating the other view', async () => {
  const editor = createEditor({ initialValue: [paragraph('alpha beta')] });
  let revision = 0;
  let refresh: (() => void) | undefined;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'view-paint',
    observe: ({ refresh: refreshSource }) => {
      refresh = () => refreshSource({ nodeKeys: 'all' });
      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [
            {
              attributes: { className: 'alpha', 'data-token': 'alpha' },
              key: 'alpha',
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: 5 },
              },
            },
            {
              attributes: {
                className: `beta-${revision}`,
                'data-token': 'beta',
              },
              key: 'beta',
              range: {
                anchor: { path, offset: 6 },
                focus: { path, offset: 10 },
              },
            },
          ]
        : [],
  };
  const rendered = render(
    <Plite decorations={[source]} editor={editor}>
      <Editable data-testid="first" />
      <Editable data-testid="second" />
    </Plite>
  );

  await act(async () => {
    revision += 1;
    refresh?.();
  });
  const firstToken = rendered
    .getByTestId('first')
    .querySelector('[data-token="alpha"]')!;
  const secondToken = rendered
    .getByTestId('second')
    .querySelector('[data-token="alpha"]')!;
  const readSecondToken = vi.spyOn(secondToken, 'getAttribute');

  firstToken.className = 'corrupt';
  await act(async () => {
    revision += 1;
    refresh?.();
  });

  expect(readSecondToken).not.toHaveBeenCalled();
  expect(firstToken).toHaveClass('alpha');
  expect(secondToken).toHaveClass('alpha');
  expect(rendered.getByTestId('first').textContent).toBe('alpha beta');
  expect(rendered.getByTestId('second').textContent).toBe('alpha beta');
  expect(rendered.container.querySelectorAll('.beta-2')).toHaveLength(2);
  readSecondToken.mockRestore();
  rendered.unmount();
});

test.each(['validation', 'text', 'children'])(
  'exports selection only after text DOM repair during host revalidation (%s)',
  async (change) => {
    const editor = createEditor({ initialValue: [paragraph('alpha beta')] });
    let revision = 0;
    let refresh: (() => void) | undefined;
    const source: PliteDecorationSource<typeof editor> = {
      id: 'host-revalidation',
      observe: ({ refresh: refreshSource }) => {
        refresh = () => refreshSource({ nodeKeys: 'all' });
        return () => {};
      },
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node)
          ? [
              {
                attributes: {
                  className: `alpha-${revision}`,
                  'data-token': 'alpha',
                },
                key: 'alpha',
                range: {
                  anchor: { path, offset: 0 },
                  focus: { path, offset: 5 },
                },
              },
            ]
          : [],
    };
    const rendered = render(
      <Plite decorations={[source]} editor={editor}>
        <Editable data-testid="editor" />
      </Plite>
    );
    await act(async () => {});
    const root = rendered.getByTestId('editor');
    const token = root.querySelector('[data-token="alpha"]')!;
    const textNode = token.firstChild!;
    const runtime = getMountedEditableDOMRuntime(editor)!;
    const selectionExport = vi.spyOn(
      runtime,
      'requestSelectionExportAfterDOMCommit'
    );

    await act(async () => {
      runtime.runUnobservedDOMMutation(() => {
        if (change === 'text') textNode.nodeValue = 'corrupt';
        if (change === 'children') {
          token.replaceChildren(document.createElement('strong'));
        }
      });
      revision += 1;
      refresh?.();
    });

    expect(root.textContent).toBe('alpha beta');
    expect(root.querySelector('[data-token="alpha"]')).toBe(token);
    expect(token.firstChild).toBe(textNode);
    expect(token).toHaveClass('alpha-1');
    expect(selectionExport).toHaveBeenCalledTimes(
      change === 'validation' ? 0 : 1
    );
    selectionExport.mockRestore();
    rendered.unmount();
  }
);

test('keeps unchanged tokens connected when another decoration is added or removed', async () => {
  const editor = createEditor({
    initialValue: [paragraph('alpha beta gamma')],
  });
  let includeMiddle = false;
  let refresh:
    | Parameters<
        NonNullable<PliteDecorationSource<typeof editor>['observe']>
      >[0]['refresh']
    | undefined;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'stable-token-dom',
    observe: ({ refresh: nextRefresh }) => {
      refresh = nextRefresh;

      return () => {
        refresh = undefined;
      };
    },
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node)) return [];

      return [
        { key: 'alpha', start: 0, end: 5 },
        ...(includeMiddle ? [{ key: 'beta', start: 6, end: 10 }] : []),
        { key: 'gamma', start: 11, end: 16 },
      ].map(({ key, start, end }) => ({
        key,
        attributes: { 'data-stable-token': key },
        range: {
          anchor: { path, offset: start },
          focus: { path, offset: end },
        },
      }));
    },
  };
  const rendered = render(
    <Plite decorations={[source]} editor={editor}>
      <Editable />
    </Plite>
  );
  const editable = rendered.container.querySelector('[data-plite-editor]')!;
  const alpha = editable.querySelector('[data-stable-token="alpha"]')!;
  const gamma = editable.querySelector('[data-stable-token="gamma"]')!;
  expect(alpha).not.toBeNull();
  expect(gamma).not.toBeNull();
  const detached: Node[] = [];
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) detached.push(...mutation.removedNodes);
  });

  observer.observe(editable, { childList: true, subtree: true });
  try {
    for (const value of [true, false]) {
      await act(async () => {
        includeMiddle = value;
        refresh?.({ nodeKeys: 'all' });
      });

      expect(editable.textContent).toBe('alpha beta gamma');
      expect(
        editable.querySelector('[data-stable-token="beta"]')?.textContent ??
          null
      ).toBe(value ? 'beta' : null);
      expect(editable.querySelector('[data-stable-token="alpha"]')).toBe(alpha);
      expect(editable.querySelector('[data-stable-token="gamma"]')).toBe(gamma);
    }
    expect(
      detached.some((node) => node === alpha || node.contains(alpha))
    ).toBe(false);
    expect(
      detached.some((node) => node === gamma || node.contains(gamma))
    ).toBe(false);
  } finally {
    observer.disconnect();
    rendered.unmount();
  }
});

test.each(['!', '\n'])(
  'keeps appended %j outside a decoration ending at the text boundary',
  async (inserted) => {
    const editor = createEditor({ initialValue: [paragraph('token')] });
    const source: PliteDecorationSource<typeof editor> = {
      id: 'fixed-token',
      read: ({ entry: [node, path] }) =>
        TextApi.isText(node)
          ? [
              {
                key: 'token',
                attributes: { 'data-fixed-token': '' },
                range: {
                  anchor: { path, offset: 0 },
                  focus: { path, offset: 5 },
                },
              },
            ]
          : [],
    };
    const rendered = render(
      <Plite decorations={[source]} editor={editor}>
        <Editable />
      </Plite>
    );
    const token = rendered.container.querySelector('[data-fixed-token]');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert(inserted, { at: { path: [0, 0], offset: 5 } });
      });
    });

    expect(rendered.container.querySelector('[data-fixed-token]')).toBe(token);
    expect(token?.textContent).toBe('token');
    expect(
      rendered.container.querySelector('[data-plite-editor]')?.textContent
    ).toBe(`token${inserted === '\n' ? '\n\n' : inserted}`);
    rendered.unmount();
  }
);

test('preserves the terminal newline after appending to a plain text flow', async () => {
  const editor = createEditor({ initialValue: [paragraph('plain')] });
  const rendered = render(
    <Plite editor={editor}>
      <Editable />
    </Plite>
  );

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('\n', { at: { path: [0, 0], offset: 5 } });
    });
  });

  expect(
    rendered.container.querySelector('[data-plite-editor]')?.textContent
  ).toBe('plain\n\n');
  expect(
    rendered.container.querySelector('[data-plite-string]')
  ).toHaveAttribute('data-plite-length', '6');
  rendered.unmount();
});

test('composition replaces only its owning retained text flow', async () => {
  const editor = createEditor({
    initialValue: [paragraph('First text'), paragraph('Second text')],
  });

  editor.update.selection.set({
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
  const rendered = render(
    <Plite editor={editor}>
      <Editable />
    </Plite>
  );
  const blocks = () =>
    Array.from(
      rendered.container.querySelectorAll<HTMLElement>(
        '[data-plite-node="element"]'
      )
    );
  const initialBlocks = blocks();
  const firstFlow = initialBlocks[0].querySelector('[data-plite-text-flow]');
  const secondFlow = initialBlocks[1].querySelector('[data-plite-text-flow]');
  const runtime = getMountedEditableDOMRuntime(editor)!;

  expect(firstFlow).not.toBeNull();
  expect(secondFlow).not.toBeNull();

  act(() => runtime.setComposing(true));

  await waitFor(() =>
    expect(blocks()[0].querySelector('[data-plite-text-flow]')).toBeNull()
  );
  expect(blocks()[1].querySelector('[data-plite-text-flow]')).toBe(secondFlow);

  act(() => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [1, 0], offset: 6 } });
    });
  });

  await waitFor(() => expect(blocks()[1]).toHaveTextContent('Second! text'));
  expect(blocks()[1].querySelector('[data-plite-text-flow]')).toBe(secondFlow);

  act(() => runtime.setComposing(false));

  await waitFor(() =>
    expect(blocks()[0].querySelector('[data-plite-text-flow]')).not.toBeNull()
  );
  expect(blocks()[1].querySelector('[data-plite-text-flow]')).toBe(secondFlow);
});

test('reconciles only retained flows whose decoration buckets changed', async () => {
  const editor = createEditor({
    initialValue: [paragraph('First text'), paragraph('Second text')],
  });
  let firstVersion = 'before';
  let refresh:
    | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    | null = null;
  const source: PliteDecorationSource<typeof editor> = {
    id: 'retained-text-locality',
    observe: ({ refresh: nextRefresh }) => {
      refresh = nextRefresh;

      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [
            {
              attributes: {
                'data-local-decoration':
                  node.text === 'First text' ? firstVersion : 'stable',
              },
              key: `retained:${node.text}`,
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: node.text.length },
              },
            },
          ]
        : [],
  };
  const rendered = render(
    <Plite decorations={[source]} editor={editor}>
      <Editable />
    </Plite>
  );
  const flows = Array.from(
    rendered.container.querySelectorAll<HTMLElement>('[data-plite-text-flow]')
  );
  const firstKey = editorGetNodeKey(editor, [0, 0]);

  expect(flows).toHaveLength(2);
  expect(firstKey).not.toBeNull();
  const before = flows.map((flow) =>
    Number(flow.getAttribute('data-plite-text-flow-reconcile-count'))
  );

  await act(async () => {
    firstVersion = 'after';
    refresh?.({ nodeKeys: [firstKey!] });
  });
  await waitFor(() =>
    expect(
      flows[0].querySelector('[data-local-decoration="after"]')
    ).not.toBeNull()
  );

  const after = flows.map((flow) =>
    Number(flow.getAttribute('data-plite-text-flow-reconcile-count'))
  );

  expect(after[0]).toBe(before[0] + 1);
  expect(after[1]).toBe(before[1]);
});

test('keeps a child-owned source alive through StrictMode replay', async () => {
  const editor = createEditor({ initialValue: [paragraph('Strict source')] });
  let className = 'strict-before';
  let refresh:
    | Parameters<NonNullable<PliteDecorationSource['observe']>>[0]['refresh']
    | null = null;
  let observeCount = 0;
  let cleanupCount = 0;
  const source: PliteDecorationSource<unknown> = {
    id: 'strict-child',
    observe: ({ refresh: nextRefresh }) => {
      observeCount += 1;
      refresh = nextRefresh;

      return () => {
        cleanupCount += 1;
      };
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node) && node.text === 'Strict source'
        ? [
            {
              attributes: { className },
              key: 'strict:source',
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: 6 },
              },
            },
          ]
        : [],
  };
  const RegisterSource = () => {
    useRegisterPliteDecorationSource(source);

    return null;
  };
  const rendered = render(
    <StrictMode>
      <Plite editor={editor}>
        <RegisterSource />
        <Editable />
      </Plite>
    </StrictMode>
  );

  await act(async () => {});
  expect(observeCount - cleanupCount).toBe(1);
  expect(rendered.container.querySelector('.strict-before')).not.toBeNull();

  act(() => {
    className = 'strict-after';
    refresh?.({ nodeKeys: 'all' });
  });
  expect(rendered.container.querySelector('.strict-before')).toBeNull();
  expect(rendered.container.querySelector('.strict-after')).not.toBeNull();

  rendered.unmount();
  await act(async () => {});
  expect(cleanupCount).toBe(observeCount);
});
