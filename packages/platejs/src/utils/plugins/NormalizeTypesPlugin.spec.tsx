/** @jsx jsxt */

import { jsxt, type TestEditor } from '../../testing';
import { normalizeRoot } from './__tests__/normalizeRoot';
import { NormalizeTypesPlugin } from './NormalizeTypesPlugin';

jsxt;

describe('NormalizeTypesPlugin', () => {
  it.each([
    {
      input: (
        <editor>
          <element type="element" />
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="element">
            <element type="h1">
              <htext />
            </element>
            <hp>
              <htext />
            </hp>
          </element>
        </editor>
      ) as TestEditor,
      rules: [
        { path: [0, 0], strictType: 'h1' },
        { path: [0, 1], type: 'paragraph' },
      ],
      title: 'inserts missing nodes for configured paths',
    },
    {
      input: (
        <editor>
          <element type="h1">test</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h2">
            <htext />
          </element>
        </editor>
      ) as TestEditor,
      rules: [{ path: [1], type: 'h2' }],
      title: 'inserts a missing node for a type rule',
    },
    {
      input: (
        <editor>
          <element type="h2">test</element>
          <element type="h2">test</element>
          <element type="h2">test</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h2">test</element>
          <element type="h2">test</element>
          <element type="h2">test</element>
        </editor>
      ) as TestEditor,
      rules: [{ path: [0], type: 'h1' }],
      title: 'does not rewrite an existing node for a type rule',
    },
    {
      input: (
        <editor>
          <element type="h1">test</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h2">
            <htext />
          </element>
        </editor>
      ) as TestEditor,
      rules: [{ path: [1], strictType: 'h2' }],
      title: 'inserts a missing node for a strictType rule',
    },
    {
      input: (
        <editor>
          <element type="h2">test</element>
          <element type="h2">test</element>
          <element type="h2">test</element>
        </editor>
      ) as TestEditor,
      output: (
        <editor>
          <element type="h1">test</element>
          <element type="h2">test</element>
          <element type="h2">test</element>
        </editor>
      ) as TestEditor,
      rules: [{ path: [0], strictType: 'h1' }],
      title: 'rewrites an existing node for a strictType rule',
    },
  ])('$title', ({ input, output, rules }) => {
    const normalized = normalizeRoot({
      plugins: [
        NormalizeTypesPlugin.configure({
          initialState: { rules },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    expect(normalized.children).toEqual(output.children);
  });

  it('reports insertion errors without changing the document', () => {
    const errors: unknown[] = [];
    const normalized = normalizeRoot({
      plugins: [
        NormalizeTypesPlugin.configure({
          initialState: {
            onError: (error) => errors.push(error),
            rules: [{ path: [3], type: 'h1' }],
          },
        }),
      ],
      value: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    expect(errors).toHaveLength(1);
    expect(normalized.children).toEqual([
      { children: [{ text: 'x' }], type: 'paragraph' },
    ]);
  });
});
