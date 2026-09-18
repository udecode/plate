import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { DecorationContext } from '../../../../../plitejs/src/react/decoration-context';
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
  useEditorReadOnly,
} from '../../core';
import { SuggestionPlugin } from './SuggestionPlugin';
import { useActiveSuggestion } from './useSuggestion';

const ActiveProbe = () => {
  const { activeId } = useActiveSuggestion();
  return <output data-testid="active-suggestion">{activeId ?? 'none'}</output>;
};

type DecorationManager = NonNullable<
  React.ContextType<typeof DecorationContext>
>;

const MetricsProbe = ({
  onManager,
}: {
  onManager: (manager: DecorationManager) => void;
}) => {
  const manager = React.useContext(DecorationContext);

  React.useLayoutEffect(() => {
    if (manager) onManager(manager);
  }, [manager, onManager]);

  return null;
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
  const tree = (projection: 'markup' | 'proposed') => (
    <React.StrictMode>
      <EditorRoot
        editor={editor}
        authored={{ intent: 'propose', projection }}
        suppressInstanceWarning
      >
        <EditorContent data-testid="proposal" />
        <Capture name="proposal" />
      </EditorRoot>
      <EditorRoot
        editor={editor}
        authored={{ intent: 'edit', projection: 'accepted' }}
        suppressInstanceWarning
      >
        <EditorContent data-testid="accepted" />
        <Capture name="accepted" />
      </EditorRoot>
    </React.StrictMode>
  );
  const mounted = render(tree('markup'));
  const first = views.get('proposal')!;
  const second = views.get('accepted')!;

  expect(mounted.getByTestId('proposal')).toHaveTextContent('Base proposal');
  expect(mounted.getByTestId('accepted').textContent).toBe('Base');
  expect(first).not.toBe(second);
  expect(first.plugin(SuggestionPlugin).read.mode()).toBe('suggesting');
  expect(second.plugin(SuggestionPlugin).read.mode()).toBe('editing');
  await act(async () => first.plugin(SuggestionPlugin).api.setMode('editing'));
  await act(async () => mounted.rerender(tree('markup')));
  expect(views.get('proposal')).toBe(first);
  expect(first.plugin(SuggestionPlugin).read.mode()).toBe('editing');
  expect(mounted.getByTestId('proposal').textContent).toBe('Base proposal');

  await act(async () => mounted.rerender(tree('proposed')));
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
      authored={{ intent: 'edit', projection: 'markup' }}
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
  const managers: DecorationManager[] = [];
  const recordManager = (manager: DecorationManager) => {
    if (!managers.includes(manager)) managers.push(manager);
  };
  const view = render(
    <>
      <section data-testid="first-root">
        <EditorRoot editor={editor} suppressInstanceWarning>
          <MetricsProbe onManager={recordManager} />
          <EditorContainer>
            <EditorContent data-testid="first" />
          </EditorContainer>
        </EditorRoot>
      </section>
      <section data-testid="second-root">
        <EditorRoot editor={editor} suppressInstanceWarning>
          <MetricsProbe onManager={recordManager} />
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
    expect(
      first.querySelector(
        `[data-editor-authored-change="${changeId}"][data-editor-suggestion-active]`
      )
    ).not.toBeNull();
    expect(second.querySelector('[data-editor-suggestion-active]')).toBeNull();
  });

  view.unmount();
  expect(managers).toHaveLength(2);
  expect(
    managers.every((manager) => manager.getMetrics().sourceObserverCount === 0)
  ).toBe(true);
});

const RetainedBlockPlugin = definePlugin('retainedBlock', {
  schema: { element: { void: 'block' } },
});

function RetainedBlock(props: EditorElementProps<typeof RetainedBlockPlugin>) {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const key = editor.key(props.element);

  return (
    <EditorElement
      {...props}
      attributes={{
        ...props.attributes,
        'data-testid': 'retained-block',
        'data-render-key': key,
        'data-owner-match': String(props.editor === editor),
        'data-read-only': String(readOnly),
      }}
    >
      <span contentEditable={false}>Image</span>
      {props.children}
    </EditorElement>
  );
}

it.each(['accept', 'reject'] as const)(
  'keeps deleted block renderers bound to their retained view through history and %s',
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
    const initialKey = mounted
      .getByTestId('retained-block')
      .getAttribute('data-render-key');
    expect(initialKey).toBeTruthy();
    expect(mounted.getByTestId('retained-block')).toHaveAttribute(
      'data-owner-match',
      'true'
    );
    expect(mounted.getByTestId('retained-block')).toHaveAttribute(
      'data-read-only',
      'false'
    );

    await act(async () => {
      editor.update({ history: 'new-batch' }, (tx) => {
        tx.nodes.remove({ at: [1] });
      });
    });
    const retained = mounted.getByTestId('retained-block');
    expect(retained).toHaveAttribute('data-editor-retained');
    expect(retained).toHaveAttribute('data-editor-authored-author', 'alice');
    expect(retained).toHaveAttribute('data-owner-match', 'true');
    expect(retained).toHaveAttribute('data-read-only', 'true');
    expect(retained.getAttribute('data-render-key')).toBeTruthy();
    expect(editor.read.children()).toEqual([value[0], value[2]]);
    expect(editor.read.value().children).toEqual(value);

    await act(async () => editor.api.history.undo());
    expect(mounted.getByTestId('retained-block')).not.toHaveAttribute(
      'data-editor-retained'
    );
    expect(mounted.getByTestId('retained-block')).toHaveAttribute(
      'data-read-only',
      'false'
    );
    await act(async () => editor.api.history.redo());
    expect(mounted.getByTestId('retained-block')).toHaveAttribute(
      'data-editor-retained'
    );
    expect(mounted.getByTestId('retained-block')).toHaveAttribute(
      'data-owner-match',
      'true'
    );
    expect(mounted.getByTestId('retained-block')).toHaveAttribute(
      'data-read-only',
      'true'
    );

    await act(async () => {
      editor.update.authored.decide({
        action,
        selection: editor.read.authored.select({ status: 'pending' }),
      });
    });
    if (action === 'accept') {
      expect(mounted.queryByTestId('retained-block')).toBeNull();
      expect(editor.read.value().children).toEqual([value[0], value[2]]);
    } else {
      expect(mounted.getByTestId('retained-block')).not.toHaveAttribute(
        'data-editor-retained'
      );
      expect(mounted.getByTestId('retained-block')).toHaveAttribute(
        'data-owner-match',
        'true'
      );
      expect(mounted.getByTestId('retained-block')).toHaveAttribute(
        'data-read-only',
        'false'
      );
      expect(editor.read.value().children).toEqual(value);
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
  const readOnly = useEditorReadOnly();

  return (
    <strong
      {...props.attributes}
      data-owner-match={String(props.editor === editor)}
      data-read-only={String(readOnly)}
      data-render-text={editor.read.text.string([])}
    >
      {props.children}
    </strong>
  );
}

it.each(['leaf', 'text'] as const)(
  'binds custom marks at %s placement in retained text to their fragment editor',
  async (placement) => {
    const value = [
      {
        type: 'paragraph',
        children: [{ text: 'Before deleted after', retainedMark: true }],
      },
    ];
    const editor = createEditor({
      initialValue: value,
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
    const retained = mounted.container.querySelector(
      '[data-editor-retained] strong, strong[data-editor-retained]'
    );
    expect(retained).toHaveTextContent('deleted');
    expect(retained?.getAttribute('data-owner-match')).toBe('true');
    expect(retained?.getAttribute('data-read-only')).toBe('true');
    expect(retained?.getAttribute('data-render-text')).toBe('deleted');
    expect(mounted.container.textContent).toBe('Before deleted after');
    expect(editor.read.children()).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Before  after', retainedMark: true }],
      },
    ]);
    mounted.unmount();
  }
);
