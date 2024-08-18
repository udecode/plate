import { BoldPlugin, ParagraphPlugin } from '@udecode/plate';

import { serializeHtml } from '../../react/serializeHtml';
import { createPlateUIEditor } from '../create-plate-ui-editor';

it('serialize with slate className', () => {
  const editor = createPlateUIEditor({
    plugins: [ParagraphPlugin],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe('<div class="slate-p">I am centered text!</div>');
});

it('serialize with without modifying content', () => {
  const editor = createPlateUIEditor({
    plugins: [ParagraphPlugin],
  });

  expect(
    serializeHtml(editor, {
      nodes: [
        {
          children: [{ text: 'I am class="preserved" text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe('<div class="slate-p">I am class=&quot;preserved&quot; text!</div>');
});

it('serialize with slate classNames: a+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe('<div class="slate-p slate-test">I am centered text!</div>');
});

it('serialize with slate classNames: slate+b', () => {
  const editor = createPlateUIEditor({
    plugins: [
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe('<div class="slate-p slate-test">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b', () => {
  const editor = createPlateUIEditor({
    plugins: [
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
    })
  ).toBe('<div class="slate-p slate-test">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b+slate', () => {
  const editor = createPlateUIEditor({
    plugins: [
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
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
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
        {
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
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
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
      preserveClassNames: ['custom-'],
    })
  ).toBe('<div class="custom-align-center">I am centered text!</div>');
});

it('serialize without preserving classnames', () => {
  const editor = createPlateUIEditor({
    plugins: [
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
      preserveClassNames: [],
    })
  ).toBe('<div>I am centered text!</div>');
});

it('serialize nested with custom preserved classname: a+custom', () => {
  const editor = createPlateUIEditor({
    plugins: [
      ParagraphPlugin.extend({
        props: {
          className: 'a custom-align-center slate-test',
        },
      }),
      BoldPlugin.extend({
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
          children: [
            { text: 'I am ' },
            { bold: true, text: 'centered' },
            { text: ' text!' },
          ],
          type: ParagraphPlugin.key,
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
      ParagraphPlugin.extend({
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
          children: [{ text: 'I am centered text!' }],
          type: ParagraphPlugin.key,
        },
      ],
      preserveClassNames: ['custom-', 'slate-'],
    })
  ).toBe(
    '<div class="slate-p custom-align-center slate-test">I am centered text!</div>'
  );
});
