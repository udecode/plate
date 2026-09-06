import { createSlateEditor } from 'platejs';

import { BaseEquationPlugin } from './BaseEquationPlugin';
import { BaseInlineEquationPlugin } from './BaseInlineEquationPlugin';

describe.each([
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
])('$key values', (plugin) => {
  it.each([
    '42',
    'false',
    'x^2',
    '',
  ])('preserves the TeX attribute as a string: %s', (texExpression) => {
    const editor = createSlateEditor({ plugins: [plugin] });
    const element = document.createElement('span');
    element.setAttribute('data-slate-tex-expression', texExpression);

    expect(
      editor
        .getPlugin(plugin)
        .parsers.html?.deserializer?.toNodeProps?.({ element } as any)
    ).toEqual({ texExpression });
  });

  it('supplies an empty TeX source when no attribute exists', () => {
    const editor = createSlateEditor({ plugins: [plugin] });

    expect(
      editor.getPlugin(plugin).parsers.html?.deserializer?.toNodeProps?.({
        element: document.createElement('span'),
      } as any)
    ).toEqual({ texExpression: '' });
  });

  it.each([
    { input: undefined, expected: '' },
    { input: null, expected: '' },
    { input: {}, expected: '' },
    { input: [], expected: '' },
    { input: 0, expected: '0' },
    { input: 42, expected: '42' },
    { input: -3.5, expected: '-3.5' },
    { input: false, expected: 'false' },
    { input: true, expected: 'true' },
    { input: 'x^2', expected: 'x^2' },
  ])('normalizes TeX values without losing primitive content: $input', ({
    input: texExpression,
    expected,
  }) => {
    const equation = {
      children: [{ text: '' }],
      texExpression,
      type: plugin.key,
    };
    const value =
      plugin === BaseInlineEquationPlugin
        ? [{ children: [{ text: '' }, equation, { text: '' }], type: 'p' }]
        : [equation];
    const editor = createSlateEditor({
      plugins: [plugin],
      value: value as any,
    });

    editor.tf.normalize({ force: true });

    expect(
      Array.from(
        editor.api.nodes({ at: [], match: { type: plugin.key } })
      )[0][0]
    ).toMatchObject({ texExpression: expected });
  });
});
