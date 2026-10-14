import { expect, it } from 'bun:test';

import { act, render } from '@testing-library/react';
import {
  createEditor,
  EditorContent,
  EditorRoot,
  LinkPlugin,
} from 'platejs/react';
import * as React from 'react';

import { TagElement, TagPlugin } from './tag';

const tag = (value: string, url: string) => ({
  children: [{ text: '' }],
  type: 'tag',
  url,
  value,
});

it("links a read-only chip only when the editor's link schemes allow its url", () => {
  const editor = createEditor({
    plugins: [
      LinkPlugin.configure({ initialState: { allowedSchemes: ['https'] } }),
      TagPlugin.configure({ component: TagElement }),
    ],
    initialValue: [
      {
        children: [
          { text: '' },
          tag('Web', 'https://example.com/docs'),
          { text: '' },
          tag('Mail', ' mailto:team@example.com '),
          { text: '' },
          tag('Code', 'vscode://settings'),
          { text: '' },
        ],
        type: 'paragraph',
      },
    ],
  });
  const view = render(
    <EditorRoot editor={editor}>
      <EditorContent readOnly />
    </EditorRoot>
  );
  const links = () =>
    [...view.container.querySelectorAll('a')].map((link) => [
      link.textContent,
      link.getAttribute('href'),
    ]);

  try {
    const narrowed = links();

    act(() => {
      editor
        .plugin(LinkPlugin)
        .store.set({ allowedSchemes: ['https', 'mailto', 'vscode'] });
    });

    expect({ narrowed, widened: links() }).toEqual({
      narrowed: [['Web', 'https://example.com/docs']],
      widened: [
        ['Web', 'https://example.com/docs'],
        ['Mail', 'mailto:team@example.com'],
        ['Code', 'vscode://settings'],
      ],
    });
  } finally {
    view.unmount();
  }
});
