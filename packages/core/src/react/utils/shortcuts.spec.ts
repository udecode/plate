import { createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';

describe('extend method with shortcuts', () => {
  it('should add new shortcuts to a plugin', () => {
    const testPlugin = createPlatePlugin({
      key: 'testPlugin',
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+b',
        },
      },
    }).extend({
      shortcuts: {
        italic: {
          handler: () => {},
          keys: 'mod+i',
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
          handler: originalCallback,
          keys: 'mod+b',
        },
      },
    }).extend({
      shortcuts: {
        bold: {
          handler: newCallback,
          keys: 'mod+b',
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
          handler: originalCallback,
          keys: 'mod+b',
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
          handler: () => {},
          keys: 'mod+b',
        },
        italic: {
          handler: () => {},
          keys: 'mod+i',
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
          handler: () => {},
          keys: 'mod+b',
        },
      },
    }).extend((ctx) => ({
      shortcuts: {
        bold: null,
        italic: {
          handler: () => {},
          keys: ctx.plugin.shortcuts.bold?.keys ?? [],
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
          handler: () => {},
          keys: 'mod+b',
          priority: 50,
        },
        italic: {
          handler: () => {},
          keys: 'mod+i',
          priority: 50,
        },
      },
    });

    const highPriorityHotkeyPlugin = createPlatePlugin({
      key: 'highPriorityHotkey',
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+shift+b',
          priority: 150,
        },
      },
    });

    const defaultPriorityHotkeyPlugin = createPlatePlugin({
      key: 'defaultPriorityHotkey',
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+alt+b',
          // No priority specified, should default to 100
        },
        italic: {
          handler: () => {},
          keys: 'mod+alt+i',
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
          handler: () => {},
          keys: 'mod+b',
          priority: 100,
        },
      },
    });

    const secondPlugin = createPlatePlugin({
      key: 'secondPlugin',
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+shift+b',
          priority: 100,
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
          handler: () => {},
          keys: 'mod+b',
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [lowPriorityPlugin],
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+alt+b',
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
          handler: () => {},
          keys: 'mod+b',
          priority: 200, // High priority shortcut in a low priority plugin
        },
      },
    });

    const highPriorityPlugin = createPlatePlugin({
      key: 'highPriority',
      priority: 150,
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+shift+b',
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
          handler: () => {},
          keys: 'mod+i',
          // No specific priority, should use plugin priority
        },
      },
    });

    const highPriorityPlugin = createPlatePlugin({
      key: 'highPriority',
      priority: 150,
      shortcuts: {
        italic: {
          handler: () => {},
          keys: 'mod+shift+i',
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
          handler: () => {},
          keys: 'mod+b',
          priority: 150,
        },
        italic: {
          handler: () => {},
          keys: 'mod+i',
          // No specific priority, should use plugin priority
        },
        underline: {
          handler: () => {},
          keys: 'mod+u',
          priority: 50,
        },
      },
    });

    const overridePlugin = createPlatePlugin({
      key: 'overridePlugin',
      priority: 120,
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+shift+b',
          // No specific priority, should use plugin priority
        },
        italic: {
          handler: () => {},
          keys: 'mod+shift+i',
          priority: 200,
        },
        underline: {
          handler: () => {},
          keys: 'mod+shift+u',
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
          handler: () => {},
          keys: 'mod+b',
        },
        italic: {
          handler: () => {},
          keys: 'mod+i',
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
      shortcuts: {
        bold: {
          handler: () => {},
          keys: 'mod+shift+b',
          priority: 50, // Lower than testPlugin
        },
        italic: {
          handler: () => {},
          keys: 'mod+shift+i',
          priority: 200, // Higher than testPlugin
        },
        underline: {
          handler: () => {},
          keys: 'mod+u',
          // No specific priority, should use root plugin priority (highest)
        },
      },
    });

    expect(editor.shortcuts.bold?.keys).toBe('mod+b');
    expect(editor.shortcuts.italic?.keys).toBe('mod+shift+i');
    expect(editor.shortcuts.underline?.keys).toBe('mod+u');
  });
});
