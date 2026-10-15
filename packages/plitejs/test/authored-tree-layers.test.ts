import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  decideKey,
  type FormatTag,
  keySteps,
  keyTips,
  type LayerOutcome,
  type LayerValue,
  writeLayer,
} from '../src/authored/tree/layers';

// docs/plans/2026-10-10-authored-values.md, S1: the decision laws of one key
// over histories that clients write, amend, withdraw, correct and merge.

type Client = {
  added: Map<string, FormatTag>;
  clock: number;
  id: number;
  live: LayerValue;
  removed: Set<string>;
  written: number;
};

const tagsOf = (client: Client) =>
  [...client.added.values()].filter((tag) => !client.removed.has(tag.id));

const VALUES: LayerValue[] = [undefined, 1, 2, 3];

type Op =
  | { client: number; kind: 'write'; change: number; value: number }
  | { client: number; kind: 'correct'; value: number }
  | { a: number; b: number; kind: 'sync' };

const opArb = (clients: number) =>
  fc.oneof(
    {
      arbitrary: fc.record({
        change: fc.nat({ max: 1 }),
        client: fc.nat({ max: clients - 1 }),
        kind: fc.constant('write' as const),
        value: fc.nat({ max: VALUES.length - 1 }),
      }),
      weight: 5,
    },
    {
      arbitrary: fc.record({
        client: fc.nat({ max: clients - 1 }),
        kind: fc.constant('correct' as const),
        value: fc.nat({ max: VALUES.length - 1 }),
      }),
      weight: 1,
    },
    {
      arbitrary: fc.record({
        a: fc.nat({ max: clients - 1 }),
        b: fc.nat({ max: clients - 1 }),
        kind: fc.constant('sync' as const),
      }),
      weight: 2,
    }
  );

/** Set members merge as Yjs set-valued attributes do; the scalar keeps the later write. */
const sync = (a: Client, b: Client) => {
  for (const [id, tag] of [...a.added, ...b.added]) {
    a.added.set(id, tag);
    b.added.set(id, tag);
  }
  for (const id of [...a.removed, ...b.removed]) {
    a.removed.add(id);
    b.removed.add(id);
  }
  const later =
    a.written > b.written || (a.written === b.written && a.id > b.id) ? a : b;

  a.live = later.live;
  b.live = later.live;
  a.written = later.written;
  b.written = later.written;
};

const run = (clients: number, ops: Op[]) => {
  const peers: Client[] = Array.from({ length: clients }, (_, id) => ({
    added: new Map(),
    clock: 0,
    id,
    live: undefined,
    removed: new Set(),
    written: 0,
  }));
  let stamp = 0;

  for (const op of ops) {
    if (op.kind === 'sync') {
      sync(peers[op.a], peers[op.b]);
      continue;
    }
    const peer = peers[op.client];
    const next = VALUES[op.value];
    const before = tagsOf(peer);
    const change = `p${peer.id}c${'change' in op ? op.change : 0}`;
    const after =
      op.kind === 'correct'
        ? writeLayer({
            intent: 'edit',
            isOwn: () => false,
            next,
            ownInsertion: false,
            previous: peer.live,
            source: 'correction',
            tag: () => {
              throw new Error('a correction writes no tag');
            },
            tags: before,
          })
        : writeLayer({
            intent: 'propose',
            isOwn: (tag) => tag.change === change,
            next,
            ownInsertion: false,
            previous: peer.live,
            source: 'command',
            tag: (fields) => ({
              ...fields,
              at: 1,
              author: `p${peer.id}`,
              change,
              id: `p${peer.id}t${(peer.clock += 1)}`,
              key: 'bold',
              kind: 'format',
            }),
            tags: before,
          });

    for (const tag of before) {
      if (!after.includes(tag)) peer.removed.add(tag.id);
    }
    for (const tag of after) peer.added.set(tag.id, tag);
    peer.live = next;
    stamp += 1;
    peer.written = stamp;
  }
  for (const a of peers) for (const b of peers) sync(a, b);

  return { live: peers[0].live, tags: tagsOf(peers[0]) };
};

const sameValue = (left: LayerValue, right: LayerValue) =>
  JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const apply = (
  live: LayerValue,
  tags: readonly FormatTag[],
  outcome: LayerOutcome
) => {
  const decision = decideKey(live, tags, outcome);

  return {
    blocked: decision.waits.length > 0,
    decision,
    live: decision.value.kind === 'set' ? decision.value.value : live,
    tags: decision.kept,
  };
};

const historyArb = fc.integer({ max: 3, min: 1 }).chain((clients) =>
  fc.record({
    clients: fc.constant(clients),
    ops: fc.array(opArb(clients), { maxLength: 14, minLength: 1 }),
  })
);

const changesOf = (tags: readonly FormatTag[]) => [
  ...new Set(tags.map((tag) => tag.change)),
];

describe('format layers', () => {
  it('gives one result for every admissible order of the same decisions', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.infiniteStream(fc.boolean()),
        fc.infiniteStream(fc.nat({ max: 1000 })),
        ({ clients, ops }, coins, shuffle) => {
          const { live, tags } = run(clients, ops);
          const changes = changesOf(tags);
          const every = coins.next().value || coins.next().value;
          const decided = every
            ? changes
            : changes.filter(() => coins.next().value);
          const actions = new Map(
            decided.map((change) => [
              change,
              coins.next().value ? ('accept' as const) : ('reject' as const),
            ])
          );
          const outcomeFor =
            (part: readonly string[]): LayerOutcome =>
            ({ change }) =>
              part.includes(change) ? (actions.get(change) ?? 'keep') : 'keep';
          const batch = apply(live, tags, outcomeFor(decided));
          const order = [...decided].sort(() => shuffle.next().value - 500);

          // Grow each group from a shuffled order until it applies, so every
          // partition tried is admissible; a blocked group changes nothing.
          let state = { live, tags };
          let group: string[] = [];

          for (const change of order) {
            group = group.concat(change);
            const step = apply(state.live, state.tags, outcomeFor(group));

            if (step.blocked) {
              assert.equal(
                step.tags,
                state.tags,
                'a blocked decision keeps every tag'
              );
              assert.ok(
                step.decision.value.kind === 'unchanged',
                'a blocked decision writes no value'
              );
              continue;
            }
            state = { live: step.live, tags: step.tags };
            group = [];
          }

          if (group.length > 0) {
            assert.ok(
              batch.blocked,
              'decisions left waiting after an order mean the batch waits too'
            );
            return;
          }
          assert.ok(
            !batch.blocked,
            'a batch whose orders all apply does not wait'
          );
          assert.ok(
            sameValue(state.live, batch.live),
            `an admissible order ends on the batch value: ${JSON.stringify({ batch: batch.live, ordered: state.live })}`
          );
          assert.deepEqual(
            state.tags.map((tag) => tag.id).sort(),
            batch.tags.map((tag) => tag.id).sort(),
            'an admissible order keeps the batch tags'
          );
        }
      ),
      { numRuns: 2000 }
    );
  });

  it('decides the same whatever order a client holds the tags in', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.infiniteStream(fc.nat({ max: 2 })),
        fc.infiniteStream(fc.nat({ max: 1000 })),
        ({ clients, ops }, picks, shuffle) => {
          const { live, tags } = run(clients, ops);
          const outcomes = new Map(
            changesOf(tags).map((change) => [
              change,
              (['accept', 'keep', 'reject'] as const)[picks.next().value],
            ])
          );
          const outcome: LayerOutcome = ({ change }) =>
            outcomes.get(change) ?? 'keep';
          const shuffled = [...tags].sort(() => shuffle.next().value - 500);
          const shape = (list: readonly FormatTag[]) =>
            keySteps(list).map((step) => ({
              below: step.below ?? null,
              ids: step.tags.map((tag) => tag.id).sort(),
            }));
          const held = decideKey(live, tags, outcome);
          const other = decideKey(live, shuffled, outcome);

          assert.deepEqual(
            shape(shuffled),
            shape(tags),
            'the tags order in the document changes no step'
          );
          assert.deepEqual(
            [...other.waits].sort(),
            [...held.waits].sort(),
            'the tags order in the document changes no wait'
          );
          assert.deepEqual(
            other.value,
            held.value,
            'the tags order in the document changes no value'
          );
          assert.deepEqual(
            other.kept.map((tag) => tag.id).sort(),
            held.kept.map((tag) => tag.id).sort(),
            'the tags order in the document changes no kept tag'
          );
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('keeps the same tag objects it was given', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.infiniteStream(fc.nat({ max: 2 })),
        ({ clients, ops }, picks) => {
          const { live, tags } = run(clients, ops);
          const outcomes = new Map(
            changesOf(tags).map((change) => [
              change,
              (['accept', 'keep', 'reject'] as const)[picks.next().value],
            ])
          );
          const { kept } = decideKey(
            live,
            tags,
            ({ change }) => outcomes.get(change) ?? 'keep'
          );

          for (const tag of kept) {
            assert.ok(
              tags.includes(tag),
              'every kept tag is an input tag, never a copy'
            );
          }
        }
      ),
      { numRuns: 300 }
    );
  });

  it('restores the value before the first tag when everything is rejected and keeps the live value when everything is accepted', () => {
    fc.assert(
      fc.property(historyArb, ({ clients, ops }) => {
        const { live, tags } = run(clients, ops);

        if (tags.length === 0) return;
        const rejected = apply(live, tags, () => 'reject');
        const accepted = apply(live, tags, () => 'accept');

        assert.ok(
          sameValue(rejected.live, keySteps(tags)[0].below),
          'rejecting everything restores the value the bottom step replaced'
        );
        assert.equal(
          rejected.tags.length,
          0,
          'rejecting everything leaves no tag'
        );
        assert.ok(
          sameValue(accepted.live, live),
          'accepting everything keeps the live value'
        );
        assert.equal(
          accepted.tags.length,
          0,
          'accepting everything leaves no tag'
        );
      }),
      { numRuns: 300 }
    );
  });

  it('decides the same whatever value a correction left live', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.nat({ max: VALUES.length - 1 }),
        fc.infiniteStream(fc.nat({ max: 2 })),
        ({ clients, ops }, corrected, picks) => {
          const { live, tags } = run(clients, ops);
          const outcomes = new Map(
            changesOf(tags).map((change) => [
              change,
              (['accept', 'keep', 'reject'] as const)[picks.next().value],
            ])
          );
          const outcome: LayerOutcome = ({ change }) =>
            outcomes.get(change) ?? 'keep';
          const before = decideKey(live, tags, outcome);
          const after = decideKey(VALUES[corrected], tags, outcome);

          assert.deepEqual(
            [...after.waits].sort(),
            [...before.waits].sort(),
            'a correction that rewrote only the live value changes no wait'
          );
          assert.equal(
            after.value.kind,
            before.value.kind,
            'a correction changes no decision'
          );
          if (before.value.kind === 'set' && after.value.kind === 'set') {
            assert.ok(
              sameValue(after.value.value, before.value.value),
              'a correction changes no restored value'
            );
          }
        }
      ),
      { numRuns: 300 }
    );
  });

  it('leaves one tip after any local Suggesting write that adds a tag', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.nat({ max: VALUES.length - 1 }),
        ({ clients, ops }, value) => {
          const { live, tags } = run(clients, ops);
          const next = writeLayer({
            intent: 'propose',
            isOwn: () => false,
            next: VALUES[value],
            ownInsertion: false,
            previous: live,
            source: 'command',
            tag: (fields) => ({
              ...fields,
              at: 1,
              author: 'z',
              change: 'z',
              id: 'z1',
              key: 'bold',
              kind: 'format',
            }),
            tags,
          });

          assert.equal(
            next.length,
            tags.length + 1,
            'another change always adds one tag'
          );
          assert.deepEqual(
            keyTips(next),
            ['z1'],
            'the new tag is the only tip'
          );
        }
      ),
      { numRuns: 200 }
    );
  });
  it("withdraws a writer's own tag on their own insertion when the value goes back", () => {
    // Bob's red tag under `blue` was accepted, so only Alice's tag is left.
    const blue = {
      at: 1,
      author: 'alice',
      before: 'red',
      change: 'alice:3',
      id: 'blue',
      key: 'color',
      kind: 'format' as const,
      over: ['red'],
    };

    assert.deepEqual(
      writeLayer({
        intent: 'propose',
        isOwn: (tag) => tag.author === 'alice',
        next: 'red',
        ownInsertion: true,
        previous: 'blue',
        source: 'command',
        tag: (fields) => ({
          ...fields,
          at: 1,
          author: 'alice',
          change: 'alice:4',
          id: 'new',
          key: 'color',
          kind: 'format',
        }),
        tags: [blue],
      }),
      []
    );
  });
});
