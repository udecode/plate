import { createEditor, defineBasePlugin } from '../../core';
import { createPluginStateSnapshot, snapshotPluginState } from './pluginStore';

describe('plugin state snapshot ownership', () => {
  it('retains an owned immutable subtree across unrelated store updates', () => {
    const plugin = defineBasePlugin('snapshot', {
      initialState: { count: 0, draft: { children: [{ text: 'settled' }] } },
    });
    const editor = createEditor({ plugins: [plugin] });
    const { store } = editor.plugin(plugin);
    const draft = store.get('draft');
    store.set({ count: 1 });
    expect(store.get('draft')).toBe(draft);
    store.set((state) => {
      state.count = 2;
    });
    expect(store.get('draft')).toBe(draft);
  });
  it('does not retain or trust caller-owned mutable or shallow frozen data', () => {
    const child = { text: 'before' };
    const input = Object.freeze({ children: [child] });
    const first = snapshotPluginState(input);
    child.text = 'after';
    const second = snapshotPluginState(input);
    expect(first.children[0].text).toBe('before');
    expect(second.children[0].text).toBe('after');
    expect(first.children[0]).not.toBe(child);
    expect(Object.isFrozen(first.children[0])).toBe(true);
  });
  it('preserves shared settled nodes from an owner-local graph through publication', () => {
    const own = createPluginStateSnapshot();
    const settled = { text: 'settled' };
    const first = own({ children: [settled, { text: 'tail' }] });
    const second = own({ children: [settled, { text: 'tail continued' }] });
    expect(second.children[0]).toBe(first.children[0]);
    const published = snapshotPluginState({ operation: second });
    expect(published.operation).toBe(second);
    expect(published.operation.children[0]).toBe(first.children[0]);
  });
});
