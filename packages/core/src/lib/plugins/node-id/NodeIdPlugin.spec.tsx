/** @jsx jsxt */

import { LinkPlugin } from '@platejs/link/react';
import { jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../editor';
import {
  NodeIdPlugin,
  normalizeNodeId,
  normalizeNodeIdWithEditor,
} from './NodeIdPlugin';

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

  it('returns the original value when every node already has an id', () => {
    const input = [
      { children: [{ text: 'first' }], id: 1, type: 'p' },
      { children: [{ text: 'second' }], id: 2, type: 'p' },
    ] as any;

    const output = normalizeNodeId(input, {
      idCreator: createIdFactory(),
    }) as any;

    expect(output).toBe(input);
    expect(output[0]).toBe(input[0]);
    expect(output[1]).toBe(input[1]);
  });

  it('preserves unchanged branches when only part of the tree needs ids', () => {
    const input = [
      { children: [{ text: 'first' }], id: 1, type: 'p' },
      { children: [{ text: 'second' }], type: 'p' },
      { children: [{ text: 'third' }], id: 3, type: 'p' },
    ] as any;

    const output = normalizeNodeId(input, {
      idCreator: createIdFactory(),
    }) as any;

    expect(output).not.toBe(input);
    expect(output[0]).toBe(input[0]);
    expect(output[1]).not.toBe(input[1]);
    expect(output[2]).toBe(input[2]);
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

describe('normalizeNodeIdWithEditor', () => {
  it('uses editor block semantics instead of raw inline flags', () => {
    const input = (
      <editor>
        <hp>
          before <ha>link</ha> after
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      nodeId: false,
      plugins: [LinkPlugin],
      value: input.children,
    });

    const output = normalizeNodeIdWithEditor(editor, input.children, {
      idCreator: createIdFactory(),
    }) as any;

    expect(output[0].id).toBe(1);
    expect(output[0].children[1].id).toBeUndefined();
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

  it('does not mutate the provided initial value during normalization', () => {
    const value = [
      { children: [{ text: 'first' }], type: 'p' },
      { children: [{ text: 'last' }], type: 'p' },
    ] as any;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
          },
        }),
      ],
      value,
    });

    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(2);
    expect(value[0].id).toBeUndefined();
    expect(value[1].id).toBeUndefined();
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

  it('skips inline nodes during initial normalization by default', () => {
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
            idCreator: createIdFactory(),
          },
        }),
        LinkPlugin,
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect((editor.children[0] as any).children[1].id).toBeUndefined();
  });

  it('renormalizes middle nodes when initialValueIds is "always"', () => {
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
            initialValueIds: 'always',
          },
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(100);
    expect(editor.children[2].id).toBe(3);
  });

  it('skips initial normalization when initialValueIds is false', () => {
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
            initialValueIds: false,
          },
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBeUndefined();
    expect(editor.children[1].id).toBe(9);
    expect(editor.children[2].id).toBeUndefined();
  });

  it('supports legacy normalizeInitialValue: true', () => {
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
          } as any,
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBe(100);
    expect(editor.children[2].id).toBe(3);
  });

  it('supports legacy normalizeInitialValue: null as a disable path', () => {
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
            normalizeInitialValue: null,
          } as any,
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBeUndefined();
    expect(editor.children[1].id).toBe(9);
    expect(editor.children[2].id).toBeUndefined();
  });

  it('prefers initialValueIds over the legacy normalizeInitialValue alias', () => {
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
            initialValueIds: false,
            normalizeInitialValue: true,
          } as any,
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].id).toBe(1);
    expect(editor.children[1].id).toBeUndefined();
    expect(editor.children[2].id).toBe(3);
  });

  it('respects a custom idKey in the if-needed fast path', () => {
    const input = (
      <editor>
        <hp foo="first">first</hp>
        <hp>middle</hp>
        <hp foo="last">last</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
            idKey: 'foo',
            initialValueIds: 'if-needed',
          },
        }),
      ],
      value: input.children,
    });

    expect(editor.children[0].foo).toBe('first');
    expect(editor.children[1].foo).toBeUndefined();
    expect(editor.children[2].foo).toBe('last');
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
