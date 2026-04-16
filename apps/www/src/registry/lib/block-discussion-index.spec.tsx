/** @jsx jsxt */

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { jsxt } from '@platejs/test-utils';
import { describe, expect, it } from 'bun:test';
import { createSlateEditor, createSlatePlugin, KEYS } from 'platejs';

import {
  BLOCK_SUGGESTION_TOKEN,
  buildBlockDiscussionIndex,
} from './block-discussion-index';

jsxt;

const suggestionData = {
  createdAt: 1,
  id: '1',
  type: 'remove',
  userId: 'u1',
} as const;

const collectEntries = (editor: any) => {
  const entries: any[] = [];

  const visit = (node: any, path: number[]) => {
    entries.push([node, path]);

    if (!node || typeof node !== 'object' || !Array.isArray(node.children)) {
      return;
    }

    node.children.forEach((child: any, index: number) => {
      visit(child, [...path, index]);
    });
  };

  editor.children.forEach((child: any, index: number) => {
    visit(child, [index]);
  });

  return entries;
};

const getSuggestionData = (node: any) => node.suggestion_1;

const getSuggestionDataList = (node: any) =>
  Object.keys(node)
    .filter((key) => key.startsWith('suggestion_'))
    .map((key) => node[key]);

const getSuggestionId = (node: any) => node.suggestion_1?.id;

const MentionPlugin = createSlatePlugin({
  key: KEYS.mention,
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
});

const InlineEquationPlugin = createSlatePlugin({
  key: KEYS.inlineEquation,
  node: { isElement: true, isInline: true, isVoid: true },
});

const getResolvedSuggestions = (editor: any) =>
  buildBlockDiscussionIndex({
    discussions: [],
    entries: collectEntries(editor),
    getCommentId: () => {},
    getSuggestionData: (node: any) =>
      editor.getApi(BaseSuggestionPlugin).suggestion.suggestionData(node),
    getSuggestionDataList: (node: any) =>
      editor.getApi(BaseSuggestionPlugin).suggestion.dataList(node),
    getSuggestionId: (node: any) =>
      editor.getApi(BaseSuggestionPlugin).suggestion.nodeId(node),
    isBlockSuggestion: (node: any) =>
      editor.getApi(BaseSuggestionPlugin).suggestion.isBlockSuggestion(node),
  }).suggestionsByBlock.get('0') ?? [];

describe('buildBlockDiscussionIndex', () => {
  it('keeps inline void display text in remove summaries', () => {
    const input = (
      <editor>
        <hp>
          <htext suggestion suggestion_1={suggestionData}>
            dates like{' '}
          </htext>
          <hdate
            date="Mon Jan 15 2024"
            suggestion
            suggestion_1={suggestionData}
          >
            <htext />
          </hdate>
          <htext suggestion suggestion_1={suggestionData}>
            {' '}
            or use inline equations:{' '}
          </htext>
          <hinlineequation
            suggestion
            suggestion_1={suggestionData}
            texExpression="E = mc^2"
          >
            <htext />
          </hinlineequation>
        </hp>
      </editor>
    ) as any;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input),
      getCommentId: () => {},
      getSuggestionData,
      getSuggestionDataList,
      getSuggestionId,
      isBlockSuggestion: () => false,
    });

    const suggestion = index.suggestionsByBlock.get('0')?.[0];
    const expectedDate = new Date('Mon Jan 15 2024').toLocaleDateString(
      undefined,
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );

    expect(suggestion?.type).toBe('remove');
    expect(suggestion?.text).toBe(
      `dates like ${expectedDate} or use inline equations: E = mc^2`
    );
  });

  it('keeps mention values in remove summaries', () => {
    const input = (
      <editor>
        <hp>
          <htext suggestion suggestion_1={suggestionData}>
            Hello{' '}
          </htext>
          <hmention
            key="u1"
            suggestion
            suggestion_1={suggestionData}
            value="Ada"
          >
            <htext />
          </hmention>
          <htext suggestion suggestion_1={suggestionData}>
            !
          </htext>
        </hp>
      </editor>
    ) as any;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input),
      getCommentId: () => {},
      getSuggestionData,
      getSuggestionDataList,
      getSuggestionId,
      isBlockSuggestion: () => false,
    });

    const suggestion = index.suggestionsByBlock.get('0')?.[0];

    expect(suggestion?.type).toBe('remove');
    expect(suggestion?.text).toBe('Hello Ada!');
  });

  it('keeps inline link text in remove summaries', () => {
    const input = (
      <editor>
        <hp>
          <ha
            suggestion
            suggestion_1={suggestionData}
            url="https://example.com"
          >
            link
          </ha>
        </hp>
      </editor>
    ) as any;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input),
      getCommentId: () => {},
      getSuggestionData,
      getSuggestionDataList,
      getSuggestionId,
      isBlockSuggestion: () => false,
    });

    const suggestion = index.suggestionsByBlock.get('0')?.[0];

    expect(suggestion?.type).toBe('remove');
    expect(suggestion?.text).toBe('link');
  });

  it('uses the block label for block equation remove summaries', () => {
    const input = (
      <editor>
        <hequation
          suggestion={{ ...suggestionData }}
          texExpression="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}"
        >
          <htext />
        </hequation>
      </editor>
    ) as any;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input),
      getCommentId: () => {},
      getSuggestionData: (node: any) => node.suggestion,
      getSuggestionDataList,
      getSuggestionId: (node: any) => node.suggestion?.id,
      isBlockSuggestion: (node: any) => !!node.suggestion,
    });

    const suggestion = index.suggestionsByBlock.get('0')?.[0];

    expect(suggestion?.type).toBe('remove');
    expect(suggestion?.text).toBe(`${BLOCK_SUGGESTION_TOKEN}Equation`);
  });

  it.each([
    {
      createValue: () => (
        <editor>
          <hp>
            <htext>like </htext>
            <hmention key="u1" value="Alice">
              <htext />
            </hmention>
            <htext>,or</htext>
          </hp>
        </editor>
      ),
      expectedText: ' Alice',
      name: 'mention',
      plugins: [MentionPlugin],
    },
    {
      createValue: () => (
        <editor>
          <hp>
            <htext>equations: </htext>
            <hinlineequation texExpression="E = mc^2">
              <htext />
            </hinlineequation>
            <htext>.</htext>
          </hp>
        </editor>
      ),
      expectedText: ' E = mc^2',
      name: 'inline equation',
      plugins: [InlineEquationPlugin],
    },
  ])('keeps one remove suggestion when continuing backward deletion across $name', ({
    createValue,
    expectedText,
    plugins,
  }) => {
    const input = createValue() as any;

    const editor = createSlateEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: { currentUserId: 'u1' },
        }),
        ...plugins,
      ],
      selection: {
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      },
      value: input.children,
    });

    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteBackward('character');
    editor.tf.deleteBackward('character');

    const suggestions = getResolvedSuggestions(editor);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.type).toBe('remove');
    expect(suggestions[0]?.text).toBe(expectedText);
  });
});
