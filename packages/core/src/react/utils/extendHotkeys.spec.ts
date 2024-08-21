import { createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';

describe('extend method with hotkeys', () => {
  it('should add new hotkeys to a plugin', () => {
    const testPlugin = createPlatePlugin({
      hotkeys: {
        bold: {
          callback: () => {},
          hotkey: 'mod+b',
        },
      },
      key: 'testPlugin',
    }).extend({
      hotkeys: {
        italic: {
          callback: () => {},
          hotkey: 'mod+i',
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.hotkeys.bold).toBeDefined();
    expect(editor.hotkeys.italic).toBeDefined();
  });

  it('should override existing hotkeys in a plugin', () => {
    const originalCallback = jest.fn();
    const newCallback = jest.fn();

    const testPlugin = createPlatePlugin({
      hotkeys: {
        bold: {
          callback: originalCallback,
          hotkey: 'mod+b',
        },
      },
      key: 'testPlugin',
    }).extend({
      hotkeys: {
        bold: {
          callback: newCallback,
          hotkey: 'mod+b',
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    editor.hotkeys.bold?.callback({
      editor,
      event: {} as KeyboardEvent,
      handler: {} as any,
    } as any);

    expect(originalCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalled();
  });

  it('should allow removing hotkeys by setting them to null', () => {
    const testPlugin = createPlatePlugin({
      hotkeys: {
        bold: {
          callback: () => {},
          hotkey: 'mod+b',
        },
        italic: {
          callback: () => {},
          hotkey: 'mod+i',
        },
      },
      key: 'testPlugin',
    }).extend({
      hotkeys: {
        bold: null,
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.hotkeys.bold).toBeUndefined();
    expect(editor.hotkeys.italic).toBeDefined();
  });

  it('should allow extending hotkeys using a function', () => {
    const testPlugin = createPlatePlugin({
      hotkeys: {
        bold: {
          callback: () => {},
          hotkey: 'mod+b',
        },
      },
      key: 'testPlugin',
    }).extend((ctx) => ({
      hotkeys: {
        bold: null,
        italic: {
          callback: () => {},
          hotkey: ctx.plugin.hotkeys.bold?.hotkey ?? [],
        },
      },
    }));

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(editor.hotkeys.bold).toBeUndefined();
    expect(editor.hotkeys.italic?.hotkey).toBe('mod+b');
  });

  it('should maintain plugin priority when resolving conflicting hotkeys', () => {
    const lowPriorityPlugin = createPlatePlugin({
      hotkeys: {
        bold: {
          callback: () => {},
          hotkey: 'mod+b',
        },
      },
      key: 'lowPriority',
      priority: 50,
    });

    const highPriorityPlugin = createPlatePlugin({
      hotkeys: {
        bold: {
          callback: () => {},
          hotkey: 'mod+b',
        },
      },
      key: 'highPriority',
      priority: 100,
    });

    const editor = createPlateEditor({
      plugins: [lowPriorityPlugin, highPriorityPlugin],
    });

    expect(editor.hotkeys.bold?.hotkey).toBe(
      highPriorityPlugin.hotkeys.bold?.hotkey
    );
  });
});
