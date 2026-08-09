import type { Shortcuts } from '../plugin';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createPlateEditor } from '../editor';
import { dispatchPlateShortcut } from './dispatchPlateShortcut';

const createEditor = (shortcuts: Shortcuts) => createPlateEditor({ shortcuts });

const dispatch = ({
  activeScopes = [],
  editor,
  event = {},
  phase = 'keydown',
}: {
  activeScopes?: string[];
  editor: ReturnType<typeof createEditor>;
  event?: KeyboardEventInit;
  phase?: 'keydown' | 'keyup';
}) => {
  const keyboardEvent = new KeyboardEvent(phase, {
    bubbles: true,
    cancelable: true,
    ...event,
  });

  dispatchPlateShortcut(
    activeScopes,
    editor,
    keyboardEvent,
    phase,
    getPlateRuntime(editor).shortcutTable
  );

  return keyboardEvent;
};

describe('dispatchPlateShortcut', () => {
  it('dispatches the first handled shortcut in priority order', () => {
    const fallback = mock();
    const specific = mock();
    const editor = createEditor({
      fallback: { handler: fallback, keys: 'ctrl+k' },
      specific: {
        handler: specific,
        keys: 'ctrl+k',
        priority: 100,
      },
    });
    const event = dispatch({
      editor,
      event: { code: 'KeyK', ctrlKey: true, key: 'k' },
    });

    expect(specific).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('falls through when a higher-priority handler declines', () => {
    const fallback = mock();
    const specific = mock(() => false);
    const editor = createEditor({
      fallback: { handler: fallback, keys: 'ctrl+k' },
      specific: {
        handler: specific,
        keys: 'ctrl+k',
        priority: 100,
      },
    });

    dispatch({
      editor,
      event: { code: 'KeyK', ctrlKey: true, key: 'k' },
    });

    expect(specific).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('keeps unhandled shortcuts native', () => {
    const editor = createEditor({
      save: {
        handler: () => false,
        keys: 'ctrl+s',
        preventDefault: true,
      },
    });
    const event = dispatch({
      editor,
      event: { code: 'KeyS', ctrlKey: true, key: 's' },
    });

    expect(event.defaultPrevented).toBe(false);
  });

  it('respects explicit preventDefault policy', () => {
    const editor = createEditor({
      allowBrowser: {
        handler: () => {},
        keys: 'ctrl+a',
        preventDefault: false,
      },
      suppressBrowser: {
        handler: () => {},
        keys: 'ctrl+s',
        preventDefault: true,
      },
    });

    expect(
      dispatch({
        editor,
        event: { code: 'KeyA', ctrlKey: true, key: 'a' },
      }).defaultPrevented
    ).toBe(false);
    expect(
      dispatch({
        editor,
        event: { code: 'KeyS', ctrlKey: true, key: 's' },
      }).defaultPrevented
    ).toBe(true);
  });

  it('passes matched event details to the handler', () => {
    const handler = mock();
    const editor = createEditor({
      save: {
        description: 'Save',
        handler,
        keys: 'ctrl+shift+s',
      },
    });

    dispatch({
      editor,
      event: {
        code: 'KeyS',
        ctrlKey: true,
        key: 's',
        shiftKey: true,
      },
    });

    expect(handler).toHaveBeenCalledWith({
      editor,
      event: expect.any(KeyboardEvent),
      eventDetails: expect.objectContaining({
        ctrl: true,
        description: 'Save',
        keys: ['s'],
        shift: true,
      }),
    });
  });

  it('filters shortcuts through the active scope', () => {
    const handler = mock();
    const editor = createEditor({
      comment: {
        handler,
        keys: 'ctrl+k',
        scopes: ['comments'],
      },
    });
    const event = { code: 'KeyK', ctrlKey: true, key: 'k' };

    dispatch({ activeScopes: ['editing'], editor, event });
    expect(handler).not.toHaveBeenCalled();

    dispatch({ activeScopes: ['comments'], editor, event });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('dispatches keyup-only shortcuts once', () => {
    const handler = mock();
    const editor = createEditor({
      inspect: { handler, keys: 'ctrl+i', keyup: true },
    });
    const event = { code: 'KeyI', ctrlKey: true, key: 'i' };

    dispatch({ editor, event });
    expect(handler).not.toHaveBeenCalled();

    dispatch({ editor, event, phase: 'keyup' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('rejects AltGraph while matching non-Latin physical keys', () => {
    const altGraph = mock();
    const undo = mock();
    const editor = createEditor({
      altGraph: { handler: altGraph, keys: 'ctrl+alt+e' },
      undo: { handler: undo, keys: 'ctrl+z' },
    });
    const altGraphEvent = new KeyboardEvent('keydown', {
      altKey: true,
      bubbles: true,
      cancelable: true,
      code: 'KeyE',
      ctrlKey: true,
      key: '€',
    });

    Object.defineProperty(altGraphEvent, 'getModifierState', {
      value: (key: string) => key === 'AltGraph',
    });
    dispatchPlateShortcut(
      [],
      editor,
      altGraphEvent,
      'keydown',
      getPlateRuntime(editor).shortcutTable
    );
    dispatch({
      editor,
      event: { code: 'KeyZ', ctrlKey: true, key: 'я' },
    });

    expect(altGraph).not.toHaveBeenCalled();
    expect(undo).toHaveBeenCalledTimes(1);
  });
});
