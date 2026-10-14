import remarkGfm from 'remark-gfm';

import { AuthoredPlugin } from '../../authored';
import { BaseParagraphPlugin } from '../../core';
import { BaseDetailsPlugin } from '../../features/details';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import { AIChatPlugin } from './AIChatPlugin';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

// A closed Details whose title holds the caret, followed by one paragraph.
const titled = (title: string) => {
  const selection = {
    anchor: { offset: title.length, path: [0, 0, 0] },
    focus: { offset: title.length, path: [0, 0, 0] },
    kind: 'text' as const,
  };
  const editor = createEditor({
    plugins: [
      AuthoredPlugin,
      BaseParagraphPlugin,
      BaseDetailsPlugin,
      BaseAIPlugin,
      MarkdownPlugin.configure({
        initialState: { remarkPlugins: [remarkGfm] },
      }),
      AIChatPlugin,
    ],
    userId: 'alice',
    selection,
    initialValue: [
      {
        children: [
          { children: [{ text: title }], type: 'summary' },
          paragraph('Body'),
        ],
        type: 'details',
      },
      paragraph('After'),
    ],
  });
  const ai = editor.plugin(AIChatPlugin);
  const run = (action: 'accept' | 'Insert below') => {
    if (action === 'accept') {
      ai.store.set({ chatSelection: null, mode: 'insert' });
      ai.api.setPreview('Answer');
      ai.api.accept();
    } else {
      ai.store.set({ chatNodes: [], chatSelection: selection, mode: 'chat' });
      ai.api.setPreview('Answer');
      ai.api.insertBelow();
    }
  };

  return { editor, run };
};

describe('AIChatPlugin from a closed Details title', () => {
  it.each([
    ['accept', 'Title'],
    ['accept', ''],
    ['Insert below', 'Title'],
    ['Insert below', ''],
  ] as const)(
    'lands %s output after the Details from the title %j',
    (action, title) => {
      const { editor, run } = titled(title);
      const summary = editor.key([0, 0]);

      run(action);

      expect({
        caret: editor.read.selection()?.focus.path,
        children: editor.read.children(),
        title: summary && editor.read.nodes.get(summary)?.[1],
      }).toEqual({
        caret: [1, 0],
        children: [
          {
            children: [
              { children: [{ text: title }], type: 'summary' },
              paragraph('Body'),
            ],
            type: 'details',
          },
          paragraph('Answer'),
          paragraph('After'),
        ],
        title: [0, 0],
      });
    }
  );
});
