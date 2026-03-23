/** @jsx jsxt */

import { KEYS, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

describe('BaseDatePlugin', () => {
  it('configure date as void inline element', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
    } as any);

    const plugin = editor.getPlugin({ key: KEYS.date });

    expect(plugin.node.isVoid).toBe(true);
    expect(plugin.node.isInline).toBe(true);
    expect(plugin.node.isElement).toBe(true);
  });

  it('mark date elements as not selectable', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
    } as any);

    const plugin = editor.getPlugin({ key: KEYS.date });

    expect(plugin.node.isSelectable).toBe(false);
  });

  it('provide insert.date transform', () => {
    const editor = createSlateEditor({
      plugins: [BaseDatePlugin],
    } as any);

    expect((editor.tf as any).insert.date).toBeDefined();
    expect(typeof (editor.tf as any).insert.date).toBe('function');
  });
});
