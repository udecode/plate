/** @jsx jsxt */

import { KEYS } from 'platejs';
import { createPlateEditor } from 'platejs/react';
import { jsxt } from '@platejs/test-utils';

import { BaseDatePlugin } from './BaseDatePlugin';

jsxt;

describe('BaseDatePlugin', () => {
  it('should configure date as void inline element', () => {
    const editor = createPlateEditor({
      plugins: [BaseDatePlugin],
    });

    const plugin = editor.getPlugin({ key: KEYS.date });

    expect(plugin.node.isVoid).toBe(true);
    expect(plugin.node.isInline).toBe(true);
    expect(plugin.node.isElement).toBe(true);
  });

  it('should mark date elements as not selectable', () => {
    const editor = createPlateEditor({
      plugins: [BaseDatePlugin],
    });

    const plugin = editor.getPlugin({ key: KEYS.date });

    expect(plugin.node.isSelectable).toBe(false);
  });

  it('should provide insert.date transform', () => {
    const editor = createPlateEditor({
      plugins: [BaseDatePlugin],
    });

    expect(editor.tf.insert.date).toBeDefined();
    expect(typeof editor.tf.insert.date).toBe('function');
  });
});
