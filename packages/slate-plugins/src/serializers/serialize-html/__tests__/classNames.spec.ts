import { AlignPlugin } from '../../../elements/align/AlignPlugin';
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
