import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { HotkeysProvider } from '@udecode/react-hotkeys';

import type { Shortcuts } from '../plugin';

import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createPlateEditor } from '../editor';
import * as storesModule from '../stores';
import { EditorShortcutDispatcher } from './EditorShortcutDispatcher';

let useEditorSpy: ReturnType<typeof spyOn>;
const mountedElements: HTMLElement[] = [];

const createEditable = () => {
  const editable = document.createElement('div');

  document.body.append(editable);
  mountedElements.push(editable);

  return editable;
};

const renderDispatcher = ({
  activeScopes,
  editable = createEditable(),
  id,
}: {
  activeScopes?: string[];
  editable?: HTMLDivElement;
  id?: string;
} = {}) => {
  const dispatcher = (
    <EditorShortcutDispatcher editableRef={{ current: editable }} id={id} />
  );

  return {
    editable,
    ...render(
      activeScopes ? (
        <HotkeysProvider initiallyActiveScopes={activeScopes}>
          {dispatcher}
        </HotkeysProvider>
      ) : (
        dispatcher
      )
    ),
  };
};

const publishEditorWithShortcuts = (shortcuts: Shortcuts) =>
  createPlateEditor({ shortcuts });

const dispatchKeyboardEvent = (
  editable: HTMLDivElement,
  type: 'keydown' | 'keyup',
  init: KeyboardEventInit
) => {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...init,
  });

  editable.dispatchEvent(event);

  return event;
};

describe('EditorShortcutDispatcher', () => {
  beforeEach(() => {
    useEditorSpy = spyOn(storesModule, 'useEditor');
  });

  afterEach(() => {
    useEditorSpy.mockRestore();
    mountedElements.splice(0).forEach((element) => {
      element.remove();
    });
  });

  it('installs exactly one keydown listener on each editable root', () => {
    const editor = publishEditorWithShortcuts({
      bold: { handler: () => {}, keys: 'ctrl+b' },
      italic: { handler: () => {}, keys: 'ctrl+i' },
    });
    const editable = createEditable();
    const addEventListener = spyOn(editable, 'addEventListener');
    const removeEventListener = spyOn(editable, 'removeEventListener');

    useEditorSpy.mockReturnValue(editor);
    const { unmount } = renderDispatcher({ editable });

    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'keydown')
    ).toHaveLength(1);
    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'keyup')
    ).toHaveLength(0);

    unmount();

    expect(
      removeEventListener.mock.calls.filter(([type]) => type === 'keydown')
    ).toHaveLength(1);
  });

  it('keeps a 1000-shortcut table behind one root listener', () => {
    const handler = mock();
    const shortcuts = Object.fromEntries(
      Array.from({ length: 1000 }, (_, index) => [
        `shortcut-${index}`,
        {
          handler: index === 999 ? handler : () => {},
          keys: index === 999 ? 'ctrl+x' : `ctrl+f${(index % 12) + 1}`,
        },
      ])
    ) as Shortcuts;
    const editor = publishEditorWithShortcuts(shortcuts);
    const editable = createEditable();
    const addEventListener = spyOn(editable, 'addEventListener');

    useEditorSpy.mockReturnValue(editor);
    renderDispatcher({ editable });
    fireEvent.keyDown(editable, {
      code: 'KeyX',
      ctrlKey: true,
      key: 'x',
    });

    expect(
      getPlateRuntime(editor).shortcutTable.filter(({ id }) =>
        id.includes('.shortcut-')
      )
    ).toHaveLength(1000);
    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'keydown')
    ).toHaveLength(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('dispatches the first handled shortcut in compiled priority order', () => {
    const fallback = mock();
    const specific = mock();
    const editor = publishEditorWithShortcuts({
      fallback: {
        handler: fallback,
        keys: 'ctrl+k',
        priority: 0,
      },
      specific: {
        handler: specific,
        keys: 'ctrl+k',
        priority: 100,
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();
    const event = dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyK',
      ctrlKey: true,
      key: 'k',
    });

    expect(specific).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it('falls through when a higher-priority handler returns false', () => {
    const fallback = mock();
    const specific = mock(() => false);
    const editor = publishEditorWithShortcuts({
      fallback: {
        handler: fallback,
        keys: 'ctrl+k',
        priority: 0,
      },
      specific: {
        handler: specific,
        keys: 'ctrl+k',
        priority: 100,
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();

    dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyK',
      ctrlKey: true,
      key: 'k',
    });

    expect(specific).toHaveBeenCalledTimes(1);
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('never prevents default for an unhandled shortcut', () => {
    const editor = publishEditorWithShortcuts({
      save: {
        handler: () => false,
        keys: 'ctrl+s',
        preventDefault: true,
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();
    const event = dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyS',
      ctrlKey: true,
      key: 's',
    });

    expect(event.defaultPrevented).toBe(false);
  });

  it('respects explicit preventDefault policy for handled shortcuts', () => {
    const allowBrowser = mock();
    const suppressBrowser = mock();
    const editor = publishEditorWithShortcuts({
      allowBrowser: {
        handler: allowBrowser,
        keys: 'ctrl+a',
        preventDefault: false,
      },
      suppressBrowser: {
        handler: suppressBrowser,
        keys: 'ctrl+s',
        preventDefault: true,
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();
    const allowed = dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyA',
      ctrlKey: true,
      key: 'a',
    });
    const suppressed = dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyS',
      ctrlKey: true,
      key: 's',
    });

    expect(allowBrowser).toHaveBeenCalledTimes(1);
    expect(allowed.defaultPrevented).toBe(false);
    expect(suppressBrowser).toHaveBeenCalledTimes(1);
    expect(suppressed.defaultPrevented).toBe(true);
  });

  it('passes matched event details to the owning handler', () => {
    const handler = mock();
    const editor = publishEditorWithShortcuts({
      save: {
        description: 'Save',
        handler,
        keys: 'ctrl+shift+s',
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();

    dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyS',
      ctrlKey: true,
      key: 's',
      shiftKey: true,
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
    const editor = publishEditorWithShortcuts({
      comment: {
        handler,
        keys: 'ctrl+k',
        scopes: ['comments'],
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const inactive = renderDispatcher({ activeScopes: ['editing'] });

    fireEvent.keyDown(inactive.editable, {
      code: 'KeyK',
      ctrlKey: true,
      key: 'k',
    });
    expect(handler).not.toHaveBeenCalled();
    inactive.unmount();

    const active = renderDispatcher({ activeScopes: ['comments'] });

    fireEvent.keyDown(active.editable, {
      code: 'KeyK',
      ctrlKey: true,
      key: 'k',
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('dispatches keyup-only shortcuts once', () => {
    const handler = mock();
    const editor = publishEditorWithShortcuts({
      inspect: {
        handler,
        keys: 'ctrl+i',
        keyup: true,
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();

    fireEvent.keyDown(editable, {
      code: 'KeyI',
      ctrlKey: true,
      key: 'i',
    });
    expect(handler).not.toHaveBeenCalled();

    fireEvent.keyUp(editable, {
      code: 'KeyI',
      ctrlKey: true,
      key: 'i',
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('rejects AltGraph events and supports non-Latin physical fallback', () => {
    const altGraph = mock();
    const undo = mock();
    const editor = publishEditorWithShortcuts({
      altGraph: {
        handler: altGraph,
        keys: 'ctrl+alt+e',
      },
      undo: {
        handler: undo,
        keys: 'ctrl+z',
      },
    });

    useEditorSpy.mockReturnValue(editor);
    const { editable } = renderDispatcher();
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
    editable.dispatchEvent(altGraphEvent);
    dispatchKeyboardEvent(editable, 'keydown', {
      code: 'KeyZ',
      ctrlKey: true,
      key: 'я',
    });

    expect(altGraph).not.toHaveBeenCalled();
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('replaces the dispatcher table atomically with the editor revision', () => {
    const first = mock();
    const second = mock();
    const firstEditor = publishEditorWithShortcuts({
      first: { handler: first, keys: 'ctrl+1' },
    });
    const secondEditor = publishEditorWithShortcuts({
      second: { handler: second, keys: 'ctrl+2' },
    });

    useEditorSpy.mockReturnValue(firstEditor);
    const editable = createEditable();
    const view = renderDispatcher({ editable });

    fireEvent.keyDown(editable, {
      code: 'Digit1',
      ctrlKey: true,
      key: '1',
    });
    useEditorSpy.mockReturnValue(secondEditor);
    view.rerender(
      <EditorShortcutDispatcher
        editableRef={{ current: editable }}
        id="second"
      />
    );
    fireEvent.keyDown(editable, {
      code: 'Digit1',
      ctrlKey: true,
      key: '1',
    });
    fireEvent.keyDown(editable, {
      code: 'Digit2',
      ctrlKey: true,
      key: '2',
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('isolates dispatch across multiple editor roots', () => {
    const first = mock();
    const second = mock();
    const firstEditor = publishEditorWithShortcuts({
      run: { handler: first, keys: 'ctrl+r' },
    });
    const secondEditor = publishEditorWithShortcuts({
      run: { handler: second, keys: 'ctrl+r' },
    });

    useEditorSpy.mockImplementation(({ id }) =>
      id === 'second' ? secondEditor : firstEditor
    );
    const firstRoot = renderDispatcher({ id: 'first' });
    const secondRoot = renderDispatcher({ id: 'second' });

    fireEvent.keyDown(firstRoot.editable, {
      code: 'KeyR',
      ctrlKey: true,
      key: 'r',
    });
    fireEvent.keyDown(secondRoot.editable, {
      code: 'KeyR',
      ctrlKey: true,
      key: 'r',
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
