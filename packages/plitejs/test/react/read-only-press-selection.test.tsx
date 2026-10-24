import { act, fireEvent, render } from '@testing-library/react';
import React, { Activity, useState } from 'react';
import { expect, onTestFinished, test, vi } from 'vitest';

import { defineEditorSchema, schema } from '../../src';
import { authored } from '../../src/authored';
import { setShownSelectionAsView } from '../../src/core/view-carets';
import { createEditorView } from '../../src/editor-runtime-view';
import type { Range } from '../../src/interfaces/range';
import { SelectionApi } from '../../src/interfaces/selection';
import { TextApi } from '../../src/interfaces/text';
import type { RenderLeafProps } from '../../src/react/components/editable-text';
import {
  Editable,
  type RenderElementProps,
} from '../../src/react/components/editable-text-blocks';
import { ImperativeTextFlowContext } from '../../src/react/components/editable-text-flow';
import { EditorRoot } from '../../src/react/components/plite';
import type { DecorationSource } from '../../src/react/decoration-source';
import { applyEditableCaretMovement } from '../../src/react/editable/caret-engine';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { useClaimEditableDOMCommit } from '../../src/react/hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../../src/react/hooks/use-editor-context';
import { useEditorFocused } from '../../src/react/hooks/use-editor-focused';
import { useRootEditor } from '../../src/react/hooks/use-plite-runtime';
import { createEditor } from '../../src/react/plugin/with-react';
import { readPliteViewSelection } from '../../src/react/view-selection';

type View = ReturnType<typeof useEditorContext>;

const p = (text: string) => ({ children: [{ text }], type: 'paragraph' });

const sourceOf = (initialValue: unknown) =>
  createEditor({
    initialValue: initialValue as never,
    plugins: [authored({ authorId: 'alice' })],
  });

const select = (view: View, range: Range) => {
  act(() => {
    setShownSelectionAsView(view, SelectionApi.text(range));
  });
};

const struck = () => {
  const source = sourceOf([p('This extra sentence can go.')]);

  createEditorView(source, {
    authored: { intent: 'propose' },
  }).update.text.delete({
    at: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 11 },
    },
  });

  return source;
};

const withInsertedBlock = () => {
  const source = sourceOf([p('one'), p('two')]);

  createEditorView(source, { authored: { intent: 'propose' } }).update((tx) =>
    tx.nodes.insert(p('new') as never, { at: [0] })
  );

  return source;
};

const strings = (root: HTMLElement) =>
  [...root.querySelectorAll('[data-editor-string]')].map(
    (string) => string.firstChild as Text
  );

const withControl = ({ attributes, children }: RenderElementProps) => (
  <p {...attributes}>
    {children}
    <button contentEditable={false} type="button">
      copy
    </button>
  </p>
);

const mountFocusAwarePreview = (
  source: ReturnType<typeof sourceOf>,
  { control = false }: { control?: boolean } = {}
) => {
  let view!: View;
  let rerender!: () => void;
  const FocusAware = () => {
    const focused = useEditorFocused();
    const [renders, setRenders] = useState(0);

    view = useEditorContext();
    rerender = () => setRenders((count) => count + 1);

    return (
      <Editable
        aria-label="preview"
        data-focused={focused}
        data-renders={renders}
        renderElement={control ? withControl : undefined}
      />
    );
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
      <FocusAware />
    </EditorRoot>
  );
  const root = mounted.getByLabelText('preview');
  const text = root.querySelector('[data-editor-string]')!.firstChild as Text;

  return { rerender, root, text, view };
};

const firefoxPress = (
  string: Text,
  offset = string.data.length,
  during?: () => void
) => {
  act(() => {
    fireEvent.pointerDown(string.parentElement!);
    fireEvent.mouseDown(string.parentElement!);
    during?.();
    document.getSelection()!.setBaseAndExtent(string, offset, string, offset);
  });
};

const touch = (text: Text, during?: () => void) => {
  act(() => {
    const down = new MouseEvent('pointerdown', { bubbles: true });

    Object.defineProperty(down, 'pointerType', { value: 'touch' });
    text.parentElement!.dispatchEvent(down);
    during?.();
    fireEvent.pointerUp(text.parentElement!);
  });
};

const mouseDownAfterTap = async (text: Text) => {
  await act(
    () =>
      new Promise((resolve) => {
        setTimeout(resolve, 0);
      })
  );
  act(() => {
    fireEvent.mouseDown(text.parentElement!);
    document
      .getSelection()!
      .setBaseAndExtent(text, text.data.length, text, text.data.length);
  });
};

test("a tap's caret in a read-only preview survives renders before its selectionchange", async () => {
  const source = struck();
  const { rerender, root, text } = mountFocusAwarePreview(source);

  touch(text);
  await mouseDownAfterTap(text);
  act(() => {
    root.focus();
  });
  act(() => {
    rerender();
  });
  act(() => {
    fireEvent.mouseUp(text.parentElement!);
    document.dispatchEvent(new Event('selectionchange'));
  });

  const stored = { path: [0, 2], offset: 16 };

  await vi.waitFor(() => {
    expect(source.read.selection()).toMatchObject({
      anchor: stored,
      focus: stored,
    });
  });

  const shown = document.getSelection()!;

  expect([shown.anchorNode, shown.anchorOffset]).toEqual([
    text,
    text.data.length,
  ]);
});

test('a selection a handler places during a read-only click reaches the DOM', () => {
  const { root, text, view } = mountFocusAwarePreview(struck());

  firefoxPress(text, text.data.length, () => {
    setShownSelectionAsView(view, SelectionApi.text(caret([0, 0], 4)));
  });
  act(() => {
    root.focus();
  });

  const shown = document.getSelection()!;
  const placed = { path: [0, 0], offset: 4 };

  expect([shown.anchorNode, shown.anchorOffset]).toEqual([text, 4]);
  expect(view.read.selection()).toMatchObject({
    anchor: placed,
    focus: placed,
  });
});

test("a press on a control after a cancelled read-only touch, whose handler selects text, leaves the next render to show the model's caret", () => {
  const source = sourceOf([p('one'), p('two')]);
  const { rerender, root, view } = mountFocusAwarePreview(source, {
    control: true,
  });

  act(() => {
    root.focus();
  });
  select(view, caret([1, 0], 1));
  const [first, second] = strings(root);
  const control = root.querySelector('button')!;

  act(() => {
    fireEvent.pointerDown(first.parentElement!);
    fireEvent.pointerCancel(first.parentElement!);
  });
  act(() => {
    fireEvent.pointerDown(control);
    document.getSelection()!.setBaseAndExtent(first, 0, first, 3);
  });
  act(() => {
    rerender();
  });

  expect([view.read.selection(), ...shown()]).toEqual([
    caret([1, 0], 1),
    second,
    1,
  ]);
});

const runFrames = (frames: FrameRequestCallback[]) => {
  act(() => {
    frames.splice(0).forEach((frame) => frame(performance.now()));
  });
};

const holdFrames = () => {
  const frames: FrameRequestCallback[] = [];
  const raf = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => frames.push(callback));

  onTestFinished(() => raf.mockRestore());

  return () => {
    raf.mockRestore();
    runFrames(frames);
  };
};

const largeDocument = () =>
  sourceOf(Array.from({ length: 1000 }, () => p('abcdef')));

const shiftArrowDown = (root: HTMLElement) => {
  const runtime = findMountedEditableDOMRuntime(root)!;

  act(() => {
    applyEditableCaretMovement({
      domPhaseScheduler: runtime.domPhaseScheduler,
      editor: runtime.editor,
      event: {
        altKey: false,
        ctrlKey: false,
        currentTarget: root,
        key: 'ArrowDown',
        metaKey: false,
        nativeEvent: {
          altKey: false,
          ctrlKey: false,
          key: 'ArrowDown',
          metaKey: false,
          shiftKey: true,
        },
        preventDefault: vi.fn(),
        shiftKey: true,
      } as never,
      selection: runtime.editor.read((state) => state.selection())!,
      viewportRuntime: {
        mountedTopLevelRanges: [{ endIndex: 0, startIndex: 0 }],
        type: 'virtualized',
      },
    });
  });
};

const mountBesideReadOnly = (source: ReturnType<typeof sourceOf>) => {
  let view!: View;
  let other!: View;
  const Capture = ({ into }: { into: (view: View) => void }) => {
    into(useEditorContext());

    return null;
  };
  const mounted = render(
    <>
      <EditorRoot editor={source}>
        <Capture into={(captured) => (view = captured)} />
        <Editable aria-label="editor" />
      </EditorRoot>
      <EditorRoot editor={sourceOf([p('second editor')])} readOnly>
        <Capture into={(captured) => (other = captured)} />
        <Editable aria-label="other" />
      </EditorRoot>
    </>
  );

  return {
    other,
    otherRoot: mounted.getByLabelText('other'),
    root: mounted.getByLabelText('editor'),
    view,
  };
};

test("a click's caret in another read-only editor survives the deferred clear of a large-document Shift+ArrowDown", async () => {
  const releaseFrames = holdFrames();
  const { other, otherRoot, root, view } = mountBesideReadOnly(largeDocument());

  select(view, caret([0, 0], 1));
  shiftArrowDown(root);
  const extended = view.read.selection();

  await act(async () => {});
  const [pressed] = strings(otherRoot);

  firefoxPress(pressed, 2);
  act(() => {
    otherRoot.focus();
  });
  releaseFrames();
  const ranges = document.getSelection()!.rangeCount;

  act(() => {
    fireEvent.mouseUp(pressed.parentElement!);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  expect([extended?.focus, ranges, other.read.selection(), shown()]).toEqual([
    { path: [1, 0], offset: 1 },
    1,
    expect.objectContaining(caret([0, 0], 2)),
    [pressed, 2],
  ]);
});

const BODY_ROOT = 'details-slot:body';

const contentRootSchema = defineEditorSchema('schema:test-press-content-root', {
  elements: {
    'details-content': {
      content: schema.content.open(),
      contentRoots: { body: schema.content.not(schema.content.text()) },
    },
  },
  id: 'test-press-content-root',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const mountDetails = ({
  bodyReadOnly = false,
  readOnly,
}: {
  bodyReadOnly?: boolean;
  readOnly: boolean;
}) => {
  const source = createEditor({
    initialValue: {
      children: [
        p('above'),
        {
          type: 'details-content',
          childRoots: { body: BODY_ROOT },
          children: [{ text: '' }],
        },
        p('after'),
      ],
      roots: { [BODY_ROOT]: [p('body text')] },
    } as never,
    plugins: [contentRootSchema],
  });
  let view!: View;
  let body!: ReturnType<typeof useRootEditor>;
  const Capture = () => {
    view = useEditorContext();
    body = useRootEditor(BODY_ROOT);

    return null;
  };
  const mounted = render(
    <EditorRoot editor={source} readOnly={readOnly}>
      <Capture />
      <Editable
        aria-label="main"
        renderElement={(props) =>
          props.element.type === 'details-content' ? (
            <section {...props.attributes}>
              {props.slots.contentRoot('body', {
                ariaLabel: 'body',
                readOnly: bodyReadOnly,
              })}
            </section>
          ) : (
            <p {...props.attributes}>{props.children}</p>
          )
        }
      />
    </EditorRoot>
  );
  const main = mounted.getByLabelText('main');

  return { body, bodyRoot: mounted.getByLabelText('body'), main, view };
};

const bodyCaret = (offset: number) => {
  const point = { offset, path: [0, 0], root: BODY_ROOT };

  return { anchor: point, focus: point };
};

const shiftArrowRightIntoBody = async ({
  main,
  view,
}: ReturnType<typeof mountDetails>) => {
  act(() => {
    main.focus();
  });
  select(view, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 5 },
  });
  act(() => {
    fireEvent.keyDown(main, { key: 'ArrowRight', shiftKey: true });
  });
  const projected = readPliteViewSelection(
    findMountedEditableDOMRuntime(main)!.editor
  );

  await act(async () => {});

  return projected;
};

test("a read-only click's caret inside a content root survives the main root's deferred clear of a Shift+ArrowRight into it", async () => {
  const releaseFrames = holdFrames();
  const details = mountDetails({ readOnly: true });
  const projected = await shiftArrowRightIntoBody(details);
  const [pressed] = strings(details.bodyRoot);

  firefoxPress(pressed, 1);
  act(() => {
    details.bodyRoot.focus();
  });
  releaseFrames();
  const ranges = document.getSelection()!.rangeCount;

  act(() => {
    fireEvent.mouseUp(pressed.parentElement!);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  expect([
    projected !== null,
    pressed.data,
    ranges,
    details.body.read.selection(),
  ]).toEqual([true, 'b', 1, expect.objectContaining(bodyCaret(1))]);
});

test("a click's caret in a read-only content root survives the focus retry of an ArrowRight into it", async () => {
  const releaseFrames = holdFrames();
  const details = mountDetails({ bodyReadOnly: true, readOnly: false });

  act(() => {
    details.main.focus();
  });
  select(details.view, caret([0, 0], 5));
  act(() => {
    fireEvent.keyDown(details.main, { key: 'ArrowRight' });
  });
  await act(async () => {});
  const entered = details.body.read.selection();
  const [pressed] = strings(details.bodyRoot);

  firefoxPress(pressed, 2);
  releaseFrames();
  act(() => {
    fireEvent.mouseUp(pressed.parentElement!);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  expect([entered, details.body.read.selection(), shown()]).toEqual([
    expect.objectContaining(bodyCaret(0)),
    expect.objectContaining(bodyCaret(2)),
    [pressed, 2],
  ]);
});

test('a click inside a read-only selection keeps its caret through a render on click', async () => {
  const source = sourceOf([p('one'), p('two'), p('three')]);
  const { rerender, root, view } = mountFocusAwarePreview(source);

  act(() => {
    root.focus();
  });
  select(view, {
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 3 },
  });
  const second = strings(root)[1];

  act(() => {
    fireEvent.pointerDown(second.parentElement!);
    fireEvent.mouseDown(second.parentElement!);
  });
  act(() => {
    fireEvent.mouseUp(second.parentElement!);
  });
  act(() => {
    document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
    fireEvent.click(second.parentElement!);
    rerender();
  });
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });

  const at = { path: [1, 0], offset: 1 };

  await vi.waitFor(() => {
    expect(view.read.selection()).toMatchObject({ anchor: at, focus: at });
  });
});

test("a preview switch during a read-only press that hides the pressed block shows the model's caret", async () => {
  const source = withInsertedBlock();
  const { root, view } = mountFocusAwarePreview(source);

  act(() => {
    root.focus();
  });
  select(view, caret([2, 0], 1));
  const inserted = strings(root)[0];

  act(() => {
    fireEvent.pointerDown(inserted.parentElement!);
    fireEvent.mouseDown(inserted.parentElement!);
    document.getSelection()!.setBaseAndExtent(inserted, 2, inserted, 2);
  });
  act(() => {
    findMountedEditableDOMRuntime(root)!.editor.api.authored.setView({
      preview: 'accepted',
    });
  });
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
  await act(
    () =>
      new Promise((resolve) => {
        setTimeout(resolve, 150);
      })
  );

  const shown = document.getSelection()!;

  expect([view.read.selection(), shown.anchorNode, shown.anchorOffset]).toEqual(
    [caret([1, 0], 1), strings(root)[1], 1]
  );
});

const caret = (path: number[], offset: number) => {
  const point = { offset, path };

  return { anchor: point, focus: point };
};

const lines = () => sourceOf([p('one'), p('two'), p('three')]);

const shown = () => {
  const selection = document.getSelection()!;

  return [selection.anchorNode, selection.anchorOffset];
};

const settle = () =>
  act(
    () =>
      new Promise((resolve) => {
        setTimeout(resolve, 150);
      })
  );

const mountFocusAware = (
  source: ReturnType<typeof lines>,
  container?: HTMLElement
) => {
  let view!: View;
  const FocusAware = () => {
    const focused = useEditorFocused();

    view = useEditorContext();

    return <Editable aria-label="preview" data-focused={focused} />;
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
      <FocusAware />
    </EditorRoot>,
    container ? { container } : undefined
  );
  const root = (container ?? mounted.container).querySelector<HTMLElement>(
    '[aria-label="preview"]'
  )!;

  return { root, view };
};

const FocusLeaf = ({ attributes, children, path }: RenderLeafProps) => {
  const focused = useEditorFocused();

  useClaimEditableDOMCommit();

  return focused && path?.[0] === 0 ? (
    <strong {...attributes}>{children}</strong>
  ) : (
    <span {...attributes}>{children}</span>
  );
};

const renderFocusLeaf = (props: RenderLeafProps) => <FocusLeaf {...props} />;

test("a click's caret survives its focus render after the read-only editor was hidden and shown during an earlier press", async () => {
  const source = lines();
  let view!: View;
  let setMode!: (mode: 'hidden' | 'visible') => void;
  const Capture = () => {
    view = useEditorContext();

    return null;
  };
  const Host = () => {
    const [mode, set] = useState<'hidden' | 'visible'>('visible');

    setMode = set;

    return (
      <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
        <Capture />
        <Activity mode={mode}>
          <Editable aria-label="preview" renderLeaf={renderFocusLeaf} />
        </Activity>
      </EditorRoot>
    );
  };
  const mounted = render(<Host />);
  const root = mounted.getByLabelText('preview');

  select(view, caret([1, 0], 1));
  const [, second, third] = strings(root);

  document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
  firefoxPress(third, 2);
  act(() => {
    setMode('hidden');
  });
  act(() => {
    setMode('visible');
  });
  await settle();
  select(view, caret([1, 0], 1));
  const [clicked, again] = strings(root);

  document.getSelection()!.setBaseAndExtent(again, 1, again, 1);
  firefoxPress(clicked, 2);
  act(() => {
    root.focus();
  });
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  const at = { path: [0, 0], offset: 2 };

  expect([view.read.selection(), shown()]).toEqual([
    expect.objectContaining({ anchor: at, focus: at }),
    [strings(root)[0], 2],
  ]);
});

const FocusElement = ({ attributes, children }: RenderElementProps) => {
  const focused = useEditorFocused();

  useClaimEditableDOMCommit();

  return focused ? (
    <div {...attributes}>{children}</div>
  ) : (
    <p {...attributes}>{children}</p>
  );
};

const renderFocusElement = (props: RenderElementProps) => (
  <FocusElement {...props} />
);

test("a click's caret survives an element that changes its tag on focus", async () => {
  const source = lines();
  let view!: View;
  const Capture = () => {
    view = useEditorContext();

    return null;
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
      <Capture />
      <Editable
        aria-label="preview"
        renderElement={renderFocusElement}
        renderLeaf={({ attributes, children }) => (
          <span {...attributes}>{children}</span>
        )}
      />
    </EditorRoot>
  );
  const root = mounted.getByLabelText('preview');

  select(view, caret([1, 0], 1));
  firefoxPress(strings(root)[0], 2);
  act(() => {
    root.focus();
  });
  expect(root.querySelector('div')).not.toBeNull();
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });

  const at = { path: [0, 0], offset: 2 };

  await vi.waitFor(() => {
    expect(view.read.selection()).toMatchObject({ anchor: at, focus: at });
  });
  expect(shown()).toEqual([strings(root)[0], 2]);
});

const KeyedInner = ({ attributes, children }: RenderElementProps) => {
  const focused = useEditorFocused();

  return (
    <p {...attributes}>
      <span key={focused ? 'focused' : 'blurred'}>{children}</span>
    </p>
  );
};

const renderKeyedInner = (props: RenderElementProps) => (
  <KeyedInner {...props} />
);

test("a click's caret survives an element whose inner wrapper remounts on focus", async () => {
  const source = sourceOf([p('one'), p('two')]);
  let view!: View;
  const Capture = () => {
    view = useEditorContext();

    return null;
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
      <Capture />
      <Editable aria-label="preview" renderElement={renderKeyedInner} />
    </EditorRoot>
  );
  const root = mounted.getByLabelText('preview');

  select(view, caret([1, 0], 1));
  const [clicked, second] = strings(root);

  document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
  firefoxPress(clicked, 2);
  act(() => {
    root.focus();
  });
  const replaced = strings(root)[0] !== clicked;

  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  const at = { path: [0, 0], offset: 2 };

  expect([replaced, view.read.selection(), shown()]).toEqual([
    true,
    expect.objectContaining({ anchor: at, focus: at }),
    [strings(root)[0], 2],
  ]);
});

const mountWithMouseUp = (
  source: ReturnType<typeof lines>,
  onMouseUp: (view: View, rerender: () => void) => void
) => {
  let view!: View;
  const View = () => {
    const [renders, setRenders] = useState(0);

    view = useEditorContext();

    return (
      <Editable
        aria-label="preview"
        data-renders={renders}
        onMouseUp={(event) => {
          event.preventDefault();
          onMouseUp(view, () => setRenders((count) => count + 1));

          return true;
        }}
      />
    );
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
      <View />
    </EditorRoot>
  );

  return { root: mounted.getByLabelText('preview'), view: () => view };
};

test('a read-only click a mouseup handler takes without placing keeps its caret through the render it schedules', async () => {
  const source = lines();
  const { root, view } = mountWithMouseUp(source, (_current, rerender) => {
    rerender();
  });

  act(() => {
    root.focus();
  });
  select(view(), caret([0, 0], 1));
  const third = strings(root)[2];

  firefoxPress(third, 2);
  act(() => {
    fireEvent.mouseUp(third.parentElement!);
  });
  await settle();
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  expect([view().read.selection(), ...shown()]).toEqual([
    caret([2, 0], 2),
    strings(root)[2],
    2,
  ]);
});

test("a click's caret in a read-only view inside a non-editable wrapper survives the focus render", async () => {
  const wrapper = document.createElement('div');

  wrapper.setAttribute('contenteditable', 'false');
  document.body.append(wrapper);
  try {
    const source = lines();
    const { root, view } = mountFocusAware(source, wrapper);

    select(view, caret([1, 0], 1));
    const [clicked, second] = strings(root);

    document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
    firefoxPress(clicked, 2);
    act(() => {
      root.focus();
    });
    act(() => {
      document.dispatchEvent(new Event('selectionchange'));
    });

    const at = { path: [0, 0], offset: 2 };

    await vi.waitFor(() => {
      expect(view.read.selection()).toMatchObject({ anchor: at, focus: at });
    });
  } finally {
    wrapper.remove();
  }
});

const mountPlain = (source: ReturnType<typeof lines>) => {
  let view!: View;
  const Capture = () => {
    view = useEditorContext();

    return null;
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview: 'proposed' }} readOnly>
      <Capture />
      <Editable aria-label="preview" />
    </EditorRoot>
  );

  return { root: mounted.getByLabelText('preview'), view: () => view };
};

test("after a read-only click on the model's caret, a blur that clears the page's selection leaves a later focus to show the caret", async () => {
  const { root, view } = mountPlain(lines());
  const input = document.createElement('input');

  document.body.append(input);
  try {
    act(() => {
      root.focus();
    });
    select(view(), caret([1, 0], 1));
    const second = strings(root)[1];

    document.getSelection()!.setBaseAndExtent(second, 1, second, 1);
    firefoxPress(second, 1);
    act(() => {
      fireEvent.mouseUp(second.parentElement!);
      fireEvent.click(second.parentElement!);
    });
    act(() => {
      input.focus();
      document.getSelection()!.removeAllRanges();
    });
    act(() => {
      root.focus();
    });
    await settle();

    expect([view().read.selection(), ...shown()]).toEqual([
      caret([1, 0], 1),
      strings(root)[1],
      1,
    ]);
  } finally {
    input.remove();
  }
});

test("a read-only click in Chromium's order, focus before placement, never imports the page's older range", async () => {
  const source = lines();
  const { root, view } = mountFocusAware(source);
  const [first, , third] = strings(root);

  document.getSelection()!.setBaseAndExtent(first, 1, first, 1);
  select(view, caret([1, 0], 1));
  document.getSelection()!.setBaseAndExtent(first, 1, first, 1);
  act(() => {
    fireEvent.pointerDown(third.parentElement!);
    fireEvent.mouseDown(third.parentElement!);
    root.focus();
  });
  expect(view.read.selection()).toEqual(caret([1, 0], 1));
  act(() => {
    document.getSelection()!.setBaseAndExtent(third, 2, third, 2);
    fireEvent.mouseUp(third.parentElement!);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await vi.waitFor(() => {
    expect(view.read.selection()).toMatchObject(caret([2, 0], 2));
  });
});

test("a typing repair still retrying when the view turns read-only leaves a later click's caret alone", async () => {
  const source = lines();
  let view!: View;
  let setReadOnly!: (readOnly: boolean) => void;
  const Toggle = () => {
    const [readOnly, set] = useState(false);

    setReadOnly = set;

    return (
      <EditorRoot
        editor={source}
        authored={{ preview: 'proposed' }}
        readOnly={readOnly}
      >
        <Capture />
      </EditorRoot>
    );
  };
  const Capture = () => {
    view = useEditorContext();

    return <Editable aria-label="preview" />;
  };
  const mounted = render(<Toggle />);
  const root = mounted.getByLabelText('preview');

  act(() => {
    root.focus();
  });
  select(view, caret([0, 0], 3));
  const [first] = strings(root);

  act(() => {
    first.data = 'onx';
    findMountedEditableDOMRuntime(
      root
    )!.domRepairQueueRef.current!.repairCaretAfterModelTextInsert();
  });
  act(() => {
    setReadOnly(true);
  });
  firefoxPress(strings(root)[2], 2);
  act(() => {
    first.data = 'one';
  });
  await settle();
  expect(shown()).toEqual([strings(root)[2], 2]);
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
  await vi.waitFor(() => {
    expect(view.read.selection()).toMatchObject(caret([2, 0], 2));
  });
});

test("a typing repair still retrying in another editor leaves a read-only click's caret alone", async () => {
  const { other, otherRoot, root, view } = mountBesideReadOnly(lines());

  act(() => {
    root.focus();
  });
  select(view, caret([0, 0], 3));
  const [first] = strings(root);

  act(() => {
    first.data = 'onx';
    findMountedEditableDOMRuntime(
      root
    )!.domRepairQueueRef.current!.repairCaretAfterModelTextInsert();
  });
  const [pressed] = strings(otherRoot);

  firefoxPress(pressed, 2);
  act(() => {
    otherRoot.focus();
  });
  act(() => {
    first.data = 'one';
  });
  await settle();
  act(() => {
    fireEvent.mouseUp(pressed.parentElement!);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();

  expect([shown(), other.read.selection()]).toEqual([
    [pressed, 2],
    expect.objectContaining(caret([0, 0], 2)),
  ]);
});

const markLines = (everyLine: boolean) => {
  let marked = false;
  let refresh!: Parameters<
    NonNullable<DecorationSource['observe']>
  >[0]['refresh'];
  const sources: Array<DecorationSource<ReturnType<typeof lines>>> = [
    {
      id: 'mark-lines',
      observe: (input) => {
        ({ refresh } = input);

        return () => {};
      },
      read: ({ entry: [node, path] }) =>
        marked && TextApi.isText(node) && (everyLine || path[0] === 0)
          ? [
              {
                attributes: { 'data-marked': 'true' },
                key: `mark-${path.join('.')}`,
                range: {
                  anchor: { path, offset: 0 },
                  focus: { path, offset: node.text.length },
                },
              },
            ]
          : [],
    },
  ];

  return {
    mark: () => {
      marked = true;
      refresh({ nodeKeys: 'all' });
    },
    sources,
  };
};

test("a click's caret survives a decoration refresh that re-renders the clicked leaf before its selectionchange", async () => {
  const source = lines();
  let view!: View;
  const { mark, sources } = markLines(false);
  const Capture = () => {
    view = useEditorContext();

    return null;
  };
  const mounted = render(
    <EditorRoot
      editor={source}
      authored={{ preview: 'proposed' }}
      decorations={sources}
      readOnly
    >
      <Capture />
      <ImperativeTextFlowContext.Provider value={false}>
        <Editable aria-label="preview" />
      </ImperativeTextFlowContext.Provider>
    </EditorRoot>
  );
  const root = mounted.getByLabelText('preview');

  select(view, caret([1, 0], 1));
  const [clicked] = strings(root);

  firefoxPress(clicked, 2);
  act(() => {
    mark();
  });
  expect(root.querySelector('[data-marked]')).not.toBeNull();
  act(() => {
    root.focus();
    document.dispatchEvent(new Event('selectionchange'));
  });

  const at = { path: [0, 0], offset: 2 };

  await vi.waitFor(() => {
    expect(view.read.selection()).toMatchObject({ anchor: at, focus: at });
  });
  expect(shown()).toEqual([strings(root)[0], 2]);
});

test("a decoration refresh after a read-only click on a model caret the page did not show repairs the caret Plite's text flow moves", async () => {
  const source = lines();
  let view!: View;
  const { mark, sources } = markLines(true);
  const Capture = () => {
    view = useEditorContext();

    return null;
  };
  const mounted = render(
    <EditorRoot
      editor={source}
      authored={{ preview: 'proposed' }}
      decorations={sources}
      readOnly
    >
      <Capture />
      <ImperativeTextFlowContext.Provider value>
        <Editable aria-label="preview" />
      </ImperativeTextFlowContext.Provider>
    </EditorRoot>
  );
  const root = mounted.getByLabelText('preview');
  const [clicked] = strings(root);

  act(() => {
    root.focus();
  });
  select(view, caret([0, 0], 1));
  document.getSelection()!.removeAllRanges();
  firefoxPress(clicked, 1);
  act(() => {
    document.dispatchEvent(new Event('selectionchange'));
  });
  await settle();
  act(() => {
    fireEvent.mouseUp(clicked.parentElement!);
  });
  act(() => {
    mark();
  });
  await settle();

  expect([
    strings(root)[0] !== clicked,
    view.read.selection(),
    shown(),
  ]).toEqual([true, caret([0, 0], 1), [strings(root)[0], 1]]);
});
