import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { authoredTestApi, expandedChildren } from './support/authored';

const judged: unknown[] = [];
const isString = (value: unknown): value is string => {
  judged.push(value);

  return typeof value === 'string';
};
const validated = (options: object = {}) =>
  property.string({ validate: isString, validationVersion: 1, ...options });

const Validated = defineEditorSchema('schema:authored-validator-calls', {
  elements: {
    paragraph: schema.element.textBlock({
      properties: { align: validated({ default: 'center' }) },
    }),
    quote: { content: schema.content.type('paragraph', { min: 1 }) },
  },
  id: 'authored-validator-calls',
  properties: [
    schema.elementProperty('ref', validated(), {
      target: target.group('element'),
    }),
    schema.textProperty('tag', validated()),
  ],
  root: schema.content.types(['paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
} as never);

const suggested = (
  value: readonly object[],
  ...steps: ReadonlyArray<readonly [string, (tx: any) => void]>
) => {
  const carol = createEditor({
    initialValue: structuredClone(value) as never,
    plugins: [
      Validated,
      createAuthoredPlugin({ authorId: 'carol', intent: 'propose' }),
    ] as never,
  });

  for (const [change, step] of steps) {
    authoredTestApi(carol).propose(change, step);
  }

  return createEditor({
    initialValue: expandedChildren(carol) as never,
    plugins: [Validated, createAuthoredPlugin({ authorId: 'zed' })] as never,
  });
};
const judging = (decide: () => { status: string }) => {
  judged.length = 0;
  const { status } = decide();

  return { judged: [...judged], status };
};
const deleted = [{ at: 1, author: 'ann', change: 'ann:1', kind: 'delete' }];
const deciding = (
  definition: unknown,
  value: readonly object[],
  action: 'accept' | 'reject' = 'accept'
) => {
  const editor = createEditor({
    initialValue: value as never,
    plugins: [definition, createAuthoredPlugin({ authorId: 'zed' })] as never,
  });
  const decision = judging(() =>
    authoredTestApi(editor).decide({ action, changes: ['ann:1'] })
  );

  return { children: editor.read.children(), ...decision };
};
const paragraphsIn = (
  id: string,
  quoteParagraph: object,
  properties: readonly unknown[]
) =>
  defineEditorSchema(`schema:${id}`, {
    elements: {
      paragraph: schema.element.textBlock(),
      quote: {
        content: schema.content.types(['paragraph'], {
          default: { properties: quoteParagraph, type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id,
    properties,
    root: schema.content.types(['paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  } as never);
const deletedLineIn = (properties: object) => [
  {
    children: [
      {
        authored: deleted,
        children: [{ authored: deleted, text: 'a' }],
        type: 'paragraph',
        ...properties,
      },
    ],
    type: 'quote',
  },
];

describe('validators a decision calls', () => {
  it('judge each stored value once per decision', () => {
    const editor = suggested(
      [
        {
          align: 'left',
          children: [{ tag: 't0', text: 'ab' }],
          ref: 'r0',
          type: 'paragraph',
        },
        {
          align: 'left',
          children: [{ tag: 't1', text: 'cd' }],
          ref: 'r1',
          type: 'paragraph',
        },
      ],
      ['carol:ref', (tx) => tx.nodes.set({ ref: 'r9' }, { at: [0] })],
      ['carol:tag', (tx) => tx.nodes.set({ tag: 't9' }, { at: [0, 0] })],
      ['carol:remove', (tx) => tx.nodes.remove({ at: [1] })]
    );
    const decisions = [
      { action: 'accept', changes: ['carol:ref'] },
      { action: 'reject', changes: ['carol:tag'] },
      { action: 'accept', changes: ['carol:remove'] },
    ].map((decision) =>
      judging(() => authoredTestApi(editor).decide(decision as never))
    );

    for (const decision of decisions) {
      assert.equal(decision.status, 'applied');
      assert.equal(new Set(decision.judged).size, decision.judged.length);
    }
    assert.deepEqual(editor.read.children(), [
      {
        align: 'left',
        children: [{ tag: 't0', text: 'ab' }],
        ref: 'r9',
        type: 'paragraph',
      },
    ]);
  });

  it('judge each stored value once per withdrawal', () => {
    const carol = createEditor({
      initialValue: [
        {
          align: 'left',
          children: [{ tag: 't0', text: 'ab' }],
          ref: 'r0',
          type: 'paragraph',
        },
      ] as never,
      plugins: [
        Validated,
        createAuthoredPlugin({ authorId: 'carol', intent: 'propose' }),
      ] as never,
    });

    authoredTestApi(carol).propose('carol:ref', (tx) =>
      tx.nodes.set({ ref: 'r9' }, { at: [0] })
    );
    authoredTestApi(carol).propose('carol:tag', (tx) =>
      tx.nodes.set({ tag: 't9' }, { at: [0, 0] })
    );
    const withdrawal = judging(() =>
      authoredTestApi(carol).withdraw(['carol:ref'])
    );

    assert.equal(withdrawal.status, 'applied');
    assert.equal(new Set(withdrawal.judged).size, withdrawal.judged.length);
  });

  it('judge a construction value only by the properties its type allows', () => {
    const quoteCode = property.string({
      validate: (value: unknown): value is string =>
        (value as string).startsWith('q'),
      validationVersion: 1,
    });
    const definition = defineEditorSchema(
      'schema:authored-validator-calls-a1',
      {
        elements: {
          paragraph: schema.element.textBlock(),
          quote: schema.element.textBlock(),
        },
        id: 'authored-validator-calls-a1',
        properties: [
          schema.elementProperty('code', property.number(), {
            target: target.types(['paragraph']),
          }),
          schema.elementProperty('code', quoteCode, {
            target: target.types(['quote']),
          }),
        ],
        root: schema.content.types(['paragraph', 'quote'], {
          default: { properties: { code: 1 }, type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      } as never
    );
    const decision = deciding(definition, [
      {
        authored: deleted,
        children: [{ authored: deleted, text: 'a' }],
        code: 2,
        type: 'paragraph',
      },
    ]);

    assert.deepEqual(decision.children, [
      { children: [{ text: '' }], code: 1, type: 'paragraph' },
    ]);
  });

  it('judge a set item a construction writes before resolution', () => {
    const definition = paragraphsIn(
      'authored-validator-calls-a2',
      { tags: ['built'] },
      [
        schema.elementProperty('tags', property.set(validated()), {
          target: target.types(['paragraph']),
        }),
      ]
    );
    const decision = deciding(definition, deletedLineIn({ tags: ['stored'] }));

    assert.deepEqual(decision.children, [
      {
        children: [
          { children: [{ text: '' }], tags: ['built'], type: 'paragraph' },
        ],
        type: 'quote',
      },
    ]);
  });

  it('judge construction values again under a schema rebuilt with new validators', () => {
    const aligned = () =>
      paragraphsIn('authored-validator-calls-a3', { align: 'center' }, [
        schema.elementProperty(
          'align',
          property.string({
            validate: (value: unknown): value is string =>
              typeof value === 'string',
            validationVersion: 1,
          }),
          { target: target.types(['paragraph']) }
        ),
      ]);
    const decisions = [aligned(), aligned()].map(
      (definition) =>
        deciding(definition, deletedLineIn({ align: 'left' })).status
    );

    assert.deepEqual(decisions, ['applied', 'applied']);
  });

  it('judge a value whose validator throws once per decision', () => {
    const definition = defineEditorSchema(
      'schema:authored-validator-calls-a5',
      {
        elements: { paragraph: schema.element.textBlock() },
        id: 'authored-validator-calls-a5',
        properties: [
          schema.elementProperty(
            'align',
            validated({
              validate: (value: unknown): value is string => {
                judged.push(value);
                if (value === 'bad') throw new Error('bad align');

                return typeof value === 'string';
              },
            }),
            { target: target.types(['paragraph']) }
          ),
        ],
        root: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      } as never
    );
    const decision = deciding(
      definition,
      [
        {
          align: 'good',
          authored: [
            {
              at: 1,
              author: 'ann',
              before: 'bad',
              change: 'ann:1',
              id: 'ann:1:align',
              key: 'align',
              kind: 'format',
              write: { kind: 'set', value: 'good' },
            },
          ],
          children: [{ text: 'a' }],
          type: 'paragraph',
        },
      ],
      'reject'
    );

    assert.deepEqual(
      [decision.status, decision.judged.filter((value) => value === 'bad')],
      ['applied', ['bad']]
    );
  });

  it('judge the values a decision generates once, after it builds them all', () => {
    const generatedIn = (placement: 'element' | 'text') => {
      let made = 0;
      const generated = validated({
        generate: () => {
          made += 1;
          judged.push(`made g${made}`);

          return `g${made}`;
        },
      });
      const definition = defineEditorSchema(
        `schema:authored-validator-calls-a7-${placement}`,
        {
          elements: {
            box: {
              content: schema.content.types(['paragraph'], {
                default: { type: 'paragraph' },
                min: 2,
              }),
            },
            paragraph: schema.element.textBlock(),
          },
          id: `authored-validator-calls-a7-${placement}`,
          properties: [
            placement === 'text'
              ? schema.textProperty('gid', generated)
              : schema.elementProperty('gid', generated, {
                  target: target.group('element'),
                }),
          ],
          root: schema.content.types(['paragraph', 'box'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        } as never
      );
      const stored = new Set(['s0', 's1', 's2']);
      const deletedLine = (gid: string) =>
        placement === 'text'
          ? {
              authored: deleted,
              children: [{ authored: deleted, gid, text: 'a' }],
              type: 'paragraph',
            }
          : {
              authored: deleted,
              children: [{ authored: deleted, text: 'a' }],
              gid,
              type: 'paragraph',
            };
      const decision = deciding(definition, [
        {
          children: [deletedLine('s1'), deletedLine('s2')],
          type: 'box',
          ...(placement === 'element' ? { gid: 's0' } : {}),
        },
      ]);
      const calls = decision.judged.filter(
        (value) => !stored.has(value as string)
      );
      const ids = calls.flatMap((value) =>
        String(value).startsWith('made ') ? [String(value).slice(5)] : []
      );

      return { calls, ids, status: decision.status };
    };
    const decisions = (['element', 'text'] as const).map(generatedIn);

    assert.deepEqual(
      decisions.map(({ calls, ids, status }) => ({
        calls,
        count: ids.length,
        status,
      })),
      decisions.map(({ ids }) => ({
        calls: [...ids.map((id) => `made ${id}`), ...ids],
        count: 2,
        status: 'applied',
      }))
    );
  });

  it('judge a default a decision writes into a line it builds at most once', () => {
    // A tracked deletion as an import stores it, with no filler line holding
    // the default.
    const editor = createEditor({
      initialValue: [
        {
          children: [
            {
              align: 'left',
              authored: deleted,
              children: [{ authored: deleted, text: 'a' }],
              type: 'paragraph',
            },
          ],
          type: 'quote',
        },
      ] as never,
      plugins: [Validated, createAuthoredPlugin({ authorId: 'zed' })] as never,
    });
    const decision = judging(() =>
      authoredTestApi(editor).decide({ action: 'accept', changes: ['ann:1'] })
    );

    assert.equal(decision.status, 'applied');
    assert.deepEqual(editor.read.children(), [
      {
        children: [
          { align: 'center', children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'quote',
      },
    ]);
    assert.ok(
      decision.judged.filter((value) => value === 'center').length <= 1
    );
  });
});
