import { act, render, waitFor } from '@testing-library/react';
import { TextApi } from 'plitejs';
import { history } from 'plitejs/history';
import { useEffect, useLayoutEffect, useState } from 'react';

import {
  createEditor,
  Editable,
  Plite,
  type PliteDecorationSource,
  type RenderLeafProps,
} from '../../src/react';
import { ImperativeTextFlowContext } from '../../src/react/components/editable-text-flow';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const createStatefulLeafFixture = ({
  ranges = [
    { end: 7, key: 'first', source: 'ranges', start: 1 },
    { end: 9, key: 'second', source: 'ranges', start: 4 },
  ],
  text = 'abcdefghij',
}: {
  ranges?: Array<{
    end: number;
    key: string;
    source: string;
    start: number;
  }>;
  text?: string;
} = {}) => {
  const editor = createEditor({
    extensions: [history()],
    initialValue: [paragraph(text)],
  });
  const anchors = ranges.map(({ end, key, source, start }) => ({
    anchor: editor.anchor(
      {
        anchor: { offset: start, path: [0, 0] },
        focus: { offset: end, path: [0, 0] },
      },
      { association: 'inward', deletion: 'nearest' }
    ),
    key,
    source,
  }));
  const counts = { cleaned: 0, created: 0, mounted: 0 };
  const live = new Map<
    number,
    {
      local: number;
      setLocal: (value: number) => void;
    }
  >();
  const sources: Array<PliteDecorationSource<typeof editor>> = [
    ...new Set(anchors.map(({ source }) => source)),
  ].map((id) => ({
    id,
    read: ({ entry: [node] }) =>
      TextApi.isText(node)
        ? anchors.flatMap(({ anchor, key, source }) => {
            if (source !== id) return [];
            const range = anchor.resolve();

            return range
              ? [
                  {
                    attributes: {
                      'data-decoration': key,
                      'data-source': source,
                    },
                    key,
                    range,
                  },
                ]
              : [];
          })
        : [],
  }));

  const StatefulLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    const [instance] = useState(() => {
      counts.created += 1;

      return counts.created;
    });
    const [local, setLocal] = useState(1);

    useLayoutEffect(() => {
      live.set(instance, { local, setLocal });
    }, [instance, local]);
    useEffect(() => {
      counts.mounted += 1;

      return () => {
        counts.cleaned += 1;
        live.delete(instance);
      };
    }, [instance]);

    return (
      <span
        {...attributes}
        data-leaf-instance={instance}
        data-leaf-local={local}
        data-stateful-leaf="true"
      >
        {leaf.bold ? <strong>{children}</strong> : children}
      </span>
    );
  };
  const editable = (label: string) => (
    <Editable
      aria-label={label}
      domStrategy="full"
      renderLeaf={(props) => <StatefulLeaf {...props} />}
    />
  );
  const View = ({ second = false }: { second?: boolean }) => (
    <Plite decorations={sources} editor={editor}>
      {editable('First identity editor')}
      {second ? editable('Second identity editor') : null}
    </Plite>
  );

  return {
    counts,
    editor,
    live,
    release: () => anchors.forEach(({ anchor }) => anchor.release()),
    setLocal: (value: number) => {
      for (const state of live.values()) state.setLocal(value);
    },
    View,
  };
};

const readLeafHosts = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-stateful-leaf]'));

const expectSameLeafHosts = (
  before: readonly HTMLElement[],
  root: ParentNode
) => {
  const after = readLeafHosts(root);

  expect(after).toHaveLength(before.length);
  expect(after.every((host, index) => host === before[index])).toBe(true);
};

test('preserves stateful leaf owners through text, mark, and history commits', async () => {
  const fixture = createStatefulLeafFixture();
  const rendered = render(<fixture.View />);

  try {
    await act(async () => {});
    await act(async () => {
      fixture.setLocal(7);
    });
    const editable = rendered.getByLabelText('First identity editor');
    const hosts = readLeafHosts(editable);
    const instances = hosts.map((host) => Number(host.dataset.leafInstance));

    expect(hosts).toHaveLength(5);

    await act(async () => {
      fixture.editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.insert('X', { at: { offset: 0, path: [0, 0] } });
      });
    });
    expect(editable.textContent).toBe('Xabcdefghij');
    expectSameLeafHosts(hosts, editable);

    await act(async () => {
      fixture.editor.update((tx) => tx.history.undo());
    });
    expect(editable.textContent).toBe('abcdefghij');
    expectSameLeafHosts(hosts, editable);

    await act(async () => {
      fixture.editor.update({ history: 'new-batch' }, (tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 10, path: [0, 0] },
        });
        tx.marks.add('bold', true);
      });
    });
    expect(editable.querySelectorAll('strong')).toHaveLength(5);
    expectSameLeafHosts(hosts, editable);

    await act(async () => {
      fixture.editor.update((tx) => tx.history.undo());
    });
    expect(editable.querySelectorAll('strong')).toHaveLength(0);
    expectSameLeafHosts(hosts, editable);
    expect(
      instances.every((instance) => fixture.live.get(instance)?.local === 7)
    ).toBe(true);
  } finally {
    rendered.unmount();
    fixture.release();
  }

  expect(fixture.live.size).toBe(0);
  expect(fixture.counts.cleaned).toBe(fixture.counts.mounted);
});

test('rerenders an undecorated custom leaf without replacing its owner', async () => {
  const editor = createEditor({ initialValue: [paragraph('abc')] });
  let setLocal: ((value: number) => void) | undefined;
  let instanceCount = 0;
  let latestLocal = 0;
  const StatefulLeaf = ({ attributes, children }: RenderLeafProps) => {
    const [instance] = useState(() => {
      instanceCount += 1;

      return instanceCount;
    });
    const [local, updateLocal] = useState(1);

    setLocal = updateLocal;
    latestLocal = local;

    return (
      <span
        {...attributes}
        data-leaf-instance={instance}
        data-leaf-local={local}
        data-stateful-leaf="true"
      >
        {children}
      </span>
    );
  };
  const rendered = render(
    <Plite editor={editor}>
      <Editable
        aria-label="Undecorated identity editor"
        domStrategy="full"
        renderLeaf={(props) => <StatefulLeaf {...props} />}
      />
    </Plite>
  );
  const editable = rendered.getByLabelText('Undecorated identity editor');
  const leaf = readLeafHosts(editable)[0];

  await act(async () => {});
  await act(async () => {
    setLocal?.(7);
  });
  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('X', { at: { offset: 1, path: [0, 0] } });
    });
  });

  expect(editable.textContent).toBe('aXbc');
  expect(readLeafHosts(editable)).toEqual([leaf]);
  expect(latestLocal).toBe(7);
  expect(instanceCount).toBe(1);
});

test('keeps source-local decoration keys and mounted view lifetimes distinct', async () => {
  const fixture = createStatefulLeafFixture({
    ranges: [
      { end: 5, key: 'same', source: 'one', start: 0 },
      { end: 10, key: 'same', source: 'two', start: 5 },
    ],
  });
  const rendered = render(<fixture.View second />);

  try {
    await act(async () => {});
    await act(async () => {
      fixture.setLocal(7);
    });
    const editors = [
      rendered.getByLabelText('First identity editor'),
      rendered.getByLabelText('Second identity editor'),
    ];
    const readSourceHosts = (root: ParentNode) =>
      ['one', 'two'].map((source) =>
        root
          .querySelector(`[data-source="${source}"]`)
          ?.closest<HTMLElement>('[data-stateful-leaf]')
      );
    const hosts = editors.map(readSourceHosts);
    const instances = hosts
      .flat()
      .map((host) => Number(host?.dataset.leafInstance));

    expect(hosts[0]).toHaveLength(2);
    expect(hosts[1]).toHaveLength(2);
    expect(hosts.flat().every(Boolean)).toBe(true);

    await act(async () => {
      fixture.editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.insert('X', { at: { offset: 0, path: [0, 0] } });
      });
    });
    await act(async () => {
      fixture.editor.update((tx) => tx.history.undo());
    });
    await act(async () => {
      fixture.editor.update((tx) => tx.history.redo());
    });

    for (const [index, editor] of editors.entries()) {
      expect(editor.textContent).toBe('Xabcdefghij');
      expect(readSourceHosts(editor)).toEqual(hosts[index]);
      expect(editor.querySelector('[data-source="one"]')?.textContent).toBe(
        'abcde'
      );
      expect(editor.querySelector('[data-source="two"]')?.textContent).toBe(
        'fghij'
      );
    }
    expect(
      instances.every((instance) => fixture.live.get(instance)?.local === 7)
    ).toBe(true);
  } finally {
    rendered.unmount();
    fixture.release();
  }

  expect(fixture.live.size).toBe(0);
  expect(fixture.counts.cleaned).toBe(fixture.counts.mounted);
});

test('keeps retained-flow DOM identity attached to its decoration source', async () => {
  const editor = createEditor({ initialValue: [paragraph('abcdefghij')] });
  const source = (
    id: 'one' | 'two',
    swapped: boolean
  ): PliteDecorationSource<typeof editor> => ({
    id,
    read: ({ entry: [node, path] }) => {
      if (!TextApi.isText(node)) return [];
      const first = id === 'one' ? !swapped : swapped;

      return [
        {
          attributes: { 'data-source': id },
          key: 'same',
          range: {
            anchor: { offset: first ? 0 : 5, path },
            focus: { offset: first ? 5 : 10, path },
          },
        },
      ];
    },
  });
  const View = ({ swapped }: { swapped: boolean }) => (
    <Plite
      decorations={[source('one', swapped), source('two', swapped)]}
      editor={editor}
    >
      <Editable aria-label="Retained identity editor" />
    </Plite>
  );
  const rendered = render(<View swapped={false} />);
  const editable = rendered.getByLabelText('Retained identity editor');
  const one = editable.querySelector('[data-source="one"]');
  const two = editable.querySelector('[data-source="two"]');

  expect(editable.querySelector('[data-plite-text-flow]')).not.toBeNull();
  expect(one?.textContent).toBe('abcde');
  expect(two?.textContent).toBe('fghij');

  rendered.rerender(<View swapped />);

  await act(async () => {
    await Promise.resolve();
  });

  await waitFor(() =>
    expect(editable.querySelector('[data-source="one"]')?.textContent).toBe(
      'fghij'
    )
  );
  expect(editable.querySelector('[data-source="two"]')?.textContent).toBe(
    'abcde'
  );
  expect(editable.querySelector('[data-source="one"]')).toBe(one);
  expect(editable.querySelector('[data-source="two"]')).toBe(two);

  rendered.unmount();
});

test('remounts a leaf when an empty text commit cannot stay imperative', async () => {
  const editor = createEditor({ initialValue: [paragraph('abc')] });
  const rendered = render(
    <ImperativeTextFlowContext.Provider value={false}>
      <Plite editor={editor}>
        <Editable aria-label="Repair editor" domStrategy="full" />
      </Plite>
    </ImperativeTextFlowContext.Provider>
  );
  const editable = rendered.getByLabelText('Repair editor');
  const leaf = editable.querySelector('[data-plite-leaf]');

  expect(leaf).not.toBeNull();

  act(() => {
    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
          kind: 'text',
        },
      });
    });
  });

  await waitFor(() =>
    expect(editable.querySelector('[data-plite-zero-width]')).not.toBeNull()
  );
  expect(editable.querySelector('[data-plite-leaf]')).not.toBe(leaf);
  expect(editor.read((state) => state.text.string([0]))).toBe('');
});
