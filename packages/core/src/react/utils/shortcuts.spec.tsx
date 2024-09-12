/** @jsx jsx */

import { BoldPlugin } from '@udecode/plate-basic-marks/react';
import { jsx } from '@udecode/plate-test-utils';

import { createPlateTestEditor } from '../__tests__/createPlateTestEditor';

jsx;
import { type PlateEditor, createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';

it('should use custom hotkey for bold', async () => {
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
    editor: input,
    plugins: [
      BoldPlugin.configure({
        handlers: {
          onKeyDown: ({ editor, event }) => {
            if (event.key === 'b' && event.ctrlKey) {
              editor.tf.toggle.mark({ key: 'bold' });
            }
          },
        },
      }),
    ],
  });

  await triggerKeyboardEvent('mod+b');

  expect(editor.children).toEqual(output.children);
});

describe('extend method with shortcuts', () => {
  it('should add new shortcuts to a plugin', () => {
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

    expect(editor.shortcuts.bold).toBeDefined();
    expect(editor.shortcuts.italic).toBeDefined();
  });

  it('should override existing shortcuts in a plugin', () => {
    const originalCallback = jest.fn();
    const newCallback = jest.fn();

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

    editor.shortcuts.bold?.handler?.({
      editor,
      event: {} as KeyboardEvent,
      handler: {} as any,
    } as any);

    expect(originalCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalled();
  });

  it('should configure existing shortcuts in a plugin', () => {
    const originalCallback = jest.fn();
    const newCallback = jest.fn();

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

    expect(editor.shortcuts.bold?.keys).toBe('mod+bb');
  });

  it('should allow removing shortcuts by setting them to null', () => {
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

    expect(editor.shortcuts.bold).toBeUndefined();
    expect(editor.shortcuts.italic).toBeDefined();
  });

  it('should allow extending shortcuts using a function', () => {
    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: () => {},
        },
      },
    }).extend((ctx) => ({
      shortcuts: {
        bold: null,
        italic: {
          keys: ctx.plugin.shortcuts.bold?.keys ?? [],
          handler: () => {},
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.shortcuts.bold).toBeUndefined();
    expect(editor.shortcuts.italic?.keys).toBe('mod+b');
  });

  it('should respect hotkey priority when resolving conflicting shortcuts', () => {
    const lowPriorityHotkeyPlugin = createPlatePlugin({
      key: 'lowPriorityHotkey',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          priority: 50,
          handler: () => {},
        },
        italic: {
          keys: 'mod+i',
          priority: 50,
          handler: () => {},
        },
      },
    });

    const highPriorityHotkeyPlugin = createPlatePlugin({
      key: 'highPriorityHotkey',
      shortcuts: {
        bold: {
          keys: 'mod+shift+b',
          priority: 150,
          handler: () => {},
        },
      },
    });

    const defaultPriorityHotkeyPlugin = createPlatePlugin({
      key: 'defaultPriorityHotkey',
      shortcuts: {
        bold: {
          keys: 'mod+alt+b',
          handler: () => {},
          // No priority specified, should default to 100
        },
        italic: {
          keys: 'mod+alt+i',
          handler: () => {},
          // No priority specified, should default to 100
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [
        defaultPriorityHotkeyPlugin,
        highPriorityHotkeyPlugin,
        lowPriorityHotkeyPlugin,
      ],
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+shift+b');
    expect(editor.shortcuts.italic?.keys).toBe('mod+alt+i');
  });

  it('should use the last defined hotkey when priorities are equal', () => {
    const firstPlugin = createPlatePlugin({
      key: 'firstPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          priority: 100,
          handler: () => {},
        },
      },
    });

    const secondPlugin = createPlatePlugin({
      key: 'secondPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+shift+b',
          priority: 100,
          handler: () => {},
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [firstPlugin, secondPlugin],
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+shift+b');
  });

  it('should prioritize root plugin shortcuts over other plugins', () => {
    const lowPriorityPlugin = createPlatePlugin({
      key: 'lowPriority',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: () => {},
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [lowPriorityPlugin],
      shortcuts: {
        bold: {
          keys: 'mod+alt+b',
          handler: () => {},
        },
      },
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+alt+b');
  });
});

describe('shortcut priority and plugin interaction', () => {
  it('should prioritize shortcut-specific priority over plugin priority', () => {
    const lowPriorityPlugin = createPlatePlugin({
      key: 'lowPriority',
      priority: 50,
      shortcuts: {
        bold: {
          keys: 'mod+b',
          priority: 200, // High priority shortcut in a low priority plugin
          handler: () => {},
        },
      },
    });

    const highPriorityPlugin = createPlatePlugin({
      key: 'highPriority',
      priority: 150,
      shortcuts: {
        bold: {
          keys: 'mod+shift+b',
          handler: () => {},
          // No specific priority, should use plugin priority
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [lowPriorityPlugin, highPriorityPlugin],
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+b');
  });

  it('should use plugin priority when shortcut priority is not specified', () => {
    const lowPriorityPlugin = createPlatePlugin({
      key: 'lowPriority',
      priority: 50,
      shortcuts: {
        italic: {
          keys: 'mod+i',
          handler: () => {},
          // No specific priority, should use plugin priority
        },
      },
    });

    const highPriorityPlugin = createPlatePlugin({
      key: 'highPriority',
      priority: 150,
      shortcuts: {
        italic: {
          keys: 'mod+shift+i',
          handler: () => {},
          // No specific priority, should use plugin priority
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [lowPriorityPlugin, highPriorityPlugin],
    });

    expect(editor.shortcuts.italic?.keys).toBe('mod+shift+i');
  });

  it('should handle multiple shortcuts with different priorities', () => {
    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      priority: 100,
      shortcuts: {
        bold: {
          keys: 'mod+b',
          priority: 150,
          handler: () => {},
        },
        italic: {
          keys: 'mod+i',
          handler: () => {},
          // No specific priority, should use plugin priority
        },
        underline: {
          keys: 'mod+u',
          priority: 50,
          handler: () => {},
        },
      },
    });

    const overridePlugin = createPlatePlugin({
      key: 'overridePlugin',
      priority: 120,
      shortcuts: {
        bold: {
          keys: 'mod+shift+b',
          handler: () => {},
          // No specific priority, should use plugin priority
        },
        italic: {
          keys: 'mod+shift+i',
          priority: 200,
          handler: () => {},
        },
        underline: {
          keys: 'mod+shift+u',
          handler: () => {},
          // No specific priority, should use plugin priority
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin, overridePlugin],
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+b');
    expect(editor.shortcuts.italic?.keys).toBe('mod+shift+i');
    expect(editor.shortcuts.underline?.keys).toBe('mod+shift+u');
  });

  it('should handle root plugin shortcuts with different priorities', () => {
    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      priority: 100,
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
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
      shortcuts: {
        bold: {
          keys: 'mod+shift+b',
          priority: 50, // Lower than testPlugin
          handler: () => {},
        },
        italic: {
          keys: 'mod+shift+i',
          priority: 200, // Higher than testPlugin
          handler: () => {},
        },
        underline: {
          keys: 'mod+u',
          handler: () => {},
          // No specific priority, should use root plugin priority (highest)
        },
      },
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+b');
    expect(editor.shortcuts.italic?.keys).toBe('mod+shift+i');
    expect(editor.shortcuts.underline?.keys).toBe('mod+u');
  });
});
