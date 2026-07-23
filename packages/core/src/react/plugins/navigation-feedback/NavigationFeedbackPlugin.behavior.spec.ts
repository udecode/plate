import { defineEditorExtension } from '@platejs/plite';

import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { createPlateEditor } from '../../editor';
import { NavigationFeedbackPlugin } from './NavigationFeedbackPlugin';

describe('NavigationFeedbackPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  it('flashTarget sets and clears the active target', () => {
    let timeoutCallback: Function | undefined;
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
      callback: Function
    ) => {
      timeoutCallback = callback;
      return 1;
    }) as typeof setTimeout);
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
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

    expect(editor.api.navigation.activeTarget()).toEqual({
      cycle: 1,
      duration: 25,
      path: [0],
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 25);

    timeoutCallback?.();

    expect(editor.api.navigation.activeTarget()).toBeNull();
  });

  it('a new flash replaces the previous timer and increments the pulse', () => {
    const clearTimeoutSpy = spyOn(
      globalThis,
      'clearTimeout'
    ).mockImplementation(() => {});
    let timeoutId = 0;
    spyOn(globalThis, 'setTimeout').mockImplementation(((_: Function) => {
      timeoutId += 1;
      return timeoutId;
    }) as typeof setTimeout);
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
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
    expect(editor.api.navigation.activeTarget()).toEqual({
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
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    const focusSpy = mock(() => {});
    const scrollSpy = mock(() => {});
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            focus: focusSpy,
            scrollIntoView: scrollSpy,
          },
        },
        name: 'test:scroll-service',
      })
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
    expect(scrollSpy).toHaveBeenCalledWith({
      offset: 1,
      path: [0, 0],
    });
    expect(editor.api.navigation.activeTarget()).toEqual({
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
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });
    let navigated = false;

    editor.update((tx) => {
      tx.nodes.insert({ children: [{ text: 'two' }], type: 'p' }, { at: [1] });
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
    expect(editor.api.navigation.isTarget([1])).toBe(true);
  });

  it('keeps the active target path synced when the target node moves', () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    editor.update((tx) => {
      tx.navigation.flashTarget({
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    editor.update.nodes.insert(
      { children: [{ text: 'zero' }], type: 'p' },
      {
        at: [0],
      }
    );

    expect(editor.api.navigation.activeTarget()).toEqual({
      cycle: 1,
      duration: 1600,
      path: [1],
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(
      editor.plugin(NavigationFeedbackPlugin).getOption('activeTarget')
    ).toMatchObject({
      cycle: 1,
      duration: 1600,
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(
      editor
        .plugin(NavigationFeedbackPlugin)
        .getOption('activeTarget')
        ?.pathAnchor.resolve()
    ).toEqual([1]);
    expect(editor.api.navigation.isTarget([1])).toBe(true);
    expect(editor.api.navigation.isTarget([0])).toBe(false);
  });

  it('clears the active target when the target node is removed', () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
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

    expect(editor.api.navigation.activeTarget()).toBeNull();
    expect(
      editor.plugin(NavigationFeedbackPlugin).getOption('activeTarget')
    ).toBeNull();
    expect(editor.api.navigation.isTarget([0])).toBe(false);
  });

  it('uses the top-level navigationFeedback option to override duration', () => {
    const editor = createPlateEditor({
      navigationFeedback: { duration: 1200 },
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    expect(editor.plugin(NavigationFeedbackPlugin).getOption('duration')).toBe(
      1200
    );
  });

  it('can disable the navigation feedback plugin from editor options', () => {
    const editor = createPlateEditor({
      navigationFeedback: false,
      initialValue: [{ children: [{ text: 'one' }], type: 'p' }],
    });

    expect(
      getPlateRuntime(editor).pluginList.map((plugin) => plugin.key)
    ).not.toContain(NavigationFeedbackPlugin.key);
    expect(editor.api.navigation).toBeUndefined();
  });
});
