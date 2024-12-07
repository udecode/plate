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
          replace: {
            replaceMap,
          },
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
        settings: {
          replace: { replaceMap: new Map([['hello', [{ text: '👋' }]]]) },
        },
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
          replace: {
            replaceMap: new Map([['world', [{ text: '🌍', type: 'emoji' }]]]),
          },
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');

    // Should have both emoji replacements and case fixes
    expect(annotations).toEqual([
      // Replace annotations
      {
        messageId: 'replaceWithText',
        range: expect.any(Object),
        rangeRef: expect.any(Object),
        suggest: [
          {
            data: { text: '🌍', type: 'emoji' },
            fix: expect.any(Function),
          },
        ],
        text: 'world',
        type: 'emoji',
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
  });

  it('should only lint targeted block when target specified', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    // Create two blocks with different content
    const firstBlockId = 'block-1';
    const secondBlockId = 'block-2';
    editor.children = [
      {
        id: firstBlockId,
        children: [{ text: 'hello world' }],
        type: 'p',
      },
      {
        id: secondBlockId,
        children: [{ text: 'hello earth' }],
        type: 'p',
      },
    ];

    editor.api.lint.run([
      {
        ...replaceLintPlugin.configs.all,
        targets: [{ id: firstBlockId }], // Only target first block
      },
      {
        settings: {
          replace: {
            replaceMap: new Map([
              ['earth', [{ text: '🌏', type: 'emoji' }]],
              ['hello', [{ text: '👋', type: 'emoji' }]],
              ['world', [{ text: '�', type: 'emoji' }]],
            ]),
          },
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');

    // Should only have annotations for "hello" and "world" from first block
    expect(annotations).toHaveLength(2);
    expect(annotations[0].text).toBe('hello');
    expect(annotations[1].text).toBe('world');
    expect(annotations.some((a) => a.text === 'earth')).toBe(false);
  });
});
