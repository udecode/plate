import type { Range } from '@platejs/plite';

import { createBaseEditor } from '../../editor';
import { createRuleFactory } from './createRuleFactory';
import type { BlockStartInputRuleMatch, InsertTextInputRule } from './types';

const resolveInsertTextRule = <TMatch>(
  rule: InsertTextInputRule<TMatch>,
  {
    blockText,
    pluginKey,
    range,
  }: {
    blockText: string;
    pluginKey: string;
    range: Range;
  }
) => {
  const editor = createBaseEditor();
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
      pluginKey,
      text: ' ',
      tx,
    });
  });

  return match;
};

describe('createRuleFactory', () => {
  it('passes config defaults into block-start match resolvers when no public options are provided', () => {
    const rule = createRuleFactory<{}, { marker: string }>({
      type: 'blockStart',
      marker: '>',
      trigger: ' ',
      match: ({ marker }) => marker,
    })() as InsertTextInputRule<BlockStartInputRuleMatch>;

    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };

    const match = resolveInsertTextRule(rule, {
      blockText: '>',
      pluginKey: 'blockquote',
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
    })() as InsertTextInputRule<BlockStartInputRuleMatch & { start: number }>;

    const range = {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    };

    const match = resolveInsertTextRule(rule, {
      blockText: '3.',
      pluginKey: 'list',
      range,
    });

    expect(match).toEqual({ range, start: 3, text: '3.' });
  });
});
