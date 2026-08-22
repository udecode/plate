import type React from 'react';

import { createPlateEditor } from '../editor';
import { definePlatePlugin } from '../plugin';
import { pipeHandler } from './pipeHandler';

describe('pipeHandler', () => {
  it('types and publishes root prefixless events', () => {
    const keyDown = mock();
    const editor = createPlateEditor({
      on: {
        keyDown: ({ editor: innerEditor, event }) => {
          innerEditor.id satisfies string;
          event.key satisfies string;
          keyDown();
        },
      },
    });

    pipeHandler(editor, { handlerKey: 'onKeyDown' })?.(
      new KeyboardEvent('keydown', { key: 'a' })
    );

    expect(keyDown).toHaveBeenCalledTimes(1);
  });

  it('maps React handler props to prefixless plugin events', () => {
    const pluginHandler = mock();
    const propHandler = mock();
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('events', {
          on: { keyDown: pluginHandler },
        }),
      ],
    });
    const event = {
      isPropagationStopped: () => false,
    } as React.KeyboardEvent;

    pipeHandler(editor, {
      editableProps: { onKeyDown: propHandler },
      handlerKey: 'onKeyDown',
    })?.(event);

    expect(pluginHandler).toHaveBeenCalledTimes(1);
    expect(pluginHandler.mock.calls[0]?.[0].event).toBe(event);
    expect(propHandler).toHaveBeenCalledTimes(1);
  });

  it('maps capture props to their distinct prefixless plugin events', () => {
    const keyDown = mock();
    const keyDownCapture = mock();
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('captureEvents', {
          on: { keyDown, keyDownCapture },
        }),
      ],
    });
    const event = {
      isPropagationStopped: () => false,
    } as React.KeyboardEvent;

    pipeHandler(editor, { handlerKey: 'onKeyDownCapture' })?.(event);

    expect(keyDown).not.toHaveBeenCalled();
    expect(keyDownCapture).toHaveBeenCalledTimes(1);
    expect(keyDownCapture.mock.calls[0]?.[0].event).toBe(event);
  });

  it('maps onDOMBeforeInput without acronym drift', () => {
    const domBeforeInput = mock(() => true);
    const propHandler = mock();
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('events', {
          on: { domBeforeInput },
        }),
      ],
    });
    const event = {
      isPropagationStopped: () => false,
    } as unknown as InputEvent;

    const handled = pipeHandler(editor, {
      editableProps: { onDOMBeforeInput: propHandler },
      handlerKey: 'onDOMBeforeInput',
    })?.(event);

    expect(handled).toBe(true);
    expect(domBeforeInput).toHaveBeenCalledTimes(1);
    expect(propHandler).not.toHaveBeenCalled();
  });

  it('uses editOnly.on in read-only editors', () => {
    const disabled = mock();
    const enabled = mock();
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('disabled', {
          editOnly: true,
          on: { keyDown: disabled },
        }),
        definePlatePlugin('enabled', {
          editOnly: { on: false },
          on: { keyDown: enabled },
        }),
      ],
      readOnly: true,
    });

    pipeHandler(editor, {
      handlerKey: 'onKeyDown',
    })?.({ isPropagationStopped: () => false });

    expect(disabled).not.toHaveBeenCalled();
    expect(enabled).toHaveBeenCalledTimes(1);
  });
});
