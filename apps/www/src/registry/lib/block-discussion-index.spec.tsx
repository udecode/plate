/** @jsx jsxt */

import { describe, expect, it } from 'bun:test';

import { BaseCommentPlugin } from '@platejs/comment';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { jsxt, type TestEditorFixture } from '@platejs/test-utils';
import {
  PLUGINS,
  type BaseEditor,
  type Element,
  type Node,
  type NodeEntry,
  type NodeKey,
  type Text,
  createBaseEditor,
  defineBasePlugin,
  ElementApi,
  property,
  schema,
} from 'platejs';
import type { PlateEditor } from 'platejs/react';

import {
  BLOCK_SUGGESTION_TOKEN,
  buildBlockDiscussionIndex,
  sameBlockDiscussionSelection,
  shouldRefreshBlockDiscussionIndex,
} from './block-discussion-index';

jsxt;

const suggestionData = {
  createdAt: 1,
  id: '1',
  type: 'remove',
  userId: 'u1',
} as const;

type DiscussionEntry = NodeEntry<Element | Text>;

const collectEntries = (children: readonly Element[]) => {
  const entries: DiscussionEntry[] = [];

  const visit = (node: Element | Text, path: number[]) => {
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
const getSuggestionKey = (id: string) => `suggestion_${id}`;

const getBlockSuggestionData = (node: Node) =>
  ElementApi.isElement(node)
    ? (node.suggestion as typeof suggestionData | undefined)
    : undefined;

const MentionPlugin = defineBasePlugin(PLUGINS.mention, {
  schema: {
    element: {
      inline: true,
      properties: {
        label: property.string(),
        ref: property.string({ required: true }),
      },
      void: 'markable-inline',
    },
  },
});

const InlineEquationPlugin = defineBasePlugin(PLUGINS.inlineEquation, {
  schema: {
    element: {
      inline: true,
      properties: { latex: property.string() },
      void: 'inline',
    },
  },
});

const ParagraphPlugin = defineBasePlugin('p', {
  schema: { element: schema.element.textBlock() },
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
      getSuggestionId: (node) => suggestionApi.id(node),
      getSuggestionKey: (id) => suggestionApi.key(id),
      isBlockSuggestion: (node) => suggestionApi.isBlockSuggestion(node),
      isDate: (node) => node.type === PLUGINS.date,
      isInlineEquation: (node) => {
        const inlineEquation = editor.plugin(InlineEquationPlugin);

        return (
          inlineEquation.installed && node.type === inlineEquation.schema.type
        );
      },
    }).suggestionsByBlock.get('0') ?? []
  );
};

describe('shouldRefreshBlockDiscussionIndex', () => {
  const createEditor = (text: Text) =>
    createBaseEditor({
      plugins: [BaseCommentPlugin, BaseSuggestionPlugin, ParagraphPlugin],
      initialValue: [{ type: 'p', children: [text] }],
    }) as unknown as PlateEditor;

  it('ignores plain text typing', () => {
    const editor = createEditor({ text: 'body' });

    editor.update.text.insert('!', { at: { path: [0, 0], offset: 4 } });

    expect(shouldRefreshBlockDiscussionIndex(editor.read.lastCommit()!)).toBe(
      false
    );
  });

  it('refreshes text typing inside a suggestion', () => {
    const editor = createEditor({
      suggestion: true,
      suggestion_1: suggestionData,
      text: 'body',
    });

    editor.update.text.insert('!', { at: { path: [0, 0], offset: 4 } });

    expect(shouldRefreshBlockDiscussionIndex(editor.read.lastCommit()!)).toBe(
      true
    );
  });
});

describe('sameBlockDiscussionSelection', () => {
  it('keeps empty blocks stable across structural path shifts', () => {
    const empty = {
      contentKey: '',
      hasDraftComment: false,
      isTopLevelBlock: true,
      resolvedDiscussions: [],
      resolvedSuggestions: [],
    } as const;

    expect(sameBlockDiscussionSelection(empty, { ...empty })).toBe(true);
  });
});

describe('buildBlockDiscussionIndex', () => {
  it('indexes block discussions by stable node key instead of numeric path', () => {
    const input = (
      <editor>
        <hp>
          <htext suggestion suggestion_1={suggestionData}>
            body
          </htext>
        </hp>
      </editor>
    ) as TestEditorFixture;
    const block = input.children[0];
    const blockNodeKey = 'runtime:block' as NodeKey;
    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input.children),
      getBlockNodeKey: (node) => {
        expect(node).toBe(block);

        return blockNodeKey;
      },
      getCommentId: () => {},
      getSuggestionData,
      getSuggestionDataList,
      getSuggestionId,
      getSuggestionKey,
      isBlockSuggestion: () => false,
    });

    expect(index.topLevelNodeKeys.has(blockNodeKey)).toBe(true);
    expect(index.suggestionsByNodeKey.get(blockNodeKey)?.[0]?.text).toBe(
      'body'
    );
  });

  it('keeps inline void display text in remove summaries', () => {
    const input = (
      <editor>
        <hp>
          <htext suggestion suggestion_1={suggestionData}>
            dates like{' '}
          </htext>
          <hdate
            suggestion
            suggestion_1={suggestionData}
            value="Mon Jan 15 2024"
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
            latex="E = mc^2"
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
      getSuggestionKey,
      isDate: (node) => node.type === 'date',
      isInlineEquation: (node) => node.type === 'inlineEquation',
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

  it('preserves authored date text in remove summaries', () => {
    const input = (
      <editor>
        <hp>
          <hdate
            suggestion
            suggestion_1={suggestionData}
            value="sometime next week"
          >
            <htext />
          </hdate>
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
      getSuggestionKey,
      isBlockSuggestion: () => false,
      isDate: (node) => node.type === 'date',
    });

    expect(index.suggestionsByBlock.get('0')?.[0]?.text).toBe(
      'sometime next week'
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
      getSuggestionKey,
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
      getSuggestionKey,
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
          latex="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}"
        >
          <htext />
        </hequation>
      </editor>
    ) as TestEditorFixture;

    const index = buildBlockDiscussionIndex({
      discussions: [],
      entries: collectEntries(input.children),
      getCommentId: () => {},
      getBlockLabel: () => 'Equation',
      getSuggestionData: getBlockSuggestionData,
      getSuggestionDataList,
      getSuggestionId: (node) => getBlockSuggestionData(node)?.id,
      getSuggestionKey,
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
            <hmention label="Alice" ref="u1">
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
            <hinlineequation latex="E = mc^2">
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
  ])(
    'keeps one remove suggestion when continuing backward deletion across $name',
    ({ createValue, expectedText, plugins }) => {
      const input = createValue() as TestEditorFixture;

      const editor = createBaseEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            initialState: { currentUserId: 'u1' },
          }),
          ...plugins,
        ],
        selection: {
          kind: 'text',
          anchor: { path: [0, 2], offset: 0 },
          focus: { path: [0, 2], offset: 0 },
        },
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

      editor.update.text.deleteBackward({ unit: 'character' });
      editor.update.text.deleteBackward({ unit: 'character' });

      const suggestions = getResolvedSuggestions(editor);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]?.type).toBe('remove');
      expect(suggestions[0]?.text).toBe(expectedText);
    }
  );
});
