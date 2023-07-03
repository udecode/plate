import { serializeHtml } from '@/packages/serializer-html/src/serializeHtml';
import { createPlateUIEditor } from '@/plate/create-plate-ui-editor';
import {
  ELEMENT_PARAGRAPH,
  createBoldPlugin,
  createParagraphPlugin,
} from '@udecode/plate';

it('serialize with slate className', () => {
  const editor = createPlateUIEditor({
    plugins: [createParagraphPlugin()],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<div class="slate-p">I am centered text!</div>');
});

it('serialize with slate classNames: a+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-test',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<div class="slate-p slate-test">I am centered text!</div>');
});

it('serialize with slate classNames: slate+b', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'slate-test b',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<div class="slate-p slate-test">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-test b',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<div class="slate-p slate-test">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-test b slate-cool',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<div class="slate-p slate-test slate-cool">I am centered text!</div>'
  );
});

it('serialize with slate classNames: multiple tags', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-test b',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe(
    '<div class="slate-p slate-test">I am centered text!</div><div class="slate-p slate-test">I am centered text!</div>'
  );
});

it('serialize with custom preserved classname: a+custom', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a custom-align-center slate-test',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
      preserveClassNames: ['custom-'],
    })
  ).toBe('<div class="custom-align-center">I am centered text!</div>');
});

it('serialize nested with custom preserved classname: a+custom', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a custom-align-center slate-test',
        },
      }),
      createBoldPlugin({
        props: {
          className: 'custom-bold',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [
            { text: 'I am ' },
            { text: 'centered', bold: true },
            { text: ' text!' },
          ],
        },
      ],
      preserveClassNames: ['custom-'],
    })
  ).toBe(
    '<div class="custom-align-center">I am <strong class="custom-bold">centered</strong> text!</div>'
  );
});

it('serialize with multiple custom classname: a+custom+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a custom-align-center slate-test',
        },
      }),
    ],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
      preserveClassNames: ['custom-', 'slate-'],
    })
  ).toBe(
    '<div class="slate-p custom-align-center slate-test">I am centered text!</div>'
  );
});
