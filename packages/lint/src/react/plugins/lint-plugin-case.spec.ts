import type { TokenDecoration } from '@udecode/slate-utils';

import { getEditorPlugin } from '@udecode/plate-common/react';
import { createPlateEditor } from '@udecode/plate-common/react';

import type { LintToken } from '../types';

import { ExperimentalLintPlugin } from '../lint-plugin';
import { caseLintPlugin } from './lint-plugin-case';

describe('caseLintPlugin', () => {
  it('should suggest capitalization for sentence starts', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'hello world. this is a test. new sentence.',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      caseLintPlugin.configs.all,
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor.children[0], [0]],
    }) as unknown as TokenDecoration[];

    expect(decorations).toHaveLength(3);
    expect((decorations[0].token as LintToken).suggest?.[0].data?.text).toBe(
      'Hello'
    );
    expect((decorations[1].token as LintToken).suggest?.[0].data?.text).toBe(
      'This'
    );
    expect((decorations[2].token as LintToken).suggest?.[0].data?.text).toBe(
      'New'
    );
  });

  it('should respect ignored words', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'iPhone is great. app is here.',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      caseLintPlugin.configs.all,
      {
        settings: {
          ignoredWords: ['iPhone', 'ios'],
        },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor.children[0], [0]],
    }) as unknown as TokenDecoration[];

    expect(decorations).toHaveLength(1); // Only "app" should be flagged
    expect((decorations[0].token as LintToken).suggest?.[0].data?.text).toBe(
      'App'
    );
  });

  it('should handle fixer actions', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [{ text: 'hello world.' }],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    editor.setOption(ExperimentalLintPlugin, 'configs', [
      caseLintPlugin.configs.all,
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor.children[0], [0]],
    }) as unknown as TokenDecoration[];

    const token = decorations[0].token as LintToken;
    token.suggest?.[0].fix();
    expect(editor.children[0].children[0].text).toBe('Hello world.');
  });

  it('should only capitalize words at sentence starts', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'The cat is here. cat is there. The cat.',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      caseLintPlugin.configs.all,
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor.children[0], [0]],
    }) as unknown as TokenDecoration[];

    // Only the second "cat" (after period) should be flagged
    expect(decorations).toHaveLength(1);
    expect((decorations[0].token as LintToken).text).toBe('cat');
    expect((decorations[0].token as LintToken).suggest?.[0].data?.text).toBe(
      'Cat'
    );
  });
});
