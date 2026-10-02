import { act, fireEvent, render } from '@testing-library/react';
import { TextApi } from 'plitejs';

import {
  createEditor,
  type DecorationSource,
  Editable,
  EditorRoot,
} from '../../src/react';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { getNodeKey } from '../../src/react/editable/runtime-editor-api';

test('applies a cancelled host decoration while the next host composes', async () => {
  const editor = createEditor({
    initialValue: ['abcdef', 'second'].map((text) => ({
      type: 'paragraph',
      children: [{ text }],
    })),
  });
  const versions = [0, 0];
  let refresh: Parameters<
    NonNullable<DecorationSource['observe']>
  >[0]['refresh'];
  const source: DecorationSource<typeof editor> = {
    id: 'ime-host-handoff',
    observe: ({ refresh: nextRefresh }) => {
      refresh = nextRefresh;
      return () => {};
    },
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node) && versions[path[0]] > 0
        ? [
            {
              attributes: { 'data-ime-decoration': String(versions[path[0]]) },
              key: `host:${path[0]}`,
              range: {
                anchor: { path, offset: 1 },
                focus: { path, offset: 3 },
              },
            },
          ]
        : [],
  };
  const rendered = render(
    <EditorRoot decorations={[source]} editor={editor}>
      <Editable
        renderLeaf={(props) => (
          <span {...props.attributes}>{props.children}</span>
        )}
        scrollSelectionIntoView={() => {}}
      />
    </EditorRoot>
  );
  const root = rendered.container.querySelector<HTMLElement>('[data-editor]')!;
  Object.defineProperty(root, 'isContentEditable', { value: true });
  const runtime = findMountedEditableDOMRuntime(root)!;
  const selection = document.getSelection()!;
  const firstHost = () => root.querySelector('[data-editor-path="0,0"]')!;
  const secondHost = () => root.querySelector('[data-editor-path="1,0"]')!;
  try {
    await act(async () => {
      root.focus();
      runtime.editor.update((tx) =>
        tx.selection.set({
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        })
      );
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });
    await act(async () => {
      fireEvent.compositionStart(root);
      versions[0] = 1;
      refresh!({ nodeKeys: [getNodeKey(editor, [0, 0])!] });
    });
    expect(firstHost().querySelector('[data-ime-decoration]')).toBeNull();

    const secondText = secondHost().querySelector('[data-editor-string]')!
      .firstChild as Text;
    await act(async () => {
      fireEvent.compositionEnd(root, { data: '' });
      runtime.editor.update((tx) =>
        tx.selection.set({
          anchor: { path: [1, 0], offset: 2 },
          focus: { path: [1, 0], offset: 2 },
        })
      );
      selection.setBaseAndExtent(secondText, 2, secondText, 2);
      fireEvent.compositionStart(root);
      expect(
        runtime.inputController.domInputRuntime.compositionEpoch?.owner
      ).toBe('native');
      versions[1] = 2;
      refresh!({ nodeKeys: [getNodeKey(editor, [1, 0])!] });
    });
    await act(async () => {
      secondText.insertData(2, 'hao');
      selection.setBaseAndExtent(secondText, 5, secondText, 5);
      fireEvent.input(root, {
        inputType: 'insertCompositionText',
        data: 'hao',
        isComposing: true,
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });
    expect(
      firstHost().querySelector('[data-ime-decoration="1"]')?.textContent
    ).toBe('bc');
    expect(secondText.isConnected).toBe(true);
    expect(selection.focusNode).toBe(secondText);
    expect(selection.focusOffset).toBe(5);
    expect(secondHost().querySelector('[data-ime-decoration]')).toBeNull();

    await act(async () => {
      secondText.replaceData(2, 3, '好');
      selection.setBaseAndExtent(secondText, 3, secondText, 3);
      fireEvent.compositionEnd(root, { data: '好' });
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });
    expect(
      secondHost().querySelector('[data-ime-decoration="2"]')?.textContent
    ).toBe('e好');
    expect(editor.read((state) => state.text.string([0]))).toBe('abcdef');
    expect(editor.read((state) => state.text.string([1]))).toBe('se好cond');
  } finally {
    rendered.unmount();
  }
});

describe.each(['retained', 'custom-leaf'])(
  '%s composition decorations',
  (rendering) => {
    test.each([
      'commit',
      'cancel',
      'consecutive-commit',
      'consecutive-cancel',
      'unmount',
    ] as const)(
      'defers composing-block decoration boundaries until %s while other blocks update',
      async (completion) => {
        const editor = createEditor({
          initialValue: ['abcdef', 'second'].map((text) => ({
            type: 'paragraph',
            children: [{ text }],
          })),
        });
        let version = 0;
        let refresh:
          | Parameters<NonNullable<DecorationSource['observe']>>[0]['refresh']
          | undefined;
        const source: DecorationSource<typeof editor> = {
          id: 'ime-decoration-boundaries',
          observe: ({ refresh: nextRefresh }) => {
            refresh = nextRefresh;
            return () => {};
          },
          read: ({ entry: [node, path] }) =>
            TextApi.isText(node) && version > 0
              ? [
                  {
                    attributes: { 'data-ime-decoration': String(version) },
                    key: `ime:${path[0]}`,
                    range: {
                      anchor: { path, offset: version },
                      focus: {
                        path,
                        offset: Math.min(version + 2, node.text.length),
                      },
                    },
                  },
                ]
              : [],
        };
        const rendered = render(
          <EditorRoot decorations={[source]} editor={editor}>
            <Editable
              scrollSelectionIntoView={() => {}}
              renderLeaf={
                rendering === 'custom-leaf'
                  ? (props) => (
                      <span {...props.attributes}>{props.children}</span>
                    )
                  : undefined
              }
            />
          </EditorRoot>
        );
        const root =
          rendered.container.querySelector<HTMLElement>('[data-editor]')!;
        Object.defineProperty(root, 'isContentEditable', { value: true });
        const runtime = findMountedEditableDOMRuntime(root)!;
        const selection = document.getSelection()!;
        try {
          await act(async () => {
            root.focus();
            runtime.editor.update((tx) =>
              tx.selection.set({
                anchor: { path: [0, 0], offset: 2 },
                focus: { path: [0, 0], offset: 2 },
              })
            );
            await new Promise((resolve) => {
              setTimeout(resolve, 100);
            });
          });
          const text = selection.focusNode;
          if (!(text instanceof Text)) {
            throw new Error('Expected a native text caret');
          }
          const firstFlow = text.parentElement!.closest(
            '[data-editor-node="text"]'
          )!;
          const getSecondFlow = () =>
            root.querySelector(
              '[data-editor-node="text"][data-editor-path="1,0"]'
            )!;
          await act(async () => {
            fireEvent.compositionStart(root);
            fireEvent.compositionUpdate(root, { data: 'ni' });
            root.dispatchEvent(
              new InputEvent('beforeinput', {
                bubbles: true,
                inputType: 'insertCompositionText',
                data: 'ni',
                isComposing: true,
              })
            );
            expect(selection.focusNode).toBe(text);
            text.insertData(2, 'ni');
            selection.setBaseAndExtent(text, 4, text, 4);
            fireEvent.input(root, {
              inputType: 'insertCompositionText',
              data: 'ni',
              isComposing: true,
            });
          });
          for (const nextVersion of [1, 2]) {
            await act(async () => {
              version = nextVersion;
              refresh!({ nodeKeys: 'all' });
              if (version === 1) {
                runtime.editor.update((tx) =>
                  tx.text.insert('!', { at: { path: [1, 0], offset: 6 } })
                );
              }
              await new Promise((resolve) => {
                setTimeout(resolve, 40);
              });
            });
            expect(getSecondFlow().textContent).toBe('second!');
            expect(
              getSecondFlow().querySelector(
                `[data-ime-decoration="${version}"]`
              )
            ).not.toBeNull();
            expect(text.isConnected).toBe(true);
            expect(text.data).toBe('abnicdef');
            expect(selection.focusNode).toBe(text);
            expect(selection.focusOffset).toBe(4);
            expect(firstFlow.querySelector('[data-ime-decoration]')).toBeNull();
          }
          if (completion === 'unmount') {
            rendered.unmount();
            const detachedHTML = firstFlow.outerHTML;
            await act(async () => {
              await new Promise((resolve) => {
                setTimeout(resolve, 100);
              });
            });
            expect(text.isConnected).toBe(false);
            expect(firstFlow.outerHTML).toBe(detachedHTML);
            return;
          }
          const consecutive = completion.startsWith('consecutive');
          const committedText =
            completion === 'commit' || completion === 'consecutive-commit'
              ? '你'
              : '';
          const nextOffset = 2 + committedText.length;
          let nextText = text;
          let nextNativeOffset = nextOffset;
          await act(async () => {
            text.replaceData(2, 2, committedText);
            const offset = 2 + committedText.length;
            selection.setBaseAndExtent(text, offset, text, offset);
            fireEvent.compositionEnd(root, { data: committedText });
            if (consecutive) {
              fireEvent.compositionStart(root);
              expect(selection.focusNode).toBeInstanceOf(Text);
              const prefix = document.createRange();
              prefix.selectNodeContents(firstFlow);
              prefix.setEnd(selection.focusNode!, selection.focusOffset);
              expect(prefix.toString().length).toBe(nextOffset);
              nextText = selection.focusNode as Text;
              nextNativeOffset = selection.focusOffset;
              fireEvent.compositionUpdate(root, { data: 'hao' });
              root.dispatchEvent(
                new InputEvent('beforeinput', {
                  bubbles: true,
                  inputType: 'insertCompositionText',
                  data: 'hao',
                  isComposing: true,
                })
              );
              expect(selection.focusNode).toBe(nextText);
              nextText.insertData(nextNativeOffset, 'hao');
              selection.setBaseAndExtent(
                nextText,
                nextNativeOffset + 3,
                nextText,
                nextNativeOffset + 3
              );
              fireEvent.input(root, {
                inputType: 'insertCompositionText',
                data: 'hao',
                isComposing: true,
              });
            }
            await new Promise((resolve) => {
              setTimeout(resolve, 100);
            });
          });
          if (consecutive) {
            expect(runtime.inputController.state.isComposing).toBe(true);
            expect(nextText.isConnected).toBe(true);
            expect(selection.focusNode).toBe(nextText);
            expect(selection.focusOffset).toBe(nextNativeOffset + 3);
            expect(firstFlow.textContent).toBe(`ab${committedText}haocdef`);
            await act(async () => {
              nextText.replaceData(nextNativeOffset, 3, '好');
              selection.setBaseAndExtent(
                nextText,
                nextNativeOffset + 1,
                nextText,
                nextNativeOffset + 1
              );
              fireEvent.compositionEnd(root, { data: '好' });
              await new Promise((resolve) => {
                setTimeout(resolve, 100);
              });
            });
          }
          const inserted = consecutive ? `${committedText}好` : committedText;
          const finalText = `ab${inserted}cdef`;
          expect(runtime.inputController.state.isComposing).toBe(false);
          expect(firstFlow.textContent).toBe(finalText);
          expect(runtime.editor.read((state) => state.text.string([0]))).toBe(
            finalText
          );
          expect(
            runtime.editor.read((state) => state.selection())
          ).toMatchObject({
            anchor: { path: [0, 0], offset: 2 + inserted.length },
            focus: { path: [0, 0], offset: 2 + inserted.length },
          });
          expect(
            firstFlow.querySelector('[data-ime-decoration="2"]')?.textContent
          ).toBe(finalText.slice(2, 4));
          expect(
            firstFlow.querySelector('[data-ime-decoration="1"]')
          ).toBeNull();
          expect(getSecondFlow().textContent).toBe('second!');
        } finally {
          rendered.unmount();
        }
      }
    );
  }
);
