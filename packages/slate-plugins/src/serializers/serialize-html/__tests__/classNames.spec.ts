import { AlignPlugin } from '../../../elements/align/AlignPlugin';
import { BoldPlugin } from '../../../marks/bold/BoldPlugin';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

it('serialize with slate className', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: { className: 'slate-align-center' },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align-center">I am centered text!</div>');
});

it('serialize with slate classNames: a+slate', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: { className: 'a slate-align-center' },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align-center">I am centered text!</div>');
});

it('serialize with slate classNames: slate+b', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: { className: 'slate-align-center b' },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align-center">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: { className: 'a slate-align-center b' },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align-center">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b+slate', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: { className: 'a slate-align-center b slate-cool' },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe(
    '<div class="slate-align-center slate-cool">I am centered text!</div>'
  );
});

it('serialize with slate classNames: multiple tags', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: { className: 'a slate-align-center b' },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe(
    '<div class="slate-align-center">I am centered text!</div><div class="slate-align-center">I am centered text!</div>'
  );
});

it('serialize with custom preserved classname: a+custom', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: {
              className: 'a custom-align-center slate-align-center',
            },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
      preserveClassNames: ['custom-'],
    })
  ).toBe('<div class="custom-align-center">I am centered text!</div>');
});

it('serialize nested with custom preserved classname: a+custom', () => {
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: {
              className: 'a custom-align-center slate-align-center',
            },
          },
        }),
        BoldPlugin({
          bold: {
            rootProps: {
              className: 'custom-bold',
            },
          },
        }),
      ],
      nodes: [
        {
          type: 'align_center',
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
  expect(
    serializeHTMLFromNodes({
      plugins: [
        AlignPlugin({
          align_center: {
            rootProps: {
              className: 'a custom-align-center slate-align-center',
            },
          },
        }),
      ],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
      preserveClassNames: ['custom-', 'slate-'],
    })
  ).toBe(
    '<div class="custom-align-center slate-align-center">I am centered text!</div>'
  );
});
