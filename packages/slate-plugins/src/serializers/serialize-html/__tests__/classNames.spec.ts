import { createEditorPlugins } from '../../../__fixtures__/editor.fixtures';
import { useAlignPlugin } from '../../../elements/align/useAlignPlugin';
import { useBoldPlugin } from '../../../marks/bold/useBoldPlugin';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

it('serialize with slate className', () => {
  const editor = createEditorPlugins();

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align_center">I am centered text!</div>');
});

it('serialize with slate classNames: a+slate', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a slate-align_center',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align_center">I am centered text!</div>');
});

it('serialize with slate classNames: slate+b', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'slate-align_center b',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align_center">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a slate-align_center b',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe('<div class="slate-align_center">I am centered text!</div>');
});

it('serialize with classNames: a+slate+b+slate', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a slate-align_center b slate-cool',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe(
    '<div class="slate-align_center slate-cool">I am centered text!</div>'
  );
});

it('serialize with slate classNames: multiple tags', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a slate-align_center b',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
    })
  ).toBe(
    '<div class="slate-align_center">I am centered text!</div><div class="slate-align_center">I am centered text!</div>'
  );
});

it('serialize with custom preserved classname: a+custom', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a custom-align-center slate-align_center',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
      preserveClassNames: ['custom-'],
    })
  ).toBe('<div class="custom-align-center">I am centered text!</div>');
});

it('serialize nested with custom preserved classname: a+custom', () => {
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a custom-align-center slate-align_center',
        }),
      },
      bold: {
        getNodeProps: () => ({
          className: 'custom-bold',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin(), useBoldPlugin()],
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
  const editor = createEditorPlugins({
    options: {
      align_center: {
        getNodeProps: () => ({
          className: 'a custom-align-center slate-align_center',
        }),
      },
    },
  });

  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [useAlignPlugin()],
      nodes: [
        { type: 'align_center', children: [{ text: 'I am centered text!' }] },
      ],
      preserveClassNames: ['custom-', 'slate-'],
    })
  ).toBe(
    '<div class="custom-align-center slate-align_center">I am centered text!</div>'
  );
});
