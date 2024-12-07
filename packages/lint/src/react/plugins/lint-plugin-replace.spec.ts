import { createPlateEditor } from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from '../lint-plugin';
import { replaceLintPlugin } from './lint-plugin-replace';

describe('replaceLintPlugin', () => {
  const replaceMap = new Map([
    ['hello', [{ text: '👋', type: 'emoji' }]],
    [
      'world',
      [
        { text: '🌍', type: 'emoji' },
        { text: '🌎', type: 'emoji' },
      ],
    ],
  ]);

  it('should decorate matching text', () => {
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

    // Call run instead of decorate
    plugin.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replace: {
            replaceMap,
          },
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toEqual([
      {
        messageId: 'replaceWithText',
        range: expect.any(Object),
        rangeRef: expect.any(Object),
        suggest: [
          {
            data: {
              text: '👋',
              type: 'emoji',
            },
            fix: expect.any(Function),
          },
        ],
        text: 'hello',
        type: 'emoji',
      },
      {
        messageId: 'replaceWithText',
        range: expect.any(Object),
        rangeRef: expect.any(Object),
        suggest: [
          {
            data: {
              text: '🌍',
              type: 'emoji',
            },
            fix: expect.any(Function),
          },
          {
            data: {
              text: '🌎',
              type: 'emoji',
            },
            fix: expect.any(Function),
          },
        ],
        text: 'world',
        type: 'emoji',
      },
    ]);
  });
});
