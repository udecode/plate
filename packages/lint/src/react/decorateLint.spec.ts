import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from './lint-plugin';
import { replaceLintPlugin } from './plugins/lint-plugin-replace';

describe('decorateLint', () => {
  it('should map annotations to leaf decorations', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [{ text: 'hello world' }],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    editor.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: new Map([
            ['hello', [{ text: '👋', type: 'emoji' }]],
            ['world', [{ text: '🌍', type: 'emoji' }]],
          ]),
        },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor, []],
    });

    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 0] },
        annotation: expect.objectContaining({
          data: { type: 'emoji' },
          text: 'hello',
        }),
        focus: { offset: 5, path: [0, 0] },
        lint: true,
      },
      {
        anchor: { offset: 6, path: [0, 0] },
        annotation: expect.objectContaining({
          data: { type: 'emoji' },
          text: 'world',
        }),
        focus: { offset: 11, path: [0, 0] },
        lint: true,
      },
    ]);
  });

  it('should handle annotations spanning multiple leaves', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          { text: 'he' },
          { bold: true, text: 'll' },
          { text: 'o wo' },
          { bold: true, text: 'r' },
          { text: 'ld' },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    editor.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: new Map([
            ['hello', [{ text: '👋', type: 'emoji' }]],
            ['world', [{ text: '🌍', type: 'emoji' }]],
          ]),
        },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor, []],
    });

    expect(decorations).toEqual([
      // "hello" annotation spans 3 leaves
      {
        anchor: { offset: 0, path: [0, 0] },
        annotation: expect.objectContaining({ text: 'hello' }),
        focus: { offset: 2, path: [0, 0] },
        lint: true,
      },
      {
        anchor: { offset: 0, path: [0, 1] },
        annotation: expect.objectContaining({ text: 'hello' }),
        focus: { offset: 2, path: [0, 1] },
        lint: true,
      },
      {
        anchor: { offset: 0, path: [0, 2] },
        annotation: expect.objectContaining({ text: 'hello' }),
        focus: { offset: 1, path: [0, 2] },
        lint: true,
      },
      // "world" annotation spans 3 leaves
      {
        anchor: { offset: 2, path: [0, 2] },
        annotation: expect.objectContaining({ text: 'world' }),
        focus: { offset: 4, path: [0, 2] },
        lint: true,
      },
      {
        anchor: { offset: 0, path: [0, 3] },
        annotation: expect.objectContaining({ text: 'world' }),
        focus: { offset: 1, path: [0, 3] },
        lint: true,
      },
      {
        anchor: { offset: 0, path: [0, 4] },
        annotation: expect.objectContaining({ text: 'world' }),
        focus: { offset: 2, path: [0, 4] },
        lint: true,
      },
    ]);
  });

  it('should handle annotations at leaf boundaries', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          { text: 'start ' },
          { bold: true, text: 'hello' },
          { text: ' middle ' },
          { bold: true, text: 'world' },
          { text: ' end' },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    editor.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: new Map([
            ['hello', [{ text: '👋', type: 'emoji' }]],
            ['world', [{ text: '🌍', type: 'emoji' }]],
          ]),
        },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor, []],
    });

    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 1] },
        annotation: expect.objectContaining({ text: 'hello' }),
        focus: { offset: 5, path: [0, 1] },
        lint: true,
      },
      {
        anchor: { offset: 0, path: [0, 3] },
        annotation: expect.objectContaining({ text: 'world' }),
        focus: { offset: 5, path: [0, 3] },
        lint: true,
      },
    ]);
  });

  it('should handle empty leaves', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          { text: '' },
          { bold: true, text: 'hello' },
          { text: ' ' },
          { bold: true, text: 'world' },
          { text: '' },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    editor.api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: new Map([
            ['hello', [{ text: '👋', type: 'emoji' }]],
            ['world', [{ text: '🌍', type: 'emoji' }]],
          ]),
        },
      },
    ]);

    const decorations = plugin.decorate?.({
      ...getEditorPlugin(editor, plugin),
      entry: [editor, []],
    });

    expect(decorations).toEqual([
      {
        anchor: { offset: 0, path: [0, 1] },
        annotation: expect.objectContaining({ text: 'hello' }),
        focus: { offset: 5, path: [0, 1] },
        lint: true,
      },
      {
        anchor: { offset: 0, path: [0, 3] },
        annotation: expect.objectContaining({ text: 'world' }),
        focus: { offset: 5, path: [0, 3] },
        lint: true,
      },
    ]);
  });
});
