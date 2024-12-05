import type { TokenDecoration } from '@udecode/slate-utils';

import { getEditorPlugin } from '@udecode/plate-common/react';
import { createPlateEditor } from '@udecode/plate-common/react';

import type { LintToken } from './types';

import { ExperimentalLintPlugin } from './lint-plugin';
import { replaceLintPlugin } from './plugins/lint-plugin-replace';

describe('decorateLint', () => {
  const replaceMap = new Map([
    ['hello', [{ text: '👋' }]],
    ['world', [{ text: '🌍' }, { text: '🌎' }]],
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

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ]);

    expect(
      plugin.decorate?.({
        ...getEditorPlugin(editor, plugin),
        entry: [editor.children[0], [0]],
      })
    ).toEqual([
      {
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 5,
          path: [0, 0],
        },
        lint: true,
        token: {
          messageId: 'replaceWithText',
          range: expect.any(Object),
          rangeRef: expect.any(Object),
          suggest: [
            {
              data: { text: '👋' },
              fix: expect.any(Function),
            },
          ],
          text: 'hello',
        },
      },
      {
        anchor: {
          offset: 6,
          path: [0, 0],
        },
        focus: {
          offset: 11,
          path: [0, 0],
        },
        lint: true,
        token: {
          messageId: 'replaceWithText',
          range: expect.any(Object),
          rangeRef: expect.any(Object),
          suggest: [
            {
              data: { text: '🌍' },
              fix: expect.any(Function),
            },
            {
              data: { text: '🌎' },
              fix: expect.any(Function),
            },
          ],
          text: 'world',
        },
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

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      {
        ...replaceLintPlugin.configs.all,
        targets: [{ id: nodeId }],
      },
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ]);

    expect(
      plugin.decorate?.({
        ...getEditorPlugin(editor, plugin),
        entry: [{ id: nodeId, children: [{ text: 'hello' }], type: 'p' }, [0]],
      })
    ).toEqual([
      {
        anchor: {
          offset: 0,
          path: [0, 0],
        },
        focus: {
          offset: 5,
          path: [0, 0],
        },
        lint: true,
        token: {
          messageId: 'replaceWithText',
          range: expect.any(Object),
          rangeRef: expect.any(Object),
          suggest: [
            {
              data: { text: '👋' },
              fix: expect.any(Function),
            },
          ],
          text: 'hello',
        },
      },
    ]);
  });

  it('should skip non-block nodes', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ]);

    expect(
      plugin.decorate?.({
        ...getEditorPlugin(editor, plugin),
        entry: [{ text: 'hello' }, [0]], // Non-block node
      })
    ).toEqual([]);
  });

  it('should handle empty configs', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', []);

    expect(
      plugin.decorate?.({
        ...getEditorPlugin(editor, plugin),
        entry: [{ children: [{ text: 'hello' }], type: 'p' }, [0]],
      })
    ).toEqual([]);
  });

  it('should handle non-matching targets', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const plugin = editor.getPlugin(ExperimentalLintPlugin);

    editor.setOption(ExperimentalLintPlugin, 'configs', [
      {
        ...replaceLintPlugin.configs.all,
        targets: [{ id: 'non-existent' }],
      },
      {
        settings: {
          replaceMap: replaceMap,
        },
      },
    ]);

    expect(
      plugin.decorate?.({
        ...getEditorPlugin(editor, plugin),
        entry: [
          { id: 'different-id', children: [{ text: 'hello' }], type: 'p' },
          [0],
        ],
      })
    ).toEqual([]);
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
    editor.setOption(ExperimentalLintPlugin, 'configs', [
      replaceLintPlugin.configs.all,
      {
        settings: { replaceMap: new Map([['hello', [{ text: '👋' }]]]) },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor.children[0], [0]],
    }) as unknown as TokenDecoration[];

    // Test fixer actions
    const token = decorations[0].token as LintToken;
    expect(token?.suggest?.[0].fix).toBeDefined();

    // Call fix function
    token?.suggest?.[0].fix();
    expect(editor.children[0].children[0].text).toBe('👋');
  });
});
