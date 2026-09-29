import { act, fireEvent, render } from '@testing-library/react';

import { createEditor, Editable, EditorRoot } from '../../src/react';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';

describe.each([
  { initialText: 'abcdef', insertionOffset: 2, committedText: '你好' },
  {
    initialText: 'Rich Content Editing',
    insertionOffset: 16,
    committedText: '点点滴滴',
  },
])('IME in $initialText', ({ initialText, insertionOffset, committedText }) => {
  test.each([false, true])(
    'preserves the native IME caret through input and commit with rerender=%s',
    async (rerender) => {
      const editor = createEditor({
        initialValue: [
          { type: 'paragraph', children: [{ text: initialText }] },
        ],
      });
      const surface = () => (
        <EditorRoot editor={editor}>
          <Editable scrollSelectionIntoView={() => {}} />
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
            anchor: { path: [0, 0], offset: insertionOffset },
            focus: { path: [0, 0], offset: insertionOffset },
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
          expect(root.textContent).toBe(`${before}${committedText}${after}`);
          fireEvent.compositionEnd(root, { data: committedText });
          await new Promise((resolve) => {
            setTimeout(resolve, 100);
          });
        });
        expect(runtime.inputController.state.isComposing).toBe(false);
        expect(root.textContent).toBe(`${before}${committedText}${after}`);
        expect(selection.focusNode).toBe(compositionTextNode);
        expect(selection.focusOffset).toBe(
          insertionOffset + committedText.length
        );
      } finally {
        rendered.unmount();
      }
    }
  );
});
