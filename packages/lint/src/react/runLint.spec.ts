import { createPlateEditor } from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from './lint-plugin';
import { caseLintPlugin } from './plugins';
import { replaceLintPlugin } from './plugins/lint-plugin-replace';

describe('runLint', () => {
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
    plugin.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap,
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toEqual([
      {
        data: {
          type: 'emoji',
        },
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
      },
      {
        data: {
          type: 'emoji',
        },
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
      },
    ]);
  });

  it('should handle targets in config', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const nodeId = 'test-node';
    editor.children = [
      {
        id: nodeId,
        children: [
          {
            text: 'hello',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([
      {
        ...replaceLintPlugin.configs.all,
        targets: [{ id: nodeId }],
      },
      {
        settings: {
          replaceMap,
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toEqual([
      {
        data: {
          type: 'emoji',
        },
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
      },
    ]);
  });

  it('should skip non-block nodes', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap,
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toEqual([]);
  });

  it('should handle empty configs', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toEqual([]);
  });

  it('should handle fixer actions', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: { replaceMap: new Map([['hello', [{ text: '👋' }]]]) },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations[0]?.suggest?.[0].fix).toBeDefined();

    annotations[0]?.suggest?.[0].fix();
    expect(editor.children[0].children[0].text).toBe('👋');
  });

  it('should handle multiple plugins (case and replace)', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'hello world. this is a test.',
          },
        ],
        type: 'p',
      },
    ];

    editor.api.lint.run([
      replaceLintPlugin.configs.all,
      caseLintPlugin.configs.all,
      {
        settings: {
          replaceMap: new Map([
            ['hello', [{ text: '👋', type: 'emoji' }]],
            ['world', [{ text: '🌍', type: 'emoji' }]],
          ]),
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');

    // Should have both emoji replacements and case fixes
    expect(annotations).toEqual([
      // Replace annotations
      {
        data: { type: 'emoji' },
        messageId: 'replaceWithText',
        range: expect.any(Object),
        rangeRef: expect.any(Object),
        suggest: [
          {
            data: { text: '👋', type: 'emoji' },
            fix: expect.any(Function),
          },
        ],
        text: 'hello',
      },
      // Case annotation for 'this'
      {
        data: { type: undefined },
        messageId: 'replaceWithText',
        range: expect.any(Object),
        rangeRef: expect.any(Object),
        suggest: undefined,
        text: 'this',
      },
      // Case annotation for 'hello'
      {
        messageId: 'capitalizeFirstLetter',
        range: expect.any(Object),
        rangeRef: expect.any(Object),
        suggest: [
          {
            data: { text: 'Hello' },
            fix: expect.any(Function),
          },
        ],
        text: 'hello',
      },
      // Case annotation for 'this'
      {
        messageId: 'capitalizeFirstLetter',
        range: {
          anchor: { offset: 13, path: [0, 0] },
          focus: { offset: 17, path: [0, 0] },
        },
        rangeRef: expect.any(Object),
        suggest: [
          {
            data: { text: 'This' },
            fix: expect.any(Function),
          },
        ],
        text: 'this',
      },
    ]);

    // Verify both types of fixes work
    annotations[0].suggest?.[0].fix(); // Replace 'hello' with emoji
    expect(editor.children[0].children[0].text).toBe(
      '👋 world. this is a test.'
    );

    annotations[2].suggest?.[0].fix(); // Capitalize 'this'
    expect(editor.children[0].children[0].text).toBe(
      '👋 world. This is a test.'
    );
  });
});
