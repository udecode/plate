import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { projectAuthoredDocument } from '../../../authored';
import {
  createEditor,
  definePlugin,
  EditorContainer,
  EditorContent,
  EditorElement,
  type EditorElementProps,
  type EditorLeafProps,
  EditorRoot,
  type EditorTextProps,
  property,
  useEditor,
} from '../../core';
import { SuggestionPlugin } from './SuggestionPlugin';
import { useActiveSuggestion } from './useSuggestion';

const ActiveProbe = () => {
  const { activeId } = useActiveSuggestion();
  return <output data-testid="active-suggestion">{activeId ?? 'none'}</output>;
};

it('initializes independent authored views and preserves their mode across parent renders', async () => {
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    plugins: [SuggestionPlugin],
    userId: 'alice',
  });
  editor.update((tx) => {
    tx.authored.propose();
    tx.text.insert(' proposal', { at: { offset: 4, path: [0, 0] } });
  });
  const document = editor.read.value();
  const views = new Map<string, ReturnType<typeof useEditor>>();
  const Capture = ({ name }: { name: string }) => {
    views.set(name, useEditor());
    return null;
  };
  const tree = (intent: 'edit' | 'propose') => (
    <React.StrictMode>
      <EditorRoot editor={editor} authored={{ intent }} suppressInstanceWarning>
        <EditorContent data-testid="proposal" />
        <Capture name="proposal" />
      </EditorRoot>
      <EditorRoot
        editor={editor}
        authored={{ preview: 'accepted' }}
        suppressInstanceWarning
      >
        <EditorContent data-testid="accepted" />
        <Capture name="accepted" />
      </EditorRoot>
    </React.StrictMode>
  );
  const mounted = render(tree('propose'));
  const first = views.get('proposal')!;
  const second = views.get('accepted')!;

  expect(mounted.getByTestId('proposal')).toHaveTextContent('Base proposal');
  expect(mounted.getByTestId('accepted').textContent).toBe('Base');
  expect(first).not.toBe(second);
  expect(first.plugin(SuggestionPlugin).read.mode()).toBe('suggesting');
  expect(second.plugin(SuggestionPlugin).read.mode()).toBe('editing');
  await act(async () => first.plugin(SuggestionPlugin).api.setMode('editing'));
  await act(async () => mounted.rerender(tree('propose')));
  expect(views.get('proposal')).toBe(first);
  expect(first.plugin(SuggestionPlugin).read.mode()).toBe('editing');
  expect(mounted.getByTestId('proposal').textContent).toBe('Base proposal');

  await act(async () => mounted.rerender(tree('edit')));
  await act(async () => mounted.rerender(tree('propose')));
  expect(views.get('proposal')).toBe(first);
  expect(first.plugin(SuggestionPlugin).read.mode()).toBe('suggesting');
  expect(mounted.getByTestId('proposal')).toHaveTextContent('Base proposal');
  expect(second.plugin(SuggestionPlugin).read.mode()).toBe('editing');
  expect(editor.plugin(SuggestionPlugin).read.mode()).toBe('editing');
  expect(editor.read.value()).toEqual(document);
  mounted.unmount();
});

it('decorates pending changes on a client-mounted editing markup view', async () => {
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    plugins: [SuggestionPlugin],
    userId: 'alice',
  });
  let changeId = '';

  editor.update((tx) => {
    changeId = tx.authored.propose();
    tx.text.insert(' proposal', { at: { offset: 4, path: [0, 0] } });
  });
  const mounted = render(
    <EditorRoot
      editor={editor}
      authored={{ intent: 'edit' }}
      suppressInstanceWarning
    >
      <EditorContent data-testid="editing-markup" />
    </EditorRoot>
  );
  const root = mounted.getByTestId('editing-markup');

  await waitFor(() => {
    expect(
      root.querySelector(`[data-editor-authored-change="${changeId}"]`)
    ).not.toBeNull();
  });
  expect(root).toHaveTextContent('Base proposal');
  mounted.unmount();
});

it('keeps active suggestion interaction local to each mounted view', async () => {
  const plugin = SuggestionPlugin.configure({
    slots: { afterEditable: ActiveProbe },
  });
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'Accepted' }], type: 'paragraph' }],
    plugins: [plugin],
    userId: 'alice',
  });
  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  editor.update.text.insert(' proposed', {
    at: { offset: 8, path: [0, 0] },
  });
  const changeId = editor.read.authored.changes().items[0].id;
  const view = render(
    <>
      <section data-testid="first-root">
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContainer>
            <EditorContent data-testid="first" />
          </EditorContainer>
        </EditorRoot>
      </section>
      <section data-testid="second-root">
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContainer>
            <EditorContent data-testid="second" />
          </EditorContainer>
        </EditorRoot>
      </section>
    </>
  );
  const first = view.getByTestId('first');
  const second = view.getByTestId('second');
  const firstRoot = view.getByTestId('first-root');
  const secondRoot = view.getByTestId('second-root');

  await waitFor(() => {
    expect(
      first.querySelector(`[data-editor-authored-change="${changeId}"]`)
    ).not.toBeNull();
    expect(
      second.querySelector(`[data-editor-authored-change="${changeId}"]`)
    ).not.toBeNull();
  });
  expect(
    first.querySelector(`[data-editor-authored-change="${changeId}"]`)
  ).toHaveAttribute('data-editor-authored-author', 'alice');
  fireEvent.click(
    first.querySelector(`[data-editor-authored-change="${changeId}"]`)!
  );

  await waitFor(() => {
    expect(
      firstRoot.querySelector('[data-testid="active-suggestion"]')
    ).toHaveTextContent(changeId);
    expect(
      secondRoot.querySelector('[data-testid="active-suggestion"]')
    ).toHaveTextContent('none');
  });

  view.unmount();
});

const RetainedBlockPlugin = definePlugin('retainedBlock', {
  schema: { element: { void: 'block' } },
});

function RetainedBlock(props: EditorElementProps<typeof RetainedBlockPlugin>) {
  const editor = useEditor();
  const key = editor.key(props.element);

  return (
    <EditorElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-testid': 'retained-block',
        'data-render-key': key,
        'data-owner-match': String(props.editor === editor),
      }}
    >
      <span contentEditable={false}>Image</span>
      {props.children}
    </EditorElement>
  );
}

it.each(['accept', 'reject'] as const)(
  'keeps a deleted block on its renderer through history and %s',
  async (action) => {
    const value = [
      { type: 'paragraph', children: [{ text: 'Before' }] },
      { type: 'retainedBlock', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'After' }] },
    ];
    const editor = createEditor({
      initialValue: value,
      plugins: [
        SuggestionPlugin,
        RetainedBlockPlugin.configure({ component: RetainedBlock }),
      ],
      userId: 'alice',
    });
    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    const mounted = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );
    const block = () => mounted.getByTestId('retained-block');
    const initialKey = block().getAttribute('data-render-key');
    expect(initialKey).toBeTruthy();
    expect(block()).toHaveAttribute('data-owner-match', 'true');

    await act(async () => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.nodes.remove({ at: [1] });
      });
    });
    const [deletion] = editor.read.authored.changes().items;
    expect(deletion).toMatchObject({ authorId: 'alice', kind: 'delete' });
    expect(block()).toHaveAttribute('data-editor-authored-change', deletion.id);
    expect(block()).toHaveAttribute('data-editor-authored-kind', 'delete');
    expect(block()).toHaveAttribute('data-owner-match', 'true');
    expect(block()).toHaveAttribute('data-render-key', initialKey!);
    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'proposed' })
        .document.children
    ).toEqual([value[0], value[2]]);
    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'accepted' })
        .document.children
    ).toEqual(value);

    await act(() => {
      editor.api.history.undo();
    });
    expect(block()).not.toHaveAttribute('data-editor-authored-change');
    expect(editor.read.children()).toEqual(value);
    await act(() => {
      editor.api.history.redo();
    });
    expect(block()).toHaveAttribute('data-editor-authored-kind', 'delete');
    expect(block()).toHaveAttribute('data-owner-match', 'true');

    const [pending] = editor.read.authored.changes().items;
    await act(async () => {
      editor.update.authored.decide({ action, changes: [pending] });
    });
    expect(editor.read.authored.change(pending.id)).toBeNull();
    if (action === 'accept') {
      expect(mounted.queryByTestId('retained-block')).toBeNull();
      expect(editor.read.children()).toEqual([value[0], value[2]]);
    } else {
      expect(block()).not.toHaveAttribute('data-editor-authored-change');
      expect(block()).toHaveAttribute('data-render-key', initialKey!);
      expect(editor.read.children()).toEqual(value);
    }
    mounted.unmount();
  }
);

const RetainedMarkPlugin = definePlugin('retainedMark', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

function RetainedMark(
  props:
    | EditorLeafProps<typeof RetainedMarkPlugin>
    | EditorTextProps<typeof RetainedMarkPlugin>
) {
  const editor = useEditor();

  return (
    <strong
      {...props.attributes}
      data-owner-match={String(props.editor === editor)}
    >
      {props.children}
    </strong>
  );
}

it.each(['leaf', 'text'] as const)(
  'paints struck text under a custom mark at %s placement',
  async (placement) => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Before deleted after', retainedMark: true }],
        },
      ],
      plugins: [
        SuggestionPlugin,
        RetainedMarkPlugin.configure({
          component: RetainedMark,
          render: { mark: { placement } },
        }),
      ],
      userId: 'alice',
    });
    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    const mounted = render(
      <EditorRoot editor={editor}>
        <EditorContent />
      </EditorRoot>
    );

    await act(async () => {
      editor.update.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 7 },
          focus: { path: [0, 0], offset: 14 },
        },
      });
    });
    const struck = mounted.container.querySelector(
      'strong[data-editor-authored-kind="delete"]'
    );
    expect(struck).toHaveTextContent('deleted');
    expect(struck).toHaveAttribute('data-editor-authored-author', 'alice');
    expect(struck?.getAttribute('data-owner-match')).toBe('true');
    expect(mounted.container.textContent).toBe('Before deleted after');
    expect(
      projectAuthoredDocument(editor.read.value(), { projection: 'proposed' })
        .document.children
    ).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Before  after', retainedMark: true }],
      },
    ]);
    mounted.unmount();
  }
);

it('renames the card a decision merges in a block the decision does not write', async () => {
  const editor = createEditor({
    initialValue: [
      {
        authored: [
          { at: 1, author: 'carol', change: 'carol:1', kind: 'insert' },
        ],
        children: [
          { text: 'One' },
          {
            authored: [
              { at: 3, author: 'bob', change: 'bob:1', kind: 'insert' },
            ],
            text: '!',
          },
        ],
        type: 'paragraph',
      },
      {
        authored: [
          { at: 2, author: 'carol', change: 'carol:2', kind: 'insert' },
        ],
        children: [{ text: 'Two' }],
        type: 'paragraph',
      },
    ],
    plugins: [SuggestionPlugin],
    userId: 'alice',
  });
  const mounted = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  const cardOfTwo = () =>
    mounted.container
      .querySelector('[data-editor-authored-change="carol:2"]')
      ?.getAttribute('data-editor-authored-groups');

  await waitFor(() => expect(cardOfTwo()).toBe('carol:2'));
  await act(async () => {
    editor.update.authored.decide({
      action: 'accept',
      changes: [editor.read.authored.change('bob:1')!],
    });
  });

  expect(cardOfTwo()).toBe('carol:1');
  mounted.unmount();
});

const mountCard = async (userId: string) => {
  const pathsByBlock = new Map<number, string[]>();
  const RenderCount = definePlugin('renderCount', {
    inject: {
      nodeProps: {
        transformProps: ({ path }) => {
          if (path) {
            pathsByBlock.set(path[0], [
              ...(pathsByBlock.get(path[0]) ?? []),
              String(path),
            ]);
          }
          return {};
        },
      },
    },
  });
  const editor = createEditor({
    initialValue: Array.from({ length: 1000 }, (_, index) => ({
      authored: [
        {
          at: index + 1,
          author: 'alice',
          change: `alice:${index}`,
          kind: 'insert',
        },
      ],
      children: [{ text: `proposed ${index}` }],
      type: 'paragraph',
    })),
    plugins: [SuggestionPlugin, RenderCount],
    userId,
  });

  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  const mounted = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );

  await waitFor(() => expect(pathsByBlock.has(999)).toBe(true));
  pathsByBlock.clear();

  return { editor, mounted, pathsByBlock };
};

it("renders only the edited block when a card's author types at its end", async () => {
  const { editor, mounted, pathsByBlock } = await mountCard('alice');

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', {
        at: { offset: 'proposed 999'.length, path: [999, 0] },
      });
    });
  });

  expect([...pathsByBlock.keys()]).toEqual([999]);
  mounted.unmount();
});

it('renders once the part of a card that another author’s key renames', async () => {
  const { editor, mounted, pathsByBlock } = await mountCard('bob');

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { offset: 3, path: [500, 0] } });
    });
  });

  expect(pathsByBlock.has(500)).toBe(true);
  expect(
    [...pathsByBlock]
      .filter(([block]) => block !== 500)
      .map(([block, paths]) => [block, [...paths].sort().join(' ')])
      .sort(([left], [right]) => Number(left) - Number(right))
  ).toEqual(
    Array.from({ length: 499 }, (_, index) => [
      501 + index,
      `${501 + index} ${501 + index},0`,
    ])
  );
  mounted.unmount();
});

it('paints nothing on text a rejected replacement gives back', async () => {
  const editor = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Before old after' }] },
    ],
    plugins: [SuggestionPlugin],
    userId: 'alice',
  });
  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  const mounted = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 10 },
      });
      tx.text.insert('new');
    });
  });
  const [replacement] = editor.read.authored.changes().items;

  await act(async () => {
    editor.update.authored.decide({ action: 'reject', changes: [replacement] });
  });

  expect(mounted.container.textContent).toBe('Before old after');
  expect(
    mounted.container.querySelector('[data-editor-authored-kind]')
  ).toBeNull();
  expect(JSON.stringify(editor.read.children())).toContain('"kind":"held"');
  mounted.unmount();
});

it('reports stored changes to the callbacks of an accepted preview root', () => {
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    plugins: [SuggestionPlugin],
    userId: 'alice',
  });
  const changes: string[] = [];

  render(
    <EditorRoot
      editor={editor}
      authored={{ preview: 'accepted' }}
      suppressInstanceWarning
      onSelectionChange={() => changes.push('selection')}
      onValueChange={({ value }) =>
        changes.push(`value:${JSON.stringify(value.children)}`)
      }
    >
      <EditorContent />
    </EditorRoot>
  );
  act(() => {
    editor.update((tx) => {
      tx.authored.propose();
      tx.text.insert(' proposal', { at: { offset: 4, path: [0, 0] } });
    });
  });
  act(() => {
    editor.update.selection.set({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  expect(changes).toEqual([
    `value:${JSON.stringify(editor.read.value().children)}`,
    'selection',
  ]);
});
