/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { property, schema } from '@platejs/plite';
import {
  insertBreak,
  insertText,
  string as editorString,
} from '@platejs/plite/internal';
import { BaseParagraphPlugin } from '../../lib/plugins';
import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';

import { createPlateEditor } from '../editor';
import { definePlatePlugin } from '../plugin';
import {
  createRuleFactory,
  defineInputRule,
} from '../../lib/plugins/input-rules';

jsxt;

describe('input rules', () => {
  it('retains element schema contributions after configuring input rules', () => {
    const CalloutPlugin = definePlatePlugin('callout', {
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
      editor.read.schema.assertDocument({
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
        definePlatePlugin('testPlugin', {}).configure({
          inputRules: [strongRule],
        }),
      ],
    });

    expect(
      getPlateRuntime(editor).inputRules.plugins.testPlugin.rules
    ).toHaveLength(1);
    expect(
      getPlateRuntime(editor).inputRules.plugins.testPlugin.rules[0].id
    ).toBe('testPlugin.0');
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['*']
    ).toHaveLength(1);
  });

  it('dispatches configured insertText rules through the core runtime', () => {
    const apply = mock(() => true);
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {}).configure({
          inputRules: [
            defineInputRule({
              apply,
              target: 'insertText',
              trigger: '*',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    } as any);

    insertText(editor, '*');

    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('keeps generated competing insertText rules single-winner', () => {
    for (const winnerIndex of [0, 1, 3, 7]) {
      for (const continueInsertion of [false, true]) {
        const callCounts = Array.from({ length: 8 }, () => 0);
        const editor = createPlateEditor({
          plugins: [
            definePlatePlugin('testPlugin', {}).configure({
              inputRules: Array.from({ length: 8 }, (_, index) =>
                defineInputRule({
                  apply: ({ insertText }) => {
                    callCounts[index] += 1;

                    if (index !== winnerIndex) return false;
                    if (continueInsertion) insertText('continued');

                    return true;
                  },
                  target: 'insertText',
                  trigger: '*',
                })
              ),
            }),
          ],
          initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
        } as any);

        editor.update.selection.set({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
        insertText(editor, '*');

        expect(callCounts).toEqual(
          Array.from({ length: 8 }, (_, index) =>
            index <= winnerIndex ? 1 : 0
          )
        );
        expect(editorString(editor, [])).toBe(
          continueInsertion ? 'continued' : ''
        );
      }
    }
  });

  it('passes the active transaction to insertText rules', () => {
    let applyCount = 0;
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {}).configure({
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
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(applyCount).toBe(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'handled' }], type: 'paragraph' },
    ]);
  });

  it('dispatches configured insertBreak rules through the core runtime', () => {
    const apply = mock(() => true);
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {}).configure({
          inputRules: [
            defineInputRule({
              apply,
              target: 'insertBreak',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    insertBreak(editor);

    expect(apply).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'hello' }], type: 'paragraph' },
    ]);
  });

  it('passes the active transaction to insertBreak rules', () => {
    let applyCount = 0;
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {}).configure({
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
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    insertBreak(editor);

    expect(applyCount).toBe(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'hello!' }], type: 'paragraph' },
    ]);
  });

  it('dispatches configured insertData rules through the core runtime', () => {
    const apply = mock(({ text }) => {
      expect(text).toBe('hello');

      return true;
    });
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {}).configure({
          inputRules: [
            defineInputRule({
              apply,
              mimeTypes: ['text/plain'],
              target: 'insertData',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
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
      inserted = editor.api.dom.clipboard.insertData(dataTransfer);
    });

    expect(inserted).toBe(true);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('skips rules whose enabled predicate returns false', () => {
    const apply = mock(() => true);
    const enabled = mock(() => false);
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {}).configure({
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
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    } as any);

    insertText(editor, '*');

    expect(enabled).toHaveBeenCalledTimes(1);
    expect(apply).not.toHaveBeenCalled();
  });

  it('keeps terminal configure-time rules final over definition defaults', () => {
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('testPlugin', {
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertText',
              trigger: '*',
            }),
          ],
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

    expect(
      getPlateRuntime(editor).inputRules.plugins.testPlugin.rules
    ).toHaveLength(1);
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['*']
    ).toBeUndefined();
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger._
    ).toHaveLength(1);
  });

  it('provides lazy cached selection getters and the owning plugin to insertText resolve', () => {
    const apply = mock(() => true);
    const resolve = mock(
      ({ getBlockStartRange, getBlockStartText, plugin }) => {
        expect(plugin.name).toBe('h2');
        expect(getBlockStartRange()).toBe(getBlockStartRange());
        expect(getBlockStartText()).toBe('##');
        expect(getBlockStartText()).toBe('##');

        return true;
      }
    );
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('h2', {}).configure({
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
      initialValue: [{ children: [{ text: '##' }], type: 'paragraph' }],
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
        definePlatePlugin('testPlugin', {}).configure({
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
      initialValue: [{ children: [{ text: 'abc' }], type: 'paragraph' }],
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
        definePlatePlugin('alpha', {}).configure({
          inputRules: [first, second],
        }),
        definePlatePlugin('beta', {}).configure({
          inputRules: [high],
        }),
      ],
    });

    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['*'].map(
        (rule) => rule.id
      )
    ).toEqual(['beta.0', 'alpha.0', 'alpha.1']);
  });

  it('supports definition-side inputRules factories with owner-scoped helpers', () => {
    const BoldPlugin = definePlatePlugin('bold', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      inputRules: ({ rule }) => [
        rule.mark({
          end: '*',
          start: '**',
          trigger: '*',
        }),
      ],
    });
    const editor = createPlateEditor({
      plugins: [BoldPlugin],
      initialValue: [{ children: [{ text: '**hello*' }], type: 'paragraph' }],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 8, path: [0, 0] },
      focus: { offset: 8, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(getPlateRuntime(editor).inputRules.plugins.bold.rules).toHaveLength(
      1
    );
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['*']
    ).toHaveLength(1);
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['*'][0]?.plugin
    ).toBe(getCompiledPlatePlugin(editor, BoldPlugin));
    expect(editor.read.children()).toMatchObject([
      {
        children: [{ bold: true, text: 'hello' }],
        type: 'paragraph',
      },
    ]);
  });

  it('does not serialize unresolved mark plugin names', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlatePlugin('markRuleOwner', {
          inputRules: ({ rule }) => [
            rule.mark({
              end: '*',
              mark: 'missingMark',
              start: '**',
              trigger: '*',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '**hello*' }], type: 'paragraph' }],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 8, path: [0, 0] },
      focus: { offset: 8, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '**hello*' }], type: 'paragraph' },
    ]);
  });

  it('does not match non-adjacent closing mark delimiters', () => {
    const editor = createPlateEditor({
      plugins: [
        definePlatePlugin('bold', {
          inputRules: ({ rule }) => [
            rule.mark({
              end: '*',
              start: '**',
              trigger: '*',
            }),
          ],
        }),
      ],
      initialValue: [
        { children: [{ text: '**hello* nope' }], type: 'paragraph' },
      ],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 13, path: [0, 0] },
      focus: { offset: 13, path: [0, 0] },
    });
    insertText(editor, '*');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '**hello* nope*' }], type: 'paragraph' },
    ]);
  });

  it('supports definition-side blockFence helpers for match-triggered fences', () => {
    const apply = mock(() => true);
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlatePlugin('codeBlock', {
          inputRules: ({ rule }) => [
            rule.blockFence({
              apply,
              block: BaseParagraphPlugin,
              fence: '```',
              on: 'match',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '``' }], type: 'paragraph' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    insertText(editor, '`');

    expect(apply).toHaveBeenCalledTimes(1);
    expect(
      getPlateRuntime(editor).inputRules.plugins.codeBlock.rules
    ).toHaveLength(1);
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['`']
    ).toHaveLength(1);
  });

  it('registers configured match-triggered fences through createPlateEditor', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlatePlugin('codeBlock', {}).configure({
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertText',
              trigger: '`',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '``' }], type: 'paragraph' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });

    expect(
      getPlateRuntime(editor).inputRules.plugins.codeBlock.rules
    ).toHaveLength(1);
    expect(
      getPlateRuntime(editor).inputRules.insertText.byTrigger['`']
    ).toHaveLength(1);
  });

  it('registers configured break-triggered rules through createPlateEditor', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlatePlugin('equation', {}).configure({
          inputRules: [
            defineInputRule({
              apply: () => true,
              target: 'insertBreak',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '$$' }], type: 'paragraph' }],
    } as any);

    expect(
      getPlateRuntime(editor).inputRules.plugins.equation.rules
    ).toHaveLength(1);
    expect(getPlateRuntime(editor).inputRules.insertBreak).toContainEqual(
      expect.objectContaining({
        plugin: expect.objectContaining({ name: 'equation' }),
      })
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
        definePlatePlugin('blockquote', {
          schema: {
            element: {
              content: schema.content.group('block'),
            },
          },
        }).configure({
          inputRules: [blockquoteMarkdown({ marker: '|' })],
        }),
      ],
      initialValue: [{ children: [{ text: '|' }], type: 'paragraph' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    insertText(editor, ' ');

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
  });

  it('does not serialize unresolved block plugin names', () => {
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlatePlugin('blockRuleOwner', {
          inputRules: ({ rule }) => [
            rule.blockStart({
              match: '>',
              mode: 'set',
              node: 'missingBlock',
              trigger: ' ',
            }),
          ],
        }),
      ],
      initialValue: [{ children: [{ text: '>' }], type: 'paragraph' }],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
    insertText(editor, ' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '>' }], type: 'paragraph' },
    ]);
  });

  it('toggles block-start rules back to paragraph when active', () => {
    const HeadingPlugin = definePlatePlugin('h2', {
      schema: {
        element: {
          content: schema.content.open({ default: 'text', min: 1 }),
        },
      },
    });
    const headingMarkdown = createRuleFactory({
      type: 'blockStart',
      trigger: ' ',
      mode: 'toggle',
      match: '##',
      node: HeadingPlugin,
    });
    const editor = createPlateEditor({
      plugins: [
        BaseParagraphPlugin,
        HeadingPlugin.configure({
          inputRules: [headingMarkdown()],
        }),
      ],
      initialValue: [{ children: [{ text: '##' }], type: 'h2' }],
    } as any);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    insertText(editor, ' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('rejects boolean-map inputRules config', () => {
    expect(() =>
      createPlateEditor({
        plugins: [
          definePlatePlugin('testPlugin', {}).configure({
            inputRules: { markdown: true } as any,
          }),
        ],
      })
    ).toThrow(
      'inputRules must be an array of explicit rule instances or a factory.'
    );
  });
});
