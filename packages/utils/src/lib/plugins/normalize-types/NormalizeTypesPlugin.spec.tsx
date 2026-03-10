/** @jsx jsxt */

import { ParagraphPlugin } from '@platejs/core/react';
import { jsxt } from '@platejs/test-utils';

import { normalizeRoot } from '../__tests__/normalizeRoot';
import { NormalizeTypesPlugin } from './NormalizeTypesPlugin';

jsxt;

describe('NormalizeTypesPlugin', () => {
  it.each([
    {
      input: (
        <editor>
          <element />
        </editor>
      ) as any,
      output: (
        <editor>
          <element>
            <hh1>
              <htext />
            </hh1>
            <hp>
              <htext />
            </hp>
          </element>
        </editor>
      ) as any,
      rules: [
        { path: [0, 0], strictType: 'h1' },
        { path: [0, 1], type: ParagraphPlugin.key },
      ],
      title: 'inserts missing nodes for configured paths',
    },
    {
      input: (
        <editor>
          <hh1>test</hh1>
        </editor>
      ) as any,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh2>
            <htext />
          </hh2>
        </editor>
      ) as any,
      rules: [{ path: [1], type: 'h2' }],
      title: 'inserts a missing node for a type rule',
    },
    {
      input: (
        <editor>
          <hh2>test</hh2>
          <hh2>test</hh2>
          <hh2>test</hh2>
        </editor>
      ) as any,
      output: (
        <editor>
          <hh2>test</hh2>
          <hh2>test</hh2>
          <hh2>test</hh2>
        </editor>
      ) as any,
      rules: [{ path: [0], type: 'h1' }],
      title: 'does not rewrite an existing node for a type rule',
    },
    {
      input: (
        <editor>
          <hh1>test</hh1>
        </editor>
      ) as any,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh2>
            <htext />
          </hh2>
        </editor>
      ) as any,
      rules: [{ path: [1], strictType: 'h2' }],
      title: 'inserts a missing node for a strictType rule',
    },
    {
      input: (
        <editor>
          <hh2>test</hh2>
          <hh2>test</hh2>
          <hh2>test</hh2>
        </editor>
      ) as any,
      output: (
        <editor>
          <hh1>test</hh1>
          <hh2>test</hh2>
          <hh2>test</hh2>
        </editor>
      ) as any,
      rules: [{ path: [0], strictType: 'h1' }],
      title: 'rewrites an existing node for a strictType rule',
    },
  ])('$title', ({ input, output, rules }) => {
    const editor = normalizeRoot({
      plugins: [
        NormalizeTypesPlugin.configure({
          options: { rules },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    expect(editor.children).toEqual(output.children);
  });
});
