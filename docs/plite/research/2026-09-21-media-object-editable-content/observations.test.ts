import { expect, test } from 'bun:test';

import {
  createEditor,
  definePlugin,
  schema,
} from '../../../../packages/platejs/src/core';
import { BaseImagePlugin } from '../../../../packages/platejs/src/features/media/lib/image/BaseImagePlugin';

test('observe whether an empty caption makes an existing image replaceable', () => {
  const editor = createEditor({
    plugins: [BaseImagePlugin],
    initialValue: [
      {
        type: 'image',
        url: 'https://example.com/existing.png',
        children: [{ text: '' }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ],
  });
  const before = editor.read.children();
  const image = before[0];
  const observation = {
    behavior: editor.read.schema.element('image')?.behavior,
    empty: editor.read.nodes.isEmpty(image),
  };

  editor.update.blocks.insertAfter(
    { type: 'paragraph', children: [{ text: 'inserted' }] },
    { at: [0], replaceEmpty: true }
  );

  const children = editor.read.children();
  console.log(JSON.stringify({ ...observation, before, after: children }));
  // This records the current defect, not the desired contract.
  expect(observation.empty).toBe(true);
  expect(children.some((node) => node.type === 'image')).toBe(false);
});

test('observe how atom changes traversal through editable text', () => {
  const observations = [false, true].map((atom) => {
    const plugin = definePlugin('objectProbe', {
      schema: {
        element: schema.element.textBlock({ atom, isolating: true }),
      },
    });
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [
        { type: 'objectProbe', children: [{ text: 'abc' }] },
      ],
    });
    return {
      atom,
      positions: [...editor.read.points.positions({ at: [0], unit: 'character' })],
    };
  });

  console.log(JSON.stringify(observations));
  expect(observations[0].positions.map((point) => point.offset)).toEqual([0, 1, 2, 3]);
  expect(observations[1].positions.map((point) => point.offset)).toEqual([0]);
});

test('observe whether copying caption text carries the media object', () => {
  const editor = createEditor({
    plugins: [BaseImagePlugin],
    initialValue: [
      {
        type: 'image',
        url: 'https://example.com/existing.png',
        children: [{ text: 'caption' }],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ],
  });
  const slice = editor.read.slice.export({
    at: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    },
  });
  console.log(JSON.stringify({ captionSlice: slice }));
  expect(slice.content).toEqual([
    {
      type: 'image',
      url: 'https://example.com/existing.png',
      children: [{ text: 'apt' }],
    },
  ]);
  expect(slice.openStart).toBe(0);
  expect(slice.openEnd).toBe(0);
  const receiver = createEditor({
    plugins: [BaseImagePlugin],
    initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  receiver.update.slice.replace(slice);
  console.log(JSON.stringify({ captionPaste: receiver.read.children() }));
  expect(receiver.read.children().some((node) => node.type === 'image')).toBe(true);
});
