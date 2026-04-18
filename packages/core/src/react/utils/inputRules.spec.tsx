/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { BaseParagraphPlugin } from 'platejs';
import { CodeBlockRules } from '@platejs/code-block';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react';
import { MathRules } from '@platejs/math';
import { EquationPlugin, InlineEquationPlugin } from '@platejs/math/react';

import { createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';
import {
  createRuleFactory,
  defineInputRule,
} from '../../lib/plugins/input-rules';

jsxt;

describe('input rules', () => {
  it('registers explicit configured rule instances on the owning plugin', () => {
    const strongRule = defineInputRule({
      apply: () => true,
      target: 'insertText',
      trigger: '*',
    });
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [strongRule],
        }),
      ],
    });

    expect(editor.meta.inputRules.plugins.testPlugin.rules).toHaveLength(1);
    expect(editor.meta.inputRules.plugins.testPlugin.rules[0].id).toBe(
      'testPlugin.0'
    );
    expect(editor.meta.inputRules.insertText.byTrigger['*']).toHaveLength(1);
  });

  it('dispatches configured insertText rules through the core runtime', () => {
    const apply = mock(() => true);
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply,
              target: 'insertText',
              trigger: '*',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);

    editor.tf.insertText('*');

    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('skips rules whose enabled predicate returns false', () => {
    const apply = mock(() => true);
    const enabled = mock(() => false);
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply,
              enabled,
              target: 'insertText',
              trigger: '*',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);

    editor.tf.insertText('*');

    expect(enabled).toHaveBeenCalledTimes(1);
    expect(apply).not.toHaveBeenCalled();
  });

  it('combines definition-side and configure-time rule arrays', () => {
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertText',
              trigger: '*',
            }),
          ],
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertText',
              trigger: '_',
            }),
          ],
        }),
      ],
    });

    expect(editor.meta.inputRules.plugins.testPlugin.rules).toHaveLength(2);
    expect(editor.meta.inputRules.insertText.byTrigger['*']).toHaveLength(1);
    expect(editor.meta.inputRules.insertText.byTrigger._).toHaveLength(1);
  });

  it('provides lazy cached selection getters and pluginKey to insertText resolve', () => {
    const apply = mock(() => true);
    const resolve = mock(
      ({ getBlockStartRange, getBlockStartText, pluginKey }) => {
        expect(pluginKey).toBe('h2');
        expect(getBlockStartRange()).toBe(getBlockStartRange());
        expect(getBlockStartText()).toBe('##');
        expect(getBlockStartText()).toBe('##');

        return true;
      }
    );
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'h2',
        }).configure({
          inputRules: [
            defineInputRule({
              apply,
              resolve,
              target: 'insertText',
              trigger: ' ',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '##' }], type: 'p' }],
    } as any);
    const originalRange = editor.api.range.bind(editor.api);
    const originalString = editor.api.string.bind(editor.api);
    const range = mock((...args: Parameters<typeof originalRange>) =>
      originalRange(...args)
    );
    const string = mock((...args: Parameters<typeof originalString>) =>
      originalString(...args)
    );

    editor.api.range = range as typeof editor.api.range;
    editor.api.string = string as typeof editor.api.string;
    editor.tf.select({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    editor.tf.insertText(' ');

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(range).toHaveBeenCalledTimes(1);
    expect(string).toHaveBeenCalledTimes(1);
  });

  it('provides lazy cached character getters to insertText resolve', () => {
    const apply = mock(() => true);
    const resolve = mock(({ getCharAfter, getCharBefore }) => {
      expect(getCharBefore()).toBe('b');
      expect(getCharBefore()).toBe('b');
      expect(getCharAfter()).toBe('c');
      expect(getCharAfter()).toBe('c');

      return true;
    });
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply,
              resolve,
              target: 'insertText',
              trigger: ' ',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: 'abc' }], type: 'p' }],
    } as any);
    const originalAfter = editor.api.after.bind(editor.api);
    const originalBefore = editor.api.before.bind(editor.api);
    const originalString = editor.api.string.bind(editor.api);
    const after = mock((...args: Parameters<typeof originalAfter>) =>
      originalAfter(...args)
    );
    const before = mock((...args: Parameters<typeof originalBefore>) =>
      originalBefore(...args)
    );
    const string = mock((...args: Parameters<typeof originalString>) =>
      originalString(...args)
    );

    editor.api.after = after as typeof editor.api.after;
    editor.api.before = before as typeof editor.api.before;
    editor.api.string = string as typeof editor.api.string;
    editor.tf.select({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    editor.tf.insertText(' ');

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(before).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);
    expect(string).toHaveBeenCalledTimes(2);
  });

  it('orders competing rules by priority, then plugin order, then declaration order', () => {
    const baseRule = defineInputRule({
      apply: () => true,
      target: 'insertText',
      trigger: '*',
    });
    const first = { ...baseRule, priority: 100 };
    const second = { ...baseRule, priority: 100 };
    const high = { ...baseRule, priority: 200 };
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'alpha',
        }).configure({
          inputRules: [first, second],
        }),
        createPlatePlugin({
          key: 'beta',
        }).configure({
          inputRules: [high],
        }),
      ],
    });

    expect(
      editor.meta.inputRules.insertText.byTrigger['*'].map((rule) => rule.id)
    ).toEqual(['beta.0', 'alpha.0', 'alpha.1']);
  });

  it('supports definition-side inputRules factories with owner-scoped helpers', () => {
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'bold',
          inputRules: ({ rule }) => [
            rule.mark({
              end: '*',
              start: '**',
              trigger: '*',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '**hello*' }], type: 'p' }],
    });

    editor.tf.select({
      anchor: { offset: 8, path: [0, 0] },
      focus: { offset: 8, path: [0, 0] },
    });
    editor.tf.insertText('*');

    expect(editor.meta.inputRules.plugins.bold.rules).toHaveLength(1);
    expect(editor.meta.inputRules.insertText.byTrigger['*']).toHaveLength(1);
    expect(editor.children).toMatchObject([
      {
        children: [{ bold: true, text: 'hello' }],
        type: 'p',
      },
    ]);
  });

  it('supports definition-side blockFence helpers for match-triggered fences', () => {
    const apply = mock(() => true);
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'codeBlock',
          inputRules: ({ rule }) => [
            rule.blockFence({
              apply,
              block: 'p',
              fence: '```',
              on: 'match',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '``' }], type: 'p' }],
    } as any);

    editor.tf.select({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    editor.tf.insertText('`');

    expect(apply).toHaveBeenCalledTimes(1);
    expect(editor.meta.inputRules.plugins.codeBlock.rules).toHaveLength(1);
    expect(editor.meta.inputRules.insertText.byTrigger['`']).toHaveLength(1);
  });

  it('registers configured match-triggered code-block fences through createPlateEditor', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        CodeBlockPlugin.configure({
          inputRules: [CodeBlockRules.markdown({ on: 'match' })],
        }),
        CodeLinePlugin,
        CodeSyntaxPlugin,
      ],
      value: [{ children: [{ text: '``' }], type: 'p' }],
    } as any);

    editor.tf.select({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    expect(editor.meta.inputRules.plugins.code_block.rules).toHaveLength(1);
    expect(editor.meta.inputRules.insertText.byTrigger['`']).toHaveLength(1);
  });

  it('registers configured break-triggered block-math fences through createPlateEditor', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        InlineEquationPlugin.configure({
          inputRules: [MathRules.markdown({ variant: '$' })],
        }),
        EquationPlugin.configure({
          inputRules: [MathRules.markdown({ on: 'break', variant: '$$' })],
        }),
      ],
      value: [{ children: [{ text: '$$' }], type: 'p' }],
    } as any);

    expect(editor.meta.inputRules.plugins.equation.rules).toHaveLength(1);
    expect(editor.meta.inputRules.insertBreak).toContainEqual(
      expect.objectContaining({ pluginKey: 'equation' })
    );
  });

  it('supports rule factories with concrete defaults and caller overrides', () => {
    const blockquoteMarkdown = createRuleFactory<{}, { marker: string }>({
      type: 'blockStart',
      marker: '>',
      trigger: ' ',
      mode: 'wrap',
      match: ({ marker }) => marker,
    });
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'blockquote',
        }).configure({
          inputRules: [blockquoteMarkdown({ marker: '|' })],
        }),
      ],
      value: [{ children: [{ text: '|' }], type: 'p' }],
    } as any);

    editor.tf.select({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    editor.tf.insertText(' ');

    expect(editor.children).toMatchObject([
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
  });

  it('rejects boolean-map inputRules config', () => {
    expect(() =>
      createPlateEditor({
        plugins: [
          createPlatePlugin({
            key: 'testPlugin',
          }).configure({
            inputRules: { markdown: true } as any,
          }),
        ],
      })
    ).toThrow('inputRules config must be an array of explicit rule instances.');
  });
});
