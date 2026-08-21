import { DOMEditor } from '@platejs/plite-dom/internal';
import { act, render } from '@testing-library/react';
import React from 'react';

import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { Plate } from '../../components/Plate';
import { PlateContent } from '../../components/PlateContent';
import { createPlateEditor } from '../../editor';
import { NavigationFeedbackPlugin } from './NavigationFeedbackPlugin';

const flushMicrotasks = async (count = 3) => {
  for (let index = 0; index < count; index += 1) {
    await Promise.resolve();
  }
};

describe('NavigationFeedbackPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('updates navigation highlight attributes without a selection change', async () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const initialSelection = editor.read.selection();

    const { getByText } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    const getHighlightedElement = () =>
      getByText('one').closest('[data-plite-node="element"]') as HTMLElement;

    expect(
      getHighlightedElement().getAttribute('data-nav-highlight')
    ).toBeNull();

    await act(async () => {
      await Promise.resolve();
    });

    expect(typeof editor.api.react.refreshDecorations).toBe('function');

    act(() => {
      editor.update((tx) => {
        tx.navigation.flashTarget({
          target: {
            path: [0],
            type: 'node',
          },
        });
      });
    });

    expect(editor.read.selection()).toEqual(initialSelection);

    await act(async () => {
      await flushMicrotasks();
    });
    expect(getHighlightedElement().getAttribute('data-nav-highlight')).toBe(
      'navigated'
    );
    expect(getHighlightedElement().getAttribute('data-nav-pulse')).toBe('1');

    act(() => {
      editor.update((tx) => {
        tx.navigation.clear();
      });
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toBeNull();

    await act(async () => {
      await flushMicrotasks();
    });
    expect(
      getHighlightedElement().getAttribute('data-nav-highlight')
    ).toBeNull();
  });

  it('flashTarget sets and clears the active target', () => {
    let timeoutCallback: (() => void) | undefined;
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: () => void
    ) => {
      timeoutCallback = callback;
      return 1;
    }) as typeof setTimeout);
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    editor.update((tx) => {
      tx.navigation.flashTarget({
        duration: 25,
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toEqual({
      cycle: 1,
      duration: 25,
      path: [0],
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 25);

    timeoutCallback?.();

    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toBeNull();
  });

  it('a new flash replaces the previous timer and increments the pulse', () => {
    const clearTimeoutSpy = spyOn(
      globalThis,
      'clearTimeout'
    ).mockImplementation(() => {});
    let timeoutId = 0;
    spyOn(globalThis, 'setTimeout').mockImplementation(((_: () => void) => {
      timeoutId += 1;
      return timeoutId;
    }) as typeof setTimeout);
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    editor.update((tx) => {
      tx.navigation.flashTarget({
        target: {
          path: [0],
          type: 'node',
        },
      });
    });
    editor.update((tx) => {
      tx.navigation.flashTarget({
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    expect(clearTimeoutSpy).toHaveBeenCalledWith(1);
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toEqual({
      cycle: 0,
      duration: 1600,
      path: [0],
      pulse: 2,
      type: 'node',
      variant: 'navigated',
    });
  });

  it('navigate selects, focuses, scrolls, and flashes the target', () => {
    const editor = createPlateEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const focusSpy = spyOn(DOMEditor, 'focus').mockImplementation(() => {});
    const scrollSpy = spyOn(DOMEditor, 'scrollIntoView').mockImplementation(
      () => {}
    );
    editor.update((tx) => {
      tx.navigation.navigate({
        scrollTarget: {
          offset: 1,
          path: [0, 0],
        },
        select: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalledWith(
      editor,
      {
        offset: 1,
        path: [0, 0],
      },
      undefined
    );
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toEqual({
      cycle: 1,
      duration: 1600,
      path: [0],
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
  });

  it('navigates to a node inserted earlier in the same transaction', () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    let navigated = false;

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'two' }], type: 'paragraph' },
        { at: [1] }
      );
      navigated = tx.navigation.navigate({
        focus: false,
        scroll: false,
        select: { offset: 0, path: [1, 0] },
        target: {
          path: [1],
          type: 'node',
        },
      });
    });

    expect(navigated).toBe(true);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
      kind: 'text',
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('isTarget', [1])
    ).toBe(true);
  });

  it('keeps the active target and rendered highlight synced when the target node moves', async () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });
    const { getByText } = render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );
    const getElement = (text: string) =>
      getByText(text).closest('[data-plite-node="element"]') as HTMLElement;

    await act(async () => {
      await flushMicrotasks();
    });
    act(() => {
      editor.update((tx) => {
        tx.navigation.flashTarget({
          target: {
            path: [0],
            type: 'node',
          },
        });
      });
    });
    await act(async () => {
      await flushMicrotasks();
    });

    expect(getElement('one').getAttribute('data-nav-highlight')).toBe(
      'navigated'
    );

    act(() => {
      editor.update.nodes.insert(
        { children: [{ text: 'zero' }], type: 'paragraph' },
        {
          at: [0],
        }
      );
    });
    await act(async () => {
      await flushMicrotasks();
    });

    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toEqual({
      cycle: 1,
      duration: 1600,
      path: [1],
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toMatchObject({
      cycle: 1,
      duration: 1600,
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(editor.plugin(NavigationFeedbackPlugin).store.get()).toEqual({
      duration: 1600,
      target: {
        cycle: 1,
        duration: 1600,
        path: [1],
        pulse: 1,
        type: 'node',
        variant: 'navigated',
      },
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('isTarget', [1])
    ).toBe(true);
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('isTarget', [0])
    ).toBe(false);
    expect(getElement('zero').getAttribute('data-nav-highlight')).toBeNull();
    expect(getElement('one').getAttribute('data-nav-highlight')).toBe(
      'navigated'
    );
  });

  it('clears the active target when the target node is removed', () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });

    editor.update((tx) => {
      tx.navigation.flashTarget({
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    editor.update.nodes.remove({ at: [0] });

    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('activeTarget')
    ).toBeNull();
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('target')
    ).toBeNull();
    expect(
      editor.plugin(NavigationFeedbackPlugin).store.get('isTarget', [0])
    ).toBe(false);
  });

  it('uses the top-level navigationFeedback option to override duration', () => {
    const editor = createPlateEditor({
      navigationFeedback: { duration: 1200 },
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });

    expect(editor.plugin(NavigationFeedbackPlugin).store.get('duration')).toBe(
      1200
    );
  });

  it('can disable the navigation feedback plugin from editor options', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
    });

    expect(
      getPlateRuntime(editor).pluginList.map((plugin) => plugin.name)
    ).not.toContain(NavigationFeedbackPlugin.name);
    expect(editor.plugin(NavigationFeedbackPlugin).installed).toBe(false);
  });
});
