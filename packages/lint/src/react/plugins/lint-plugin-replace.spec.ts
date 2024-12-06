import type { TokenDecoration } from '@udecode/slate-utils';

import { getEditorPlugin } from '@udecode/plate-common/react';
import { createPlateEditor } from '@udecode/plate-common/react';

import type { LintToken } from '../types';

import { ExperimentalLintPlugin } from '../lint-plugin';
import { replaceLintPlugin } from './lint-plugin-replace';

describe('replaceLintPlugin', () => {
  const replaceMap = new Map([
    ['hello', [{ text: '👋' }]],
    ['world', [{ text: '🌍' }, { text: '🌎' }]],
  ]);

  it('should suggest replacements', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'hello world',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap,
        },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor.children[0], [0]],
    }) as unknown as TokenDecoration[];

    expect(decorations).toHaveLength(2);
    expect((decorations[0].token as LintToken).suggest?.[0].data?.text).toBe(
      '👋'
    );
    expect((decorations[1].token as LintToken).suggest?.[0].data?.text).toBe(
      '🌍'
    );
    expect((decorations[1].token as LintToken).suggest?.[1].data?.text).toBe(
      '🌎'
    );
  });
});
