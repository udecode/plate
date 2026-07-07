/** @jsx jsxt */

import { IndentPlugin } from '@platejs/indent/react';
import { jsxt } from '@platejs/test-utils';
import { KEYS, createSlateEditor } from 'platejs';

import { BaseTogglePlugin } from '../lib';
import { TogglePlugin } from './TogglePlugin';

jsxt;

describe('withToggle', () => {
  const plugins = [
    IndentPlugin.configure({
      inject: {
        targetPlugins: [KEYS.p, KEYS.toggle],
      },
    }),
    TogglePlugin,
  ];

  it('insertBreak in an open toggle creates an indented paragraph inside the toggle', () => {
    const input = (
      <editor>
        <htoggle id="t1">
          Toggle
          <cursor />
        </htoggle>
        <hp>after</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins,
      selection: input.selection,
      value: input.children,
    });

    editor.getApi(BaseTogglePlugin).toggle.toggleIds(['t1'], true);
    editor.tf.insertBreak();

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: '' }],
        indent: 1,
        type: 'p',
      },
      {
        children: [{ text: 'after' }],
        type: 'p',
      },
    ]);
  });

  it('insertBreak in a closed toggle places the new toggle after hidden children', () => {
    const input = (
      <editor>
        <htoggle id="t1">
          Toggle
          <cursor />
        </htoggle>
        <hp id="p1" indent={1}>
          hidden child
        </hp>
        <hp>after</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins,
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'Toggle' }],
        id: 't1',
        type: 'toggle',
      },
      {
        children: [{ text: 'hidden child' }],
        id: 'p1',
        indent: 1,
        type: 'p',
      },
      {
        children: [{ text: '' }],
        type: 'toggle',
      },
      {
        children: [{ text: 'after' }],
        type: 'p',
      },
    ]);
  });
});
