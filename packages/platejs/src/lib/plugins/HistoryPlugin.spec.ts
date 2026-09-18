import { createEditor } from '../editor';
import { HistoryPlugin } from './HistoryPlugin';

const value = [{ children: [{ text: '' }], type: 'paragraph' }] as const;

describe('HistoryPlugin', () => {
  it('reads live grouping and retention config through one recorder', () => {
    let now = 0;
    const clock = Object.getOwnPropertyDescriptor(
      globalThis.performance,
      'now'
    );

    Object.defineProperty(globalThis.performance, 'now', {
      configurable: true,
      value: () => now,
    });

    try {
      const ConfiguredHistoryPlugin = HistoryPlugin.configure({
        initialState: { maxDepth: 3, newBatchDelay: 500 },
      });
      const editor = createEditor({
        plugins: [ConfiguredHistoryPlugin],
        initialValue: value,
      });
      const history = editor.plugin(ConfiguredHistoryPlugin);

      editor.update((tx) =>
        tx.text.insert('a', { at: { offset: 0, path: [0, 0] } })
      );
      now = 499;
      editor.update((tx) =>
        tx.text.insert('b', { at: { offset: 1, path: [0, 0] } })
      );

      expect(editor.read.history().undos).toHaveLength(1);

      history.store.set({ newBatchDelay: 0 });
      now = 500;
      editor.update((tx) =>
        tx.text.insert('c', { at: { offset: 2, path: [0, 0] } })
      );

      expect(editor.read.history().undos).toHaveLength(2);

      history.store.set({ maxDepth: 1 });
      expect(editor.read.history().undos).toHaveLength(2);

      now = 501;
      editor.update({ history: 'new-batch' }, (tx) =>
        tx.text.insert('d', { at: { offset: 3, path: [0, 0] } })
      );

      expect(editor.read.history().undos).toHaveLength(1);
      expect(editor.api.history.undo()).toEqual({ status: 'applied' });
      expect(editor.read.text.string([0])).toBe('abc');
    } finally {
      if (clock) {
        Object.defineProperty(globalThis.performance, 'now', clock);
      } else {
        Reflect.deleteProperty(globalThis.performance, 'now');
      }
    }
  });

  it('keeps defaults for omitted state fields', () => {
    const ConfiguredHistoryPlugin = HistoryPlugin.configure({
      initialState: { maxDepth: 2 },
    });
    const editor = createEditor({ plugins: [ConfiguredHistoryPlugin] });

    expect(editor.plugin(ConfiguredHistoryPlugin).store.get()).toEqual({
      maxDepth: 2,
      newBatchDelay: 500,
    });
  });
});
