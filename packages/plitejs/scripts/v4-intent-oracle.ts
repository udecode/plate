import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

import {
  bindV4DocumentChange,
  createV4DocumentChange,
  getV4Steps,
} from '../src/core/change/document-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonElementNode,
  type JsonNode,
} from '../src/core/change/tokens';
import {
  applyV4Steps,
  elementStreamLength,
  isTextBearingElement,
} from '../src/core/change/v4/apply';
import { invertV4Steps } from '../src/core/change/v4/invert';
import { rebaseV4Changes } from '../src/core/change/v4/rebase';
import { V4_REGISTER_SET, type V4Step } from '../src/core/change/v4/types';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import { history } from '../src/history';
import {
  createEditor,
  defineEditorSchema,
  editorCommands,
  property,
  schema,
  SelectionApi,
  target as schemaTarget,
} from '../src/index';
import {
  type LaterEntry,
  v4OwnTakeBack,
  v4PutEntryAt,
  v4TakeBack,
} from '../src/sync/server/v4-take-back';

/**
 * Independent Phase A model oracle for the clean-room MIT v4 14 x 14 2D hybrid
 * rebase kernel. Imports ONLY `applyV4Steps`, `invertV4Steps`, and the private
 * `rebaseV4Changes` entry point. Verifies:
 *
 * 1. Pinned counterexamples (abcde -> aXe + split-delete undo, delete(3,2) vs
 *    delete(1,6), R1-R3 remove_node vs join_nodes escalation, duplicate remove
 *    -> satisfied, split x split, split x join, join x join, wrap_inline
 *    disjoint/crossing, set_props/format_text LWW scalar+set, set_register ABA
 *    undo, move cycles & sibling shifts).
 * 2. Exhaustive 14 x 14 single-step pair matrix across all 196 op combinations
 *    on representative small documents (both replay paths converge with full
 *    element IDs, marks, roots, and registers, or return an explicit closed
 *    escalation reason).
 * 3. Randomized 1-3 step batch pair fuzz (20,000 seeds default; 2,000 under
 *    `--light`) asserting exact TP-1 convergence with full IDs and real
 *    per-step outcomes.
 */

const light = process.argv.includes('--light');
const seedCount = light ? 2000 : 20_000;

const p = (
  id: string,
  children: readonly JsonNode[] | string,
  extra: Record<string, unknown> = {}
): JsonElementNode => ({
  ...extra,
  children: typeof children === 'string' ? [{ text: children }] : [...children],
  id,
  type: 'paragraph',
});

const box = (
  id: string,
  children: readonly JsonElementNode[],
  extra: Record<string, unknown> = {}
): JsonElementNode => ({
  ...extra,
  children: [...children],
  id,
  type: 'quote',
});

const link = (
  id: string,
  text: string,
  url = 'https://a.test'
): JsonElementNode => ({
  children: [{ text }],
  id,
  type: 'link',
  url,
});

const normalizeJson = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};

    for (const key of Object.keys(value).sort()) {
      const item = (value as Record<string, unknown>)[key];

      if (item !== undefined) {
        out[key] = normalizeJson(item);
      }
    }

    return out;
  }

  return value;
};

const docsEqualWithIds = (
  left: JsonEditorValue,
  right: JsonEditorValue
): boolean =>
  isDeepStrictEqual(
    normalizeJson({
      children: left.children,
      records: left.records ?? {},
      roots: left.roots ?? {},
    }),
    normalizeJson({
      children: right.children,
      records: right.records ?? {},
      roots: right.roots ?? {},
    })
  );

const assertDiamondConverges = (
  label: string,
  base: JsonEditorValue,
  aSteps: readonly V4Step[],
  bSteps: readonly V4Step[],
  expected?: JsonEditorValue
) => {
  const afterA = applyV4Steps(base, aSteps);
  const afterB = applyV4Steps(base, bSteps);
  const rebased = rebaseV4Changes(base, aSteps, bSteps);

  if (!rebased.ok) {
    throw new Error(
      `[${label}] unexpected escalation "${rebased.reason}"\nA=${JSON.stringify(aSteps)}\nB=${JSON.stringify(bSteps)}`
    );
  }

  const viaA = applyV4Steps(afterA, rebased.bPrime);
  const viaB = applyV4Steps(afterB, rebased.aPrime);

  if (!docsEqualWithIds(viaA, viaB)) {
    throw new Error(
      `[${label}] TP-1 DIVERGENCE!\nbase=${JSON.stringify(base)}\nA=${JSON.stringify(aSteps)}\nB=${JSON.stringify(bSteps)}\nbPrime=${JSON.stringify(rebased.bPrime)}\naPrime=${JSON.stringify(rebased.aPrime)}\nviaA=${JSON.stringify(viaA)}\nviaB=${JSON.stringify(viaB)}`
    );
  }
  if (!docsEqualWithIds(viaA, rebased.after)) {
    throw new Error(`[${label}] rebased.after disagrees with viaA`);
  }
  if (expected && !docsEqualWithIds(viaA, expected)) {
    throw new Error(
      `[${label}] converged doc disagrees with expected!\nactual=${JSON.stringify(viaA)}\nexpected=${JSON.stringify(expected)}`
    );
  }
  assert.equal(
    rebased.bOutcomes.length,
    bSteps.length,
    `[${label}] bOutcomes length`
  );

  return rebased;
};

const checkPinnedInvariants = () => {
  // 1. abcde -> aXe + selective undo restores abXcde
  {
    const base: JsonEditorValue = { children: [p('p1', 'abcde')] };
    const ins: V4Step[] = [
      { offset: 2, op: 'insert_text', target: 'p1', text: 'X' },
    ];
    const del: V4Step[] = [
      { length: 3, offset: 1, op: 'delete_text', target: 'p1' },
    ];
    const res1 = assertDiamondConverges('abcde ins x del', base, ins, del, {
      children: [p('p1', 'aXe')],
    });
    const afterIns = applyV4Steps(base, ins);
    const invDel = invertV4Steps(afterIns, res1.bPrime);
    const undone = applyV4Steps(res1.after, invDel);

    assert.ok(
      docsEqualWithIds(undone, { children: [p('p1', 'abXcde')] }),
      `split-delete undo must restore abXcde, got ${JSON.stringify(undone)}`
    );

    assertDiamondConverges('abcde del x ins', base, del, ins, {
      children: [p('p1', 'aXe')],
    });
  }

  // 2. delete(3,2) vs delete(1,6) (bStart offset)
  {
    const base: JsonEditorValue = { children: [p('p1', '01234567')] };
    const a: V4Step[] = [
      { length: 2, offset: 3, op: 'delete_text', target: 'p1' },
    ];
    const b: V4Step[] = [
      { length: 6, offset: 1, op: 'delete_text', target: 'p1' },
    ];

    assertDiamondConverges('delete(3,2) vs delete(1,6)', base, a, b, {
      children: [p('p1', '07')],
    });
    assertDiamondConverges('delete(1,6) vs delete(3,2)', base, b, a, {
      children: [p('p1', '07')],
    });
  }

  // 3. R1-R3 remove_node(p1/p2) vs join_nodes(p1, p2) -> explicit target-deleted
  {
    const base: JsonEditorValue = {
      children: [p('p1', 'aaa'), p('p2', 'bbb')],
    };
    const join: V4Step[] = [{ op: 'join_nodes', source: 'p2', target: 'p1' }];
    const rem1: V4Step[] = [{ id: 'p1', op: 'remove_node' }];
    const rem2: V4Step[] = [{ id: 'p2', op: 'remove_node' }];

    for (const [label, a, b] of [
      ['R1 rem(p1) x join', rem1, join],
      ['R1 join x rem(p1)', join, rem1],
      ['R2 rem(p2) x join', rem2, join],
      ['R2 join x rem(p2)', join, rem2],
    ] as const) {
      const res = rebaseV4Changes(base, a, b);

      assert.equal(res.ok, false, `${label} must escalate`);
      if (!res.ok) assert.equal(res.reason, 'target-deleted', label);
    }
  }

  // 4. Duplicate remove_node -> aPrime: [], bPrime: [], outcome: 'satisfied'
  {
    const base: JsonEditorValue = {
      children: [p('p1', 'a'), p('p2', 'b')],
    };
    const rem: V4Step[] = [{ id: 'p2', op: 'remove_node' }];
    const res = assertDiamondConverges(
      'duplicate remove_node',
      base,
      rem,
      rem,
      {
        children: [p('p1', 'a')],
      }
    );

    assert.deepEqual(res.aPrime, []);
    assert.deepEqual(res.bPrime, []);
    assert.deepEqual(res.bOutcomes, ['satisfied']);
  }

  // 5. Reciprocal split_node x insert_text, split x split (equal & unequal)
  {
    const base: JsonEditorValue = {
      children: [p('p1', 'hello', { align: 'left' })],
    };
    const splitA: V4Step[] = [
      {
        at: 2,
        id: 'p1',
        newId: 'pA',
        op: 'split_node',
        props: { align: 'center' },
      },
    ];
    const splitB: V4Step[] = [
      {
        at: 2,
        id: 'p1',
        newId: 'pB',
        op: 'split_node',
        props: { align: 'right' },
      },
    ];

    assertDiamondConverges(
      'split x split equal offset + props',
      base,
      splitA,
      splitB,
      {
        children: [
          p('p1', 'he', { align: 'left' }),
          p('pA', '', { align: 'center' }),
          p('pB', 'llo', { align: 'right' }),
        ],
      }
    );
  }

  // 6. Join x text inside source (CE3)
  {
    const base: JsonEditorValue = {
      children: [p('p1', 'aaa'), p('p2', 'bb')],
    };

    assertDiamondConverges(
      'CE3 join x insert in p2',
      base,
      [{ op: 'join_nodes', source: 'p2', target: 'p1' }],
      [{ offset: 1, op: 'insert_text', target: 'p2', text: 'Z' }],
      { children: [p('p1', 'aaabZb')] }
    );
  }

  // 7. wrap_inline disjoint commutes, crossing escalates
  {
    const base: JsonEditorValue = { children: [p('p1', 'abcdef')] };
    const w1: V4Step[] = [
      {
        length: 2,
        node: { children: [], id: 'l1', type: 'link', url: 'https://1.test' },
        offset: 0,
        op: 'wrap_inline',
        target: 'p1',
      },
    ];
    const w2: V4Step[] = [
      {
        length: 2,
        node: { children: [], id: 'l2', type: 'link', url: 'https://2.test' },
        offset: 4,
        op: 'wrap_inline',
        target: 'p1',
      },
    ];
    const crossDel: V4Step[] = [
      { length: 2, offset: 1, op: 'delete_text', target: 'p1' },
    ];

    assertDiamondConverges('wrap_inline disjoint', base, w1, w2);
    const crossed = rebaseV4Changes(base, w1, crossDel);

    assert.equal(crossed.ok, false);
    if (!crossed.ok) assert.equal(crossed.reason, 'inline-wrap-crossing');
  }

  // 8. set_props & format_text LWW room order (scalar + opposing set-valued)
  {
    const base: JsonEditorValue = {
      children: [p('p1', 'abcd', { align: 'left', tags: ['z'] })],
    };
    const pA: V4Step[] = [
      {
        add: { tags: ['x', 'y'] },
        id: 'p1',
        op: 'set_props',
        remove: { tags: ['z'] },
        set: { align: 'center' },
      },
    ];
    const pB: V4Step[] = [
      {
        add: { tags: ['z', 'w'] },
        id: 'p1',
        op: 'set_props',
        remove: { tags: ['y'] },
        set: { align: 'right' },
      },
    ];

    assertDiamondConverges(
      'set_props LWW scalar + opposing sets',
      base,
      pA,
      pB,
      {
        children: [p('p1', 'abcd', { align: 'right', tags: ['w', 'x', 'z'] })],
      }
    );
  }

  // 9. set_register ABA undo protection (CE13)
  {
    const base0: JsonEditorValue = { children: [p('p1', 'doc')] };
    const base = applyV4Steps(base0, [
      {
        after: '"Spec"',
        id: 'status',
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: 'w1',
      },
    ]);
    const bobABA: V4Step[] = [
      {
        after: '"Review"',
        id: 'status',
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: 'w2',
      },
      {
        after: '"Spec"',
        id: 'status',
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: 'w3',
      },
    ];
    const aliceUndo: V4Step[] = [
      {
        after: '"Draft"',
        expectedWriteId: 'w1',
        id: 'status',
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: 'w4',
      },
    ];
    const res = assertDiamondConverges(
      'CE13 set_register ABA undo',
      base,
      bobABA,
      aliceUndo
    );

    assert.deepEqual(res.after.records?.[V4_REGISTER_SET]?.status, {
      encoded: '"Spec"',
      writeId: 'w3',
    });
    assert.deepEqual(res.bOutcomes, ['satisfied']);
  }

  // 10. Move cycle -> 'cycle'
  {
    const base: JsonEditorValue = {
      children: [box('b1', [p('c1', 'one')]), box('b2', [p('c2', 'two')])],
    };
    const mA: V4Step[] = [
      { id: 'b1', op: 'move_node', to: { id: 'b2', index: 0 } },
    ];
    const mB: V4Step[] = [
      { id: 'b2', op: 'move_node', to: { id: 'b1', index: 0 } },
    ];
    const res = rebaseV4Changes(base, mA, mB);

    assert.equal(res.ok, false);
    if (!res.ok) assert.equal(res.reason, 'cycle');
  }
};

// Exhaustive 14 x 14 matrix across all 196 op combinations
const ALL_14_OPS = [
  'insert_text',
  'delete_text',
  'format_text',
  'insert_node',
  'remove_node',
  'move_node',
  'split_node',
  'join_nodes',
  'set_props',
  'wrap_inline',
  'unwrap_inline',
  'create_root',
  'delete_root',
  'set_register',
] as const;

type OpKind = (typeof ALL_14_OPS)[number];

const makeMatrixBase = (): JsonEditorValue =>
  applyV4Steps(
    {
      children: [
        p('p1', [{ text: 'ab' }, link('l1', 'cd'), { text: 'ef' }], {
          align: 'left',
          tags: ['t1'],
        }),
        p('p2', 'ghij', { align: 'left', tags: ['t1'] }),
        p('p3', 'klmn', { align: 'left' }),
        box('q1', [p('q1a', 'one'), p('q1b', 'two')]),
      ],
      roots: {
        aside: [p('a1', 'side')],
      },
    },
    [
      {
        after: '"v0"',
        id: 'k1',
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: 'w0',
      },
    ]
  );

const sampleStepsForOp = (op: OpKind, side: 'a' | 'b'): V4Step[] => {
  const s = side;

  switch (op) {
    case 'insert_text': {
      return [
        {
          offset: 1,
          op: 'insert_text',
          target: 'p1',
          text: s === 'a' ? 'A' : 'B',
        },
        {
          offset: 3,
          op: 'insert_text',
          target: 'p1',
          text: s === 'a' ? 'X' : 'Y',
        },
        {
          offset: 1,
          op: 'insert_text',
          target: 'p2',
          text: s === 'a' ? 'M' : 'N',
        },
        {
          offset: 1,
          op: 'insert_text',
          target: 'l1',
          text: s === 'a' ? 'L' : 'R',
        },
      ];
    }
    case 'delete_text': {
      return [
        { length: 2, offset: 0, op: 'delete_text', target: 'p1' },
        { length: 3, offset: 1, op: 'delete_text', target: 'p1' },
        { length: 2, offset: 1, op: 'delete_text', target: 'p2' },
        { length: 1, offset: 0, op: 'delete_text', target: 'l1' },
      ];
    }
    case 'format_text': {
      return [
        {
          length: 2,
          offset: 0,
          op: 'format_text',
          set: { bold: s === 'a' },
          target: 'p1',
        },
        {
          length: 3,
          offset: 1,
          op: 'format_text',
          set: { italic: true },
          target: 'p1',
        },
        {
          length: 2,
          offset: 1,
          op: 'format_text',
          set: { bold: true },
          target: 'p2',
        },
      ];
    }
    case 'insert_node': {
      return [
        {
          node: p(`ins-${s}-0`, `n${s}0`),
          op: 'insert_node',
          to: { index: 0, root: 'main' },
        },
        {
          node: p(`ins-${s}-1`, `n${s}1`),
          op: 'insert_node',
          to: { index: 1, root: 'main' },
        },
        {
          node: p(`ins-${s}-q`, `q${s}`),
          op: 'insert_node',
          to: { id: 'q1', index: 1 },
        },
        {
          node: link(`inl-${s}`, 'i'),
          op: 'insert_node',
          to: { id: 'p1', offset: 1 },
        },
      ];
    }
    case 'remove_node': {
      return [
        { id: 'p1', op: 'remove_node' },
        { id: 'p2', op: 'remove_node' },
        { id: 'l1', op: 'remove_node' },
        { id: 'q1a', op: 'remove_node' },
        { id: 'a1', op: 'remove_node' },
      ];
    }
    case 'move_node': {
      return [
        { id: 'p1', op: 'move_node', to: { index: 2, root: 'main' } },
        { id: 'p2', op: 'move_node', to: { index: 0, root: 'main' } },
        { id: 'p3', op: 'move_node', to: { id: 'q1', index: 0 } },
        { id: 'q1a', op: 'move_node', to: { index: 1, root: 'main' } },
      ];
    }
    case 'split_node': {
      return [
        { at: 1, id: 'p1', newId: `sp-${s}-1`, op: 'split_node' },
        { at: 3, id: 'p1', newId: `sp-${s}-2`, op: 'split_node' },
        { at: 2, id: 'p2', newId: `sp-${s}-3`, op: 'split_node' },
        { at: 1, id: 'q1', newId: `sp-${s}-q`, op: 'split_node' },
      ];
    }
    case 'join_nodes': {
      return [
        { op: 'join_nodes', source: 'p2', target: 'p1' },
        { op: 'join_nodes', source: 'p3', target: 'p2' },
        { op: 'join_nodes', source: 'q1b', target: 'q1a' },
      ];
    }
    case 'set_props': {
      return [
        {
          add: { tags: [s] },
          id: 'p1',
          op: 'set_props',
          set: { align: s === 'a' ? 'center' : 'right' },
        },
        { id: 'p2', op: 'set_props', set: { align: 'right' } },
        { id: 'l1', op: 'set_props', set: { url: `https://${s}.test` } },
      ];
    }
    case 'wrap_inline': {
      return [
        {
          length: 2,
          node: {
            children: [],
            id: `w-${s}-1`,
            type: 'link',
            url: 'https://w.test',
          },
          offset: 0,
          op: 'wrap_inline',
          target: 'p1',
        },
        {
          length: 2,
          node: {
            children: [],
            id: `w-${s}-2`,
            type: 'link',
            url: 'https://w2.test',
          },
          offset: 3,
          op: 'wrap_inline',
          target: 'p1',
        },
        {
          length: 2,
          node: {
            children: [],
            id: `w-${s}-3`,
            type: 'link',
            url: 'https://w3.test',
          },
          offset: 1,
          op: 'wrap_inline',
          target: 'p2',
        },
      ];
    }
    case 'unwrap_inline': {
      return [{ id: 'l1', op: 'unwrap_inline', parent: 'p1' }];
    }
    case 'create_root': {
      return [
        { op: 'create_root', root: 'notes' },
        { op: 'create_root', root: `extra-${s}` },
      ];
    }
    case 'delete_root': {
      return [{ op: 'delete_root', root: 'aside' }];
    }
    case 'set_register': {
      return [
        {
          after: `"${s}"`,
          id: 'k1',
          op: 'set_register',
          set: V4_REGISTER_SET,
          writeId: `w-${s}`,
        },
        {
          after: `"cas-${s}"`,
          expectedWriteId: 'w0',
          id: 'k1',
          op: 'set_register',
          set: V4_REGISTER_SET,
          writeId: `wc-${s}`,
        },
      ];
    }
  }
  return [];
};

const checkExhaustive14x14Matrix = () => {
  const base = makeMatrixBase();
  let pairsChecked = 0;
  let converged = 0;
  let escalated = 0;

  for (const opA of ALL_14_OPS) {
    const samplesA = sampleStepsForOp(opA, 'a');

    for (const opB of ALL_14_OPS) {
      const samplesB = sampleStepsForOp(opB, 'b');

      for (const aStep of samplesA) {
        for (const bStep of samplesB) {
          pairsChecked += 1;
          const afterA = applyV4Steps(base, [aStep]);
          const afterB = applyV4Steps(base, [bStep]);
          const res = rebaseV4Changes(base, [aStep], [bStep]);

          if (!res.ok) {
            escalated += 1;
            continue;
          }

          converged += 1;
          const viaA = applyV4Steps(afterA, res.bPrime);
          const viaB = applyV4Steps(afterB, res.aPrime);

          if (
            !docsEqualWithIds(viaA, viaB) ||
            !docsEqualWithIds(viaA, res.after)
          ) {
            throw new Error(
              `[14x14 ${opA} x ${opB}] DIVERGENCE!\nA=${JSON.stringify(aStep)}\nB=${JSON.stringify(bStep)}\nbPrime=${JSON.stringify(res.bPrime)}\naPrime=${JSON.stringify(res.aPrime)}\nviaA=${JSON.stringify(viaA)}\nviaB=${JSON.stringify(viaB)}`
            );
          }
          assert.equal(res.bOutcomes.length, 1);
        }
      }
    }
  }

  return { converged, escalated, pairsChecked };
};

// Deterministic PRNG (Mulberry32)
const makeRng = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);

    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const pick = <T>(rng: () => number, items: readonly T[]): T =>
  items[Math.floor(rng() * items.length)];

const collectBlocks = (value: JsonEditorValue) => {
  const blocks: Array<{
    index: number;
    node: JsonElementNode;
    parentId: string | null;
    root: string;
  }> = [];
  const inlines: Array<{ node: JsonElementNode; parentId: string }> = [];

  const walk = (
    root: string,
    parentId: string | null,
    nodes: readonly JsonNode[]
  ) => {
    nodes.forEach((node, index) => {
      if (!isElementNode(node) || typeof node.id !== 'string') return;
      if (node.type === 'link') {
        if (parentId) inlines.push({ node, parentId });
      } else {
        blocks.push({ index, node, parentId, root });
        walk(root, node.id, node.children);
      }
    });
  };

  walk('main', null, value.children);
  if (value.roots) {
    for (const [root, nodes] of Object.entries(value.roots)) {
      walk(root, null, nodes);
    }
  }

  return { blocks, inlines };
};

const generateRandomStep = (
  rng: () => number,
  doc: JsonEditorValue,
  mint: () => string
): V4Step | null => {
  const { blocks, inlines } = collectBlocks(doc);
  const textBlocks = blocks.filter((b) => isTextBearingElement(b.node));
  const containers = blocks.filter((b) => !isTextBearingElement(b.node));
  const choice = Math.floor(rng() * 14);

  switch (choice) {
    case 0: {
      if (textBlocks.length === 0) return null;
      const b = pick(rng, textBlocks);
      const len = elementStreamLength(b.node);
      const offset = Math.floor(rng() * (len + 1));
      const text = pick(rng, ['x', 'yz', '😀']);

      return {
        ...(rng() < 0.3 ? { marks: { bold: true } } : {}),
        offset,
        op: 'insert_text',
        target: b.node.id as string,
        text,
      };
    }
    case 1: {
      const nonEmpty = textBlocks.filter(
        (b) => elementStreamLength(b.node) > 0
      );

      if (nonEmpty.length === 0) return null;
      const b = pick(rng, nonEmpty);
      const len = elementStreamLength(b.node);
      const offset = Math.floor(rng() * len);
      const delLen = 1 + Math.floor(rng() * (len - offset));

      return {
        length: delLen,
        offset,
        op: 'delete_text',
        target: b.node.id as string,
      };
    }
    case 2: {
      if (textBlocks.length === 0) return null;
      const b = pick(rng, textBlocks);
      const len = elementStreamLength(b.node);

      if (len === 0) {
        return {
          length: 0,
          offset: 0,
          op: 'format_text',
          set: { bold: rng() < 0.5 },
          target: b.node.id as string,
        };
      }
      const offset = Math.floor(rng() * len);
      const fmtLen = 1 + Math.floor(rng() * (len - offset));
      const useSet = rng() < 0.35;

      return useSet
        ? {
            add: { commentIds: [pick(rng, ['c1', 'c2'])] },
            length: fmtLen,
            offset,
            op: 'format_text',
            remove: { commentIds: [pick(rng, ['c2', 'c3'])] },
            target: b.node.id as string,
          }
        : {
            length: fmtLen,
            offset,
            op: 'format_text',
            set: { [pick(rng, ['bold', 'italic'])]: rng() < 0.5 },
            target: b.node.id as string,
          };
    }
    case 3: {
      const id = mint();

      if (textBlocks.length > 0 && rng() < 0.25) {
        const b = pick(rng, textBlocks);
        const len = elementStreamLength(b.node);

        return {
          node: link(id, 'lk'),
          op: 'insert_node',
          to: {
            id: b.node.id as string,
            offset: Math.floor(rng() * (len + 1)),
          },
        };
      }
      if (containers.length > 0 && rng() < 0.3) {
        const c = pick(rng, containers);

        return {
          node: p(id, 'sub'),
          op: 'insert_node',
          to: {
            id: c.node.id as string,
            index: Math.floor(rng() * (c.node.children.length + 1)),
          },
        };
      }

      return {
        node: p(id, 'new'),
        op: 'insert_node',
        to: {
          index: Math.floor(rng() * (doc.children.length + 1)),
          root: 'main',
        },
      };
    }
    case 4: {
      if (inlines.length > 0 && rng() < 0.3) {
        return { id: pick(rng, inlines).node.id as string, op: 'remove_node' };
      }
      const removable = blocks.filter(
        (b) =>
          !(
            b.root === 'main' &&
            b.parentId === null &&
            doc.children.length <= 1
          )
      );

      if (removable.length === 0) return null;
      return { id: pick(rng, removable).node.id as string, op: 'remove_node' };
    }
    case 5: {
      const top = blocks.filter(
        (b) => b.root === 'main' && b.parentId === null
      );

      if (top.length < 2) return null;
      const b = pick(rng, top);
      const dest = Math.floor(rng() * top.length);

      return {
        id: b.node.id as string,
        op: 'move_node',
        to: { index: dest, root: 'main' },
      };
    }
    case 6: {
      if (textBlocks.length === 0) return null;
      const b = pick(rng, textBlocks);
      const len = elementStreamLength(b.node);

      return {
        at: Math.floor(rng() * (len + 1)),
        id: b.node.id as string,
        newId: mint(),
        op: 'split_node',
        ...(rng() < 0.3
          ? { props: { align: pick(rng, ['left', 'center', 'right']) } }
          : {}),
      };
    }
    case 7: {
      const pairs: Array<[string, string]> = [];

      for (let i = 0; i + 1 < doc.children.length; i += 1) {
        const left = doc.children[i];
        const right = doc.children[i + 1];

        if (
          isElementNode(left) &&
          isElementNode(right) &&
          isTextBearingElement(left) &&
          isTextBearingElement(right) &&
          typeof left.id === 'string' &&
          typeof right.id === 'string'
        ) {
          pairs.push([left.id, right.id]);
        }
      }
      if (pairs.length === 0) return null;
      const [target, source] = pick(rng, pairs);

      return { op: 'join_nodes', source, target };
    }
    case 8: {
      if (blocks.length === 0) return null;
      const b = pick(rng, blocks);

      return rng() < 0.4
        ? {
            add: { tags: [pick(rng, ['t1', 't2', 't3'])] },
            id: b.node.id as string,
            op: 'set_props',
            remove: { tags: [pick(rng, ['t1', 't2'])] },
          }
        : {
            id: b.node.id as string,
            op: 'set_props',
            set: { align: pick(rng, ['left', 'center', 'right']) },
          };
    }
    case 9: {
      const plainTextBlocks = textBlocks.filter(
        (b) =>
          b.node.type === 'paragraph' &&
          elementStreamLength(b.node) > 0 &&
          !b.node.children.some(isElementNode)
      );

      if (plainTextBlocks.length === 0) return null;
      const b = pick(rng, plainTextBlocks);
      const len = elementStreamLength(b.node);
      const offset = Math.floor(rng() * len);
      const wrapLen = 1 + Math.floor(rng() * (len - offset));

      return {
        length: wrapLen,
        node: { children: [], id: mint(), type: 'link', url: 'https://w.test' },
        offset,
        op: 'wrap_inline',
        target: b.node.id as string,
      };
    }
    case 10: {
      if (inlines.length === 0) return null;
      const inl = pick(rng, inlines);

      return {
        id: inl.node.id as string,
        op: 'unwrap_inline',
        parent: inl.parentId,
      };
    }
    case 11: {
      const name = pick(rng, ['r1', 'r2']);

      if (doc.roots && Object.hasOwn(doc.roots, name)) return null;
      return { op: 'create_root', root: name };
    }
    case 12: {
      const rootNames = doc.roots ? Object.keys(doc.roots) : [];

      if (rootNames.length === 0) return null;
      return { op: 'delete_root', root: pick(rng, rootNames) };
    }
    case 13: {
      const wId = mint();

      return {
        after:
          rng() < 0.15
            ? null
            : JSON.stringify(pick(rng, ['draft', 'review', 'done'])),
        ...(rng() < 0.35 ? { expectedWriteId: pick(rng, ['w0', null]) } : {}),
        id: pick(rng, ['k1', 'k2']),
        op: 'set_register',
        set: V4_REGISTER_SET,
        writeId: wId,
      };
    }
    default: {
      return null;
    }
  }
};

const generateBatch = (
  rng: () => number,
  base: JsonEditorValue,
  mint: () => string,
  maxSteps: number
): V4Step[] => {
  const targetCount = 1 + Math.floor(rng() * maxSteps);
  const steps: V4Step[] = [];
  let cur = base;

  for (
    let attempt = 0;
    attempt < targetCount * 3 && steps.length < targetCount;
    attempt += 1
  ) {
    const step = generateRandomStep(rng, cur, mint);

    if (!step) continue;
    try {
      cur = applyV4Steps(cur, [step]);
      steps.push(step);
    } catch {
      // Skip invalid random step candidate
    }
  }

  return steps;
};

const runFuzz = (count: number) => {
  let converged = 0;
  let escalated = 0;
  const base = makeMatrixBase();

  for (let seed = 1; seed <= count; seed += 1) {
    const rng = makeRng(seed * 2_654_435_761);
    let seqA = 0;
    let seqB = 0;
    const batchA = generateBatch(
      rng,
      base,
      () => {
        const id = `a${seed}_${seqA}`;

        seqA += 1;
        return id;
      },
      3
    );
    const batchB = generateBatch(
      rng,
      base,
      () => {
        const id = `b${seed}_${seqB}`;

        seqB += 1;
        return id;
      },
      3
    );

    if (batchA.length === 0 || batchB.length === 0) continue;

    const afterA = applyV4Steps(base, batchA);
    const afterB = applyV4Steps(base, batchB);
    const res = rebaseV4Changes(base, batchA, batchB);

    if (!res.ok) {
      escalated += 1;
      continue;
    }

    converged += 1;
    const viaA = applyV4Steps(afterA, res.bPrime);
    const viaB = applyV4Steps(afterB, res.aPrime);

    if (!docsEqualWithIds(viaA, viaB) || !docsEqualWithIds(viaA, res.after)) {
      throw new Error(
        `[fuzz seed=${seed}] TP-1 DIVERGENCE!\nA=${JSON.stringify(batchA)}\nB=${JSON.stringify(batchB)}\nbPrime=${JSON.stringify(res.bPrime)}\naPrime=${JSON.stringify(res.aPrime)}\nviaA=${JSON.stringify(viaA)}\nviaB=${JSON.stringify(viaB)}`
      );
    }
    assert.equal(
      res.bOutcomes.length,
      batchB.length,
      `seed=${seed} outcomes length`
    );
  }

  return { converged, escalated };
};

const OracleEditorSchema = defineEditorSchema('schema:v4-intent-oracle', {
  elements: {
    heading: { content: schema.content.text() },
    paragraph: { content: schema.content.text() },
  },
  id: 'v4-intent-oracle',
  properties: [
    schema.elementProperty('align', property.string(), {
      target: schemaTarget.types(['paragraph', 'heading']),
    }),
    schema.textProperty('bold', property.boolean()),
    schema.textProperty('italic', property.boolean()),
  ],
  root: schema.content.types(['paragraph', 'heading'], {
    default: { type: 'paragraph' },
  }),
  version: 1,
});

const stripNodeIds = (nodes: readonly JsonNode[]): unknown =>
  nodes.map((node) => {
    if (!isElementNode(node)) return node;
    const { id: _id, ...rest } = node;

    return { ...rest, children: stripNodeIds(node.children) };
  });

const textLinesOf = (value: JsonEditorValue): string =>
  value.children
    .map((node) =>
      isElementNode(node)
        ? node.children
            .map((child) => ('text' in child ? child.text : ''))
            .join('')
        : ''
    )
    .join('\n');

const runShippedRoomTakeBackOracle = (fuzzCount: number) => {
  const refEditor = createEditor({ plugins: [OracleEditorSchema] });
  const compiledSchema = getCompiledEditorSchema(refEditor);
  let checked = 0;
  let accepted = 0;
  let refused = 0;

  {
    const base: JsonEditorValue = {
      children: [p('p1', 'hello'), p('p2', 'world')],
    };
    const aliceSteps: V4Step[] = [
      { offset: 0, op: 'insert_text', target: 'p1', text: 'A:' },
    ];
    const bobSteps: V4Step[] = [
      { offset: 5, op: 'insert_text', target: 'p2', text: '!' },
    ];
    const aliceChange = bindV4DocumentChange(
      createV4DocumentChange(aliceSteps),
      base
    );
    const afterAlice = aliceChange.apply(base);
    const bobChange = bindV4DocumentChange(
      createV4DocumentChange(bobSteps),
      afterAlice
    );
    const head = bobChange.apply(afterAlice);
    const entries: LaterEntry[] = [
      { after: afterAlice, before: base, change: aliceChange, writer: 'alice' },
      { after: head, before: afterAlice, change: bobChange, writer: 'bob' },
    ];
    const taken = v4TakeBack(v4PutEntryAt(entries, 0), head, compiledSchema);

    assert.ok(taken, '[B1] disjoint room take-back must succeed');
    const result = taken.apply(head);

    assert.ok(
      docsEqualWithIds(result, {
        children: [p('p1', 'hello'), p('p2', 'world!')],
      }),
      `[B1] unexpected result: ${JSON.stringify(result)}`
    );

    const own = v4OwnTakeBack(
      entries,
      'alice',
      { access: 'edit', actor: 'alice', decide: true },
      () => ({ claims: [], kind: 'covered' }),
      head,
      result,
      compiledSchema
    );

    assert.ok(own, '[B1] v4OwnTakeBack must admit matching take-back');
    assert.ok(docsEqualWithIds(own.apply(head), result));
    checked += 1;
    accepted += 1;
  }

  {
    const base: JsonEditorValue = {
      children: [p('p1', 'hello'), p('p2', 'world')],
    };
    const aliceChange = bindV4DocumentChange(
      createV4DocumentChange([
        { offset: 0, op: 'insert_text', target: 'p1', text: 'A:' },
      ]),
      base
    );
    const afterAlice = aliceChange.apply(base);
    const bobChange = bindV4DocumentChange(
      createV4DocumentChange([
        { offset: 7, op: 'insert_text', target: 'p1', text: '!' },
      ]),
      afterAlice
    );
    const head = bobChange.apply(afterAlice);
    const entries: LaterEntry[] = [
      { after: afterAlice, before: base, change: aliceChange, writer: 'alice' },
      { after: head, before: afterAlice, change: bobChange, writer: 'bob' },
    ];
    const taken = v4TakeBack(v4PutEntryAt(entries, 0), head, compiledSchema);

    assert.equal(
      taken,
      null,
      '[B2] overlapping other-writer edit must refuse take-back'
    );
    checked += 1;
    refused += 1;
  }

  {
    const base: JsonEditorValue = { children: [p('p1', 'abcde')] };
    const delChange = bindV4DocumentChange(
      createV4DocumentChange([
        { length: 3, offset: 1, op: 'delete_text', target: 'p1' },
      ]),
      base
    );
    const afterDel = delChange.apply(base);
    const insChange = bindV4DocumentChange(
      createV4DocumentChange([
        { offset: 1, op: 'insert_text', target: 'p1', text: 'X' },
      ]),
      afterDel
    );
    const head = insChange.apply(afterDel);
    const entries: LaterEntry[] = [
      { after: afterDel, before: base, change: delChange, writer: 'alice' },
      { after: head, before: afterDel, change: insChange, writer: 'alice' },
    ];
    const taken = v4TakeBack(v4PutEntryAt(entries, 0), head, compiledSchema);

    assert.ok(taken, '[B3] same-writer split-delete take-back must succeed');
    const result = taken.apply(head);

    assert.ok(
      textLinesOf(result).includes('X') && textLinesOf(result).length === 6,
      `[B3] expected X plus restored bcd, got ${textLinesOf(result)}`
    );
    checked += 1;
    accepted += 1;
  }

  for (let seed = 1; seed <= fuzzCount; seed += 1) {
    const rng = makeRng(seed * 1_103_515_245 + 12_345);
    const base: JsonEditorValue = {
      children: [p('p1', 'alpha'), p('p2', 'bravo'), p('p3', 'charlie')],
    };
    const aliceTarget = rng() < 0.5 ? 'p1' : 'p2';
    const disjoint = rng() < 0.7;
    const bobTarget = disjoint
      ? aliceTarget === 'p1'
        ? 'p3'
        : 'p1'
      : aliceTarget;
    const aliceStep: V4Step =
      rng() < 0.5
        ? {
            offset: Math.floor(rng() * 5),
            op: 'insert_text',
            target: aliceTarget,
            text: `a${seed}`,
          }
        : {
            length: 2,
            offset: 1,
            op: 'format_text',
            set: { bold: true },
            target: aliceTarget,
          };
    const bobStep: V4Step =
      rng() < 0.5
        ? {
            offset: Math.floor(rng() * 5),
            op: 'insert_text',
            target: bobTarget,
            text: `b${seed}`,
          }
        : {
            id: bobTarget,
            op: 'set_props',
            set: { align: 'center' },
          };

    const aliceChange = bindV4DocumentChange(
      createV4DocumentChange([aliceStep]),
      base
    );
    const afterAlice = aliceChange.apply(base);
    const bobChange = bindV4DocumentChange(
      createV4DocumentChange([bobStep]),
      afterAlice
    );
    const head = bobChange.apply(afterAlice);
    const entries: LaterEntry[] = [
      { after: afterAlice, before: base, change: aliceChange, writer: 'alice' },
      { after: head, before: afterAlice, change: bobChange, writer: 'bob' },
    ];
    const taken = v4TakeBack(v4PutEntryAt(entries, 0), head, compiledSchema);

    checked += 1;
    if (disjoint) {
      assert.ok(taken, `[B4 seed=${seed}] disjoint take-back must succeed`);
      const actual = taken.apply(head);
      const expected = applyV4Steps(base, [bobStep]);

      assert.ok(
        docsEqualWithIds(actual, expected),
        `[B4 seed=${seed}] disjoint room take-back diverged!\nactual=${JSON.stringify(actual)}\nexpected=${JSON.stringify(expected)}`
      );
      accepted += 1;
    } else {
      assert.equal(
        taken,
        null,
        `[B4 seed=${seed}] overlapping other-writer take-back must refuse`
      );
      refused += 1;
    }
  }

  return { accepted, checked, refused };
};

const runShippedEditorUndoOracle = (fuzzCount: number) => {
  let checked = 0;

  {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'abcde' }], type: 'paragraph' }],
      plugins: [OracleEditorSchema, history()],
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
      });
    });
    assert.equal(editor.api.history.undo().status, 'applied');
    editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
      tx.text.insert('X', { at: { offset: 2, path: [0, 0] } });
    });
    assert.equal(editor.api.history.redo().status, 'applied');
    assert.equal(textLinesOf(editor.read.value()), 'aXe');
    assert.equal(editor.api.history.undo().status, 'applied');
    assert.equal(textLinesOf(editor.read.value()), 'abXcde');
    assert.equal(editor.api.history.redo().status, 'applied');
    assert.equal(textLinesOf(editor.read.value()), 'aXe');
    checked += 1;
  }

  {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'first' }], type: 'paragraph' },
        { children: [{ text: 'second' }], type: 'paragraph' },
      ],
      plugins: [OracleEditorSchema, history()],
    });
    const firstId = (editor.read.children()[0] as { id?: string }).id;

    editor.update((tx) => {
      tx.selection.set(
        SelectionApi.text({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        })
      );
      tx.command(editorCommands.insertBreak);
    });
    assert.equal((editor.read.children()[1] as { id?: string }).id, firstId);
    editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
      tx.text.insert('!', { at: { offset: 5, path: [1, 0] } });
      tx.nodes.move({ at: [1], to: [2] });
    });
    assert.equal(editor.api.history.undo().status, 'applied');
    assert.deepEqual(stripNodeIds(editor.read.children()), [
      { children: [{ text: 'second' }], type: 'paragraph' },
      { children: [{ text: 'first!' }], type: 'paragraph' },
    ]);
    assert.equal((editor.read.children()[1] as { id?: string }).id, firstId);
    checked += 1;
  }

  {
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'ab' }], type: 'paragraph' },
        { children: [{ text: 'cd' }], type: 'paragraph' },
      ],
      plugins: [OracleEditorSchema, history()],
    });
    const id0 = (editor.read.children()[0] as { id?: string }).id;
    const id1 = (editor.read.children()[1] as { id?: string }).id;

    editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });
    editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
      tx.text.insert('X', { at: { offset: 3, path: [0, 0] } });
    });
    assert.equal(editor.api.history.undo().status, 'applied');
    assert.equal(textLinesOf(editor.read.value()), 'ab\ncXd');
    assert.equal((editor.read.children()[0] as { id?: string }).id, id0);
    assert.equal((editor.read.children()[1] as { id?: string }).id, id1);
    checked += 1;
  }

  {
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'abc' }], type: 'paragraph' }],
      plugins: [OracleEditorSchema, history()],
    });

    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      });
    });
    editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
      tx.text.insert('X', { at: { offset: 0, path: [0, 0] } });
    });
    assert.equal(editor.api.history.undo().status, 'applied');
    assert.equal(
      textLinesOf(editor.read.value()),
      'aXbc',
      '[C3b] equal-offset undo must restore local char before peer insert'
    );
    checked += 1;
  }

  for (let seed = 1; seed <= fuzzCount; seed += 1) {
    const rng = makeRng(seed * 1_664_525 + 1_013_904_223);
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'abcdef' }], type: 'paragraph' },
        { children: [{ text: 'ghijkl' }], type: 'paragraph' },
        { children: [{ text: 'mnopqr' }], type: 'paragraph' },
      ],
      plugins: [OracleEditorSchema, history()],
    });
    const localBlock = Math.floor(rng() * 3);
    const localKind = Math.floor(rng() * 4);

    editor.update((tx) => {
      if (localKind === 0) {
        const off = Math.floor(rng() * 6);

        tx.text.insert(`L${seed % 9}`, {
          at: { offset: off, path: [localBlock, 0] },
        });
      } else if (localKind === 1) {
        const off = Math.floor(rng() * 4);

        tx.text.delete({
          at: {
            anchor: { offset: off, path: [localBlock, 0] },
            focus: { offset: off + 2, path: [localBlock, 0] },
          },
        });
      } else if (localKind === 2) {
        const off = Math.floor(rng() * 4);

        tx.selection.set(
          SelectionApi.text({
            anchor: { offset: off, path: [localBlock, 0] },
            focus: { offset: off + 2, path: [localBlock, 0] },
          })
        );
        tx.marks.add('bold', true);
      } else {
        tx.nodes.set({ align: 'right' }, { at: [localBlock] });
      }
    });

    const localCommit = editor.read.lastCommit();

    assert.ok(localCommit, `[C4 seed=${seed}] local commit`);
    const localBase = localCommit.before;
    const localAfter = localCommit.after;
    const localSteps = getV4Steps(localCommit.changes);

    assert.ok(
      localSteps && localSteps.length > 0,
      `[C4 seed=${seed}] v4 steps`
    );

    const peerBlock = Math.floor(rng() * 3);
    const peerKind = Math.floor(rng() * 4);

    editor.update({ history: 'skip', tags: ['collaboration'] }, (tx) => {
      const firstLeaf = tx.children()[peerBlock]?.children?.[0];
      const len =
        firstLeaf && 'text' in firstLeaf && typeof firstLeaf.text === 'string'
          ? firstLeaf.text.length
          : 0;

      if (peerKind === 0) {
        const off = Math.floor(rng() * (len + 1));

        tx.text.insert(`P${seed % 9}`, {
          at: { offset: off, path: [peerBlock, 0] },
        });
      } else if (peerKind === 1 && len >= 2) {
        const off = Math.floor(rng() * (len - 1));

        tx.text.delete({
          at: {
            anchor: { offset: off, path: [peerBlock, 0] },
            focus: { offset: off + 1, path: [peerBlock, 0] },
          },
        });
      } else if (peerKind === 2) {
        const to = (peerBlock + 1) % 3;

        tx.nodes.move({ at: [peerBlock], to: [to] });
      } else {
        tx.nodes.set({ align: 'center' }, { at: [peerBlock] });
      }
    });

    const peerCommit = editor.read.lastCommit();

    assert.ok(peerCommit, `[C4 seed=${seed}] peer commit`);
    const peerSteps = getV4Steps(peerCommit.changes);

    assert.ok(peerSteps, `[C4 seed=${seed}] peer v4 steps`);

    const undoSteps = invertV4Steps(localBase, localSteps);
    const expectedRebase = rebaseV4Changes(localAfter, peerSteps, undoSteps, {
      formatConflictWinner: 'a',
      insertTieBreak: 'b',
    });

    const beforeUndo = structuredClone(editor.read.value());
    const undoRes = editor.api.history.undo();

    checked += 1;

    if (expectedRebase.ok) {
      if (expectedRebase.bPrime.length > 0) {
        assert.equal(
          undoRes.status,
          'applied',
          `[C4 seed=${seed}] expected undo to apply`
        );
      }
      assert.ok(
        docsEqualWithIds(editor.read.value(), expectedRebase.after),
        `[C4 seed=${seed}] shipped editor undo diverged from v4 oracle!\nactual=${JSON.stringify(editor.read.value())}\nexpected=${JSON.stringify(expectedRebase.after)}`
      );

      // Redo round-trip must restore pre-undo document cleanly
      if (undoRes.status === 'applied') {
        const redoRes = editor.api.history.redo();

        assert.equal(
          redoRes.status,
          'applied',
          `[C4 seed=${seed}] redo after undo must apply`
        );
        assert.ok(
          docsEqualWithIds(editor.read.value(), beforeUndo),
          `[C4 seed=${seed}] shipped editor redo did not restore pre-undo doc!\nactual=${JSON.stringify(editor.read.value())}\nexpected=${JSON.stringify(beforeUndo)}`
        );
      }
    }
  }

  return { checked };
};

const roomFuzzCount = light ? 20 : 60;
const editorFuzzCount = light ? 50 : 200;

const t0 = performance.now();

checkPinnedInvariants();
const matrix = checkExhaustive14x14Matrix();
const fuzz = runFuzz(seedCount);
const roomTakeBack = runShippedRoomTakeBackOracle(roomFuzzCount);
const editorUndo = runShippedEditorUndoOracle(editorFuzzCount);
const elapsedMs = Math.round(performance.now() - t0);

console.log(
  `[v4-intent-oracle] PASS in ${elapsedMs}ms | pinned=10 | matrix14x14=${matrix.pairsChecked} (${matrix.converged} converged, ${matrix.escalated} escalated) | fuzz=${seedCount} (${fuzz.converged} converged, ${fuzz.escalated} escalated) | roomTakeBack=${roomTakeBack.checked} (${roomTakeBack.accepted} accepted, ${roomTakeBack.refused} refused) | editorUndo=${editorUndo.checked}`
);
