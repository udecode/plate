import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';

import type { TabbableEntry } from './types';

import { BaseTabbablePlugin } from './BaseTabbablePlugin';

const BaseVoidPlugin = createBasePlugin({
  key: 'void',
  node: {
    element: {
      content: schema.content.text({ default: 'text', max: 1, min: 1 }),
      groups: ['block'],
      void: 'block',
    },
  },
});

describe('BaseTabbablePlugin', () => {
  it('ships the default options and delegates tabbable checks to the schema', () => {
    const editor = createBaseEditor({
      plugins: [BaseVoidPlugin, BaseTabbablePlugin],
      value: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'a' }], type: 'p' },
      ],
    });
    const plugin = editor.getPlugin(BaseTabbablePlugin);
    const voidEntry = editor.read.nodes.get([0]);
    const textEntry = editor.read.nodes.get([1, 0]);
    const { insertTabbableEntries, isTabbable, query } = plugin.options;

    if (
      !voidEntry ||
      !textEntry ||
      !insertTabbableEntries ||
      !isTabbable ||
      !query
    ) {
      throw new Error('Missing required tabbable fixture state');
    }

    const createEntry = (slateNode: TabbableEntry['slateNode']) => ({
      domNode: document.createElement('div'),
      path: [0],
      slateNode,
    });
    const event = new KeyboardEvent('keydown', { key: 'Tab' });

    expect(plugin.options.globalEventListener).toBe(false);
    expect(insertTabbableEntries(event)).toEqual([]);
    expect(query(event)).toBe(true);
    expect(isTabbable(createEntry(voidEntry[0]))).toBe(true);
    expect(isTabbable(createEntry(textEntry[0]))).toBe(false);
  });
});
