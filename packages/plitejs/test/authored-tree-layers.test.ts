import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  decideKey,
  type FormatTag,
  type IsAccepted,
  keySteps,
  keyTips,
  type LayerOutcome,
  type LayerValue,
  recordFormats,
} from '../src/authored/tree/layers';

type Client = {
  added: Map<string, FormatTag>;
  landed: Set<string>;
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
  | { client: number; kind: 'correct' | 'edit'; value: number }
  | { a: number; b: number; kind: 'sync' };

const isEditing = (change: string) => change.startsWith('~edit:');
const accepted: IsAccepted = ({ change }) => isEditing(change);

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
        kind: fc.constantFrom('correct' as const, 'edit' as const),
        value: fc.nat({ max: VALUES.length - 1 }),
      }),
      weight: 2,
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
  for (const id of [...a.landed, ...b.landed]) {
    a.landed.add(id);
    b.landed.add(id);
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
    landed: new Set(),
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
    let write: string | undefined;
    const change =
      op.kind === 'write' ? `p${peer.id}c${op.change}` : `~edit:p${peer.id}`;
    const after = recordFormats({
      keys: ['bold'],
      next: { bold: next },
      ownInsertion: false,
      previous: { bold: peer.live },
      source: op.kind === 'correct' ? 'correction' : 'command',
      standing: { accepted, landed: (id) => peer.landed.has(id) },
      tags: before,
      writer: {
        at: 1,
        author: `p${peer.id}`,
        change,
        isOwn: (tag) => tag.change === change,
        commitWriteId: () => (write ??= `p${peer.id}t${(peer.clock += 1)}`),
      },
    });

    for (const tag of before) {
      if (!after.includes(tag)) peer.removed.add(tag.id);
    }
    for (const tag of after) {
      if (!before.includes(tag) && isEditing(tag.change)) {
        peer.landed.add(tag.id);
      }
      peer.added.set(tag.id, tag);
    }
    peer.live = next;
    stamp += 1;
    peer.written = stamp;
  }
  for (const a of peers) for (const b of peers) sync(a, b);

  return {
    landed: peers[0].landed as ReadonlySet<string>,
    live: peers[0].live,
    tags: tagsOf(peers[0]),
  };
};

const sameValue = (left: LayerValue, right: LayerValue) =>
  JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

const apply = (
  live: LayerValue,
  tags: readonly FormatTag[],
  outcome: LayerOutcome,
  landed: ReadonlySet<string>,
  before: IsAccepted = accepted
) => {
  const decision = decideKey(tags, {
    accepted: before,
    landed: (id) => landed.has(id),
    outcome,
  });

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

const decidableChanges = (tags: readonly FormatTag[]) => [
  ...new Set(
    tags.map((tag) => tag.change).filter((change) => !isEditing(change))
  ),
];

describe('format layers', () => {
  it('gives one result for every admissible order of the same decisions', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.infiniteStream(fc.boolean()),
        fc.infiniteStream(fc.nat({ max: 1000 })),
        ({ clients, ops }, coins, shuffle) => {
          const { landed, live, tags } = run(clients, ops);
          const changes = decidableChanges(tags);
          const every = coins.next().value || coins.next().value;
          const decided = every
            ? changes
            : changes.filter(() => coins.next().value);

          if (decided.length === 0) return;
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
          const batch = apply(live, tags, outcomeFor(decided), landed);
          const order = [...decided].sort(() => shuffle.next().value - 500);

          // Grow each group from a shuffled order until it applies, so every
          // partition tried is admissible; a blocked group changes nothing.
          let state = { live, tags };
          let group: string[] = [];
          const landedEarlier = new Set(landed);
          const acceptedEarlier = new Set<string>();
          const acceptedBefore: IsAccepted = (member) =>
            accepted(member) || acceptedEarlier.has(member.change);

          for (const change of order) {
            group = group.concat(change);
            const step = apply(
              state.live,
              state.tags,
              outcomeFor(group),
              landedEarlier,
              acceptedBefore
            );

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
            for (const tag of step.decision.landed) landedEarlier.add(tag.id);
            for (const done of group) {
              if (actions.get(done) === 'accept') acceptedEarlier.add(done);
            }
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
          assert.deepEqual(
            [...landedEarlier].filter((id) => !landed.has(id)).sort(),
            [...new Set(batch.decision.landed.map((tag) => tag.id))].sort(),
            'an admissible order lands the batch writes'
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
          const { landed, tags } = run(clients, ops);
          const outcomes = new Map(
            decidableChanges(tags).map((change) => [
              change,
              (['accept', 'keep', 'reject'] as const)[picks.next().value],
            ])
          );
          const outcome: LayerOutcome = ({ change }) =>
            outcomes.get(change) ?? 'keep';
          const isLanded = (id: string) => landed.has(id);
          const shuffled = [...tags].sort(() => shuffle.next().value - 500);
          const shape = (list: readonly FormatTag[]) =>
            keySteps(list, isLanded).map((step) => ({
              below: step.below ?? null,
              ids: step.tags.map((tag) => tag.id).sort(),
            }));
          const reading = { accepted, landed: isLanded, outcome };
          const held = decideKey(tags, reading);
          const other = decideKey(shuffled, reading);

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
          const { landed, tags } = run(clients, ops);
          const outcomes = new Map(
            decidableChanges(tags).map((change) => [
              change,
              (['accept', 'keep', 'reject'] as const)[picks.next().value],
            ])
          );
          const { kept } = decideKey(tags, {
            accepted,
            landed: (id) => landed.has(id),
            outcome: ({ change }) => outcomes.get(change) ?? 'keep',
          });

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
        const { landed, live, tags } = run(clients, ops);

        if (tags.length === 0) return;
        const rejected = apply(live, tags, () => 'reject', landed);
        const acceptedAll = apply(live, tags, () => 'accept', landed);

        const anEditingTagStands = tags.some((tag) => isEditing(tag.change));

        if (!anEditingTagStands) {
          assert.ok(
            sameValue(
              rejected.live,
              keySteps(tags, (id) => landed.has(id))[0].below
            ),
            'rejecting everything restores the value the bottom step replaced'
          );
        }
        assert.ok(
          rejected.tags.every((tag) => isEditing(tag.change)),
          'rejecting everything leaves only Editing tags'
        );
        assert.ok(
          sameValue(acceptedAll.live, live),
          'accepting everything keeps the live value'
        );
        const leftUnlanded = (tag: FormatTag) =>
          (tag.over ?? [])
            .flat()
            .some(
              ({ id }) =>
                id !== tag.id &&
                !tags.some((other) => other.id === id) &&
                !landed.has(id)
            );

        assert.ok(
          acceptedAll.tags.every(leftUnlanded),
          'accepting everything keeps only tags over a write that left without landing'
        );
      }),
      { numRuns: 300 }
    );
  });

  it('leaves one tip after any local Suggesting write that adds a tag', () => {
    fc.assert(
      fc.property(
        historyArb,
        fc.nat({ max: VALUES.length - 1 }),
        ({ clients, ops }, value) => {
          const { landed, live, tags } = run(clients, ops);
          const next = recordFormats({
            keys: ['bold'],
            next: { bold: VALUES[value] },
            ownInsertion: false,
            previous: { bold: live },
            source: 'command',
            standing: { accepted, landed: (id) => landed.has(id) },
            tags,
            writer: {
              at: 1,
              author: 'z',
              change: 'z',
              isOwn: () => false,
              commitWriteId: () => 'z1',
            },
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

  it('stacks a tag per Editing turn when writers take turns', () => {
    let tags: readonly FormatTag[] = [
      {
        at: 1,
        author: 'ann',
        change: 'ann:1',
        id: 'a1',
        key: 'color',
        kind: 'format',
        write: { kind: 'set', value: 0 },
      },
    ];

    for (let round = 1; round <= 4; round++) {
      const author = round % 2 === 1 ? 'carol' : 'dave';

      tags = recordFormats({
        keys: ['color'],
        next: { color: round },
        ownInsertion: false,
        previous: { color: round - 1 },
        source: 'command',
        standing: { accepted, landed: (id) => id.startsWith('e') },
        tags,
        writer: {
          at: round,
          author,
          change: `~edit:${author}`,
          isOwn: (tag) => tag.author === author,
          commitWriteId: () => `e${round}`,
        },
      });
    }

    assert.deepEqual(
      tags.map(({ change, id, over }) => ({
        change,
        id,
        over: over?.map((step) => step.map((link) => link.id)),
      })),
      [
        { change: 'ann:1', id: 'a1', over: undefined },
        { change: '~edit:carol', id: 'e1', over: [['a1']] },
        { change: '~edit:dave', id: 'e2', over: [['a1'], ['e1']] },
        { change: '~edit:carol', id: 'e3', over: [['a1'], ['e1'], ['e2']] },
        {
          change: '~edit:dave',
          id: 'e4',
          over: [['a1'], ['e1'], ['e2'], ['e3']],
        },
      ]
    );
  });

  it("withdraws a writer's own tag on their own insertion when the value goes back", () => {
    const red = {
      at: 1,
      author: 'bob',
      change: 'bob:1',
      id: 'red',
      key: 'color',
      kind: 'format' as const,
      write: { kind: 'set' as const, value: 'red' },
    };
    const blue = {
      at: 1,
      author: 'alice',
      base: { kind: 'remove' as const },
      before: 'red',
      change: 'alice:3',
      id: 'blue',
      key: 'color',
      kind: 'format' as const,
      write: { kind: 'set' as const, value: 'blue' },
      over: [[{ id: 'red', write: { kind: 'set' as const, value: 'red' } }]],
    };

    assert.deepEqual(
      recordFormats({
        keys: ['color'],
        next: { color: 'red' },
        ownInsertion: true,
        previous: { color: 'blue' },
        source: 'command',
        standing: {
          accepted: ({ change }) => change === 'bob:1',
          landed: () => false,
        },
        tags: [red, blue],
        writer: {
          at: 1,
          author: 'alice',
          change: 'alice:4',
          isOwn: (tag) => tag.author === 'alice',
          commitWriteId: () => 'new',
        },
      }),
      [red]
    );
  });
});
