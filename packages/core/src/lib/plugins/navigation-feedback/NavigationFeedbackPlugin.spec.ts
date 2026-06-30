import { defineEditorExtension } from '@platejs/plite';

import { createBaseEditor } from '../../editor';
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
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
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

  it('flashTarget marks the resolved DOM element through the typed dom API', () => {
    const setAttributeSpy = mock(() => {});
    const setPropertySpy = mock(() => {});
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            resolveDOMNode: () =>
              ({
                removeAttribute: mock(() => {}),
                setAttribute: setAttributeSpy,
                style: {
                  removeProperty: mock(() => {}),
                  setProperty: setPropertySpy,
                },
              }) as unknown as HTMLElement,
          },
        },
        name: 'test:dom-node-resolution',
      })
    );

    editor.update((tx) => {
      tx.navigation.flashTarget({
        duration: 25,
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    expect(setAttributeSpy).toHaveBeenCalledWith('data-nav-target', 'true');
    expect(setAttributeSpy).toHaveBeenCalledWith(
      'data-nav-highlight',
      'navigated'
    );
    expect(setPropertySpy).toHaveBeenCalledWith(
      '--plate-nav-feedback-duration',
      '25ms'
    );
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
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
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
    const editor = createBaseEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
    const focusSpy = mock(() => {});
    const scrollSpy = mock(() => {});
    editor.extend(
      defineEditorExtension({
        api: {
          dom: {
            focus: focusSpy,
          },
          scrollIntoView: scrollSpy,
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

  it('keeps the active target path synced when the target node moves', () => {
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    editor.update((tx) => {
      tx.navigation.flashTarget({
        target: {
          path: [0],
          type: 'node',
        },
      });
    });

    editor.update.nodes.insert(
      { children: [{ text: 'zero' }], type: 'p' } as any,
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
      editor.getOption(NavigationFeedbackPlugin, 'activeTarget')
    ).toMatchObject({
      cycle: 1,
      duration: 1600,
      pulse: 1,
      type: 'node',
      variant: 'navigated',
    });
    expect(
      editor.getOption(NavigationFeedbackPlugin, 'activeTarget')?.pathRef
        .current
    ).toEqual([1]);
    expect(editor.api.navigation.isTarget([1])).toBe(true);
    expect(editor.api.navigation.isTarget([0])).toBe(false);
  });

  it('clears the active target when the target node is removed', () => {
    const editor = createBaseEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

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
      editor.getOption(NavigationFeedbackPlugin, 'activeTarget')
    ).toBeNull();
    expect(editor.api.navigation.isTarget([0])).toBe(false);
  });

  it('uses the top-level navigationFeedback option to override duration', () => {
    const editor = createBaseEditor({
      navigationFeedback: { duration: 1200 },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    expect(editor.getOption(NavigationFeedbackPlugin, 'duration')).toBe(1200);
  });

  it('can disable the navigation feedback plugin from editor options', () => {
    const editor = createBaseEditor({
      navigationFeedback: false,
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    expect(editor.runtime.pluginList.map((plugin) => plugin.key)).not.toContain(
      NavigationFeedbackPlugin.key
    );
    expect(editor.api.navigation).toBeUndefined();
  });
});
