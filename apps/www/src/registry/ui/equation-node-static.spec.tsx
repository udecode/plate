import * as React from 'react';

import { BaseEquationPlugin, BaseInlineEquationPlugin } from '@platejs/math';
import { describe, expect, it } from 'bun:test';
import { createSlateEditor } from 'platejs';
import { PlateStatic } from 'platejs/static';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  EquationElementDocx,
  EquationElementStatic,
  InlineEquationElementDocx,
  InlineEquationElementStatic,
} from './equation-node-static';

describe.each([
  {
    name: 'static',
    block: EquationElementStatic,
    inline: InlineEquationElementStatic,
  },
  {
    name: 'document',
    block: EquationElementDocx,
    inline: InlineEquationElementDocx,
  },
])('$name equation views', ({ block, inline }) => {
  function renderEquations(texExpression: unknown) {
    const editor = createSlateEditor({
      id: 'equation-content',
      plugins: [
        BaseEquationPlugin.withComponent(block),
        BaseInlineEquationPlugin.withComponent(inline),
      ],
      value: [
        { type: 'equation', texExpression, children: [{ text: '' }] },
        {
          type: 'p',
          children: [
            { text: 'before ' },
            {
              type: 'inline_equation',
              texExpression,
              children: [{ text: '' }],
            },
            { text: ' after' },
          ],
        },
      ] as any,
    });

    return renderToStaticMarkup(<PlateStatic editor={editor} />);
  }

  it.each([
    0,
    42,
    false,
    true,
  ])('preserves primitive equation content: %s', (texExpression) => {
    expect(renderEquations(texExpression)).toBe(
      renderEquations(String(texExpression))
    );
  });

  it.each([
    { texExpression: undefined },
    { texExpression: null },
    { texExpression: {} },
    { texExpression: [] },
  ])('renders empty equation values: $texExpression', ({ texExpression }) => {
    const html = renderEquations(texExpression);

    expect(html).toContain('before');
    expect(html).toContain('after');
  });
});
