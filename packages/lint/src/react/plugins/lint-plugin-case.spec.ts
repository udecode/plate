import { createPlateEditor } from '@udecode/plate-common/react';

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
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(3);
    expect(annotations[0].suggest?.[0].data?.text).toBe('Hello');
    expect(annotations[1].suggest?.[0].data?.text).toBe('This');
    expect(annotations[2].suggest?.[0].data?.text).toBe('New');
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
    plugin.api.lint.run([
      caseLintPlugin.configs.all,
      {
        settings: {
          case: {
            ignoredWords: ['iPhone', 'ios'],
          },
        },
      },
    ]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(1); // Only "app" should be flagged
    expect(annotations[0].suggest?.[0].data?.text).toBe('App');
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
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    annotations[0].suggest?.[0].fix();
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
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(1);
    expect(annotations[0].text).toBe('cat');
    expect(annotations[0].suggest?.[0].data?.text).toBe('Cat');
  });

  it('should handle multiple sentence endings correctly', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'First sentence! second here? third now. fourth one',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(3); // second, third, fourth should be flagged
    expect(annotations[0].text).toBe('second');
    expect(annotations[1].text).toBe('third');
    expect(annotations[2].text).toBe('fourth');
  });

  it('should handle multiple spaces after sentence endings', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'One sentence.   two spaces. three  spaces.',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(2);
    expect(annotations[0].text).toBe('two');
    expect(annotations[1].text).toBe('three');
  });

  it('should handle special characters and punctuation', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: 'Hello world! "this" needs caps. (another) sentence.',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(2);
    expect(annotations[0].text).toBe('this');
    expect(annotations[1].text).toBe('another');
  });

  it('should handle empty and whitespace-only strings', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [
          {
            text: '   ',
          },
        ],
        type: 'p',
      },
    ];

    const plugin = editor.getPlugin(ExperimentalLintPlugin);
    plugin.api.lint.run([caseLintPlugin.configs.all]);

    const annotations = editor.getOption(ExperimentalLintPlugin, 'annotations');
    expect(annotations).toHaveLength(0);
  });
});
