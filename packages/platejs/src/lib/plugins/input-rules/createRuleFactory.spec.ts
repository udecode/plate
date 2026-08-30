import type { Range } from 'plitejs';

import { createEditor } from '../../editor';
import { defineBasePlugin } from '../../plugin';
import { createRuleFactory } from './createRuleFactory';
import type { InsertTextInputRule } from './types';

const resolveInsertTextRule = <TMatch>(
  rule: InsertTextInputRule<TMatch>,
  {
    blockText,
    name,
    range,
  }: {
    blockText: string;
    name: string;
    range: Range;
  }
) => {
  const editor = createEditor();
  const plugin = defineBasePlugin(name, {});
  let match: TMatch | undefined;

  editor.update((tx) => {
    match = rule.resolve?.({
      cause: 'insertText',
      editor,
      getBlockEntry: () => undefined,
      getBlockStartRange: () => range,
      getBlockStartText: () => blockText,
      getBlockTextBeforeSelection: () => blockText,
      getCharAfter: () => undefined,
      getCharBefore: () => undefined,
      insertText: () => {},
      isCollapsed: true,
      options: undefined,
      plugin,
      text: ' ',
      tx,
    });
  });

  return match;
};

describe('createRuleFactory', () => {
  it('keeps every rule family discriminated at runtime', () => {
    const mark = createRuleFactory({
      type: 'mark',
      start: '**',
      trigger: '*',
    })();
    const blockFence = createRuleFactory({
      type: 'blockFence',
      apply: () => {},
      fence: '```',
    })();
    const insertText = createRuleFactory({
      type: 'insertText',
      apply: () => {},
      trigger: '!',
    })();
    const insertBreak = createRuleFactory({
      type: 'insertBreak',
      apply: () => {},
    })();
    const insertData = createRuleFactory({
      type: 'insertData',
      apply: () => {},
      mimeTypes: ['text/plain'],
    })();
    const textSubstitution = createRuleFactory({
      type: 'textSubstitution',
      patterns: [{ format: '—', match: '--' }],
    })();

    expect(mark).toMatchObject({ target: 'insertText', trigger: '*' });
    expect(blockFence).toMatchObject({ target: 'insertText', trigger: '`' });
    expect(insertText).toMatchObject({
      target: 'insertText',
      trigger: '!',
    });
    expect(insertBreak).toMatchObject({ target: 'insertBreak' });
    expect(insertData).toMatchObject({
      mimeTypes: ['text/plain'],
      target: 'insertData',
    });
    expect(textSubstitution).toMatchObject({
      target: 'insertText',
      trigger: ['-'],
    });
  });

  it('binds a plugin owner without changing rule factory behavior', () => {
    const plugin = defineBasePlugin('blockquote', {});
    const editor = createEditor({ plugins: [plugin] });
    const rule = createRuleFactory(plugin)<{}, { marker: string }>({
      type: 'blockStart',
      marker: '>',
      trigger: ' ',
      match: ({ marker }) => marker,
    })();
    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    let match: ReturnType<NonNullable<typeof rule.resolve>>;

    editor.update((tx) => {
      match = rule.resolve?.({
        cause: 'insertText',
        editor,
        getBlockEntry: () => undefined,
        getBlockStartRange: () => range,
        getBlockStartText: () => '>',
        getBlockTextBeforeSelection: () => '>',
        getCharAfter: () => undefined,
        getCharBefore: () => undefined,
        insertText: () => {},
        isCollapsed: true,
        options: undefined,
        plugin,
        text: ' ',
        tx,
      });
    });

    expect(match).toEqual({ range, text: '>' });
  });

  it('passes config defaults into block-start match resolvers when no public options are provided', () => {
    const rule = createRuleFactory<{}, { marker: string }>({
      type: 'blockStart',
      marker: '>',
      trigger: ' ',
      match: ({ marker }) => marker,
    })();

    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    const match = resolveInsertTextRule(rule, {
      blockText: '>',
      name: 'blockquote',
      range,
    });

    expect(match).toEqual({ range, text: '>' });
  });

  it('merges base block-start match data with custom resolveMatch extras', () => {
    const rule = createRuleFactory<{}, {}, { start: number }>({
      type: 'blockStart',
      trigger: ' ',
      match: /^(\d+)\.$/,
      resolveMatch: ({ match }) => ({
        start: Number((match as RegExpMatchArray)[1]),
      }),
    })();

    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    const match = resolveInsertTextRule(rule, {
      blockText: '3.',
      name: 'list',
      range,
    });

    expect(match).toEqual({ range, start: 3, text: '3.' });
  });
});
