import { createPlateEditor } from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from './lint-plugin';

jest.mock('@udecode/slate-react', () => ({
  focusEditor: jest.fn(),
}));

describe('LintPlugin', () => {
  it('should set selected active annotation', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    ];

    const activeAnnotation: any = {
      rangeRef: {
        current: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      text: 'hello',
    };
    editor.setOption(ExperimentalLintPlugin, 'annotations', [activeAnnotation]);
    editor.setOption(
      ExperimentalLintPlugin,
      'activeAnnotation',
      activeAnnotation
    );

    editor.selection = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };
    const result = editor.api.lint.setSelectedactiveAnnotation();
    expect(result).toBe(true);
    expect(
      editor.getOption(ExperimentalLintPlugin, 'activeAnnotation')?.text
    ).toBe('hello');
  });

  it('should focus next match', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const activeAnnotation = {
      rangeRef: {
        current: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      text: 'hello',
    } as any;
    editor.setOption(ExperimentalLintPlugin, 'annotations', [
      activeAnnotation,
      {
        rangeRef: {
          current: {
            anchor: { offset: 6, path: [0, 0] },
            focus: { offset: 11, path: [0, 0] },
          },
        },
        text: 'world',
      } as any,
    ]);
    editor.setOption(
      ExperimentalLintPlugin,
      'activeAnnotation',
      activeAnnotation
    );

    const match = editor.tf.lint.focusNextMatch();
    expect(match?.text).toBe('world');
    expect(
      editor.getOption(ExperimentalLintPlugin, 'activeAnnotation')?.text
    ).toBe('world');
  });
});
