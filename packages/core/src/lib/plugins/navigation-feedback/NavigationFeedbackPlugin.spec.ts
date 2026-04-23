import { createSlateEditor } from '../../editor';
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
    const editor = createSlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
    editor.tf.navigation.flashTarget({
      duration: 25,
      target: {
        path: [0],
        type: 'node',
      },
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
    const editor = createSlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
    editor.tf.navigation.flashTarget({
      target: {
        path: [0],
        type: 'node',
      },
    });
    editor.tf.navigation.flashTarget({
      target: {
        path: [0],
        type: 'node',
      },
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
    const editor = createSlateEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);
    const focusSpy = spyOn(editor.tf, 'focus').mockImplementation(() => {});
    const scrollSpy = spyOn(editor.api, 'scrollIntoView').mockImplementation(
      () => {}
    );
    editor.tf.navigation.navigate({
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

    expect(editor.selection).toEqual({
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
    const editor = createSlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    editor.tf.navigation.flashTarget({
      target: {
        path: [0],
        type: 'node',
      },
    });

    editor.tf.insertNodes({ children: [{ text: 'zero' }], type: 'p' } as any, {
      at: [0],
    });

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
    const editor = createSlateEditor({
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    editor.tf.navigation.flashTarget({
      target: {
        path: [0],
        type: 'node',
      },
    });

    editor.tf.removeNodes({ at: [0] });

    expect(editor.api.navigation.activeTarget()).toBeNull();
    expect(
      editor.getOption(NavigationFeedbackPlugin, 'activeTarget')
    ).toBeNull();
    expect(editor.api.navigation.isTarget([0])).toBe(false);
  });

  it('uses the top-level navigationFeedback option to override duration', () => {
    const editor = createSlateEditor({
      navigationFeedback: { duration: 1200 },
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    expect(editor.getOption(NavigationFeedbackPlugin, 'duration')).toBe(1200);
  });

  it('can disable the navigation feedback plugin from editor options', () => {
    const editor = createSlateEditor({
      navigationFeedback: false,
      value: [{ children: [{ text: 'one' }], type: 'p' }],
    } as any);

    expect(editor.meta.pluginList.map((plugin) => plugin.key)).not.toContain(
      NavigationFeedbackPlugin.key
    );
    expect(editor.api.navigation).toBeUndefined();
    expect(editor.tf.navigation).toBeUndefined();
  });
});
