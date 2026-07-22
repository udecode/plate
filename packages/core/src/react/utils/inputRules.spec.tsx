/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { property, schema } from '@platejs/plite';
import { insertBreak, insertText } from '@platejs/plite/internal';
import { BaseParagraphPlugin } from '../../lib/plugins';

import { createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';
import {
  createRuleFactory,
  defineInputRule,
} from '../../lib/plugins/input-rules';

jsxt;

describe('input rules', () => {
  it('retains element schema contributions after configuring input rules', () => {
    const CalloutPlugin = createPlatePlugin({
      key: 'callout',
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    }).configure({
      inputRules: [
        defineInputRule({
          apply: () => true,
          target: 'insertText',
          trigger: '>',
        }),
      ],
    });
    const editor = createPlateEditor({
      plugins: [CalloutPlugin],
    });

    expect(() =>
      editor.read.schema.validateDocument({
        children: [{ children: [{ text: '' }], type: 'callout' }],
      })
    ).not.toThrow();
  });

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

    expect(editor.runtime.inputRules.plugins.testPlugin.rules).toHaveLength(1);
    expect(editor.runtime.inputRules.plugins.testPlugin.rules[0].id).toBe(
      'testPlugin.0'
    );
    expect(editor.runtime.inputRules.insertText.byTrigger['*']).toHaveLength(1);
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

    insertText(editor, '*');

    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('passes the active transaction to insertText rules', () => {
    let applyCount = 0;
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply: ({ tx }) => {
                applyCount += 1;
                tx.text.insert('handled');

                return true;
              },
              target: 'insertText',
              trigger: '*',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(applyCount).toBe(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'handled' }], type: 'p' },
    ]);
  });

  it('dispatches configured insertBreak rules through the core runtime', () => {
    const apply = mock(() => true);
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply,
              target: 'insertBreak',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    insertBreak(editor);

    expect(apply).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'hello' }], type: 'p' },
    ]);
  });

  it('passes the active transaction to insertBreak rules', () => {
    let applyCount = 0;
    const editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'testPlugin',
        }).configure({
          inputRules: [
            defineInputRule({
              apply: ({ tx }) => {
                applyCount += 1;
                tx.text.insert('!');

                return true;
              },
              target: 'insertBreak',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    insertBreak(editor);

    expect(applyCount).toBe(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'hello!' }], type: 'p' },
    ]);
  });

  it('dispatches configured insertData rules through the core runtime', () => {
    const apply = mock(({ text }) => {
      expect(text).toBe('hello');

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
              mimeTypes: ['text/plain'],
              target: 'insertData',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '' }], type: 'p' }],
    } as any);
    const dataTransfer = {
      files: [],
      getData: mock((mimeType: string) =>
        mimeType === 'text/plain' ? 'hello' : ''
      ),
      types: ['text/plain'],
    } as any;

    let inserted: unknown;

    editor.update(() => {
      inserted = editor.api.clipboard.insertData(dataTransfer);
    });

    expect(inserted).toBe(true);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
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

    insertText(editor, '*');

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

    expect(editor.runtime.inputRules.plugins.testPlugin.rules).toHaveLength(2);
    expect(editor.runtime.inputRules.insertText.byTrigger['*']).toHaveLength(1);
    expect(editor.runtime.inputRules.insertText.byTrigger._).toHaveLength(1);
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
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    insertText(editor, ' ');

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
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
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    insertText(editor, ' ');

    expect(resolve).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
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
      editor.runtime.inputRules.insertText.byTrigger['*'].map((rule) => rule.id)
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
          schema: {
            mark: property.boolean({ default: false, omitDefault: true }),
          },
        }),
      ],
      value: [{ children: [{ text: '**hello*' }], type: 'p' }],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 8, path: [0, 0] },
      focus: { offset: 8, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(editor.runtime.inputRules.plugins.bold.rules).toHaveLength(1);
    expect(editor.runtime.inputRules.insertText.byTrigger['*']).toHaveLength(1);
    expect(editor.read.children()).toMatchObject([
      {
        children: [{ bold: true, text: 'hello' }],
        type: 'p',
      },
    ]);
  });

  it('does not match non-adjacent closing mark delimiters', () => {
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
      value: [{ children: [{ text: '**hello* nope' }], type: 'p' }],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 13, path: [0, 0] },
      focus: { offset: 13, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '**hello* nope*' }], type: 'p' },
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

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    insertText(editor, '`');

    expect(apply).toHaveBeenCalledTimes(1);
    expect(editor.runtime.inputRules.plugins.codeBlock.rules).toHaveLength(1);
    expect(editor.runtime.inputRules.insertText.byTrigger['`']).toHaveLength(1);
  });

  it('registers configured match-triggered fences through createPlateEditor', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        createPlatePlugin({
          key: 'codeBlock',
          type: 'code_block',
        }).configure({
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertText',
              trigger: '`',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '``' }], type: 'p' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    expect(editor.runtime.inputRules.plugins.codeBlock.rules).toHaveLength(1);
    expect(editor.runtime.inputRules.insertText.byTrigger['`']).toHaveLength(1);
  });

  it('registers configured break-triggered rules through createPlateEditor', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        createPlatePlugin({
          key: 'equation',
        }).configure({
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertBreak',
            }),
          ],
        }),
      ],
      value: [{ children: [{ text: '$$' }], type: 'p' }],
    } as any);

    expect(editor.runtime.inputRules.plugins.equation.rules).toHaveLength(1);
    expect(editor.runtime.inputRules.insertBreak).toContainEqual(
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
          schema: {
            element: {
              content: schema.content.group('block'),
            },
          },
        }).configure({
          inputRules: [blockquoteMarkdown({ marker: '|' })],
        }),
      ],
      value: [{ children: [{ text: '|' }], type: 'p' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    insertText(editor, ' ');

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: '' }], type: 'p' }],
        type: 'blockquote',
      },
    ]);
  });

  it('toggles block-start rules back to paragraph when active', () => {
    const headingMarkdown = createRuleFactory({
      type: 'blockStart',
      trigger: ' ',
      mode: 'toggle',
      match: '##',
      node: 'heading',
    });
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        createPlatePlugin({
          key: 'heading',
          schema: {
            element: {
              content: schema.content.open({ default: 'text', min: 1 }),
            },
          },
        }).configure({
          inputRules: [headingMarkdown()],
        }),
      ],
      value: [{ children: [{ text: '##' }], type: 'heading' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    insertText(editor, ' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
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
