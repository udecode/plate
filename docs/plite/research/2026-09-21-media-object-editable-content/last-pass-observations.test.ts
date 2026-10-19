import { expect, test } from 'bun:test';

import {
  createEditor,
  definePlugin,
  schema,
} from '../../../../packages/platejs/src/core';

test('observe whether isolation alone closes an inner text slice', () => {
  const observe = (isolating: boolean) => {
    const plugin = definePlugin(`sliceProbe${isolating ? 'Closed' : 'Open'}`, {
      schema: {
        element: schema.element.textBlock({
          isolating,
          keyboardSelectable: true,
        }),
      },
    });
    const type = plugin.name;
    const editor = createEditor({
      plugins: [plugin],
      initialValue: [{ type, children: [{ text: 'caption' }] }],
    });
    const slice = editor.read.slice.export({
      at: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 4 },
      },
    });
    const receiver = createEditor({
      plugins: [plugin],
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    });

    receiver.update.slice.replace(slice);

    return { isolating, result: receiver.read.children(), slice };
  };
  const observations = [observe(false), observe(true)];

  console.log(JSON.stringify(observations));
  expect(observations[0].slice.openStart).toBe(1);
  expect(observations[0].result).toEqual([
    { type: 'paragraph', children: [{ text: 'apt' }] },
  ]);
  expect(observations[1].slice.openStart).toBe(0);
  expect(observations[1].result[0]?.type).toBe('sliceProbeClosed');
});
