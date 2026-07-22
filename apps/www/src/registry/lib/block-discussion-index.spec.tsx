/** @jsx jsxt */

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { jsxt, type TestEditorFixture } from '@platejs/test-utils';
import { describe, expect, it } from 'bun:test';
import {
  type BaseEditor,
  type Element,
  type Node,
  type NodeEntry,
  type TCommentText,
  type Text,
  createBaseEditor,
  createBasePlugin,
  ElementApi,
  KEYS,
  NODES,
  property,
} from 'platejs';

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

type DiscussionEntry = NodeEntry<Element | TCommentText>;

const collectEntries = (children: readonly Element[]) => {
  const entries: DiscussionEntry[] = [];

  const visit = (node: Element | TCommentText, path: number[]) => {
    entries.push([node, path]);

    if (!ElementApi.isElement(node)) return;

    node.children.forEach((child, index) => {
      visit(child, [...path, index]);
    });
  };

  children.forEach((child, index) => {
    visit(child, [index]);
  });

  return entries;
};

const getSuggestionData = (node: Node) =>
  'suggestion_1' in node
    ? (node.suggestion_1 as typeof suggestionData | undefined)
    : undefined;

const getSuggestionDataList = (node: Text) =>
  Object.keys(node)
    .filter((key) => key.startsWith('suggestion_'))
    .map((key) => node[key] as typeof suggestionData);

const getSuggestionId = (node: Node) => getSuggestionData(node)?.id;

const getBlockSuggestionData = (node: Node) =>
  ElementApi.isElement(node)
    ? (node.suggestion as typeof suggestionData | undefined)
    : undefined;

const MentionPlugin = createBasePlugin({
  key: KEYS.mention,
  schema: {
    element: {
      inline: true,
      properties: {
        key: property.string(),
        value: property.string(),
      },
      void: 'markable-inline',
    },
  },
});

const InlineEquationPlugin = createBasePlugin({
  key: KEYS.inlineEquation,
  schema: {
    element: {
      inline: true,
      properties: { texExpression: property.string() },
      void: 'inline',
    },
  },
  type: NODES.inlineEquation,
});

const getResolvedSuggestions = (editor: BaseEditor) => {
  const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;

  return (
    buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(editor.read.children()),
      getCommentId: () => {},
      getSuggestionData: (node) => suggestionApi.suggestionData(node),
      getSuggestionDataList: (node) => suggestionApi.dataList(node),
      getSuggestionId: (node) => suggestionApi.nodeId(node),
      isBlockSuggestion: (node) => suggestionApi.isBlockSuggestion(node),
    }).suggestionsByBlock.get('0') ?? []
  );
};

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
    ) as TestEditorFixture;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input.children),
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
    ) as TestEditorFixture;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input.children),
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
    ) as TestEditorFixture;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input.children),
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
    ) as TestEditorFixture;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input.children),
      getCommentId: () => {},
      getSuggestionData: getBlockSuggestionData,
      getSuggestionDataList,
      getSuggestionId: (node) => getBlockSuggestionData(node)?.id,
      isBlockSuggestion: (node) => !!getBlockSuggestionData(node),
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
    const input = createValue() as TestEditorFixture;

    const editor = createBaseEditor({
      plugins: [
        BaseSuggestionPlugin.configure({
          options: { currentUserId: 'u1' },
        }),
        ...plugins,
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 2], offset: 0 },
        focus: { path: [0, 2], offset: 0 },
      },
      value: input.children,
    });

    editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

    editor.update.text.deleteBackward({ unit: 'character' });
    editor.update.text.deleteBackward({ unit: 'character' });

    const suggestions = getResolvedSuggestions(editor);

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.type).toBe('remove');
    expect(suggestions[0]?.text).toBe(expectedText);
  });
});
