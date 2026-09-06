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
  it.each([
    undefined,
    null,
    42,
    {},
  ])('renders empty equation values: %s', (texExpression) => {
    const editor = createSlateEditor({
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

    const html = renderToStaticMarkup(<PlateStatic editor={editor} />);

    expect(html).toContain('before');
    expect(html).toContain('after');
  });
});
