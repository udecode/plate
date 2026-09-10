import { describe, expect, it } from 'bun:test';

import { createEditor } from 'platejs';
import { BaseDatePlugin } from 'platejs/date';
import { PlateStatic } from 'platejs/static';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { BaseSuggestionKit } from './suggestion-static';

describe('BaseSuggestionKit', () => {
  it('injects inline suggestion type for static inline element rendering', () => {
    const editor = createEditor({
      plugins: [
        BaseDatePlugin.configure({ component: 'span' }),
        ...BaseSuggestionKit,
      ],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'date',
              value: '2026-09-04',
              children: [
                {
                  suggestion_1: {
                    createdAt: 0,
                    id: 'suggestion-1',
                    type: 'remove',
                    userId: 'alice',
                  },
                  text: '',
                },
              ],
            },
          ],
        },
      ],
    });

    const markup = renderToStaticMarkup(createElement(PlateStatic, { editor }));
    expect(markup).toContain('data-inline-suggestion="remove"');
  });
});
