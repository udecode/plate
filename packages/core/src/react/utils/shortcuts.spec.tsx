/** @jsx jsxt */

import { BoldPlugin } from '@platejs/basic-nodes/react';
import { jsxt } from '@platejs/test-utils';

import { createPlateTestEditor } from '../__tests__/createPlateTestEditor';

jsxt;
import { type PlateEditor, createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';

it('use custom hotkey for bold', async () => {
  const input = (
    <editor>
      <hp>
        Hello <anchor />
        world
        <focus />
      </hp>
    </editor>
  ) as any as PlateEditor;

  const output = (
    <editor>
      <hp>
        Hello <htext bold>world</htext>
      </hp>
    </editor>
  ) as any as PlateEditor;

  const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
    plugins: [
      BoldPlugin.configure({
        handlers: {
          onKeyDown: ({ editor, event }) => {
            if (event.key === 'b' && event.ctrlKey) {
              editor.tf.toggleMark('bold');
            }
          },
        },
      }),
    ],
    selection: input.selection,
    value: input.children,
  });

  await triggerKeyboardEvent('mod+b');

  expect(editor.children).toEqual(output.children);
});

describe('extend method with shortcuts', () => {
  it('add new shortcuts to a plugin', () => {
    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: () => {},
        },
      },
    }).extend({
      shortcuts: {
        italic: {
          keys: 'mod+i',
          handler: () => {},
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.meta.shortcuts['testPlugin.bold']).toBeDefined();
    expect(editor.meta.shortcuts['testPlugin.italic']).toBeDefined();
  });

  it('override existing shortcuts in a plugin', () => {
    const originalCallback = mock();
    const newCallback = mock();

    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: originalCallback,
        },
      },
    }).extend({
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: newCallback,
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    editor.meta.shortcuts['testPlugin.bold']?.handler?.({
      editor,
      event: {} as KeyboardEvent,
      handler: {} as any,
    } as any);

    expect(originalCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalled();
  });

  it('configure existing shortcuts in a plugin', () => {
    const originalCallback = mock();
    const _newCallback = mock();

    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: originalCallback,
        },
      },
    }).configure({
      shortcuts: {
        bold: {
          keys: 'mod+bb',
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.meta.shortcuts['testPlugin.bold']?.keys).toBe('mod+bb');
  });

  it('allow removing shortcuts by setting them to null', () => {
    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: () => {},
        },
        italic: {
          keys: 'mod+i',
          handler: () => {},
        },
      },
    }).extend({
      shortcuts: {
        bold: null,
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.meta.shortcuts['testPlugin.bold']).toBeUndefined();
    expect(editor.meta.shortcuts['testPlugin.italic']).toBeDefined();
  });
});
