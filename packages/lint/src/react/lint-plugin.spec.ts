import { createPlateEditor } from '@udecode/plate-common/react';

import { ExperimentalLintPlugin } from './lint-plugin';

describe('LintPlugin', () => {
  it('should set selected active token', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    editor.children = [
      {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    ];

    const activeToken: any = {
      rangeRef: {
        current: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      text: 'hello',
    };
    editor.setOption(ExperimentalLintPlugin, 'tokens', [activeToken]);
    editor.setOption(ExperimentalLintPlugin, 'activeToken', activeToken);

    editor.selection = {
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };
    const result = editor.api.lint.setSelectedActiveToken();
    expect(result).toBe(true);
    expect(editor.getOption(ExperimentalLintPlugin, 'activeToken')?.text).toBe(
      'hello'
    );
  });

  it('should focus next match', () => {
    const editor = createPlateEditor({
      plugins: [ExperimentalLintPlugin],
    });

    const activeToken = {
      rangeRef: {
        current: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        },
      },
      text: 'hello',
    } as any;
    editor.setOption(ExperimentalLintPlugin, 'tokens', [
      activeToken,
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
    editor.setOption(ExperimentalLintPlugin, 'activeToken', activeToken);

    const match = editor.tf.lint.focusNextMatch();
    expect(match?.text).toBe('world');
    expect(editor.getOption(ExperimentalLintPlugin, 'activeToken')?.text).toBe(
      'world'
    );
  });
});
