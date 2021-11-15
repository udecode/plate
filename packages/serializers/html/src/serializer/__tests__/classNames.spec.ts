import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createBoldPlugin } from '../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

it('serialize with slate className', () => {
  const editor = createPlateUIEditor({
    plugins: [createParagraphPlugin()],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<p class="slate-p">I am centered text!</p>');
});

it('serialize with slate classNames: a+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-p',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<p class="slate-p">I am centered text!</p>');
});

it('serialize with slate classNames: slate+b', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'slate-p b',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<p class="slate-p">I am centered text!</p>');
});

it('serialize with classNames: a+slate+b', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-p b',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<p class="slate-p">I am centered text!</p>');
});

it('serialize with classNames: a+slate+b+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-p b slate-cool',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
    })
  ).toBe('<p class="slate-p slate-cool">I am centered text!</p>');
});

it('serialize with slate classNames: multiple tags', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a slate-p b',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
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
    '<p class="slate-p">I am centered text!</p><p class="slate-p">I am centered text!</p>'
  );
});

it('serialize with custom preserved classname: a+custom', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a custom-align-center slate-p',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
      preserveClassNames: ['custom-'],
    })
  ).toBe('<p class="custom-align-center">I am centered text!</p>');
});

it('serialize nested with custom preserved classname: a+custom', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a custom-align-center slate-p',
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
    serializeHTMLFromNodes(editor, {
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
    '<p class="custom-align-center">I am <strong class="custom-bold">centered</strong> text!</p>'
  );
});

it('serialize with multiple custom classname: a+custom+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      createParagraphPlugin({
        props: {
          className: 'a custom-align-center slate-p',
        },
      }),
    ],
  });

  expect(
    serializeHTMLFromNodes(editor, {
      nodes: [
        {
          type: ELEMENT_PARAGRAPH,
          children: [{ text: 'I am centered text!' }],
        },
      ],
      preserveClassNames: ['custom-', 'slate-'],
    })
  ).toBe('<p class="custom-align-center slate-p">I am centered text!</p>');
});
