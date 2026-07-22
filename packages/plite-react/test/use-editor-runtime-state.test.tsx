import { act, render, renderHook, waitFor } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import type { Element } from '@platejs/plite';

import { createReactEditor, useEditorRuntimeState } from '../src';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('useEditorRuntimeState', () => {
  test('subscribes to an explicit editor outside a Plite provider', async () => {
    const editor = createReactEditor({
      initialValue: [paragraph('body')],
    });

    const { result } = renderHook(() =>
      useEditorRuntimeState(editor, (state) => {
        const [block] = state.children();
        const [textNode] = block.children;

        return 'text' in textNode ? textNode.text : '';
      })
    );

    expect(result.current).toBe('body');

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    await waitFor(() => {
      expect(result.current).toBe('body!');
    });
  });

  test('filters commits with shouldUpdate', async () => {
    const editor = createReactEditor({
      initialValue: [paragraph('body')],
    });
    const selector = vi.fn((state) => state.selection());
    const shouldUpdate = vi.fn((change) => Boolean(change?.selectionChanged));

    const { result } = renderHook(() =>
      useEditorRuntimeState(editor, selector, { shouldUpdate })
    );

    expect(result.current).toBe(null);
    const initialSelectorCalls = selector.mock.calls.length;

    await act(async () => {
      editor.update((tx) => {
        tx.text.insert('!', { at: { path: [0, 0], offset: 4 } });
      });
    });

    expect(result.current).toBe(null);
    expect(selector).toHaveBeenCalledTimes(initialSelectorCalls);
    expect(shouldUpdate).toHaveBeenCalled();

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [0, 0], offset: 2 });
      });
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    expect(selector).toHaveBeenCalledTimes(initialSelectorCalls + 1);
  });

  test('catches up when a changed filter misses a child layout commit', () => {
    const editor = createReactEditor({
      initialValue: [paragraph('body')],
    });

    const CommitFromChildLayout = ({ text }: { text?: string }) => {
      useLayoutEffect(() => {
        if (!text) return;

        editor.update((tx) => {
          tx.text.insert(text, { at: { path: [0, 0], offset: 4 } });
        });
      }, [text]);

      return null;
    };
    const Probe = ({ allow, insert }: { allow: boolean; insert?: string }) => {
      const text = useEditorRuntimeState(
        editor,
        (state) => {
          const [block] = state.children();
          const [textNode] = block.children;

          return 'text' in textNode ? textNode.text : '';
        },
        { shouldUpdate: () => allow }
      );

      return (
        <>
          <span data-testid="runtime-filtered-text">{text}</span>
          <CommitFromChildLayout text={insert} />
        </>
      );
    };
    const rendered = render(<Probe allow={false} />);

    rendered.rerender(<Probe allow insert="!" />);

    expect(rendered.getByTestId('runtime-filtered-text')).toHaveTextContent(
      'body!'
    );
  });
});
