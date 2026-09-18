import { BaseBoldPlugin, createEditor, SelectionApi } from 'platejs';
import { MarkdownPlugin } from 'platejs/markdown';

import { getCommentBlocks, getCommentPrompt } from './getCommentPrompt';

test('the comment prompt contains only the selected rich second occurrence', () => {
  const editor = createEditor({
    plugins: [BaseBoldPlugin, MarkdownPlugin],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'repeat / ' },
          { text: 'repeat', bold: true },
          { text: ' outside' },
        ],
      },
    ],
    selection: SelectionApi.text({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 6 },
    }),
  });
  const original = editor.read.value();
  const prompt = getCommentPrompt(editor, {
    messages: [],
    refs: [{ path: [0], ref: 'b1' }],
  });

  expect(prompt.split('<context>')[1].split('</context>')[0].trim()).toBe(
    '<block ref="b1"><Selection>**repeat**</Selection></block>'
  );
  expect(editor.read.value()).toEqual(original);
});

test('comment clipping preserves nested inline structure and block properties', () => {
  const children = [
    {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          align: 'center',
          children: [
            { text: 'before ' },
            {
              type: 'link',
              url: 'https://platejs.org',
              children: [{ text: 'selected', bold: true }],
            },
            { text: ' after' },
          ],
        },
      ],
    },
  ];
  const original = structuredClone(children);
  expect(
    getCommentBlocks({
      children,
      refs: [{ path: [0, 0], ref: 'b1' }],
      selection: {
        anchor: { path: [0, 0, 1, 0], offset: 2 },
        focus: { path: [0, 0, 1, 0], offset: 6 },
      },
    })
  ).toEqual([
    {
      ref: 'b1',
      block: {
        type: 'paragraph',
        align: 'center',
        children: [
          {
            type: 'link',
            url: 'https://platejs.org',
            children: [{ text: 'lect', bold: true }],
          },
        ],
      },
    },
  ]);
  expect(children).toEqual(original);
});

test.each(['cursor', 'nodes'] as const)(
  'the comment prompt preserves the complete referenced blocks for %s selection',
  (mode) => {
    const editor = createEditor({
      plugins: [MarkdownPlugin],
      initialValue: ['Alpha', 'Gap', 'Beta'].map((text) => ({
        type: 'paragraph',
        children: [{ text }],
      })),
      selection:
        mode === 'nodes'
          ? SelectionApi.nodes([[0], [2]])
          : SelectionApi.text({
              anchor: { path: [1, 0], offset: 1 },
              focus: { path: [1, 0], offset: 1 },
            }),
    });
    const prompt = getCommentPrompt(editor, {
      messages: [],
      refs: (mode === 'nodes' ? [0, 2] : [0, 1, 2]).map((index) => ({
        path: [index],
        ref: `b${index + 1}`,
      })),
    });

    expect(prompt.split('<context>')[1].split('</context>')[0].trim()).toBe(
      [
        '<block ref="b1">Alpha</block>',
        ...(mode === 'nodes' ? [] : ['<block ref="b2">Gap</block>']),
        '<block ref="b3">Beta</block>',
      ].join('\n')
    );
  }
);
