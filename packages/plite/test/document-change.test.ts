import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  type Descendant,
  type Editor,
  type Element,
  type SnapshotIndex,
} from '@platejs/plite';

import {
  classifyDocumentChange,
  ChangeDraft,
} from '../src/core/change/builder';
import { DocumentChange } from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import {
  getRootChangeApplyStats,
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  moveNodeChange,
  RootChange,
  removeNodeChange,
  removeTextChange,
  replaceChildrenChange,
  setNodeChange,
  updateNodePropertiesChange,
} from '../src/core/change/root-change';
import {
  getPreparedDocumentNodeKey,
  getPreparedDocumentSlice,
  hasMaterializedDocumentSliceTokens,
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../src/core/change/tokens';
import {
  advancePathStableSnapshotIndex,
  buildSnapshotIndex,
  getSnapshotIndexMappingStats,
  mapSnapshotIndexThroughChange,
} from '../src/core/snapshot-index';
import { getNodeKeyForNode, seedNodeKeys } from '../src/utils/node-keys';
import {
  createTestDocumentChange,
  getTestDocumentRootChange,
  getTestDocumentRootChanges,
} from './support/document-change';

const paragraph = (text: string, props: Record<string, unknown> = {}) =>
  ({
    type: 'paragraph',
    ...props,
    children: [{ text }],
  }) satisfies Element;

const asJsonNodes = (nodes: readonly Element[]) =>
  nodes as unknown as readonly JsonNode[];

const applyByTokenReference = (change: RootChange, document: DocumentIndex) => {
  let output = PreparedTokenSlice.empty;
  let position = 0;

  for (const section of change.toJSON()) {
    assert.equal(section.properties, undefined);
    output = output.concat(
      section.replacement
        ? PreparedTokenSlice.fromJSON(section.replacement)
        : document.slice(position, position + section.length)
    );
    position += section.length;
  }

  assert.equal(position, document.length);

  return DocumentIndex.fromTokens(output);
};

type GeneratedDocumentAction =
  | { at: number; kind: 'insert-block'; text: string }
  | { at: number; kind: 'remove-block' }
  | { at: number; kind: 'set-block'; rank: number }
  | { at: number; kind: 'insert-text'; offset: number; text: string }
  | { at: number; kind: 'remove-text'; offset: number }
  | { from: number; kind: 'move-block'; to: number };

const createSeededRandom = (initialSeed: number) => {
  let seed = initialSeed >>> 0;

  return () => {
    seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;

    return seed / 0x1_00_00_00_00;
  };
};

const generateDocumentAction = (
  value: JsonEditorValue,
  random: () => number,
  label: string,
  options: { allowMove?: boolean } = {}
): GeneratedDocumentAction => {
  const at = Math.floor(random() * value.children.length);
  const text = (value.children[at] as { children: readonly [{ text: string }] })
    .children[0].text;
  const action = Math.floor(random() * 6);

  if (action === 0) {
    return {
      at: Math.floor(random() * (value.children.length + 1)),
      kind: 'insert-block',
      text: `${label}-${Math.floor(random() * 1000)}`,
    };
  }
  if (action === 1 && value.children.length > 1) {
    return { at, kind: 'remove-block' };
  }
  if (action === 2) {
    return {
      at,
      kind: 'set-block',
      rank: 1 + Math.floor(random() * 1000),
    };
  }
  if (action === 3 || text.length === 0) {
    return {
      at,
      kind: 'insert-text',
      offset: Math.floor(random() * (text.length + 1)),
      text: String.fromCharCode(97 + Math.floor(random() * 26)),
    };
  }
  if (action === 4) {
    return {
      at,
      kind: 'remove-text',
      offset: Math.floor(random() * text.length),
    };
  }

  if (options.allowMove === false) {
    return {
      at,
      kind: 'set-block',
      rank: 1 + Math.floor(random() * 1000),
    };
  }

  let to = Math.floor(random() * value.children.length);

  if (to === at) to = (to + 1) % value.children.length;

  return { from: at, kind: 'move-block', to };
};

const applyDocumentAction = (
  value: JsonEditorValue,
  action: GeneratedDocumentAction
): JsonEditorValue => {
  const next = structuredClone(value) as {
    children: Array<{ children: Array<{ text: string }>; rank?: number }>;
  };

  switch (action.kind) {
    case 'insert-block': {
      next.children.splice(action.at, 0, paragraph(action.text));
      break;
    }
    case 'insert-text': {
      const text = next.children[action.at]!.children[0]!;

      text.text = `${text.text.slice(0, action.offset)}${
        action.text
      }${text.text.slice(action.offset)}`;
      break;
    }
    case 'move-block': {
      const [block] = next.children.splice(action.from, 1);

      next.children.splice(action.to, 0, block!);
      break;
    }
    case 'remove-block': {
      next.children.splice(action.at, 1);
      break;
    }
    case 'remove-text': {
      const text = next.children[action.at]!.children[0]!;

      text.text = `${text.text.slice(0, action.offset)}${text.text.slice(
        action.offset + 1
      )}`;
      break;
    }
    case 'set-block': {
      next.children[action.at]!.rank = action.rank;
      break;
    }
  }

  return next as unknown as JsonEditorValue;
};

const createDocumentActionChange = (
  value: JsonEditorValue,
  action: GeneratedDocumentAction
) => {
  const document = DocumentIndex.fromValue(value.children);
  let change: RootChange;

  switch (action.kind) {
    case 'insert-block': {
      change = insertNodeChange(document, [action.at], paragraph(action.text));
      break;
    }
    case 'insert-text': {
      change = insertTextChange(
        document,
        [action.at, 0],
        action.offset,
        action.text
      );
      break;
    }
    case 'move-block': {
      change = moveNodeChange(document, [action.from], [action.to]);
      break;
    }
    case 'remove-block': {
      change = removeNodeChange(document, [action.at]);
      break;
    }
    case 'remove-text': {
      const text = (
        value.children[action.at] as {
          children: readonly [{ text: string }];
        }
      ).children[0].text;

      change = removeTextChange(
        document,
        [action.at, 0],
        action.offset,
        text[action.offset]!
      );
      break;
    }
    case 'set-block': {
      change = setNodeChange(document, [action.at], { rank: action.rank });
      break;
    }
  }

  return createTestDocumentChange({ primary: change });
};

const withGeneratedTrace = (
  seed: number,
  actions: readonly GeneratedDocumentAction[],
  run: () => void
) => {
  try {
    run();
  } catch (error) {
    throw new Error(
      `DocumentChange generated law failed for seed ${seed} and actions ${JSON.stringify(
        actions
      )}`,
      { cause: error }
    );
  }
};

describe('JSON document change algebra', () => {
  it('validates document changes without constructor identity', () => {
    const change = DocumentChange.between(
      { children: asJsonNodes([paragraph('before')]) },
      { children: asJsonNodes([paragraph('after')]) }
    );
    const structural = Object.assign(Object.create(null) as object, {
      apply: change.apply.bind(change),
      compose: change.compose.bind(change),
      correct: change.correct.bind(change),
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      empty: change.empty,
      invert: change.invert.bind(change),
      iterChangedRanges: change.iterChangedRanges.bind(change),
      mapPosition: change.mapPosition.bind(change),
      primaryClassification: change.primaryClassification,
      rootClassifications: change.rootClassifications,
      toJSON: change.toJSON.bind(change),
    }) as DocumentChange;

    assert.equal(DocumentChange.isDocumentChange(change), true);
    assert.equal(structural instanceof DocumentChange, false);
    assert.equal(DocumentChange.isDocumentChange(structural), true);
    assert.equal(DocumentChange.isDocumentChange({}), false);
  });

  it('constructs a builder once at finalization and keeps direct changes strict', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a')]),
    };
    let constructions = 0;
    const construct = ({ after }: { after: JsonEditorValue }) => {
      constructions++;
      const canonical = {
        ...after,
        children: [...after.children, paragraph('required') as JsonNode],
      };

      return DocumentChange.between(after, canonical);
    };
    const builder = new ChangeDraft(before, {
      construct,
      validate: (value) => {
        assert.equal(value.children.length, 2);
      },
    });
    const step = builder.insertText('main', [0, 0], 1, '!');

    assert.equal(constructions, 0);
    assert.deepEqual(step.change.apply(before), {
      children: asJsonNodes([paragraph('a!')]),
    });
    const construction = builder.finalize();

    assert.equal(constructions, 1);
    assert.ok(construction);
    assert.deepEqual(builder.value, {
      children: asJsonNodes([paragraph('a!'), paragraph('required')]),
    });
    assert.deepEqual(builder.change.apply(before), builder.value);

    const direct = new ChangeDraft(before, {
      construct,
      validate: (value) => {
        assert.equal(value.children.length, 1);
      },
    });
    const directChange = createTestDocumentChange({
      primary: insertTextChange(
        DocumentIndex.fromValue(before.children),
        [0, 0],
        1,
        '?'
      ),
    });

    direct.applyCanonical(directChange);
    assert.equal(constructions, 1);
    assert.deepEqual(direct.value, {
      children: asJsonNodes([paragraph('a?')]),
    });
  });

  it('rejects a direct change before mutating builder state', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a')]),
    };
    let constructedRoots = 0;
    const builder = new ChangeDraft(before, {
      indexConstructedRoot: () => {
        constructedRoots++;
      },
      validate: (value) => {
        if (
          (value.children[0] as { children: readonly [{ text: string }] })
            .children[0].text !== 'a'
        ) {
          throw new Error('noncanonical');
        }
      },
    });
    const change = createTestDocumentChange({
      primary: insertTextChange(
        DocumentIndex.fromValue(before.children),
        [0, 0],
        1,
        '!'
      ),
    });

    assert.throws(() => builder.applyCanonical(change), /noncanonical/);
    assert.equal(builder.change.empty, true);
    assert.equal(builder.value, before);
    assert.equal(constructedRoots, 0);
  });

  it('validates the exact immutable root published by a direct change', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a')]),
    };
    let validatedChildren: readonly JsonNode[] | undefined;
    const builder = new ChangeDraft(before, {
      validate: (value) => {
        validatedChildren = value.children;
      },
    });
    const change = createTestDocumentChange({
      primary: insertTextChange(
        DocumentIndex.fromValue(before.children),
        [0, 0],
        1,
        '!'
      ),
    });
    const step = builder.applyCanonical(change);

    assert.equal(step.after.children, validatedChildren);
    assert.equal(builder.value.children, validatedChildren);
    assert.equal(Object.isFrozen(validatedChildren), true);
    assert.equal(builder.classify(), step.change);
  });

  it('rejects a noncanonical primitive draft at publication', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a')]),
    };
    const builder = new ChangeDraft(before, {
      validate: (value) => {
        if (
          (value.children[0] as { children: readonly [{ text: string }] })
            .children[0].text !== 'a'
        ) {
          throw new Error('noncanonical');
        }
      },
    });

    builder.insertText('main', [0, 0], 1, '!');

    assert.throws(() => builder.finalize(), /noncanonical/);
    assert.throws(() => builder.prepare(), /non-canonical/);
  });

  it('binds construction preparation while reserving canonical assertions for external changes', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a')]),
    };
    const preparation = Object.freeze({});
    let assertionCount = 0;
    let receivedPreparation: object | undefined;
    let validationCount = 0;
    const builder = new ChangeDraft(before, {
      assertCanonical: () => {
        assertionCount++;
      },
      construct: ({ after }, received) => {
        receivedPreparation = received;

        return DocumentChange.between(after, after);
      },
      validate: () => {
        validationCount++;
      },
    });

    builder.insertText('main', [0, 0], 1, '!');
    assert.equal(builder.finalize(preparation), null);
    assert.equal(receivedPreparation, preparation);
    assert.equal(validationCount, 1);
    assert.equal(assertionCount, 0);

    const direct = new ChangeDraft(before, {
      assertCanonical: () => {
        assertionCount++;
      },
      validate: () => {
        validationCount++;
      },
    });
    const change = createTestDocumentChange({
      primary: insertTextChange(
        DocumentIndex.fromValue(before.children),
        [0, 0],
        1,
        '?'
      ),
    });

    direct.applyCanonical(change);
    assert.equal(validationCount, 2);
    assert.equal(assertionCount, 1);
  });

  it('adopts an exact trusted indexed result without replaying its change', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a'), paragraph('b')]),
    };
    const beforeIndex = DocumentIndex.fromValue(before.children);
    const inserted = asJsonNodes([paragraph('x'), paragraph('y')]);
    const insert = PreparedTokenSlice.fromPreparedNodes(inserted);
    const prepared = getPreparedDocumentSlice(insert)!;
    const afterIndex = beforeIndex.withPreparedSplicedNodes([], 0, 1, prepared);
    const change = createTestDocumentChange({
      primary: RootChange.create(beforeIndex, {
        from: beforeIndex.nodeRange([0]).from,
        insert,
        to: beforeIndex.nodeRange([0]).to,
      }),
    });
    const builder = new ChangeDraft(before);
    const step = builder.applyTrustedCanonical(change, {
      indexedAfter: new Map([['main', afterIndex]]),
    });

    assert.equal(step.indexedAfter.get('main'), afterIndex);
    assert.equal(builder.value.children, afterIndex.value);
    assert.equal(builder.value.children[0], inserted[0]);
    assert.equal(builder.value.children[1], inserted[1]);
    assert.equal(builder.value.children[2], beforeIndex.value[1]);
    assert.equal(hasMaterializedDocumentSliceTokens(insert), false);

    const invalid = new ChangeDraft(before);

    assert.throws(
      () =>
        invalid.applyTrustedCanonical(change, {
          indexedAfter: new Map([
            ['main', DocumentIndex.fromValue(asJsonNodes([paragraph('x')]))],
          ]),
        }),
      /does not match change lengths/
    );
    assert.equal(invalid.value, before);
    assert.equal(invalid.change.empty, true);
  });

  it('adopts the exact empty indexed result for a deleted root', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
      roots: { island: asJsonNodes([paragraph('child')]) },
    };
    const after: JsonEditorValue = {
      children: before.children,
    };
    const change = DocumentChange.between(before, after);
    const candidate = new ChangeDraft(before).apply(change);
    const deletedRoot = candidate.indexedAfter.get('island');

    assert.equal(deletedRoot?.length, 0);

    let indexedDeletedRoot: DocumentIndex | undefined;
    const builder = new ChangeDraft(before, {
      indexConstructedRoot: ({ after, root }) => {
        if (root === 'island') indexedDeletedRoot = after;
      },
    });
    const step = builder.applyTrustedCanonical(change, {
      indexedAfter: candidate.indexedAfter,
      runtimeCandidates: candidate.runtimeCandidates,
    });

    assert.equal(indexedDeletedRoot, deletedRoot);
    assert.equal(step.indexedAfter.get('island'), deletedRoot);
    assert.equal(
      step.runtimeCandidates.get('island'),
      candidate.runtimeCandidates.get('island')
    );
    assert.deepEqual(step.after, after);
    assert.deepEqual(builder.value, after);
  });

  it('adopts prepared forks only for the exact parent, state, and revision', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('a')]),
    };
    let revision = Object.freeze({ id: Number(0) });
    let constructions = 0;
    const construct = ({ after }: { after: JsonEditorValue }) => {
      constructions++;

      return DocumentChange.between(after, after);
    };
    const createBuilder = () =>
      new ChangeDraft(before, {
        construct,
        preparationRevision: () => revision,
      });
    const prepareInsert = (parent: ChangeDraft) => {
      const fork = parent.fork();

      fork.insertText('main', [0, 0], 1, '!');
      assert.equal(fork.finalize(), null);

      return fork.prepare();
    };

    const parent = createBuilder();
    const prepared = prepareInsert(parent);
    const adopted = parent.adopt(prepared);

    assert(adopted);
    assert.equal(
      parent.classify(),
      adopted.change,
      'exact prepared adoption must retain its classification cache'
    );
    assert.deepEqual(parent.value, {
      children: asJsonNodes([paragraph('a!')]),
    });
    assert.equal(parent.finalize(), null);
    assert.equal(constructions, 1);

    const staleParent = createBuilder();
    const stalePrepared = prepareInsert(staleParent);

    staleParent.insertText('main', [0, 0], 0, '?');
    assert.equal(staleParent.adopt(stalePrepared), null);

    const wrongParent = createBuilder();
    const wrongParentPrepared = prepareInsert(wrongParent);

    assert.equal(createBuilder().adopt(wrongParentPrepared), null);

    const revisedParent = createBuilder();
    const revisedPrepared = prepareInsert(revisedParent);

    revision = Object.freeze({ id: 1 });
    assert.equal(revisedParent.adopt(revisedPrepared), null);
  });

  it('adopts prepared changes only across the exact shared editor base', () => {
    const children = asJsonNodes([paragraph('a')]);
    const value = { children };
    const authority = Object.freeze({});
    const revision = Object.freeze({});
    const createBuilder = (
      base: JsonEditorValue,
      owner = authority,
      currentRevision = revision
    ) =>
      new ChangeDraft(base, {
        construct: ({ after }) => DocumentChange.between(after, after),
        preparationAuthority: owner,
        preparationRevision: () => currentRevision,
      });
    const producer = createBuilder(value);

    producer.insertText('main', [0, 0], 1, '!');
    assert.equal(producer.finalize(), null);
    const prepared = producer.prepare();
    const receiver = createBuilder(value);

    assert(receiver.adopt(prepared));
    assert.deepEqual(receiver.value, {
      children: asJsonNodes([paragraph('a!')]),
    });
    assert.equal(
      createBuilder({ children }).adopt(prepared),
      null,
      'different document wrappers must reject prepared work'
    );
    assert.equal(
      createBuilder(value, Object.freeze({})).adopt(prepared),
      null,
      'different editor authorities must reject prepared work'
    );
    assert.equal(
      createBuilder(value, authority, Object.freeze({})).adopt(prepared),
      null,
      'different revisions must reject prepared work'
    );
  });

  it('replaces one token range as one canonical builder step', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('ab')]),
    };
    const builder = new ChangeDraft(before);
    const step = builder.replaceSlice(
      'main',
      { offset: 1, path: [0, 0] },
      { offset: 1, path: [0, 0] },
      PreparedTokenSlice.text('!')
    );

    assert.deepEqual(builder.value, {
      children: asJsonNodes([paragraph('a!b')]),
    });
    assert.deepEqual(step.change.apply(before), builder.value);
    assert.deepEqual(builder.change.apply(before), builder.value);
  });

  it('keeps multi-child replacement sparse through apply, inverse, compose, serialization, and transform', () => {
    const children = [
      paragraph('a'),
      paragraph('b'),
      paragraph('c'),
      paragraph('d'),
      paragraph('e'),
    ];
    const before = DocumentIndex.fromValue(asJsonNodes(children));
    const replacements = asJsonNodes([paragraph('x'), paragraph('y')]);
    const change = replaceChildrenChange(before, [], 1, 3, replacements);
    const after = change.apply(before);

    assert.deepEqual(after.value, [children[0], ...replacements, children[4]]);
    assert.equal(after.value[0], before.value[0]);
    assert.equal(after.value.at(-1), before.value.at(-1));

    const inverse = change.invert(before);

    assert.deepEqual(inverse.apply(after).value, before.value);
    assert.deepEqual(change.compose(inverse).apply(before).value, before.value);
    assert.deepEqual(
      RootChange.fromJSON(change.toJSON()).apply(before).value,
      after.value
    );

    const concurrent = insertNodeChange(before, [5], paragraph('tail'));
    const transformed = RootChange.transformInDocument(
      change,
      concurrent,
      before
    );

    assert.deepEqual(
      transformed.b.apply(after).value,
      transformed.a.apply(concurrent.apply(before)).value
    );
  });

  it('applies far-apart replacements locally without rebuilding document tokens', () => {
    const children = Array.from({ length: 10_000 }, (_, index) =>
      paragraph(String(index))
    );
    const document = DocumentIndex.fromValue(asJsonNodes(children));
    const first = document.nodeRange([1000]);
    const second = document.nodeRange([9000]);
    const change = RootChange.create(document, [
      { from: first.from, to: first.to },
      { from: second.from, to: second.to },
    ]);
    const applied = change.apply(document);
    const stats = getRootChangeApplyStats(change);

    assert.deepEqual(applied.value, [
      ...children.slice(0, 1000),
      ...children.slice(1001, 9000),
      ...children.slice(9001),
    ]);
    assert.equal(applied.value[0], document.value[0]);
    assert.equal(applied.value.at(-1), document.value.at(-1));
    assert.deepEqual(stats, {
      ancestorPaths: [[], []],
      changedRanges: [
        {
          fromAfter: first.from,
          fromBefore: first.from,
          toAfter: first.from,
          toBefore: first.to,
        },
        {
          fromAfter: second.from - (first.to - first.from),
          fromBefore: second.from,
          toAfter: second.from - (first.to - first.from),
          toBefore: second.to,
        },
      ],
      fallbackReason: null,
      localizedReplacements: 2,
      propertyChanges: 0,
      replacements: 2,
      usedTokenFallback: false,
    });
  });

  it('matches token application for randomized disjoint local replacements', () => {
    for (let seed = 1; seed <= 64; seed++) {
      const random = createSeededRandom(seed);
      const children = Array.from({ length: 16 }, (_, index) =>
        paragraph(`${seed}-${index}`)
      );
      const document = DocumentIndex.fromValue(asJsonNodes(children));
      const indexes = [1, 5, 10, 14].filter(() => random() > 0.25);
      const changes = indexes.map((index) => {
        const range = document.nodeRange([index]);
        const replacementCount = Math.floor(random() * 3);

        return {
          from: range.from,
          insert: PreparedTokenSlice.fromNodes(
            Array.from({ length: replacementCount }, (_, replacement) =>
              paragraph(`${seed}-${index}-r${replacement}`)
            )
          ),
          to: range.to,
        };
      });
      const change = RootChange.create(document, changes);
      const expected = applyByTokenReference(change, document);
      const applied = change.apply(document);
      const stats = getRootChangeApplyStats(change);

      assert.deepEqual(applied.value, expected.value, `seed ${seed}`);
      assert.equal(applied.length, change.newLength, `seed ${seed}`);
      assert.equal(expected.length, change.newLength, `seed ${seed}`);
      assert.equal(stats?.usedTokenFallback, false, `seed ${seed}`);
      assert.equal(
        stats?.localizedReplacements,
        changes.length,
        `seed ${seed}`
      );
    }
  });

  it('localizes disjoint token ranges when their rebuilt tree paths nest', () => {
    const document = DocumentIndex.fromValue(
      asJsonNodes([paragraph('alpha'), paragraph('beta')])
    );
    const second = document.nodeRange([1]);
    const change = RootChange.create(document, [
      {
        from: document.positionAt({ offset: 1, path: [0, 0] }),
        insert: PreparedTokenSlice.text('X'),
        to: document.positionAt({ offset: 2, path: [0, 0] }),
      },
      { from: second.from, to: second.to },
    ]);
    const expected = applyByTokenReference(change, document);
    const applied = change.apply(document);

    assert.deepEqual(applied.value, expected.value);
    assert.deepEqual(getRootChangeApplyStats(change), {
      ancestorPaths: [[], [0, 0]],
      changedRanges: [
        {
          fromAfter: 3,
          fromBefore: 3,
          toAfter: 4,
          toBefore: 4,
        },
        {
          fromAfter: 9,
          fromBefore: 9,
          toAfter: 9,
          toBefore: 17,
        },
      ],
      fallbackReason: null,
      localizedReplacements: 2,
      propertyChanges: 0,
      replacements: 2,
      usedTokenFallback: false,
    });
  });

  it('maps structural node keys lazily without changing snapshot queries', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue(
      asJsonNodes([
        paragraph('a'),
        paragraph('b'),
        paragraph('c'),
        paragraph('d'),
        paragraph('e'),
      ])
    );
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const change = replaceChildrenChange(
      before,
      [],
      1,
      3,
      asJsonNodes([paragraph('x'), paragraph('y')])
    );
    const after = change.apply(before);
    const mapped = mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      sourceIndex,
      owner
    );
    const firstNodeKey = sourceIndex.keyAt([0]);
    const lastNodeKey = sourceIndex.keyAt([4]);
    const removedNodeKey = sourceIndex.keyAt([1]);

    assert.equal(mapped.keyAt([0]), firstNodeKey);
    assert.equal(mapped.keyAt([3]), lastNodeKey);
    assert.deepEqual(mapped.pathOf(lastNodeKey!), [3]);
    assert.equal(mapped.pathOf(removedNodeKey!), null);
    assert.equal(mapped.entries().length, 8);
  });

  it('keeps seeded base snapshot lookups sparse until enumeration', () => {
    const owner = {} as Editor;
    const document = DocumentIndex.fromValue(
      asJsonNodes(
        Array.from({ length: 10_000 }, (_, index) => paragraph(`line ${index}`))
      )
    );
    const children = document.value as unknown as readonly Descendant[];
    const profiledIds: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;

    seedNodeKeys(children, owner);

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };

      const index = buildSnapshotIndex(owner, children);
      const nodeKey = index.keyAt([5000, 0]);

      assert(nodeKey);
      assert.deepEqual(index.pathOf(nodeKey), [5000, 0]);
      assert.equal(
        profiledIds.filter((id) => id === 'runtime-index-full-build').length,
        0
      );

      assert.equal(index.entries().length, 20_000);
      assert.equal(
        profiledIds.filter((id) => id === 'runtime-index-full-build').length,
        1
      );
      assert.equal(index.entries().length, 20_000);
      assert.equal(
        profiledIds.filter((id) => id === 'runtime-index-full-build').length,
        1
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  it('materializes unseeded base snapshot ids in document order', () => {
    const inspect = (firstPath: readonly [number, number]) => {
      const owner = {} as Editor;
      const document = DocumentIndex.fromValue(
        asJsonNodes([paragraph('alpha'), paragraph('beta'), paragraph('gamma')])
      );
      const index = buildSnapshotIndex(
        owner,
        document.value as unknown as readonly Descendant[]
      );

      assert(index.keyAt([...firstPath]));

      return index.entries();
    };

    assert.deepEqual(inspect([0, 0]), inspect([2, 0]));
  });

  it('keeps prepared structural slices token-free through runtime publication', () => {
    const before = DocumentIndex.fromValue(asJsonNodes([paragraph('before')]));
    const inserted = asJsonNodes([paragraph('inserted')]);
    const slice = PreparedTokenSlice.fromPreparedNodes(inserted);
    const change = RootChange.create(before, {
      from: before.length,
      insert: slice,
    });
    const after = change.apply(before);
    const blockNodeKey = getPreparedDocumentNodeKey(slice, [0])!;
    const textNodeKey = getPreparedDocumentNodeKey(slice, [0, 0])!;
    const inspect = (query: 'keyAt' | 'pathOf') => {
      const owner = {} as Editor;
      const sourceChildren = before.value as unknown as readonly Descendant[];

      seedNodeKeys(sourceChildren, owner);
      const sourceIndex = buildSnapshotIndex(owner, sourceChildren);

      assert.equal(hasMaterializedDocumentSliceTokens(slice), false);
      assert.equal(after.node([1]), inserted[0]);
      assert.equal(hasMaterializedDocumentSliceTokens(slice), false);
      const mapped = mapSnapshotIndexThroughChange(
        before,
        after,
        change,
        sourceIndex,
        owner,
        new Set(),
        []
      );

      assert.equal(hasMaterializedDocumentSliceTokens(slice), false);
      assert.equal(getNodeKeyForNode(after.node([1]), owner), null);
      assert.equal(getNodeKeyForNode(after.node([1, 0]), owner), null);
      assert.match(blockNodeKey, /^p\d+$/);
      assert.match(textNodeKey, /^p\d+$/);
      if (query === 'keyAt') {
        assert.equal(mapped.keyAt([1]), blockNodeKey);
        assert.equal(mapped.keyAt([1, 0]), textNodeKey);
        assert.deepEqual(mapped.pathOf(blockNodeKey), [1]);
        assert.deepEqual(mapped.pathOf(textNodeKey), [1, 0]);
      } else {
        assert.deepEqual(mapped.pathOf(textNodeKey), [1, 0]);
        assert.deepEqual(mapped.pathOf(blockNodeKey), [1]);
        assert.equal(mapped.keyAt([1, 0]), textNodeKey);
        assert.equal(mapped.keyAt([1]), blockNodeKey);
      }
      assert.equal(getNodeKeyForNode(after.node([1]), owner), blockNodeKey);
      assert.equal(getNodeKeyForNode(after.node([1, 0]), owner), textNodeKey);
      assert.equal(hasMaterializedDocumentSliceTokens(slice), false);

      return [blockNodeKey, textNodeKey];
    };

    assert.deepEqual(inspect('keyAt'), inspect('pathOf'));

    const draftOwner = {} as Editor;
    const sourceChildren = before.value as unknown as readonly Descendant[];

    seedNodeKeys(sourceChildren, draftOwner);
    const draftIndex = mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      buildSnapshotIndex(draftOwner, sourceChildren),
      draftOwner,
      new Set(),
      [],
      false
    );

    assert.equal(draftIndex.keyAt([1]), blockNodeKey);
    assert.deepEqual(draftIndex.pathOf(textNodeKey), [1, 0]);
    assert.equal(getNodeKeyForNode(after.node([1]), draftOwner), null);
    assert.equal(getNodeKeyForNode(after.node([1, 0]), draftOwner), null);
  });

  it('maps unqueried prepared identities through later moves and retained paths', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue(asJsonNodes([paragraph('base')]));
    const sourceChildren = before.value as unknown as readonly Descendant[];

    seedNodeKeys(sourceChildren, owner);
    const sourceIndex = buildSnapshotIndex(owner, sourceChildren);
    const inserted = asJsonNodes([paragraph('left'), paragraph('right')]);
    const slice = PreparedTokenSlice.fromPreparedNodes(inserted);
    const insert = RootChange.create(before, {
      from: before.length,
      insert: slice,
    });
    const insertedDocument = insert.apply(before);
    const insertedIndex = mapSnapshotIndexThroughChange(
      before,
      insertedDocument,
      insert,
      sourceIndex,
      owner,
      new Set(),
      []
    );
    const move = moveNodeChange(insertedDocument, [2], [0]);
    const movedDocument = move.apply(insertedDocument);
    const movedIndex = mapSnapshotIndexThroughChange(
      insertedDocument,
      movedDocument,
      move,
      insertedIndex,
      owner
    );
    const leftKey = getPreparedDocumentNodeKey(slice, [0])!;
    const leftTextKey = getPreparedDocumentNodeKey(slice, [0, 0])!;
    const rightKey = getPreparedDocumentNodeKey(slice, [1])!;
    const rightTextKey = getPreparedDocumentNodeKey(slice, [1, 0])!;

    assert.equal(movedIndex.keyAt([0]), rightKey);
    assert.equal(movedIndex.keyAt([0, 0]), rightTextKey);
    assert.deepEqual(movedIndex.pathOf(leftKey), [2]);
    assert.deepEqual(movedIndex.pathOf(leftTextKey), [2, 0]);
    assert.equal(getNodeKeyForNode(movedDocument.node([0]), owner), rightKey);
    assert.equal(
      getNodeKeyForNode(movedDocument.node([0, 0]), owner),
      rightTextKey
    );
  });

  it('keeps mapped snapshot identity injective across query orders', () => {
    const inspect = (order: 'entries' | 'forward' | 'mixed' | 'reverse') => {
      const owner = {} as Editor;
      const before = DocumentIndex.fromValue(asJsonNodes([paragraph('a')]));
      const sourceIndex = buildSnapshotIndex(
        owner,
        before.value as unknown as readonly Element[]
      );
      const change = replaceChildrenChange(
        before,
        [],
        1,
        1,
        asJsonNodes([paragraph('x'), paragraph('y')])
      );
      const after = change.apply(before);
      const mapped = mapSnapshotIndexThroughChange(
        before,
        after,
        change,
        sourceIndex,
        owner
      );
      const changedPaths = [[1], [1, 0], [2], [2, 0]] as const;
      const changedNodeKeys = changedPaths.map((path) =>
        getNodeKeyForNode(after.node(path), owner)
      );

      assert.equal(
        changedNodeKeys.every((nodeKey) => nodeKey !== null),
        true
      );

      if (order === 'entries') {
        mapped.entries();
        for (const nodeKey of changedNodeKeys) {
          mapped.pathOf(nodeKey!);
        }
      } else if (order === 'forward') {
        for (const path of changedPaths) mapped.keyAt([...path]);
        for (const nodeKey of changedNodeKeys.toReversed()) {
          mapped.pathOf(nodeKey!);
        }
      } else if (order === 'reverse') {
        for (const nodeKey of changedNodeKeys.toReversed()) {
          mapped.pathOf(nodeKey!);
        }
        for (const path of changedPaths.toReversed()) {
          mapped.keyAt([...path]);
        }
      } else {
        for (let index = 0; index < changedPaths.length; index += 1) {
          mapped.keyAt([...changedPaths[index]!]);
          mapped.pathOf(changedNodeKeys.at(-index - 1)!);
        }
      }

      const entries = mapped.entries();
      const nodeKeys = entries.map(([nodeKey]) => nodeKey);
      const paths = entries.map(([, path]) => path.join('.'));

      assert.equal(new Set(nodeKeys).size, entries.length);
      assert.equal(new Set(paths).size, entries.length);
      entries.forEach(([nodeKey, path]) => {
        assert.equal(mapped.keyAt([...path]), nodeKey);
        assert.deepEqual(mapped.pathOf(nodeKey), path);
      });

      return entries;
    };

    const canonical = inspect('entries');

    assert.deepEqual(inspect('forward'), canonical);
    assert.deepEqual(inspect('reverse'), canonical);
    assert.deepEqual(inspect('mixed'), canonical);
  });

  it('assigns changed-window node keys before mapped snapshot reads', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue(asJsonNodes([paragraph('a')]));
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const change = replaceChildrenChange(
      before,
      [],
      1,
      1,
      asJsonNodes([paragraph('x'), paragraph('y')])
    );
    const after = change.apply(before);
    const mapped = mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      sourceIndex,
      owner
    );
    const changedNodes = [
      after.node([1]),
      after.node([1, 0]),
      after.node([2]),
      after.node([2, 0]),
    ];
    const beforeReads = changedNodes.map((node) =>
      getNodeKeyForNode(node, owner)
    );

    assert.equal(
      beforeReads.every((nodeKey) => nodeKey !== null),
      true
    );

    mapped.keyAt([2, 0]);
    mapped.pathOf(sourceIndex.keyAt([0])!);
    mapped.entries();

    assert.deepEqual(
      changedNodes.map((node) => getNodeKeyForNode(node, owner)),
      beforeReads
    );
  });

  it('keeps parent identities stable when moving their only child across parents', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue([
      {
        children: [paragraph('target')],
        type: 'section',
      },
      {
        children: [paragraph('moved')],
        type: 'section',
      },
    ]);
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const targetParentId = sourceIndex.keyAt([0]);
    const sourceParentId = sourceIndex.keyAt([1]);
    const movedId = sourceIndex.keyAt([1, 0]);
    const change = moveNodeChange(before, [1, 0], [0, 1]);
    const after = change.apply(before);
    const mapped = mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      sourceIndex,
      owner
    );

    assert.equal(mapped.keyAt([0]), targetParentId);
    assert.equal(mapped.keyAt([1]), sourceParentId);
    assert.equal(mapped.keyAt([0, 1]), movedId);
    assert.deepEqual(mapped.pathOf(targetParentId!), [0]);
    assert.deepEqual(mapped.pathOf(sourceParentId!), [1]);
    assert.deepEqual(mapped.pathOf(movedId!), [0, 1]);
  });

  it('detaches an inserted source node that already survives in the document', () => {
    const owner = {} as Editor;
    const shared = paragraph('body');
    const before = DocumentIndex.fromValue([shared]);
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const change = RootChange.between(
      before,
      DocumentIndex.fromValue([shared, shared])
    );
    const after = change.apply(before);
    const mapped = mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      sourceIndex,
      owner
    );

    assert.equal(after.value[0], before.value[0]);
    assert.notEqual(after.value[1], before.value[0]);
    assert.notEqual(
      (after.value[1] as { children: readonly unknown[] }).children[0],
      (before.value[0] as { children: readonly unknown[] }).children[0]
    );
    assert.notEqual(mapped.keyAt([0]), mapped.keyAt([1]));
    assert.notEqual(mapped.keyAt([0, 0]), mapped.keyAt([1, 0]));
  });

  it('keeps lazy index provenance sequential across text and structural changes', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue(asJsonNodes([paragraph('a')]));
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const blockId = sourceIndex.keyAt([0]);
    const textId = sourceIndex.keyAt([0, 0]);
    const textChange = insertTextChange(before, [0, 0], 1, '!');
    const afterText = textChange.apply(before);
    const textIndex = mapSnapshotIndexThroughChange(
      before,
      afterText,
      textChange,
      sourceIndex,
      owner
    );
    const structuralChange = insertNodeChange(
      afterText,
      [1],
      paragraph('tail') as unknown as JsonNode
    );
    const afterStructural = structuralChange.apply(afterText);
    const structuralIndex = mapSnapshotIndexThroughChange(
      afterText,
      afterStructural,
      structuralChange,
      textIndex,
      owner
    );

    assert.equal(structuralIndex.keyAt([0]), blockId);
    assert.equal(structuralIndex.keyAt([0, 0]), textId);
    assert(structuralIndex.keyAt([1]));
    assert(structuralIndex.keyAt([1, 0]));
  });

  it('coalesces path-stable provenance without composing token changes', () => {
    const owner = {} as Editor;
    let document = DocumentIndex.fromValue(
      asJsonNodes(
        Array.from({ length: 128 }, (_, index) => paragraph(String(index)))
      )
    );
    const sourceIndex = buildSnapshotIndex(
      owner,
      document.value as unknown as readonly Element[]
    );
    const retainedNodeKey = sourceIndex.keyAt([64]);
    const removal = replaceChildrenChange(document, [], 0, 1, []);
    let next = removal.apply(document);
    let index = mapSnapshotIndexThroughChange(
      document,
      next,
      removal,
      sourceIndex,
      owner
    );

    document = next;

    for (let edit = 0; edit < 63; edit += 1) {
      const change = insertTextChange(document, [63, 0], edit + 2, '!');

      next = change.apply(document);
      index = advancePathStableSnapshotIndex(
        document,
        next,
        change,
        index,
        owner
      );
      document = next;
    }

    const stats = getSnapshotIndexMappingStats(index);

    assert.equal(stats.mappedChanges, 64);
    assert.equal(stats.segments, 2);
    assert.equal(stats.retainedDocuments, 3);
    assert.deepEqual(index.pathOf(retainedNodeKey!), [63]);

    const insertion = insertNodeChange(
      document,
      [0],
      paragraph('head') as unknown as JsonNode
    );
    next = insertion.apply(document);
    index = mapSnapshotIndexThroughChange(
      document,
      next,
      insertion,
      index,
      owner
    );

    assert.deepEqual(index.pathOf(retainedNodeKey!), [64]);
  });

  it('bounds 1,000 lazy structural mappings and releases documents on materialization', () => {
    const owner = {} as Editor;
    let document = DocumentIndex.fromValue(
      asJsonNodes(
        Array.from({ length: 1001 }, (_, index) => paragraph(String(index)))
      )
    );
    const sourceIndex = buildSnapshotIndex(
      owner,
      document.value as unknown as readonly Element[]
    );
    const retainedNodeKey = sourceIndex.keyAt([1000]);
    let basePathQueries = 0;
    let index: SnapshotIndex = Object.freeze({
      entries: sourceIndex.entries,
      keyAt: sourceIndex.keyAt,
      pathOf: (nodeKey) => {
        basePathQueries += 1;

        return sourceIndex.pathOf(nodeKey);
      },
    });
    const startedAt = performance.now();

    for (let edit = 0; edit < 1000; edit += 1) {
      const change = replaceChildrenChange(document, [], 0, 1, []);
      const next = change.apply(document);

      index = mapSnapshotIndexThroughChange(
        document,
        next,
        change,
        index,
        owner
      );
      document = next;
    }

    const duration = performance.now() - startedAt;
    const lazyStats = getSnapshotIndexMappingStats(index);

    assert.ok(duration < 1500, `1,000 mappings took ${duration.toFixed(1)}ms`);
    assert.equal(lazyStats.mappedChanges, 1000);
    assert.ok(lazyStats.segments <= 10);
    assert.ok(lazyStats.retainedDocuments <= 20);
    assert.deepEqual(index.pathOf(retainedNodeKey!), [0]);
    assert.equal(basePathQueries, 0);
    assert.equal(index.entries().length, 2);
    assert.deepEqual(getSnapshotIndexMappingStats(index), {
      mappedChanges: 0,
      retainedDocuments: 0,
      retainedTokenUnits: 0,
      retainedTopLevelReferenceBytes: 0,
      segments: 0,
    });
    assert.equal(index.keyAt([0]), retainedNodeKey);
    assert.deepEqual(index.pathOf(retainedNodeKey!), [0]);
  });

  it('bounds retained wide-document mapping storage by binary segment count', {
    // This is a storage-shape law, not a wall-time budget. Keep enough headroom
    // for shared CI hosts; registered benchmarks own performance thresholds.
    timeout: 20_000,
  }, () => {
    const owner = {} as Editor;
    let document = DocumentIndex.fromValue(
      asJsonNodes(
        Array.from({ length: 50_000 }, (_, index) => paragraph(String(index)))
      )
    );
    let index: SnapshotIndex = buildSnapshotIndex(
      owner,
      document.value as unknown as readonly Element[]
    );

    for (let edit = 0; edit < 63; edit += 1) {
      const change = replaceChildrenChange(document, [], 0, 1, []);
      const next = change.apply(document);

      index = mapSnapshotIndexThroughChange(
        document,
        next,
        change,
        index,
        owner
      );
      document = next;
    }

    const stats = getSnapshotIndexMappingStats(index);

    assert.equal(stats.mappedChanges, 63);
    assert.equal(stats.segments, 6);
    assert.equal(stats.retainedDocuments, stats.segments + 1);
    assert.ok(stats.retainedTopLevelReferenceBytes < 2_800_000);
    assert.ok(stats.retainedTokenUnits < 4_000_000);
  });

  it('rejects non-sequential lazy structural mappings', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue(
      asJsonNodes([paragraph('a'), paragraph('b'), paragraph('c')])
    );
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const firstChange = replaceChildrenChange(before, [], 0, 1, []);
    const firstAfter = firstChange.apply(before);
    const mapped = mapSnapshotIndexThroughChange(
      before,
      firstAfter,
      firstChange,
      sourceIndex,
      owner
    );
    const unrelatedChange = replaceChildrenChange(before, [], 2, 3, []);

    assert.throws(
      () =>
        mapSnapshotIndexThroughChange(
          before,
          unrelatedChange.apply(before),
          unrelatedChange,
          mapped,
          owner
        ),
      /Snapshot index mappings are not sequential/
    );
  });

  it('cuts every removed node key across an unrelated child replacement', () => {
    const owner = {} as Editor;
    const before = DocumentIndex.fromValue(
      asJsonNodes([paragraph('b'), paragraph('c'), paragraph('d')])
    );
    const sourceIndex = buildSnapshotIndex(
      owner,
      before.value as unknown as readonly Element[]
    );
    const removedIds = sourceIndex.entries().map(([nodeKey]) => nodeKey);
    const change = replaceChildrenChange(
      before,
      [],
      0,
      3,
      asJsonNodes([paragraph('x'), paragraph('y')])
    );
    const after = change.apply(before);
    const mapped = mapSnapshotIndexThroughChange(
      before,
      after,
      change,
      sourceIndex,
      owner
    );

    for (const nodeKey of removedIds) {
      assert.equal(mapped.pathOf(nodeKey), null);
    }
  });

  it('keeps unchanged token prefixes and suffixes out of changed ranges', () => {
    const before = DocumentIndex.fromValue([paragraph('one')]);
    const after = DocumentIndex.fromValue([paragraph('onX')]);
    const change = RootChange.between(before, after);
    const ranges: number[][] = [];

    change.iterChangedRanges((...range) => ranges.push(range));

    assert.deepEqual(ranges, [[4, 5, 4, 5]]);
  });

  it('keeps one node identity intact when content continues after inserted siblings', () => {
    const before = DocumentIndex.fromValue([paragraph('alpha')]);
    const after = DocumentIndex.fromValue([
      paragraph('intro-a'),
      paragraph('intro-balpha'),
    ]);
    const change = RootChange.between(before, after);
    const mappedBlock = change.mapPos(before.nodeRange([0]).from, 1, 'around');
    const mappedPoint = change.mapPos(
      before.positionAt({ offset: 1, path: [0, 0] }),
      1,
      'around'
    );

    assert.deepEqual(change.apply(before).value, after.value);
    assert.notEqual(mappedBlock, null);
    assert.deepEqual(after.nodeStartingAt(mappedBlock!)?.path, [1]);
    assert.equal(mappedPoint, after.positionAt({ offset: 8, path: [1, 0] }));
  });

  it('does not assign an ambiguous displaced continuation to either source node', () => {
    const before = DocumentIndex.fromValue([
      paragraph('alpha'),
      paragraph('alpha'),
    ]);
    const after = DocumentIndex.fromValue([
      paragraph('new-a'),
      paragraph('new-b'),
      paragraph('intro-alpha'),
    ]);
    const change = RootChange.between(before, after);
    const displacedTarget = after.nodeRange([2]).from;

    assert.deepEqual(change.apply(before).value, after.value);
    assert.notEqual(
      change.mapPos(before.nodeRange([0]).from, 1, 'around'),
      displacedTarget
    );
    assert.notEqual(
      change.mapPos(before.nodeRange([1]).from, 1, 'around'),
      displacedTarget
    );
  });

  it('round-trips nested JSON, empty leaves, and arbitrary properties', () => {
    const value: JsonNode[] = [
      {
        type: 'callout',
        tone: { level: 2, name: 'info' },
        children: [
          { bold: true, text: '' },
          {
            type: 'link',
            url: '/docs',
            children: [{ italic: true, text: 'nested' }],
          },
        ],
      },
    ];
    const document = DocumentIndex.fromValue(value);
    const roundTrip = DocumentIndex.fromTokens(document.tokens);

    assert.deepEqual(roundTrip.value, value);
    assert.equal(Object.isFrozen(roundTrip.value), true);
    assert.equal(Object.isFrozen(roundTrip.value[0]), true);
    assert.ok(document.tokenCount > 0);
    assert.ok(document.length >= 'nested'.length);
  });

  it('composes mixed text and node edits in one builder', () => {
    const children = [
      paragraph('block-0'),
      paragraph('block-1'),
      paragraph('block-2'),
      paragraph('block-3'),
    ];
    const inserted = paragraph('inserted');
    const before = { children: asJsonNodes(children) };
    const builder = new ChangeDraft(before);

    builder.insertText('main', [0, 0], 5, 'X');
    builder.setNode('main', [1], { id: 'changed' });
    builder.removeText('main', [2, 0], 1, 'lock');
    builder.insertNode('main', [4], inserted);
    builder.moveNode('main', [4], [1]);

    assert.deepEqual(builder.change.apply(before), builder.value);
    assert.deepEqual(
      builder.value.children,
      asJsonNodes([
        paragraph('blockX-0'),
        inserted,
        paragraph('block-1', { id: 'changed' }),
        paragraph('b-2'),
        paragraph('block-3'),
      ])
    );
  });

  it('moves nodes forward and backward within one parent', () => {
    const children = [
      paragraph('a'),
      paragraph('b'),
      paragraph('c'),
      paragraph('d'),
    ];

    for (const [path, newPath, expected] of [
      [[0], [3], [children[1], children[2], children[3], children[0]]],
      [[3], [0], [children[3], children[0], children[1], children[2]]],
    ] as const) {
      const document = DocumentIndex.fromValue(asJsonNodes(children));
      const change = moveNodeChange(document, path, newPath);

      assert.deepEqual(change.apply(document).value, expected);
    }
  });

  it('maps both sides of a text merge to the join boundary', () => {
    const document = DocumentIndex.fromValue([
      {
        type: 'paragraph',
        children: [{ text: 'left' }, { text: 'right' }],
      },
    ]);
    const change = mergeNodeChange(document, [0, 1]);
    const after = change.apply(document);
    const expected = { offset: 4, path: [0, 0] };

    assert.deepEqual(after.value, [paragraph('leftright')]);

    for (const association of [-1, 1] as const) {
      const left = change.mapPos(
        document.positionAt({ offset: 4, path: [0, 0] }),
        association
      );
      const right = change.mapPos(
        document.positionAt({ offset: 0, path: [0, 1] }),
        association
      );

      if (left === null || right === null) {
        throw new Error('A merge join boundary must remain mappable.');
      }

      assert.deepEqual(after.pointAt(left, association), expected);
      assert.deepEqual(after.pointAt(right, association), expected);
    }
  });

  it('moves a same-parent node into the append boundary', () => {
    const children = [paragraph('a'), paragraph('b')];
    const document = DocumentIndex.fromValue(asJsonNodes(children));
    const change = moveNodeChange(document, [0], [2]);

    assert.deepEqual(change.apply(document).value, [children[1], children[0]]);
  });

  it('moves across parents after source-parent removal', () => {
    const children = [
      paragraph('moved'),
      {
        type: 'quote',
        children: [paragraph('nested')],
      } satisfies Element,
    ];
    const document = DocumentIndex.fromValue(asJsonNodes(children));
    const change = moveNodeChange(document, [0], [1, 0]);

    assert.deepEqual(change.apply(document).value, [
      {
        type: 'quote',
        children: [paragraph('moved'), paragraph('nested')],
      },
    ]);
  });

  it('composes, inverts, serializes, and reports changed ranges', () => {
    const before = DocumentIndex.fromValue(
      asJsonNodes([paragraph('alpha'), paragraph('beta')])
    );
    const insert = insertTextChange(before, [0, 0], 2, '++');
    const afterInsert = insert.apply(before);
    const properties = setNodeChange(afterInsert, [1], {
      align: 'center',
    });
    const after = properties.apply(afterInsert);
    const composed = insert.compose(properties);
    const restored = composed.invert(before).apply(after);
    const serialized = RootChange.fromJSON(composed.toJSON());
    const ranges: Array<readonly [number, number, number, number]> = [];

    composed.iterChangedRanges((...range) => ranges.push(range));

    assert.deepEqual(composed.apply(before).value, after.value);
    assert.deepEqual(serialized.apply(before).value, after.value);
    assert.deepEqual(restored.value, before.value);
    assert.ok(ranges.length >= 1);
    assert.ok(ranges.every((range) => range[0] <= range[1]));
  });

  it('structurally shares untouched JSON and preserves moved node identity', () => {
    const before = DocumentIndex.fromValue(
      asJsonNodes([paragraph('a'), paragraph('b'), paragraph('c')])
    );
    const textChange = insertTextChange(before, [0, 0], 1, '!');
    const afterText = textChange.apply(before);

    assert.notEqual(afterText.value[0], before.value[0]);
    assert.equal(afterText.value[1], before.value[1]);
    assert.equal(afterText.value[2], before.value[2]);

    const moved = moveNodeChange(before, [0], [2]).apply(before);

    assert.equal(moved.value[2], before.value[0]);
    assert.equal(moved.value[0], before.value[1]);

    const reordered = {
      children: [{ text: 'reordered' }],
      type: 'paragraph',
    } satisfies Element;
    const reorderedBefore = DocumentIndex.fromValue(
      asJsonNodes([reordered, paragraph('sibling')])
    );
    const reorderedAfter = moveNodeChange(reorderedBefore, [0], [2]).apply(
      reorderedBefore
    );

    assert.equal(reorderedAfter.value[1], reorderedBefore.value[0]);
  });

  it('fails closed when a replacement breaks JSON token structure', () => {
    const document = DocumentIndex.fromValue(asJsonNodes([paragraph('safe')]));
    const range = document.nodeRange([0]);
    const invalid = RootChange.create(document, {
      from: range.from,
      to: range.from + 1,
    });

    assert.throws(() => invalid.apply(document), /Unbalanced/);
  });

  it('maps text points with forward and backward affinity', () => {
    const before = DocumentIndex.fromValue(asJsonNodes([paragraph('abcd')]));
    const point = { offset: 2, path: [0, 0] };
    const change = insertTextChange(before, [0, 0], 1, 'XX');
    const mappedPosition = change.mapPos(before.positionAt(point), 1);

    assert.notEqual(mappedPosition, null);
    assert.deepEqual(change.apply(before).pointAt(mappedPosition!, 1), {
      offset: 4,
      path: [0, 0],
    });

    const remove = removeTextChange(before, [0, 0], 1, 'bc');
    const removedPosition = remove.mapPos(
      before.positionAt({ offset: 2, path: [0, 0] }),
      -1
    );

    assert.notEqual(removedPosition, null);
    assert.deepEqual(remove.apply(before).pointAt(removedPosition!), {
      offset: 1,
      path: [0, 0],
    });
    assert.equal(
      remove.mapPos(
        before.positionAt({ offset: 2, path: [0, 0] }),
        -1,
        'around'
      ),
      null
    );
  });

  it('converges concurrent text changes after transformation', () => {
    const document = DocumentIndex.fromValue(asJsonNodes([paragraph('abcd')]));
    const a = insertTextChange(document, [0, 0], 2, 'A');
    const b = insertTextChange(document, [0, 0], 2, 'B');
    const transformed = RootChange.transform(a, b);
    const viaA = transformed.b.apply(a.apply(document));
    const viaB = transformed.a.apply(b.apply(document));

    assert.deepEqual(viaA.value, viaB.value);
    assert.deepEqual(viaA.value, asJsonNodes([paragraph('abABcd')]));
  });

  it('preserves independent concurrent element and text property keys', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([
        {
          ...paragraph('alpha', { tone: 'neutral' }),
          children: [{ bold: false, text: 'alpha' }],
        },
      ]),
    };
    const document = DocumentIndex.fromValue(before.children);

    for (const [path, first, second, expected] of [
      [
        [0],
        { tone: 'warning' },
        { align: 'center' },
        { align: 'center', tone: 'warning' },
      ],
      [[0, 0], { bold: true }, { italic: true }, { bold: true, italic: true }],
    ] as const) {
      const a = createTestDocumentChange({
        primary: setNodeChange(document, path, first),
      });
      const b = createTestDocumentChange({
        primary: setNodeChange(document, path, second),
      });
      const transformed = DocumentChange.transform(a, b, before);
      const viaA = DocumentChange.fromJSON(transformed.b.toJSON()).apply(
        a.apply(before)
      );
      const viaB = DocumentChange.fromJSON(transformed.a.toJSON()).apply(
        b.apply(before)
      );

      assert.deepEqual(viaA, viaB);
      const node =
        path.length === 1
          ? viaA.children[0]
          : (viaA.children[0] as { children: readonly JsonNode[] }).children[0];

      assert.deepEqual(
        Object.fromEntries(
          Object.keys(expected).map((key) => [key, node![key]])
        ),
        expected
      );
    }
  });

  it('composes, inverts, classifies, and versions property deltas', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([
        paragraph('alpha', { tags: ['base'], tone: 'neutral' }),
      ]),
    };
    const document = DocumentIndex.fromValue(before.children);
    const firstSet = updateNodePropertiesChange(document, [0], {
      add: { tags: ['first'] },
      set: { tone: 'warning' },
    });
    const afterFirst = firstSet.apply(document);
    const secondSet = updateNodePropertiesChange(afterFirst, [0], {
      remove: { tags: ['base'] },
      unset: ['tone'],
    });
    const change = createTestDocumentChange({
      primary: firstSet.compose(secondSet),
    });
    const json = change.toJSON();
    const replayedChange = DocumentChange.fromJSON(json);
    const after = replayedChange.apply(before);
    const classified = classifyDocumentChange(before, after, replayedChange);

    assert.equal(json.version, 3);
    assert.ok(
      json.primary?.some((section) => section.properties?.version === 1)
    );
    assert.deepEqual(after.children, [paragraph('alpha', { tags: ['first'] })]);
    assert.deepEqual(replayedChange.invert(before).apply(after), before);
    assert.equal(classified.primaryClassification?.properties, true);
    assert.equal(classified.primaryClassification?.structure, false);
    assert.equal(classified.primaryClassification?.text, false);
    assert.throws(
      () =>
        DocumentChange.fromJSON({
          ...json,
          version: 2 as 3,
        }),
      /Invalid DocumentChange JSON/
    );
  });

  it('serializes version 3 without a public primary-root sentinel or legacy fields', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('body')]),
      roots: { header: asJsonNodes([paragraph('header')]) },
    };
    const primary = DocumentIndex.fromValue(before.children);
    const header = DocumentIndex.fromValue(before.roots!.header!);
    const change = createTestDocumentChange({
      primary: insertTextChange(primary, [0, 0], 4, '!'),
      roots: new Map([['header', insertTextChange(header, [0, 0], 6, '?')]]),
    });
    const json = change.toJSON();

    assert.deepEqual(Object.keys(json).sort(), ['primary', 'roots', 'version']);
    assert.equal(json.version, 3);
    assert.equal(Object.hasOwn(json.roots ?? {}, 'main'), false);
    assert.equal(Object.hasOwn(change, 'changes'), false);
    assert.equal(Object.hasOwn(change, 'classifications'), false);
    assert.equal(Object.hasOwn(change, 'preserveEmptyRoots'), false);
    assert.deepEqual(
      DocumentChange.fromJSON(json).apply(before),
      change.apply(before)
    );

    assert.throws(
      () =>
        DocumentChange.fromJSON({
          changes: { main: json.primary },
          version: 3,
        } as never),
      /Invalid DocumentChange JSON/
    );
  });

  it('rejects non-JSON property deltas and serialized token payloads', () => {
    const document = DocumentIndex.fromValue(asJsonNodes([paragraph('alpha')]));
    const sparse = Array.from({ length: 1 }) as unknown[];
    const circular: Record<string, unknown> = {};
    const accessor = {} as Record<string, unknown>;
    const symbolKey = { value: true } as Record<PropertyKey, unknown>;
    const customObject = new (class {
      value = true;
    })();

    delete sparse[0];
    circular.self = circular;
    Object.defineProperty(accessor, 'value', {
      enumerable: true,
      get: () => 'value',
    });
    symbolKey[Symbol('hidden')] = true;

    for (const value of [
      undefined,
      -0,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      new Date(0),
      new Map([['key', 'value']]),
      () => 'value',
      Symbol('value'),
      circular,
      sparse,
      accessor,
      symbolKey,
      customObject,
    ]) {
      assert.throws(
        () =>
          updateNodePropertiesChange(document, [0], {
            set: { payload: value },
          }),
        /JSON-compatible data/
      );
    }

    const symbolDelta = {
      set: { payload: 'value' },
    } as Record<PropertyKey, unknown>;
    const accessorDelta = {} as Record<string, unknown>;
    const customDelta = Object.assign(
      Object.create({ inherited: true }) as Record<string, unknown>,
      { set: { payload: 'value' } }
    );

    symbolDelta[Symbol('hidden')] = true;
    Object.defineProperty(accessorDelta, 'set', {
      enumerable: true,
      get: () => ({ payload: 'value' }),
    });

    for (const delta of [symbolDelta, accessorDelta, customDelta]) {
      assert.throws(
        () => updateNodePropertiesChange(document, [0], delta as never),
        /JSON-compatible data/
      );
    }

    assert.throws(
      () =>
        PreparedTokenSlice.fromJSON([
          {
            kind: 'open',
            nodeKind: 'element',
            props: { payload: new Date(0) },
          },
          { kind: 'close', nodeKind: 'element' },
        ] as never),
      /JSON-compatible data/
    );
  });

  it('publishes immutable change maps, sets, classifications, and sections', () => {
    const document = DocumentIndex.fromValue(asJsonNodes([paragraph('alpha')]));
    const rootChange = insertTextChange(document, [0, 0], 5, '!');
    const classification = {
      paths: [[0]],
      properties: false,
      structure: false,
      text: true,
    };
    const roots = new Map([['header', rootChange]]);
    const rootClassifications = new Map([['header', classification]]);
    const createRoots = new Set(['caption']);
    const deleteRoots = new Set(['sidebar']);
    const change = createTestDocumentChange({
      createRoots,
      deleteRoots,
      primary: rootChange,
      primaryClassification: classification,
      rootClassifications,
      roots,
    });

    classification.paths[0]![0] = 9;
    roots.clear();
    rootClassifications.clear();
    createRoots.add('other');
    deleteRoots.clear();

    const primary = getTestDocumentRootChange(change);
    const namedRoots = getTestDocumentRootChanges(change);

    assert.equal(Object.isFrozen(change), true);
    assert.equal(Object.isFrozen(change.createRoots), true);
    assert.equal(Object.isFrozen(change.deleteRoots), true);
    assert.equal(Object.isFrozen(primary), true);
    assert.equal(Object.isFrozen(namedRoots.get('header')), true);
    assert.equal(Object.isFrozen(change.primaryClassification), true);
    assert.equal(Object.isFrozen(change.rootClassifications), true);
    assert.equal(
      Object.isFrozen(change.rootClassifications.get('header')),
      true
    );
    assert.equal(Object.isFrozen(rootChange.sections), true);
    assert.equal(Object.isFrozen(rootChange.data), true);
    for (const data of rootChange.data) {
      if (data === null) continue;

      assert.equal(Object.isFrozen(data), true);
      if (data instanceof PreparedTokenSlice) {
        assert.equal(Object.isFrozen(data.tokens), true);
        assert.equal(Object.isFrozen(data.offsets), true);
        assert.equal(
          data.tokens.every((token) => Object.isFrozen(token)),
          true
        );
      }
    }
    assert.equal(Object.isFrozen(change.primaryClassification?.paths), true);
    assert.equal(primary, rootChange);
    assert.equal(namedRoots.get('header'), rootChange);
    assert.equal(change.createRoots.has('caption'), true);
    assert.equal(change.createRoots.has('other'), false);
    assert.equal(change.deleteRoots.has('sidebar'), true);
    assert.deepEqual(change.primaryClassification?.paths, [[0]]);
    assert.equal(Object.isFrozen(change.primaryClassification?.paths[0]), true);

    for (const map of [change.rootClassifications]) {
      const mutable = map as Map<string, unknown>;

      assert.throws(
        () => mutable.set('other', RootChange.empty(document.length)),
        /Cannot mutate a published DocumentChange map/
      );
      assert.throws(
        () => mutable.delete('header'),
        /Cannot mutate a published DocumentChange map/
      );
      assert.throws(
        () => mutable.clear(),
        /Cannot mutate a published DocumentChange map/
      );
      assert.throws(() =>
        Map.prototype.set.call(map, 'other', RootChange.empty(document.length))
      );
      assert.throws(() => Map.prototype.delete.call(map, 'header'));
      assert.throws(() => Map.prototype.clear.call(map));
    }
    for (const set of [change.createRoots, change.deleteRoots]) {
      const mutable = set as Set<string>;

      assert.throws(
        () => mutable.add('other'),
        /Cannot mutate a published DocumentChange set/
      );
      assert.throws(
        () => mutable.delete('caption'),
        /Cannot mutate a published DocumentChange set/
      );
      assert.throws(
        () => mutable.clear(),
        /Cannot mutate a published DocumentChange set/
      );
      assert.throws(() => Set.prototype.add.call(set, 'other'));
      assert.throws(() => Set.prototype.delete.call(set, 'caption'));
      assert.throws(() => Set.prototype.clear.call(set));
    }

    change.createRoots.forEach((_value, _again, container) => {
      assert.equal(container, change.createRoots);
      assert.throws(
        () => (container as Set<string>).add('other'),
        /Cannot mutate a published DocumentChange set/
      );
    });

    assert.throws(() => {
      (change.primaryClassification?.paths[0] as number[])[0] = 7;
    });

    assert.throws(
      () =>
        createTestDocumentChange({
          primary,
          primaryClassification: {
            ...classification,
            extra: { mutable: true },
          } as never,
        }),
      /Invalid document change classification/
    );
    assert.throws(
      () =>
        createTestDocumentChange({
          primary,
          primaryClassification: {
            ...classification,
            paths: [[-0]],
          },
        }),
      /JSON-compatible data/
    );
  });

  it('defines deterministic scalar and set-valued property conflicts', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([
        paragraph('alpha', { tags: ['base'], tone: 'neutral' }),
      ]),
    };
    const document = DocumentIndex.fromValue(before.children);
    const propertyChange = (
      properties: Parameters<typeof updateNodePropertiesChange>[2]
    ) =>
      createTestDocumentChange({
        primary: updateNodePropertiesChange(document, [0], properties),
      });
    const cases = [
      {
        a: { add: { tags: ['a'] } },
        b: { add: { tags: ['b'] } },
        expected: { tags: ['a', 'b', 'base'], tone: 'neutral' },
      },
      {
        a: { add: { tags: ['shared'] } },
        b: { remove: { tags: ['shared'] } },
        expected: { tags: ['base'], tone: 'neutral' },
      },
      {
        a: { set: { tags: ['a'] } },
        b: { add: { tags: ['b'] } },
        expected: { tags: ['a', 'b'], tone: 'neutral' },
      },
      {
        a: { set: { tone: 'first' } },
        b: { set: { tone: 'second' } },
        expected: { tags: ['base'], tone: 'second' },
      },
    ] satisfies Array<{
      a: Parameters<typeof updateNodePropertiesChange>[2];
      b: Parameters<typeof updateNodePropertiesChange>[2];
      expected: Record<string, unknown>;
    }>;

    for (const { a: aDelta, b: bDelta, expected } of cases) {
      const a = propertyChange(aDelta);
      const b = propertyChange(bDelta);
      const transformed = DocumentChange.transform(a, b, before);
      const viaA = transformed.b.apply(a.apply(before));
      const viaB = transformed.a.apply(b.apply(before));

      assert.deepEqual(viaA, viaB);
      const { children: _children, ...props } = viaA.children[0]!;

      assert.deepEqual(props, { type: 'paragraph', ...expected });
    }
  });

  it('keeps property deltas attached to concurrently moved nodes', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([
        paragraph('alpha', { tone: 'neutral' }),
        paragraph('bravo'),
        paragraph('charlie'),
      ]),
    };
    const document = DocumentIndex.fromValue(before.children);
    const move = createTestDocumentChange({
      primary: moveNodeChange(document, [0], [2]),
    });
    const properties = createTestDocumentChange({
      primary: updateNodePropertiesChange(document, [0], {
        set: { tone: 'warning' },
      }),
    });
    const transformed = DocumentChange.transform(move, properties, before);
    const viaMove = transformed.b.apply(move.apply(before));
    const viaProperties = transformed.a.apply(properties.apply(before));

    assert.deepEqual(viaMove, viaProperties);
    assert.deepEqual(
      viaMove.children,
      asJsonNodes([
        paragraph('bravo'),
        paragraph('charlie'),
        paragraph('alpha', { tone: 'warning' }),
      ])
    );
  });

  it('keeps an edit attached to a concurrently moved node', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([
        paragraph('alpha'),
        paragraph('bravo'),
        paragraph('charlie'),
      ]),
    };
    const document = DocumentIndex.fromValue(before.children);
    const move = createTestDocumentChange({
      primary: moveNodeChange(document, [0], [2]),
    });
    const edit = createTestDocumentChange({
      primary: insertTextChange(document, [0, 0], 5, '!'),
    });
    const transformed = DocumentChange.transform(move, edit, before);
    const viaMove = transformed.b.apply(move.apply(before));
    const viaEdit = transformed.a.apply(edit.apply(before));

    assert.deepEqual(viaMove, viaEdit);
    assert.deepEqual(
      viaMove.children,
      asJsonNodes([
        paragraph('bravo'),
        paragraph('charlie'),
        paragraph('alpha!'),
      ])
    );
  });

  it('drops an inverse text deletion when a concurrent deletion already removed it', () => {
    const document = DocumentIndex.fromValue(asJsonNodes([paragraph('aXb')]));
    const undoInsert = removeTextChange(document, [0, 0], 1, 'X');
    const remoteDelete = removeTextChange(document, [0, 0], 0, 'aX');
    const transformed = RootChange.transform(undoInsert, remoteDelete);

    assert.equal(transformed.a.empty, true);
    assert.deepEqual(
      transformed.a.apply(remoteDelete.apply(document)).value,
      asJsonNodes([paragraph('b')])
    );
  });

  it('converges identical and overlapping concurrent deletions', () => {
    const text = 'abcde';
    const document = DocumentIndex.fromValue(asJsonNodes([paragraph(text)]));
    const identicalA = removeTextChange(document, [0, 0], 1, 'bc');
    const identicalB = removeTextChange(document, [0, 0], 1, 'bc');
    const identical = RootChange.transform(identicalA, identicalB);

    assert.equal(identical.a.empty, true);
    assert.equal(identical.b.empty, true);

    const overlapA = removeTextChange(document, [0, 0], 1, 'bc');
    const overlapB = removeTextChange(document, [0, 0], 2, 'cd');
    const overlap = RootChange.transform(overlapA, overlapB);
    const viaA = overlap.b.apply(overlapA.apply(document));
    const viaB = overlap.a.apply(overlapB.apply(document));

    assert.deepEqual(viaA.value, viaB.value);
    assert.deepEqual(viaA.value, asJsonNodes([paragraph('ae')]));

    for (let fromA = 0; fromA < text.length; fromA++) {
      for (let toA = fromA + 1; toA <= text.length; toA++) {
        for (let fromB = 0; fromB < text.length; fromB++) {
          for (let toB = fromB + 1; toB <= text.length; toB++) {
            const a = removeTextChange(
              document,
              [0, 0],
              fromA,
              text.slice(fromA, toA)
            );
            const b = removeTextChange(
              document,
              [0, 0],
              fromB,
              text.slice(fromB, toB)
            );
            const transformed = RootChange.transform(a, b);

            assert.deepEqual(
              transformed.b.apply(a.apply(document)).value,
              transformed.a.apply(b.apply(document)).value
            );
          }
        }
      }
    }
  });

  it('applies, serializes, and inverts independent root changes atomically', () => {
    const value: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
      roots: {
        header: asJsonNodes([paragraph('header')]),
      },
    };
    const main = DocumentIndex.fromValue(value.children);
    const header = DocumentIndex.fromValue(value.roots!.header!);
    const change = createTestDocumentChange({
      primary: insertTextChange(main, [0, 0], 4, '!'),
      roots: new Map([['header', insertTextChange(header, [0, 0], 6, '?')]]),
    });
    const after = change.apply(value);
    const replayed = DocumentChange.fromJSON(change.toJSON()).apply(value);
    const restored = change.invert(value).apply(after);

    assert.deepEqual(after.children, asJsonNodes([paragraph('main!')]));
    assert.deepEqual(after.roots?.header, asJsonNodes([paragraph('header?')]));
    assert.deepEqual(replayed, after);
    assert.deepEqual(restored, value);
  });

  it('rejects unsafe imported document root keys', () => {
    assert.throws(
      () =>
        DocumentChange.fromJSON({
          createRoots: ['__proto__'],
          version: 3,
        }),
      /Invalid document root key/
    );
    assert.throws(
      () =>
        DocumentChange.fromJSON(
          JSON.parse('{"roots":{"constructor":[]},"version":3}') as Parameters<
            typeof DocumentChange.fromJSON
          >[0]
        ),
      /Invalid document root key/
    );
  });

  it('rejects structural node fields in imported token props', () => {
    const replacement = (nodeKind: 'element' | 'text', props: JsonNode) => ({
      primary: [
        {
          length: 0,
          replacement: [
            { kind: 'open' as const, nodeKind, props },
            { kind: 'close' as const, nodeKind },
          ],
        },
      ],
      version: 3 as const,
    });

    assert.throws(
      () =>
        DocumentChange.fromJSON(
          replacement('element', { text: 'not element props' })
        ),
      /structural node fields/
    );
    assert.throws(
      () => DocumentChange.fromJSON(replacement('text', { children: [] })),
      /structural node fields/
    );
  });

  it('rejects impossible imported RootChange section lengths', () => {
    for (const length of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(
        () => RootChange.fromJSON([{ length }]),
        /Invalid RootChange JSON/
      );
    }
  });

  it('composes root changes and maps root-aware positions', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
      roots: {
        header: asJsonNodes([paragraph('header')]),
      },
    };
    const main = DocumentIndex.fromValue(before.children);
    const first = createTestDocumentChange({
      primary: insertTextChange(main, [0, 0], 2, '++'),
    });
    const afterFirst = first.apply(before);
    const header = DocumentIndex.fromValue(afterFirst.roots!.header!);
    const second = createTestDocumentChange({
      roots: new Map([['header', insertTextChange(header, [0, 0], 3, '!')]]),
    });
    const composed = first.compose(second);
    const ranges: Array<
      readonly [string | null, number, number, number, number]
    > = [];

    composed.iterChangedRanges((root, ...range) => {
      ranges.push([root, ...range]);
    });

    assert.deepEqual(composed.apply(before), second.apply(afterFirst));
    assert.equal(
      composed.mapPosition(main.positionAt({ offset: 4, path: [0, 0] }), {
        association: 'forward',
      }),
      main.positionAt({ offset: 4, path: [0, 0] }) + 2
    );
    assert.deepEqual(
      ranges.map(([root]) => root),
      [null, 'header']
    );
  });

  it('converges concurrent document changes per root', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('abcd')]),
      roots: {
        header: asJsonNodes([paragraph('xy')]),
      },
    };
    const main = DocumentIndex.fromValue(before.children);
    const header = DocumentIndex.fromValue(before.roots!.header!);
    const a = createTestDocumentChange({
      primary: insertTextChange(main, [0, 0], 2, 'A'),
      roots: new Map([['header', insertTextChange(header, [0, 0], 1, '1')]]),
    });
    const b = createTestDocumentChange({
      primary: insertTextChange(main, [0, 0], 2, 'B'),
      roots: new Map([['header', insertTextChange(header, [0, 0], 1, '2')]]),
    });
    const transformed = DocumentChange.transform(a, b, before);

    assert.deepEqual(
      transformed.b.apply(a.apply(before)),
      transformed.a.apply(b.apply(before))
    );
  });

  it('keeps roots absent for main-only document changes', () => {
    const value: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
    };
    const document = DocumentIndex.fromValue(value.children);
    const change = createTestDocumentChange({
      primary: insertTextChange(document, [0, 0], 4, '!'),
    });
    const after = change.apply(value);

    assert.equal(Object.hasOwn(after, 'roots'), false);
    assert.deepEqual(after, {
      children: asJsonNodes([paragraph('main!')]),
    });
    assert.deepEqual(change.invert(value).apply(after), value);
  });

  it('restores an absent root exactly after inverting its creation', () => {
    const value: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
    };
    const header = DocumentIndex.fromValue([]);
    const change = createTestDocumentChange({
      roots: new Map([
        ['header', insertNodeChange(header, [0], paragraph('created'))],
      ]),
    });
    const replayedChange = DocumentChange.fromJSON(change.toJSON());
    const after = replayedChange.apply(value);
    const inverse = change.invert(value);
    const restored = DocumentChange.fromJSON(inverse.toJSON()).apply(after);

    assert.deepEqual(after.roots?.header, asJsonNodes([paragraph('created')]));
    assert.equal(Object.hasOwn(restored, 'roots'), false);
    assert.deepEqual(restored, value);

    const valueWithEmptyRoots: JsonEditorValue = { ...value, roots: {} };
    const afterEmptyRoots = change.apply(valueWithEmptyRoots);
    const restoredEmptyRoots = change
      .invert(valueWithEmptyRoots)
      .apply(afterEmptyRoots);

    assert.deepEqual(restoredEmptyRoots, value);
    assert.equal(Object.hasOwn(restoredEmptyRoots, 'roots'), false);
  });

  it('round-trips explicit empty-root creation and deletion', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
    };
    const create = createTestDocumentChange({
      createRoots: ['caption'],
    });
    const afterCreate = create.apply(before);

    assert.deepEqual(afterCreate.roots, { caption: [] });
    assert.deepEqual(create.invert(before).apply(afterCreate), before);

    const remove = createTestDocumentChange({
      deleteRoots: ['caption'],
    });

    assert.deepEqual(remove.apply(afterCreate), before);
    assert.deepEqual(remove.invert(afterCreate).apply(before), afterCreate);
  });

  it('requires source values to compose overlapping root lifecycles', () => {
    const absent: JsonEditorValue = {
      children: asJsonNodes([paragraph('main')]),
      roots: {},
    };
    const created: JsonEditorValue = {
      ...absent,
      roots: { caption: asJsonNodes([paragraph('created')]) },
    };
    const create = DocumentChange.between(absent, created);
    const remove = createTestDocumentChange({
      deleteRoots: ['caption'],
    });

    assert.throws(() => create.compose(remove), /requires the source value/);

    const transient = create.compose(remove, absent);
    const canonicalAbsent = { children: absent.children };

    assert.deepEqual(transient.apply(absent), canonicalAbsent);
    assert.deepEqual(
      transient.invert(absent).apply(canonicalAbsent),
      canonicalAbsent
    );

    const existing: JsonEditorValue = {
      ...absent,
      roots: { caption: asJsonNodes([paragraph('existing')]) },
    };
    const deleted = remove.apply(existing);
    const recreated: JsonEditorValue = {
      ...deleted,
      roots: { caption: asJsonNodes([paragraph('recreated')]) },
    };
    const recreate = DocumentChange.between(deleted, recreated);

    assert.throws(() => remove.compose(recreate), /requires the source value/);

    const replacement = remove.compose(recreate, existing);
    const replayed = replacement.apply(existing);

    assert.deepEqual(replayed, recreated);
    assert.deepEqual(replacement.invert(existing).apply(replayed), existing);
    assert.equal(replacement.createRoots.has('caption'), false);
    assert.equal(replacement.deleteRoots.has('caption'), false);
  });

  it('composes transaction-wide correction into the canonical change', () => {
    const before: JsonEditorValue = {
      children: asJsonNodes([paragraph('alpha')]),
    };
    const document = DocumentIndex.fromValue(before.children);
    const change = createTestDocumentChange({
      primary: insertTextChange(document, [0, 0], 5, '!'),
    });
    let observedRoots: readonly (string | null)[] = [];
    const corrected = change.correct(before, (value, changedRanges) => {
      observedRoots = changedRanges.map(({ root }) => root);

      return {
        ...value,
        children: asJsonNodes([paragraph('ALPHA!')]),
      };
    });

    assert.deepEqual(corrected.apply(before), {
      children: asJsonNodes([paragraph('ALPHA!')]),
    });
    assert.deepEqual(observedRoots, [null]);
    assert.deepEqual(
      corrected.invert(before).apply(corrected.apply(before)),
      before
    );
  });

  it('preserves compose and inverse laws across deterministic edit vectors', () => {
    let seed = 0xde_ca_fb_ad;
    const random = () => {
      seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;

      return seed / 0x1_00_00_00_00;
    };

    for (let vector = 0; vector < 80; vector++) {
      const origin = DocumentIndex.fromValue(
        asJsonNodes([paragraph(`vector-${vector}-abcdefghij`)])
      );
      let current = origin;
      let composed = RootChange.empty(origin.length);

      for (let edit = 0; edit < 6; edit++) {
        const text = (current.node([0, 0]) as { text: string }).text;
        const offset = Math.floor(random() * (text.length + 1));
        const next =
          text.length > 0 && random() < 0.45 && offset < text.length
            ? removeTextChange(current, [0, 0], offset, text[offset]!)
            : insertTextChange(
                current,
                [0, 0],
                offset,
                String.fromCharCode(97 + Math.floor(random() * 26))
              );

        composed = composed.compose(next);
        current = next.apply(current);
      }

      const applied = composed.apply(origin);

      assert.deepEqual(applied.value, current.value);
      assert.deepEqual(
        composed.invert(origin).apply(applied).value,
        origin.value
      );
    }
  });

  it('converges seeded structural pairs and preserves algebra laws', () => {
    const initialSeed = 0x57_07_c0_de;
    const random = createSeededRandom(initialSeed);

    for (let vector = 0; vector < 120; vector++) {
      const seed = Math.floor(random() * 0x1_00_00_00_00) >>> 0;
      const caseRandom = createSeededRandom(seed);
      const before: JsonEditorValue = {
        children: asJsonNodes(
          Array.from({ length: 3 + Math.floor(caseRandom() * 4) }, (_, index) =>
            paragraph(`v${vector}-block-${index}-abcdef`)
          )
        ),
      };
      const actions = ['a', 'b'].map((label) =>
        generateDocumentAction(before, caseRandom, label, {
          allowMove: false,
        })
      );
      const traceActions = [...actions];

      withGeneratedTrace(seed, traceActions, () => {
        const [afterA, afterB] = actions.map((action) =>
          applyDocumentAction(before, action)
        );
        const a = createDocumentActionChange(before, actions[0]!);
        const b = createDocumentActionChange(before, actions[1]!);

        assert.deepEqual(a.apply(before), afterA);
        assert.deepEqual(b.apply(before), afterB);
        const ab = DocumentChange.transform(a, b, before);
        const pairViaA = ab.b.apply(a.apply(before));
        const pairViaB = ab.a.apply(b.apply(before));

        assert.deepEqual(pairViaA, pairViaB);

        const sequentialA = createDocumentActionChange(before, actions[0]!);
        const sequentialBAction = generateDocumentAction(
          afterA!,
          caseRandom,
          'sequential-b'
        );
        traceActions.push(sequentialBAction);
        const sequentialAfterB = applyDocumentAction(
          afterA!,
          sequentialBAction
        );
        const sequentialB = createDocumentActionChange(
          afterA!,
          sequentialBAction
        );
        const sequentialCAction = generateDocumentAction(
          sequentialAfterB,
          caseRandom,
          'sequential-c'
        );
        traceActions.push(sequentialCAction);
        const sequentialAfterC = applyDocumentAction(
          sequentialAfterB,
          sequentialCAction
        );
        const sequentialC = createDocumentActionChange(
          sequentialAfterB,
          sequentialCAction
        );
        const left = sequentialA.compose(sequentialB).compose(sequentialC);
        const right = sequentialA.compose(sequentialB.compose(sequentialC));

        assert.deepEqual(left.apply(before), sequentialAfterC);
        assert.deepEqual(right.apply(before), sequentialAfterC);
        assert.deepEqual(left.invert(before).apply(left.apply(before)), before);
      });
    }
  });
});
