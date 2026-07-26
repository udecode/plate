/** @jsx jsxt */

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { ElementApi, property, TextApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import {
  KEYS,
  type TSuggestionData,
  type TSuggestionElement,
  type TUpdateSuggestionData,
} from '@platejs/utils';

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    options: {
      currentUserId: 'testId',
    },
  });

  const BoldPlugin = createBasePlugin({
    key: 'bold',
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  const ItalicPlugin = createBasePlugin({
    key: 'italic',
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('editor.update.suggestion.addMark', () => {
    it('add mark with suggestion data', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            test
            <focus />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.add('bold', true);

      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(
          editor.read.children()[0].children[0] as any
        ) as TUpdateSuggestionData;

      expect(editor.read.children()[0].children[0].bold).toBe(true);
      expect(
        editor.read.children()[0].children[0][BaseSuggestionPlugin.key]
      ).toBe(true);
      expect(data).toBeDefined();
      expect(data?.type).toBe('update');
      expect(data?.userId).toBe('testId');
      expect(data?.newProperties).toEqual({ bold: true });
      expect(typeof data?.createdAt).toBe('number');
      expect(typeof data?.id).toBe('string');
    });

    it('tracks a mark added through the semantic toggle command', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            test
            <focus />
          </hp>
        </editor>
      ) as any;
      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.toggle('bold', true);

      const node = editor.read.children()[0].children[0] as any;
      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(node) as TUpdateSuggestionData;

      expect(node.bold).toBe(true);
      expect(data.newProperties).toEqual({ bold: true });
    });

    it('add new suggestion mark while preserving existing suggestion mark', () => {
      const existingData = {
        id: '1',
        createdAt: Date.now(),
        newProperties: { bold: true },
        type: 'update' as const,
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext suggestion_1={existingData} suggestion>
              te
              <anchor />
              st
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.add('italic', true);

      const dataList = editor
        .plugin(BaseSuggestionPlugin)
        .api.dataList(
          editor.read.children()[0].children[1] as any
        ) as TUpdateSuggestionData[];

      expect(dataList).toHaveLength(2);
      expect(dataList[0]).toEqual(existingData);
      expect(dataList[1].type).toBe('update');
      expect(dataList[1].newProperties).toEqual({ italic: true });
      expect(dataList[1].id !== existingData.id).toBeTruthy();
      // expect(dataList[1].createdAt !== existingData.createdAt).toBeTruthy();
    });

    it('skips nodes already marked by a non-update suggestion', () => {
      const existingData = {
        createdAt: Date.now(),
        id: '1',
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext suggestion_1={existingData as any} suggestion>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.add('bold', true);

      const node = editor.read.children()[0].children[0] as any;

      expect(node.bold).toBeUndefined();
      expect(editor.plugin(BaseSuggestionPlugin).api.dataList(node)).toEqual([
        existingData,
      ] as any);
    });
  });
}

{
  const suggestionPlugin = BaseSuggestionPlugin.configure({
    options: {
      currentUserId: 'alice',
    },
  });

  const createSuggestionText = ({
    id = 's1',
    text = '',
    type = 'insert',
  }: {
    id?: string;
    text?: string;
    type?: 'insert' | 'remove';
  } = {}) => ({
    [KEYS.suggestion]: true,
    [`${KEYS.suggestion}_${id}`]: {
      id,
      createdAt: 1,
      type,
      userId: 'alice',
    },
    text,
  });

  describe('editor.update.suggestion.delete', () => {
    it('removes empty inserted block suggestions instead of converting them to remove suggestions', () => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [
          {
            children: [createSuggestionText()],
            type: 'p',
          },
          {
            children: [{ text: 'next' }],
            type: 'p',
          },
        ],
      });

      editor.update.suggestion.delete({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [{ text: 'next' }],
          type: 'p',
        },
      ]);
    });

    it('deletes inline inserted text directly instead of wrapping it in a remove suggestion', () => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [
          {
            children: [createSuggestionText({ text: 'x' })],
            type: 'p',
          },
        ],
      });

      editor.update.suggestion.delete({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });

      expect(editor.read.children()).toEqual([
        {
          children: [
            {
              [KEYS.suggestion]: true,
              [`${KEYS.suggestion}_s1`]: {
                id: 's1',
                createdAt: 1,
                type: 'insert',
                userId: 'alice',
              },
              text: '',
            },
          ],
          type: 'p',
        },
      ]);
    });

    it('stops cleanly when deletion would cross blocks without a previous block element', () => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
        },
        initialValue: [
          {
            children: [{ text: 'one' }],
            type: 'p',
          },
          {
            children: [{ text: 'two' }],
            type: 'p',
          },
        ],
      });

      expect(() =>
        editor.update.suggestion.delete({
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [0, 0] },
        })
      ).not.toThrow();
    });
  });
}

{
  const suggestionPlugin = BaseSuggestionPlugin.configure({
    options: { currentUserId: 'user-1' },
  });

  describe('editor.update.suggestion.insertFragment', () => {
    it('rewrites fragment nodes with the active insert suggestion metadata', () => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: '' }], type: 'p' }],
      });
      const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;
      const fragment = [
        {
          [KEYS.suggestion]: true,
          [suggestionApi.key('other-user')]: { id: 'other-user' },
          text: 'text',
        },
        {
          children: [{ text: '' }],
          type: 'p',
        },
      ];

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.suggestion.insertFragment(fragment);

      const suggestionNodes = editor.plugin(BaseSuggestionPlugin).api.nodes();
      const inline = suggestionNodes.find(([node]) =>
        TextApi.isText(node)
      )?.[0];
      const block = suggestionNodes.find(([node]) =>
        ElementApi.isElement(node)
      )?.[0];

      expect(inline && TextApi.isText(inline)).toBe(true);
      expect(block && ElementApi.isElement(block)).toBe(true);

      const inlineData =
        inline && TextApi.isText(inline)
          ? suggestionApi.inlineData(inline)
          : undefined;
      const blockSuggestion = block?.[KEYS.suggestion];

      expect(fragment[0]).toHaveProperty(suggestionApi.key('other-user'));
      expect(inlineData).toMatchObject({
        type: 'insert',
        userId: 'user-1',
      });
      expect(blockSuggestion).toMatchObject({
        id: inlineData?.id,
        type: 'insert',
        userId: 'user-1',
      });
      expect(suggestionNodes).toHaveLength(2);
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    options: {
      currentUserId: 'testId',
    },
  });

  const BoldPlugin = createBasePlugin({
    key: 'bold',
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  const ItalicPlugin = createBasePlugin({
    key: 'italic',
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  });

  describe('editor.update.suggestion.removeMark', () => {
    it('remove mark with suggestion data', () => {
      const input = (
        <editor>
          <hp>
            <htext bold>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.remove('bold');

      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(
          editor.read.children()[0].children[0] as any
        ) as TUpdateSuggestionData;

      expect(editor.read.children()[0].children[0].bold).toBeUndefined();
      expect(
        editor.read.children()[0].children[0][BaseSuggestionPlugin.key]
      ).toBe(true);
      expect(data).toBeDefined();
      expect(data?.type).toBe('update');
      expect(data?.userId).toBe('testId');
      expect(data?.properties).toEqual({ bold: true });
      expect(typeof data?.createdAt).toBe('number');
      expect(typeof data?.id).toBe('string');
    });

    it('tracks a mark removed through the semantic toggle command', () => {
      const input = (
        <editor>
          <hp>
            <htext bold>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;
      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.toggle('bold', true);

      const node = editor.read.children()[0].children[0] as any;
      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(node) as TUpdateSuggestionData;

      expect(node.bold).toBeUndefined();
      expect(data.properties).toEqual({ bold: true });
    });

    it('add new suggestion mark while preserving existing suggestion mark', () => {
      const existingData = {
        id: '1',
        createdAt: Date.now(),
        properties: { italic: true },
        type: 'update' as const,
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext suggestion_1={existingData} bold italic suggestion>
              te
              <anchor />
              st
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.remove('bold');

      const dataList = editor
        .plugin(BaseSuggestionPlugin)
        .api.dataList(
          editor.read.children()[0].children[0] as any
        ) as TUpdateSuggestionData[];

      expect(dataList).toHaveLength(2);
      expect(dataList[0]).toEqual(existingData);
      expect(dataList[1].type).toBe('update');
      expect(dataList[1].properties).toEqual({ bold: true });
      expect(dataList[1].id !== existingData.id).toBeTruthy();
      // expect(dataList[1].createdAt !== existingData.createdAt).toBeTruthy();
    });

    it('skips nodes already marked by a non-update suggestion', () => {
      const existingData = {
        createdAt: Date.now(),
        id: '1',
        type: 'insert',
        userId: 'testId',
      };

      const input = (
        <editor>
          <hp>
            <htext bold suggestion_1={existingData as any} suggestion>
              <anchor />
              test
              <focus />
            </htext>
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin, BoldPlugin, ItalicPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);
      editor.update.marks.remove('bold');

      const node = editor.read.children()[0].children[0] as any;

      expect(node.bold).toBe(true);
      expect(editor.plugin(BaseSuggestionPlugin).api.dataList(node)).toEqual([
        existingData,
      ] as any);
    });
  });
}

// biome-ignore lint/complexity/noUselessLoneBlockStatements: keeps each merged test source isolated.
{
  describe('editor.update.suggestion.removeNodes', () => {
    it('does nothing for an empty node list', () => {
      const editor = createBaseEditor({
        plugins: [BaseSuggestionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [{ type: 'p', children: [{ text: 'one' }] }],
      });

      editor.update.suggestion.removeNodes([]);

      expect(editor.read.children()).toEqual([
        { ...editor.read.children()[0] },
      ]);
    });

    it('reuses one removal id and timestamp across every marked node', () => {
      const editor = createBaseEditor({
        plugins: [
          BaseSuggestionPlugin.configure({
            options: {
              currentUserId: 'user-1',
            },
          }),
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        initialValue: [
          { type: 'p', children: [{ text: 'one' }] },
          { type: 'p', children: [{ text: 'two' }] },
        ],
      });

      const nodes = [
        [editor.read.children()[0], [0]],
        [editor.read.children()[1], [1]],
      ] as any;

      editor.update.suggestion.removeNodes(nodes);

      const firstSuggestion = (editor.read.children()[0] as any).suggestion;
      const secondSuggestion = (editor.read.children()[1] as any).suggestion;

      expect(firstSuggestion).toMatchObject({
        type: 'remove',
        userId: 'user-1',
      });
      expect(secondSuggestion).toMatchObject({
        type: 'remove',
        userId: 'user-1',
      });
      expect(firstSuggestion.id).toBe(secondSuggestion.id);
      expect(firstSuggestion.createdAt).toBe(secondSuggestion.createdAt);
    });
  });
}

{
  const suggestionPlugin = BaseSuggestionPlugin.configure({
    options: { currentUserId: 'user-1' },
  });

  const MentionPlugin = createBasePlugin({
    key: KEYS.mention,
    schema: {
      element: {
        inline: true,
        properties: {
          value: property.string(),
        },
        void: 'markable-inline',
      },
    },
  });

  describe('editor.update.suggestion.setNodes', () => {
    it('marks the selection and each inline node with shared suggestion metadata', () => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin, MentionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 2] },
        },
        initialValue: [
          {
            children: [
              { text: 'ab ' },
              { children: [{ text: '' }], type: KEYS.mention, value: 'Ada' },
              { text: ' cd' },
            ],
            type: 'p',
          },
        ],
      });

      editor.update.suggestion.setNodes({
        createdAt: 123,
        suggestionId: 's-1',
      });

      const children = editor.read.children()[0].children;
      const markedTextNodes = children.filter(
        (node) =>
          TextApi.isText(node) &&
          editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.id === 's-1'
      );
      const mentionNode = children.find(
        (node) => 'type' in node && node.type === KEYS.mention
      );
      const mentionData =
        mentionNode &&
        editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionNode);
      const mentionChild =
        mentionNode && ElementApi.isElement(mentionNode)
          ? mentionNode.children[0]
          : undefined;

      expect(markedTextNodes.map((node) => node.text)).toEqual(['b ', ' ']);
      expect(mentionData).toMatchObject({
        createdAt: 123,
        id: 's-1',
        type: 'remove',
        userId: 'user-1',
      });
      expect(
        mentionChild &&
          editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionChild)
      ).toBeUndefined();
    });

    it('can skip marking outer inline elements', () => {
      const editor = createBaseEditor({
        plugins: [suggestionPlugin, MentionPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        initialValue: [
          {
            children: [
              { text: 'abc' },
              { children: [{ text: '' }], type: KEYS.mention, value: 'Ada' },
            ],
            type: 'p',
          },
        ],
      });

      editor.update.suggestion.setNodes({
        createdAt: 123,
        includeInlineElements: false,
        suggestionId: 's-1',
      });

      const children = editor.read.children()[0].children;
      const markedTextNode = children.find(
        (node) =>
          editor.plugin(BaseSuggestionPlugin).api.inlineData(node)?.id === 's-1'
      );
      const mentionNode = children.find(
        (node) => 'type' in node && node.type === KEYS.mention
      );

      expect(markedTextNode?.text).toBe('b');
      expect(
        mentionNode &&
          editor.plugin(BaseSuggestionPlugin).api.inlineData(mentionNode)
      ).toBeUndefined();
    });
  });
}

{
  jsxt;

  const suggestionPlugin = BaseSuggestionPlugin.configure({
    options: {
      currentUserId: 'testId',
    },
  });

  const testLineBreakDataInsert = {
    id: '1',
    createdAt: Date.now(),
    isLineBreak: true,
    type: 'insert',
    userId: 'testId',
  };

  const testLineBreakDataRemove = {
    id: '2',
    createdAt: Date.now(),
    type: 'remove',
    userId: 'testId',
  };

  describe('insertBreakSuggestion when isSuggesting is true', () => {
    it('add insertBreakData and split node', () => {
      const input = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.break.insert();

      const data = editor.read.children()[0][
        BaseSuggestionPlugin.key
      ] as TSuggestionData;

      expect(editor.read.children()).toHaveLength(2);
      expect(data).toBeDefined();
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.type).toBe('insert');
      expect(data.userId).toBe('testId');
    });

    it('does not add new suggestion id if the previous node is a line break', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataInsert}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.insert('1');

      const data = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(editor.read.children()[1].children[0] as any);

      expect(data).toBeDefined();
      expect(data?.id === testLineBreakDataInsert.id).toBeTruthy();
      expect(
        data?.createdAt === testLineBreakDataInsert.createdAt
      ).toBeTruthy();
      expect(data?.type === testLineBreakDataInsert.type).toBeTruthy();
      expect(data?.userId === testLineBreakDataInsert.userId).toBeTruthy();
    });

    it('remove the lineBreak when type is insert', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataInsert}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('does not remove the lineBreak when type is remove', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataRemove}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp suggestion={testLineBreakDataRemove}>
            test1
            <cursor />
          </hp>
          <hp>test2</hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('reuses the same suggestion id when removing across blocks', () => {
      const input = (
        <editor>
          <hp>test1</hp>
          <hp>
            test2
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', true);

      editor.update.text.deleteBackward({ unit: 'line' });
      editor.update.text.deleteBackward({ unit: 'character' });

      const lineBreakData = editor
        .plugin(BaseSuggestionPlugin)
        .api.isBlockSuggestion(editor.read.children()[0] as any)
        ? (editor.read.children()[0].suggestion as TSuggestionElement)
        : undefined;

      const suggestionTextData = editor
        .plugin(BaseSuggestionPlugin)
        .api.inlineData(editor.read.children()[1].children[0] as any);

      expect(lineBreakData).toBeDefined();
      expect(suggestionTextData).toBeDefined();
      expect(lineBreakData?.id === suggestionTextData?.id).toBeTruthy();
      expect(editor.read.children()[1].children[0].text).toBe('test2');
    });
  });

  describe('insertBreakSuggestion when isSuggesting is false', () => {
    it('remove the lineBreak when type is insert', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataInsert}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', false);

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('remove the lineBreak when type is remove', () => {
      const input = (
        <editor>
          <hp suggestion={testLineBreakDataRemove}>test1</hp>
          <hp>
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            test1
            <cursor />
            test2
          </hp>
        </editor>
      ) as any;

      const editor = createBaseEditor({
        plugins: [suggestionPlugin],
        selection: input.selection,
        initialValue: input.children,
      });

      editor.plugin(BaseSuggestionPlugin).setOption('isSuggesting', false);

      editor.update.text.deleteBackward();

      expect(editor.read.children()).toEqual(output.children);
    });
  });
}
