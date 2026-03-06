/** @jsx jsxt */

import { LinkPlugin } from '@platejs/link/react';
import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../editor';
import { NodeIdPlugin, normalizeNodeId } from './NodeIdPlugin';

jsxt;

const createIdFactory = (start = 1) => {
  let id = start;

  return () => id++;
};

describe('normalizeNodeId', () => {
  it('adds ids without mutating the input value', () => {
    const input = [{ children: [{ text: 'test' }], type: 'p' }] as any;

    const output = normalizeNodeId(input, {
      idCreator: createIdFactory(),
    }) as any;

    expect(output[0].id).toBe(1);
    expect((input[0] as any).id).toBeUndefined();
    expect(output).not.toBe(input);
  });

  it('preserves existing ids and fills missing ones', () => {
    const input = [
      { children: [{ text: 'first' }], id: 10, type: 'p' },
      { children: [{ text: 'second' }], type: 'p' },
    ] as any;

    const output = normalizeNodeId(input, {
      idCreator: createIdFactory(),
    }) as any;

    expect(output[0].id).toBe(10);
    expect(output[1].id).toBe(1);
  });

  it('supports a custom id key', () => {
    const input = [{ children: [{ text: 'test' }], type: 'p' }] as any;

    const output = normalizeNodeId(input, {
      idCreator: createIdFactory(),
      idKey: 'foo',
    }) as any;

    expect(output[0].foo).toBe(1);
    expect(output[0].id).toBeUndefined();
  });

  it('skips inline nodes by default and can include them when configured', () => {
    const input = [
      {
        children: [
          { text: 'before ' },
          {
            children: [{ text: 'link' }],
            inline: true,
            type: 'a',
          },
          { text: ' after' },
        ],
        type: 'p',
      },
    ] as any;

    const defaultOutput = normalizeNodeId(input, {
      idCreator: createIdFactory(),
    }) as any;
    const inlineOutput = normalizeNodeId(input, {
      filterInline: false,
      idCreator: createIdFactory(),
    }) as any;

    expect(defaultOutput[0].id).toBe(1);
    expect(defaultOutput[0].children[1].id).toBeUndefined();
    expect(inlineOutput[0].children[1].id).toBe(2);
  });
});

describe('NodeIdPlugin', () => {
  it('normalizes initial block ids when boundary nodes are missing ids', () => {
    const input = (
      <editor>
        <hp>first</hp>
        <hp id={9}>middle</hp>
        <hp>last</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
          },
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(9);
    expect(editor.children[2].id).toBe(2);
  });

  it('can normalize inline nodes when filterInline is disabled', () => {
    const input = (
      <editor>
        <hp>
          before <ha>link</ha> after
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            filterInline: false,
            idCreator: createIdFactory(),
          },
        }),
        LinkPlugin,
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect((editor.children[0] as any).children[1].id).toBe(2);
  });

  it('renormalizes middle nodes when normalizeInitialValue is enabled', () => {
    const input = (
      <editor>
        <hp id={1}>first</hp>
        <hp>middle</hp>
        <hp id={3}>last</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(100),
            normalizeInitialValue: true,
          },
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(100);
    expect(editor.children[2].id).toBe(3);
  });

  it('assigns ids to inserted nodes through editor transforms', () => {
    const input = (
      <editor>
        <hp id={10}>
          test
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertNode((<hp>inserted</hp>) as any);

    expect(editor.children).toMatchObject([
      { id: 10, type: 'p' },
      { id: 1, type: 'p' },
    ]);
  });
});
