import { act, fireEvent, render } from '@testing-library/react';
import { useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { defineEditorSchema, schema } from '../../src';
import { createEditor, Editable, EditorRoot } from '../../src/react';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { replace as editorReplace } from '../../src/testing';

const inlineSchema = defineEditorSchema('schema:ime-inline', {
  elements: {
    image: { void: 'block' },
    mention: { void: 'inline' },
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  id: 'ime-inline',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

describe.each([
  {
    rendering: 'retained',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '你好',
  },
  {
    rendering: 'retained',
    initialText: 'Rich Content Editing',
    insertionOffset: 16,
    committedText: '点点滴滴',
  },
  {
    rendering: 'before-link',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '你好',
  },
  {
    rendering: 'inside-link',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '你好',
  },
  {
    rendering: 'after-link',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '你好',
  },
  {
    rendering: 'custom-leaf',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '你好',
  },
  {
    rendering: 'custom-text',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '你好',
  },
  {
    rendering: 'before-link',
    initialText: 'abcdef',
    insertionOffset: 2,
    committedText: '',
  },
])(
  'IME in $rendering: $initialText',
  ({ rendering, initialText, insertionOffset, committedText }) => {
    test.each([false, true])(
      'preserves the native IME caret through input and commit with rerender=%s',
      async (rerender) => {
        const editor = createEditor();
        editor.install(inlineSchema);
        const mixed = rendering.endsWith('-link');
        const path =
          rendering === 'inside-link'
            ? [0, 1, 0]
            : rendering === 'after-link'
              ? [0, 2]
              : [0, 0];
        const prefix =
          rendering === 'inside-link'
            ? 'before '
            : rendering === 'after-link'
              ? 'before React'
              : '';
        const suffix =
          rendering === 'inside-link'
            ? ' after'
            : rendering === 'before-link'
              ? 'React after'
              : '';
        editorReplace(editor, {
          children: [
            {
              type: 'paragraph',
              children: mixed
                ? [
                    {
                      text:
                        rendering === 'before-link' ? initialText : 'before ',
                    },
                    {
                      type: 'link',
                      children: [
                        {
                          text:
                            rendering === 'inside-link' ? initialText : 'React',
                        },
                      ],
                    },
                    {
                      text: rendering === 'after-link' ? initialText : ' after',
                    },
                  ]
                : [{ text: initialText }],
            },
          ],
          selection: null,
        });
        const surface = () => (
          <EditorRoot editor={editor}>
            <Editable
              scrollSelectionIntoView={() => {}}
              renderLeaf={
                rendering === 'custom-leaf'
                  ? (props) => (
                      <span {...props.attributes}>{props.children}</span>
                    )
                  : undefined
              }
              renderText={
                rendering === 'custom-text'
                  ? (props) => (
                      <span {...props.attributes}>{props.children}</span>
                    )
                  : undefined
              }
            />
          </EditorRoot>
        );
        const rendered = render(surface());
        const root =
          rendered.container.querySelector<HTMLElement>('[data-editor]')!;
        Object.defineProperty(root, 'isContentEditable', { value: true });
        const runtime = findMountedEditableDOMRuntime(root)!;
        const selection = document.getSelection()!;
        await act(async () => {
          root.focus();
          runtime.editor.update((tx) =>
            tx.selection.set({
              anchor: { path, offset: insertionOffset },
              focus: { path, offset: insertionOffset },
            })
          );
        });
        await act(async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 100);
          });
        });
        try {
          expect(selection.focusOffset).toBe(insertionOffset);
          const compositionTextNode = selection.focusNode;
          if (!(compositionTextNode instanceof Text)) {
            throw new Error('Expected a native text caret');
          }
          const before = initialText.slice(0, insertionOffset);
          const after = initialText.slice(insertionOffset);
          let previousPreeditLength = 0;
          await act(async () => {
            fireEvent.compositionStart(root);
            await new Promise((resolve) => {
              setTimeout(resolve, 40);
            });
          });
          expect(runtime.inputController.state.isComposing).toBe(true);
          expect({
            originalTextConnected: compositionTextNode?.isConnected,
            sameTextNode: selection.focusNode === compositionTextNode,
            offset: selection.focusOffset,
          }).toEqual({
            originalTextConnected: true,
            sameTextNode: true,
            offset: insertionOffset,
          });
          for (const [preedit, offset] of [
            ['n', 1],
            ['ni', 2],
            ['nihao', 5],
            ['nihao', 2],
          ] as const) {
            await act(async () => {
              fireEvent.compositionUpdate(root, { data: preedit });
              root.dispatchEvent(
                new InputEvent('beforeinput', {
                  bubbles: true,
                  inputType: 'insertCompositionText',
                  data: preedit,
                  isComposing: true,
                })
              );
              expect(selection.focusNode).toBe(compositionTextNode);
              compositionTextNode.replaceData(
                insertionOffset,
                previousPreeditLength,
                preedit
              );
              previousPreeditLength = preedit.length;
              selection.setBaseAndExtent(
                compositionTextNode,
                insertionOffset + offset,
                compositionTextNode,
                insertionOffset + offset
              );
              fireEvent.input(root, {
                inputType: 'insertCompositionText',
                data: preedit,
                isComposing: true,
              });
              if (rerender) rendered.rerender(surface());
              await new Promise((resolve) => {
                setTimeout(resolve, 40);
              });
            });
            expect(selection.focusNode).toBe(compositionTextNode);
            expect(selection.focusOffset).toBe(insertionOffset + offset);
            expect(selection.focusNode?.textContent).toBe(
              `${before}${preedit}${after}`
            );
          }
          await act(async () => {
            compositionTextNode.replaceData(
              insertionOffset,
              previousPreeditLength,
              committedText
            );
            selection.setBaseAndExtent(
              compositionTextNode,
              insertionOffset + committedText.length,
              compositionTextNode,
              insertionOffset + committedText.length
            );
            expect(root.textContent).toBe(
              `${prefix}${before}${committedText}${after}${suffix}`
            );
            fireEvent.compositionEnd(root, { data: committedText });
            await new Promise((resolve) => {
              setTimeout(resolve, 100);
            });
          });
          expect(runtime.inputController.state.isComposing).toBe(false);
          expect(root.textContent).toBe(
            `${prefix}${before}${committedText}${after}${suffix}`
          );
          if (rendering === 'retained' || rendering === 'inside-link') {
            expect(selection.focusNode).toBe(compositionTextNode);
          }
          expect(selection.focusOffset).toBe(
            insertionOffset + committedText.length
          );
          expect(editor.read((state) => state.selection())).toMatchObject({
            anchor: { path, offset: insertionOffset + committedText.length },
            focus: { path, offset: insertionOffset + committedText.length },
          });
        } finally {
          rendered.unmount();
        }
      }
    );
  }
);

test.each([
  'empty',
  'empty-host',
  'empty-leaf',
  'spacer-before-inline',
  'inline-void',
  'block-void',
  'noneditable',
] as const)(
  'picks composition ownership at a %s text boundary',
  async (kind) => {
    const editor = createEditor();
    editor.install(inlineSchema);
    const path = kind === 'inline-void' ? [0, 1, 0] : [0, 0];
    editorReplace(editor, {
      children: [
        {
          type: kind === 'block-void' ? 'image' : 'paragraph',
          children:
            kind === 'inline-void' || kind === 'spacer-before-inline'
              ? [
                  { text: kind === 'inline-void' ? 'before' : '' },
                  { type: 'mention', children: [{ text: '' }] },
                  { text: 'after' },
                ]
              : [{ text: kind === 'noneditable' ? 'locked' : '' }],
        },
      ],
      selection: null,
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable scrollSelectionIntoView={() => {}} />
      </EditorRoot>
    );
    const root =
      rendered.container.querySelector<HTMLElement>('[data-editor]')!;
    Object.defineProperty(root, 'isContentEditable', { value: true });
    const runtime = findMountedEditableDOMRuntime(root)!;
    try {
      await act(async () => {
        root.focus();
        editor.update((tx) =>
          tx.selection.set({
            anchor: { path, offset: 0 },
            focus: { path, offset: 0 },
          })
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
      const host = root.querySelector(
        `[data-editor-node="text"][data-editor-path="${path.join(',')}"]`
      )!;
      const text =
        kind === 'empty-host'
          ? host
          : kind === 'empty-leaf'
            ? host.firstElementChild
            : (document
                .createTreeWalker(host, NodeFilter.SHOW_TEXT)
                .nextNode() ?? host.querySelector('[data-editor-zero-width]'));
      if (!text) throw new Error('Expected a native text boundary');
      if (kind === 'noneditable') host.setAttribute('contenteditable', 'false');
      const selection = document.getSelection()!;
      const offset =
        kind !== 'noneditable' && text instanceof Text ? text.length : 0;
      selection.setBaseAndExtent(text, offset, text, offset);
      await act(async () => {
        fireEvent.compositionStart(root);
      });
      const epoch = runtime.inputController.domInputRuntime.compositionEpoch;
      const emptyLine = kind.startsWith('empty');
      expect(epoch?.owner).toBe(emptyLine ? 'native' : 'model');
      expect(epoch?.anchor).toBe(emptyLine ? host : null);
      await act(async () => {
        fireEvent.compositionEnd(root);
      });
    } finally {
      rendered.unmount();
    }
  }
);

test.each([
  { firstCommit: '你', rendering: 'ordinary' },
  { firstCommit: '', rendering: 'ordinary' },
  { firstCommit: '你', rendering: 'custom-leaf' },
  { firstCommit: '你', rendering: 'custom-text' },
])(
  'keeps consecutive composition beside an inline link with $rendering after $firstCommit',
  async ({ firstCommit, rendering }) => {
    const editor = createEditor();
    editor.install(inlineSchema);
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'abcdef' },
            { type: 'link', children: [{ text: 'React' }] },
            { text: ' tail' },
          ],
        },
      ],
      selection: null,
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable
          scrollSelectionIntoView={() => {}}
          renderLeaf={
            rendering === 'custom-leaf'
              ? (props) => <span {...props.attributes}>{props.children}</span>
              : undefined
          }
          renderText={
            rendering === 'custom-text'
              ? (props) => (
                  <span {...props.attributes} data-model-text={props.text.text}>
                    {props.children}
                  </span>
                )
              : undefined
          }
        />
      </EditorRoot>
    );
    const root =
      rendered.container.querySelector<HTMLElement>('[data-editor]')!;
    Object.defineProperty(root, 'isContentEditable', { value: true });
    const selection = document.getSelection()!;
    const input = (text: Text, offset: number, count: number, data: string) => {
      fireEvent.compositionUpdate(root, { data });
      root.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          inputType: 'insertCompositionText',
          data,
          isComposing: true,
        })
      );
      text.replaceData(offset, count, data);
      selection.setBaseAndExtent(
        text,
        offset + data.length,
        text,
        offset + data.length
      );
      fireEvent.input(root, {
        inputType: 'insertCompositionText',
        data,
        isComposing: true,
      });
    };
    try {
      await act(async () => {
        root.focus();
        editor.update((tx) =>
          tx.selection.set({
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          })
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
      let nextText: Text;
      const nextOffset = 2 + firstCommit.length;
      await act(async () => {
        const text = selection.focusNode;
        if (!(text instanceof Text)) throw new Error('Expected native text');
        fireEvent.compositionStart(root);
        input(text, 2, 0, 'ni');
        input(text, 2, 2, firstCommit);
        fireEvent.compositionEnd(root, { data: firstCommit });
        fireEvent.compositionStart(root);
        const anchor = selection.focusNode;
        if (!(anchor instanceof Text)) throw new Error('Expected native text');
        nextText = anchor;
        expect(selection.focusOffset).toBe(nextOffset);
        input(nextText, nextOffset, 0, 'hao');
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
      expect(selection.focusNode).toBe(nextText!);
      expect(selection.focusOffset).toBe(nextOffset + 3);
      expect(root.textContent).toBe(`ab${firstCommit}haocdefReact tail`);
      await act(async () => {
        input(nextText!, nextOffset, 3, '好');
        fireEvent.compositionEnd(root, { data: '好' });
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
      expect(root.textContent).toBe(`ab${firstCommit}好cdefReact tail`);
      if (rendering === 'custom-text') {
        expect(
          root
            .querySelector('[data-editor-path="0,0"]')
            ?.getAttribute('data-model-text')
        ).toBe(`ab${firstCommit}好cdef`);
      }
      expect(selection.focusOffset).toBe(nextOffset + 1);
      expect(editor.read((state) => state.selection())).toMatchObject({
        focus: { path: [0, 0], offset: nextOffset + 1 },
      });
    } finally {
      rendered.unmount();
    }
  }
);

test.each(['top-level', 'nested'] as const)(
  'rebuilds a %s empty line once when a cancelled composition took its text host',
  async (placement) => {
    const editor = createEditor();
    editor.install(inlineSchema);
    const path = placement === 'nested' ? [0, 0, 0] : [0, 0];
    const paragraph = { type: 'paragraph', children: [{ text: '' }] };
    editorReplace(editor, {
      children:
        placement === 'nested'
          ? [{ type: 'quote', children: [paragraph] }]
          : [paragraph],
      selection: null,
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable scrollSelectionIntoView={() => {}} />
      </EditorRoot>
    );
    const root =
      rendered.container.querySelector<HTMLElement>('[data-editor]')!;
    Object.defineProperty(root, 'isContentEditable', { value: true });
    const textHostSelector = `[data-editor-node="text"][data-editor-path="${path.join(',')}"]`;
    const readBlock = () =>
      root.querySelector(
        `[data-editor-node="element"][data-editor-path="${path.slice(0, -1).join(',')}"]`
      )!;
    try {
      await act(async () => {
        root.focus();
        editor.update((tx) =>
          tx.selection.set({
            anchor: { path, offset: 0 },
            focus: { path, offset: 0 },
          })
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
      const host = root.querySelector(textHostSelector)!;
      const block = readBlock();
      const placeholder = host.querySelector('[data-editor-zero-width="n"]')!;
      document.getSelection()!.setBaseAndExtent(placeholder, 0, placeholder, 0);
      await act(async () => {
        fireEvent.compositionStart(root);
      });

      host.remove();
      block.append(document.createElement('br'));
      await act(async () => {
        fireEvent.compositionEnd(root, { data: '' });
      });

      const rebuilt = readBlock();
      expect(rebuilt).not.toBe(block);
      expect(block.isConnected).toBe(false);
      expect(
        rebuilt.querySelector(
          `${textHostSelector} [data-editor-zero-width="n"] br`
        )
      ).not.toBeNull();
      expect(
        [...rebuilt.children].some((child) => child.tagName === 'BR')
      ).toBe(false);

      await act(async () => {
        editor.update((tx) =>
          placement === 'nested'
            ? tx.nodes.set({ tone: 'note' } as never, { at: [0] })
            : tx.nodes.insert(
                { type: 'paragraph', children: [{ text: 'next' }] },
                { at: [1] }
              )
        );
      });
      expect(readBlock()).toBe(rebuilt);
    } finally {
      rendered.unmount();
    }
  }
);

test('rebuilds the empty line when its cancel arrives inside a React commit', async () => {
  const editor = createEditor();
  editor.install(inlineSchema);
  const path = [0, 0];
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: null,
  });
  let cancelInsideCommit = () => {};
  const CancelInsideCommit = () => {
    const [cancel, setCancel] = useState(false);

    cancelInsideCommit = () => setCancel(true);
    useLayoutEffect(() => {
      if (!cancel) return;

      document
        .querySelector('[data-editor]')!
        .dispatchEvent(
          new CompositionEvent('compositionend', { bubbles: true, data: '' })
        );
    }, [cancel]);

    return null;
  };
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const rendered = render(
    <EditorRoot editor={editor}>
      <Editable scrollSelectionIntoView={() => {}} />
      <CancelInsideCommit />
    </EditorRoot>
  );
  const root = rendered.container.querySelector<HTMLElement>('[data-editor]')!;
  Object.defineProperty(root, 'isContentEditable', { value: true });
  const readBlock = () =>
    root.querySelector('[data-editor-node="element"][data-editor-path="0"]')!;
  try {
    await act(async () => {
      root.focus();
      editor.update((tx) =>
        tx.selection.set({
          anchor: { path, offset: 0 },
          focus: { path, offset: 0 },
        })
      );
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });
    const host = root.querySelector('[data-editor-node="text"]')!;
    const block = readBlock();
    const placeholder = host.querySelector('[data-editor-zero-width="n"]')!;
    document.getSelection()!.setBaseAndExtent(placeholder, 0, placeholder, 0);
    await act(async () => {
      fireEvent.compositionStart(root);
    });

    host.remove();
    block.append(document.createElement('br'));
    await act(async () => {
      cancelInsideCommit();
    });

    const rebuilt = readBlock();
    expect(rebuilt).not.toBe(block);
    expect(
      rebuilt.querySelector(
        '[data-editor-node="text"] [data-editor-zero-width="n"] br'
      )
    ).not.toBeNull();
    expect(errors.mock.calls.map(([message]) => String(message))).toEqual([]);
  } finally {
    errors.mockRestore();
    rendered.unmount();
  }
});

test.each([
  {
    name: 'replaces its text',
    onCompositionEnd: (editor: ReturnType<typeof createEditor>) => {
      editor.update((tx) => tx.nodes.remove({ at: [1, 0] }));
    },
  },
  {
    name: 'replaces its text in a sync commit',
    onCompositionEnd: (editor: ReturnType<typeof createEditor>) => {
      flushSync(() => {
        editor.update((tx) => tx.nodes.remove({ at: [1, 0] }));
      });
    },
  },
  { name: 'claims the event', onCompositionEnd: () => true },
])(
  'rebuilds the cancelled line when the end handler $name',
  async ({ onCompositionEnd }) => {
    const editor = createEditor();
    editor.install(inlineSchema);
    editorReplace(editor, {
      children: [
        { type: 'paragraph', children: [{ text: 'above' }] },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      selection: null,
    });
    const rendered = render(
      <EditorRoot editor={editor}>
        <Editable
          onCompositionEnd={() => onCompositionEnd(editor)}
          scrollSelectionIntoView={() => {}}
        />
      </EditorRoot>
    );
    const root =
      rendered.container.querySelector<HTMLElement>('[data-editor]')!;
    Object.defineProperty(root, 'isContentEditable', { value: true });
    const readBlock = (path: string) =>
      root.querySelector(
        `[data-editor-node="element"][data-editor-path="${path}"]`
      )!;
    try {
      await act(async () => {
        root.focus();
        editor.update((tx) =>
          tx.selection.set({
            anchor: { path: [1, 0], offset: 0 },
            focus: { path: [1, 0], offset: 0 },
          })
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      });
      const block = readBlock('1');
      const above = readBlock('0');
      const host = block.querySelector('[data-editor-node="text"]')!;
      const placeholder = host.querySelector('[data-editor-zero-width="n"]')!;
      document.getSelection()!.setBaseAndExtent(placeholder, 0, placeholder, 0);
      await act(async () => {
        fireEvent.compositionStart(root);
      });

      host.remove();
      block.append(document.createElement('br'));
      await act(async () => {
        fireEvent.compositionEnd(root, { data: '' });
      });

      expect(root.isConnected).toBe(true);
      const rebuilt = readBlock('1');
      expect(rebuilt).not.toBe(block);
      expect(
        rebuilt.querySelector(
          '[data-editor-node="text"] [data-editor-zero-width="n"] br'
        )
      ).not.toBeNull();
      expect(readBlock('0')).toBe(above);
    } finally {
      rendered.unmount();
    }
  }
);

test('rebuilds the cancelled line after the end handler moves it', async () => {
  const editor = createEditor();
  editor.install(inlineSchema);
  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'above' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ],
    selection: null,
  });
  const rendered = render(
    <EditorRoot editor={editor}>
      <Editable
        onCompositionEnd={() => {
          editor.update((tx) =>
            tx.nodes.insert(
              { type: 'paragraph', children: [{ text: 'inserted' }] },
              { at: [0] }
            )
          );
        }}
        scrollSelectionIntoView={() => {}}
      />
    </EditorRoot>
  );
  const root = rendered.container.querySelector<HTMLElement>('[data-editor]')!;
  Object.defineProperty(root, 'isContentEditable', { value: true });
  const readBlock = (path: string) =>
    root.querySelector(
      `[data-editor-node="element"][data-editor-path="${path}"]`
    )!;
  try {
    await act(async () => {
      root.focus();
      editor.update((tx) =>
        tx.selection.set({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        })
      );
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });
    const block = readBlock('1');
    const above = readBlock('0');
    const host = block.querySelector('[data-editor-node="text"]')!;
    const placeholder = host.querySelector('[data-editor-zero-width="n"]')!;
    document.getSelection()!.setBaseAndExtent(placeholder, 0, placeholder, 0);
    await act(async () => {
      fireEvent.compositionStart(root);
    });

    host.remove();
    block.append(document.createElement('br'));
    await act(async () => {
      fireEvent.compositionEnd(root, { data: '' });
    });

    const rebuilt = readBlock('2');
    expect(rebuilt).not.toBe(block);
    expect(
      rebuilt.querySelector(
        '[data-editor-node="text"] [data-editor-zero-width="n"] br'
      )
    ).not.toBeNull();
    expect(readBlock('1')).toBe(above);
  } finally {
    rendered.unmount();
  }
});
