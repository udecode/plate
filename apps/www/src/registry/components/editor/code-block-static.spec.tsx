import { describe, expect, it } from 'bun:test';

import { BaseCodeBlockPlugin, createEditor } from 'platejs';
import { renderStaticHtml } from 'platejs/static';
import * as React from 'react';

import { BaseCodeBlockKit, CodeBlockElementStatic } from './code-block-static';

const initialValue = [
  {
    children: [{ text: 'print("hello")' }],
    language: 'python',
    type: 'codeBlock',
  },
];

describe('CodeBlockElementStatic', () => {
  it('renders the persisted code block language label', async () => {
    const editor = createEditor({ plugins: BaseCodeBlockKit, initialValue });

    const { data: html } = await renderStaticHtml(editor);

    expect(html).toContain('Python');
  });

  it('can hide the language label at the component boundary', async () => {
    const editor = createEditor({
      plugins: [
        BaseCodeBlockPlugin.configure({
          component: (props) => (
            <CodeBlockElementStatic {...props} showLanguageLabel={false} />
          ),
        }),
      ],
      initialValue,
    });

    const { data: html } = await renderStaticHtml(editor);

    expect(html).toContain('print(&quot;hello&quot;)');
    expect(html).not.toContain('Python');
  });
});
