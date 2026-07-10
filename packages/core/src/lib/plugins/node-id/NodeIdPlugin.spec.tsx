/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';
import {
  NodeIdPlugin,
  normalizeNodeId,
  normalizeNodeIdWithEditor,
} from './NodeIdPlugin';

jsxt;

const TestLinkPlugin = createBasePlugin({
  key: 'a',
  node: { isElement: true, isInline: true, type: 'a' },
});

const createIdFactory = (start = 1) => {
  let id = start;

  return () => id++;
};

const createStringIdFactory = (prefix = 'generated') => {
  let id = 1;

  return () => `${prefix}-${id++}`;
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

  it('matches nodes with the shared Plite matcher', () => {
    const input = [
      { children: [{ text: 'paragraph' }], type: 'p' },
      { children: [{ text: 'heading' }], type: 'h1' },
    ] as any;

    const output = normalizeNodeId(input, {
      idCreator: createIdFactory(),
      match: { type: ['p'] },
    }) as any;

    expect(output[0].id).toBe(1);
    expect(output[1].id).toBeUndefined();
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

    const editor = createBaseEditor({
      nodeId: false,
      plugins: [TestLinkPlugin],
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

    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
          },
        }),
      ],
      value: input.children,
    });

    expect(editor.read.children()[0].id).toBe(1);
    expect(editor.read.children()[1].id).toBe(9);
    expect(editor.read.children()[2].id).toBe(2);
  });

  it('does not mutate the provided initial value during normalization', () => {
    const value = [
      { children: [{ text: 'first' }], type: 'p' },
      { children: [{ text: 'last' }], type: 'p' },
    ] as any;

    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
          },
        }),
      ],
      value,
    });

    expect(editor.read.children()[0].id).toBe(1);
    expect(editor.read.children()[1].id).toBe(2);
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

    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            filterInline: false,
            idCreator: createIdFactory(),
          },
        }),
        TestLinkPlugin,
      ],
      value: input.children,
    });

    expect(editor.read.children()[0].id).toBe(1);
    expect((editor.read.children()[0] as any).children[1].id).toBe(2);
  });

  it('skips inline nodes during initial normalization by default', () => {
    const input = (
      <editor>
        <hp>
          before <ha>link</ha> after
        </hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createIdFactory(),
          },
        }),
        TestLinkPlugin,
      ],
      value: input.children,
    });

    expect(editor.read.children()[0].id).toBe(1);
    expect((editor.read.children()[0] as any).children[1].id).toBeUndefined();
  });

  it('renormalizes middle nodes when initialValueIds is "always"', () => {
    const input = (
      <editor>
        <hp id={1}>first</hp>
        <hp>middle</hp>
        <hp id={3}>last</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
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

    expect(editor.read.children()[0].id).toBe(1);
    expect(editor.read.children()[1].id).toBe(100);
    expect(editor.read.children()[2].id).toBe(3);
  });

  it('skips initial normalization when initialValueIds is false', () => {
    const input = (
      <editor>
        <hp>first</hp>
        <hp id={9}>middle</hp>
        <hp>last</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
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

    expect(editor.read.children()[0].id).toBeUndefined();
    expect(editor.read.children()[1].id).toBe(9);
    expect(editor.read.children()[2].id).toBeUndefined();
  });

  it('respects a custom idKey in the if-needed fast path', () => {
    const input = (
      <editor>
        <hp foo="first">first</hp>
        <hp>middle</hp>
        <hp foo="last">last</hp>
      </editor>
    ) as any;

    const editor = createBaseEditor({
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

    expect(editor.read.children()[0].foo).toBe('first');
    expect(editor.read.children()[1].foo).toBeUndefined();
    expect(editor.read.children()[2].foo).toBe('last');
  });

  it('replaces duplicate inserted ids and restores a unique _id override', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
          },
        }),
      ],
      value: [{ children: [{ text: 'existing' }], id: 'taken-id', type: 'p' }],
    });

    editor.update.operations.replay([
      {
        node: {
          _id: 'preferred-id',
          children: [{ text: 'inserted' }],
          id: 'taken-id',
          type: 'p',
        } as any,
        path: [1],
        type: 'insert_node',
      },
    ]);

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: 'inserted' }],
      id: 'preferred-id',
      type: 'p',
    });
    expect((editor.read.children()[1] as any)._id).toBeUndefined();
  });

  it('preserves unique inserted ids', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
          },
        }),
      ],
      value: [
        { children: [{ text: 'existing' }], id: 'existing-id', type: 'p' },
      ],
    });

    editor.update.operations.replay([
      {
        node: {
          children: [{ text: 'inserted' }],
          id: 'unique-id',
          type: 'p',
        } as any,
        path: [1],
        type: 'insert_node',
      },
    ]);

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: 'inserted' }],
      id: 'unique-id',
      type: 'p',
    });
  });

  it('applies match policy to inserted nodes', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
            match: { type: 'p' },
          },
        }),
      ],
      value: [{ children: [{ text: 'existing' }], id: 'existing', type: 'p' }],
    });

    editor.update.operations.replay([
      {
        node: { children: [{ text: 'heading' }], type: 'h1' } as any,
        path: [1],
        type: 'insert_node',
      },
      {
        node: { children: [{ text: 'paragraph' }], type: 'p' } as any,
        path: [2],
        type: 'insert_node',
      },
    ]);

    expect(editor.read.children()[1].id).toBeUndefined();
    expect(editor.read.children()[2].id).toBe('generated-1');
  });

  it('does not assign ids to inserted text leaves by default', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
          },
        }),
      ],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.operations.replay([
      {
        node: {
          text: ' marked',
          type: 'mark-like',
        } as any,
        path: [0, 1],
        type: 'insert_node',
      },
    ]);

    expect((editor.read.children()[0] as any).children[1]).toEqual({
      text: ' marked',
      type: 'mark-like',
    });
  });

  it('generates ids for nested inserted duplicates with one document scan', () => {
    const onDuplicateIdScan = mock();
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
            onDuplicateIdScan,
          },
        }),
      ],
      value: [
        { children: [{ text: 'existing a' }], id: 'taken-a', type: 'p' },
        { children: [{ text: 'existing b' }], id: 'taken-b', type: 'p' },
      ],
    });

    editor.update.operations.replay([
      {
        node: {
          children: [
            {
              children: [{ text: 'hello' }],
              id: 'taken-a',
              type: 'p',
            },
            {
              children: [{ text: 'world' }],
              id: 'taken-b',
              type: 'p',
            },
          ],
          type: 'blockquote',
        } as any,
        path: [2],
        type: 'insert_node',
      },
    ]);

    expect(onDuplicateIdScan).toHaveBeenCalledTimes(1);
    expect(onDuplicateIdScan).toHaveBeenCalledWith({
      candidateCount: 2,
      duration: expect.any(Number),
      existingCount: 2,
      visitedCount: expect.any(Number),
    });
    expect(editor.read.children()[2]).toMatchObject({
      children: [
        { children: [{ text: 'hello' }], id: 'generated-2', type: 'p' },
        { children: [{ text: 'world' }], id: 'generated-3', type: 'p' },
      ],
      id: 'generated-1',
      type: 'blockquote',
    });
  });

  it('creates a fresh id when a split node id already exists', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
            reuseId: true,
          },
        }),
      ],
      value: [
        { children: [{ text: 'existing' }], id: 'existing-id', type: 'p' },
        {
          children: [{ text: 'before' }, { text: 'after' }],
          id: 'source-id',
          type: 'p',
        },
      ],
    });

    editor.update.operations.replay([
      {
        path: [1],
        position: 1,
        properties: {
          id: 'existing-id',
          type: 'p',
        },
        type: 'split_node',
      },
    ]);

    expect(editor.read.children()[2]).toMatchObject({
      children: [{ text: 'after' }],
      id: 'generated-1',
      type: 'p',
    });
  });

  it('keeps a unique split id when reuseId is enabled', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
            reuseId: true,
          },
        }),
      ],
      value: [{ children: [{ text: 'before' }, { text: 'after' }], type: 'p' }],
    });

    editor.update.operations.replay([
      {
        path: [0],
        position: 1,
        properties: {
          id: 'keep-id',
          type: 'p',
        },
        type: 'split_node',
      },
    ]);

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: 'after' }],
      id: 'keep-id',
      type: 'p',
    });
  });

  it('removes ids from disallowed split text nodes', () => {
    const editor = createBaseEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idCreator: createStringIdFactory(),
          },
        }),
      ],
      value: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    editor.update.operations.replay([
      {
        path: [0, 0],
        position: 2,
        properties: {
          id: 'remove-me',
        } as any,
        type: 'split_node',
      },
    ]);

    expect((editor.read.children()[0] as any).children).toEqual([
      { text: 'he' },
      { text: 'llo' },
    ]);
  });
});
