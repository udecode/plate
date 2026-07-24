import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fc from 'fast-check';

import { DocumentChange } from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import {
  RootChange,
  insertNodeChange,
  insertTextChange,
  moveNodeChange,
  type NodePropertyDelta,
  removeNodeChange,
  removeTextChange,
  setNodeChange,
  updateNodePropertiesChange,
} from '../src/core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../src/core/change/tokens';
import { createTestDocumentChange } from './support/document-change';

type ModelParagraph = {
  children: [{ text: string }];
  rank?: number;
  type: 'paragraph';
};

type ModelSection = {
  children: ModelParagraph[];
  rank?: number;
  type: 'section';
};

type ModelValue = {
  children: ModelSection[];
  roots?: Record<string, ModelSection[]>;
};

type ModelRoot = string | null;

type RawAction = {
  a: number;
  b: number;
  c: number;
  kind:
    | 'insert-paragraph'
    | 'insert-section'
    | 'insert-text'
    | 'move-paragraph'
    | 'move-section'
    | 'remove-paragraph'
    | 'remove-section'
    | 'remove-text'
    | 'set-paragraph'
    | 'set-section';
  removeProperty: boolean;
  text: string;
};

type ModelAction =
  | { at: number; kind: 'insert-section'; section: ModelSection }
  | { at: number; kind: 'remove-section' }
  | { from: number; kind: 'move-section'; to: number }
  | { at: number; kind: 'set-section'; rank: number | null }
  | {
      at: number;
      kind: 'insert-paragraph';
      paragraph: ModelParagraph;
      section: number;
    }
  | {
      at: number;
      kind: 'remove-paragraph';
      section: number;
    }
  | {
      from: number;
      kind: 'move-paragraph';
      section: number;
      to: number;
    }
  | {
      at: number;
      kind: 'set-paragraph';
      rank: number | null;
      section: number;
    }
  | {
      kind: 'insert-text';
      offset: number;
      paragraph: number;
      section: number;
      text: string;
    }
  | {
      kind: 'remove-text';
      offset: number;
      paragraph: number;
      section: number;
      text: string;
    };

const paragraph = (text: string): ModelParagraph => ({
  children: [{ text }],
  type: 'paragraph',
});

const section = (label: string): ModelSection => ({
  children: [paragraph(`${label}-a`), paragraph(`${label}-b`)],
  type: 'section',
});

const documentValue = (label: string, roots = false): ModelValue => ({
  children: [
    section(`${label}-0`),
    section(`${label}-1`),
    section(`${label}-2`),
  ],
  ...(roots
    ? {
        roots: {
          header: [section(`${label}-header-0`), section(`${label}-header-1`)],
        },
      }
    : {}),
});

const canonicalValue = (value: ModelValue): ModelValue =>
  Object.keys(value.roots ?? {}).length === 0
    ? { children: value.children }
    : value;

const rootValue = (value: ModelValue, root: ModelRoot) =>
  root === null ? value.children : (value.roots?.[root] ?? []);

const jsonValue = (value: ModelValue) => value as unknown as JsonEditorValue;

const jsonNodes = (nodes: readonly ModelSection[]) =>
  nodes as unknown as readonly JsonNode[];

const index = (value: ModelValue, root: ModelRoot) =>
  DocumentIndex.fromValue(jsonNodes(rootValue(value, root)));

const modulo = (value: number, length: number) => value % length;

const differentIndex = (from: number, candidate: number, length: number) => {
  const target = modulo(candidate, length);

  return target === from ? (target + 1) % length : target;
};

const normalizeAction = (
  value: ModelValue,
  root: ModelRoot,
  raw: RawAction
): ModelAction => {
  const sections = rootValue(value, root);
  const sectionIndex = modulo(raw.a, sections.length);
  const paragraphs = sections[sectionIndex]!.children;
  const paragraphIndex = modulo(raw.b, paragraphs.length);
  const text = paragraphs[paragraphIndex]!.children[0].text;
  const rank = raw.removeProperty ? null : 1 + modulo(raw.c, 1000);

  switch (raw.kind) {
    case 'insert-section':
      return {
        at: modulo(raw.a, sections.length + 1),
        kind: raw.kind,
        section: section(`generated-${raw.text}-${raw.c}`),
      };
    case 'remove-section':
      return sections.length === 1
        ? { at: sectionIndex, kind: 'set-section', rank }
        : { at: sectionIndex, kind: raw.kind };
    case 'move-section':
      return sections.length === 1
        ? { at: sectionIndex, kind: 'set-section', rank }
        : {
            from: sectionIndex,
            kind: raw.kind,
            to: differentIndex(sectionIndex, raw.b, sections.length),
          };
    case 'set-section':
      return { at: sectionIndex, kind: raw.kind, rank };
    case 'insert-paragraph':
      return {
        at: modulo(raw.b, paragraphs.length + 1),
        kind: raw.kind,
        paragraph: paragraph(`generated-${raw.text}-${raw.c}`),
        section: sectionIndex,
      };
    case 'remove-paragraph':
      return paragraphs.length === 1
        ? {
            at: paragraphIndex,
            kind: 'set-paragraph',
            rank,
            section: sectionIndex,
          }
        : {
            at: paragraphIndex,
            kind: raw.kind,
            section: sectionIndex,
          };
    case 'move-paragraph':
      return paragraphs.length === 1
        ? {
            at: paragraphIndex,
            kind: 'set-paragraph',
            rank,
            section: sectionIndex,
          }
        : {
            from: paragraphIndex,
            kind: raw.kind,
            section: sectionIndex,
            to: differentIndex(paragraphIndex, raw.c, paragraphs.length),
          };
    case 'set-paragraph':
      return {
        at: paragraphIndex,
        kind: raw.kind,
        rank,
        section: sectionIndex,
      };
    case 'insert-text':
      return {
        kind: raw.kind,
        offset: modulo(raw.c, text.length + 1),
        paragraph: paragraphIndex,
        section: sectionIndex,
        text: raw.text,
      };
    case 'remove-text': {
      if (text.length === 0) {
        return {
          kind: 'insert-text',
          offset: 0,
          paragraph: paragraphIndex,
          section: sectionIndex,
          text: raw.text,
        };
      }

      const offset = modulo(raw.c, text.length);

      return {
        kind: raw.kind,
        offset,
        paragraph: paragraphIndex,
        section: sectionIndex,
        text: text[offset]!,
      };
    }
  }
};

const actionChange = (
  value: ModelValue,
  root: ModelRoot,
  action: ModelAction
) => {
  const document = index(value, root);
  let change: RootChange;

  switch (action.kind) {
    case 'insert-section':
      change = insertNodeChange(document, [action.at], action.section);
      break;
    case 'remove-section':
      change = removeNodeChange(document, [action.at]);
      break;
    case 'move-section':
      change = moveNodeChange(document, [action.from], [action.to]);
      break;
    case 'set-section':
      change = setNodeChange(document, [action.at], { rank: action.rank });
      break;
    case 'insert-paragraph':
      change = insertNodeChange(
        document,
        [action.section, action.at],
        action.paragraph
      );
      break;
    case 'remove-paragraph':
      change = removeNodeChange(document, [action.section, action.at]);
      break;
    case 'move-paragraph':
      change = moveNodeChange(
        document,
        [action.section, action.from],
        [action.section, action.to]
      );
      break;
    case 'set-paragraph':
      change = setNodeChange(document, [action.section, action.at], {
        rank: action.rank,
      });
      break;
    case 'insert-text':
      change = insertTextChange(
        document,
        [action.section, action.paragraph, 0],
        action.offset,
        action.text
      );
      break;
    case 'remove-text':
      change = removeTextChange(
        document,
        [action.section, action.paragraph, 0],
        action.offset,
        action.text
      );
      break;
  }

  return createTestDocumentChange(
    root === null ? { primary: change } : { roots: new Map([[root, change]]) }
  );
};

const applyModelAction = (
  value: ModelValue,
  root: ModelRoot,
  action: ModelAction
) => {
  const next = structuredClone(value);
  const sections = rootValue(next, root);

  switch (action.kind) {
    case 'insert-section':
      sections.splice(action.at, 0, action.section);
      break;
    case 'remove-section':
      sections.splice(action.at, 1);
      break;
    case 'move-section': {
      const [moved] = sections.splice(action.from, 1);

      sections.splice(action.to, 0, moved!);
      break;
    }
    case 'set-section':
      if (action.rank === null) delete sections[action.at]!.rank;
      else sections[action.at]!.rank = action.rank;
      break;
    case 'insert-paragraph':
      sections[action.section]!.children.splice(action.at, 0, action.paragraph);
      break;
    case 'remove-paragraph':
      sections[action.section]!.children.splice(action.at, 1);
      break;
    case 'move-paragraph': {
      const paragraphs = sections[action.section]!.children;
      const [moved] = paragraphs.splice(action.from, 1);

      paragraphs.splice(action.to, 0, moved!);
      break;
    }
    case 'set-paragraph': {
      const target = sections[action.section]!.children[action.at]!;

      if (action.rank === null) delete target.rank;
      else target.rank = action.rank;
      break;
    }
    case 'insert-text': {
      const target =
        sections[action.section]!.children[action.paragraph]!.children[0];

      target.text = `${target.text.slice(0, action.offset)}${action.text}${target.text.slice(action.offset)}`;
      break;
    }
    case 'remove-text': {
      const target =
        sections[action.section]!.children[action.paragraph]!.children[0];

      target.text = `${target.text.slice(0, action.offset)}${target.text.slice(action.offset + action.text.length)}`;
      break;
    }
  }

  return next;
};

const rawActionArbitrary = fc.record({
  a: fc.nat(30),
  b: fc.nat(30),
  c: fc.nat(30),
  kind: fc.constantFrom<RawAction['kind']>(
    'insert-section',
    'remove-section',
    'move-section',
    'set-section',
    'insert-paragraph',
    'remove-paragraph',
    'move-paragraph',
    'set-paragraph',
    'insert-text',
    'remove-text'
  ),
  removeProperty: fc.boolean(),
  text: fc.constantFrom('x', 'yz', '🙂'),
});
const lawSeed = Number.parseInt(
  process.env.PLITE_DOCUMENT_CHANGE_LAW_SEED ?? '1510461662',
  10
);
const lawRuns = Number.parseInt(
  process.env.PLITE_DOCUMENT_CHANGE_LAW_RUNS ?? '100',
  10
);

const assertLaw = (
  property: Parameters<typeof fc.assert>[0],
  seedOffset: number,
  numRuns = lawRuns
) =>
  fc.assert(property, {
    numRuns,
    seed: lawSeed + seedOffset,
    verbose: true,
  });

const assertConcurrentPair = (
  before: ModelValue,
  a: DocumentChange,
  b: DocumentChange
) => {
  const transformed = DocumentChange.transform(a, b, jsonValue(before));

  assert.deepEqual(
    transformed.b.apply(a.apply(jsonValue(before))),
    transformed.a.apply(b.apply(jsonValue(before)))
  );
};

const propertyDeltaArbitrary: fc.Arbitrary<NodePropertyDelta> = fc.oneof(
  fc
    .record({
      key: fc.constantFrom('align', 'tone'),
      value: fc.integer({ max: 9, min: 0 }),
    })
    .map(({ key, value }) => ({ set: { [key]: value } })),
  fc.constantFrom('align', 'tone').map((key) => ({ unset: [key] })),
  fc
    .array(fc.integer({ max: 5, min: 0 }), { maxLength: 5, minLength: 1 })
    .map((values) => ({ add: { tags: values } })),
  fc
    .array(fc.integer({ max: 5, min: 0 }), { maxLength: 5, minLength: 1 })
    .map((values) => ({ remove: { tags: values } }))
);

describe('DocumentChange generated laws', () => {
  it('matches a nested structural/property reference model and algebra', () => {
    assertLaw(
      fc.property(
        fc.array(rawActionArbitrary, { maxLength: 24, minLength: 1 }),
        (rawActions) => {
          const origin = documentValue('model');
          let model = origin;
          let composed = DocumentChange.empty;

          for (const raw of rawActions) {
            const action = normalizeAction(model, null, raw);
            const change = actionChange(model, null, action);
            const expected = applyModelAction(model, null, action);
            const serialized = DocumentChange.fromJSON(change.toJSON());
            const actual = serialized.apply(jsonValue(model));

            assert.deepEqual(actual, expected);
            assert.deepEqual(
              change.invert(jsonValue(model)).apply(actual),
              model
            );
            composed = composed.compose(change);
            model = expected;
          }

          const replayed = DocumentChange.fromJSON(composed.toJSON()).apply(
            jsonValue(origin)
          );

          assert.deepEqual(replayed, model);
          assert.deepEqual(
            composed.invert(jsonValue(origin)).apply(replayed),
            origin
          );
        }
      ),
      0
    );
  });

  it('keeps generated atomic multi-root edits and root lifecycle invertible', () => {
    assertLaw(
      fc.property(
        fc.array(fc.tuple(rawActionArbitrary, rawActionArbitrary), {
          maxLength: 12,
          minLength: 1,
        }),
        fc.array(fc.constantFrom('caption', 'footer', 'sidebar'), {
          maxLength: 8,
        }),
        (rawPairs, lifecycleRoots) => {
          let model = documentValue('roots', true);

          for (const [mainRaw, headerRaw] of rawPairs) {
            const mainAction = normalizeAction(model, null, mainRaw);
            const headerAction = normalizeAction(model, 'header', headerRaw);
            const main = actionChange(model, null, mainAction);
            const header = actionChange(model, 'header', headerAction);
            const atomic = main.compose(header);
            const expected = applyModelAction(
              applyModelAction(model, null, mainAction),
              'header',
              headerAction
            );
            const after = DocumentChange.fromJSON(atomic.toJSON()).apply(
              jsonValue(model)
            );

            assert.deepEqual(after, expected);
            assert.deepEqual(
              atomic.invert(jsonValue(model)).apply(after),
              model
            );
            model = expected;
          }

          for (const root of lifecycleRoots) {
            const exists = Object.hasOwn(model.roots ?? {}, root);
            const change = exists
              ? createTestDocumentChange({
                  deleteRoots: [root],
                })
              : createTestDocumentChange({
                  roots: new Map([
                    [
                      root,
                      insertNodeChange(
                        DocumentIndex.fromValue([]),
                        [0],
                        section(`created-${root}`)
                      ),
                    ],
                  ]),
                  createRoots: [root],
                });
            const after = DocumentChange.fromJSON(change.toJSON()).apply(
              jsonValue(model)
            );

            assert.deepEqual(
              change.invert(jsonValue(model)).apply(after),
              model
            );
            model = after as unknown as ModelValue;
          }
        }
      ),
      1,
      Math.max(50, Math.floor(lawRuns * 0.8))
    );
  });

  it('composes generated root lifecycle cycles relative to the original document', () => {
    assertLaw(
      fc.property(
        fc.constantFrom('caption', 'footer', 'sidebar'),
        fc.string({ maxLength: 16 }),
        fc.boolean(),
        (root, label, startsPresent) => {
          const before = documentValue('lifecycle');

          before.roots = startsPresent
            ? { [root]: [section(`before-${label}`)] }
            : {};

          const middle = structuredClone(before);
          const after = structuredClone(before);

          if (startsPresent) {
            delete middle.roots![root];
            after.roots![root] = [section(`after-${label}`)];
          } else {
            middle.roots![root] = [section(`middle-${label}`)];
            delete after.roots![root];
          }

          const composed = DocumentChange.between(
            jsonValue(before),
            jsonValue(middle)
          ).compose(
            DocumentChange.between(jsonValue(middle), jsonValue(after)),
            jsonValue(before)
          );
          const serialized = DocumentChange.fromJSON(composed.toJSON());
          const replayed = serialized.apply(jsonValue(before));

          assert.deepEqual(replayed, canonicalValue(after));
          assert.deepEqual(
            serialized.invert(jsonValue(before)).apply(replayed),
            canonicalValue(before)
          );
          assert.equal(serialized.createRoots.has(root), false);
          assert.equal(serialized.deleteRoots.has(root), false);
        }
      ),
      1,
      Math.max(50, Math.floor(lawRuns * 0.8))
    );
  });

  it('composes generated corrections into serializable canonical changes', () => {
    assertLaw(
      fc.property(fc.boolean(), rawActionArbitrary, (header, raw) => {
        const before = documentValue('correction', true);
        const root = header ? 'header' : null;
        const action = normalizeAction(before, root, raw);
        const base = actionChange(before, root, action);
        const expectedBase = applyModelAction(before, root, action);
        const expected = structuredClone(expectedBase);

        for (const target of rootValue(expected, root)) {
          target.rank = 999;
          for (const child of target.children) {
            child.children[0].text = child.children[0].text.toUpperCase();
          }
        }

        const corrected = base.correct(jsonValue(before), (value, ranges) => {
          if (!base.empty) {
            assert.ok(ranges.some((range) => range.root === root));
          }

          return jsonValue(expected);
        });
        const replayed = DocumentChange.fromJSON(corrected.toJSON()).apply(
          jsonValue(before)
        );

        assert.deepEqual(replayed, expected);
        assert.deepEqual(
          corrected.invert(jsonValue(before)).apply(replayed),
          before
        );
      }),
      2,
      Math.max(50, Math.floor(lawRuns * 0.8))
    );
  });

  it('converges generated structural/property pair transforms including moves', () => {
    assertLaw(
      fc.property(
        fc.tuple(
          fc.boolean(),
          rawActionArbitrary,
          fc.boolean(),
          rawActionArbitrary
        ),
        ([rootA, rawA, rootB, rawB]) => {
          const before = documentValue('concurrent-pair', true);
          const aRoot = rootA ? 'header' : null;
          const bRoot = rootB ? 'header' : null;
          const a = actionChange(
            before,
            aRoot,
            normalizeAction(before, aRoot, rawA)
          );
          const b = actionChange(
            before,
            bRoot,
            normalizeAction(before, bRoot, rawB)
          );

          assertConcurrentPair(before, a, b);
        }
      ),
      3
    );
  });

  it('preserves generated scalar and set-valued property deltas through the full algebra', () => {
    assertLaw(
      fc.property(
        fc.boolean(),
        propertyDeltaArbitrary,
        fc.boolean(),
        propertyDeltaArbitrary,
        (headerA, deltaA, headerB, deltaB) => {
          const before = documentValue('property-delta', true);

          for (const root of [null, 'header'] as const) {
            const target = rootValue(before, root)[0]!;

            Object.assign(target, {
              align: 0,
              tags: [0, 1, 2],
              tone: 0,
            });
          }

          const rootA = headerA ? 'header' : null;
          const rootB = headerB ? 'header' : null;
          const create = (
            value: ModelValue,
            root: ModelRoot,
            delta: NodePropertyDelta
          ) =>
            createTestDocumentChange(
              root === null
                ? {
                    primary: updateNodePropertiesChange(
                      index(value, root),
                      [0],
                      delta
                    ),
                  }
                : {
                    roots: new Map([
                      [
                        root,
                        updateNodePropertiesChange(
                          index(value, root),
                          [0],
                          delta
                        ),
                      ],
                    ]),
                  }
            );
          const a = create(before, rootA, deltaA);
          const b = create(before, rootB, deltaB);
          const transformed = DocumentChange.transform(
            DocumentChange.fromJSON(a.toJSON()),
            DocumentChange.fromJSON(b.toJSON()),
            jsonValue(before)
          );
          const afterA = a.apply(jsonValue(before));
          const afterB = b.apply(jsonValue(before));
          const viaA = transformed.b.apply(afterA);
          const viaB = transformed.a.apply(afterB);

          assert.deepEqual(viaA, viaB);
          assert.deepEqual(a.invert(jsonValue(before)).apply(afterA), before);

          const sequentialB = create(
            afterA as unknown as ModelValue,
            rootB,
            deltaB
          );
          const composed = DocumentChange.fromJSON(
            a.compose(sequentialB).toJSON()
          );

          assert.deepEqual(
            composed.apply(jsonValue(before)),
            sequentialB.apply(afterA)
          );
          assert.deepEqual(
            composed
              .invert(jsonValue(before))
              .apply(composed.apply(jsonValue(before))),
            before
          );
        }
      ),
      4
    );
  });

  it('composes generated sequential changes associatively', () => {
    assertLaw(
      fc.property(
        fc.tuple(rawActionArbitrary, rawActionArbitrary, rawActionArbitrary),
        ([rawA, rawB, rawC]) => {
          const before = documentValue('associative');
          const actionA = normalizeAction(before, null, rawA);
          const a = actionChange(before, null, actionA);
          const afterA = applyModelAction(before, null, actionA);
          const actionB = normalizeAction(afterA, null, rawB);
          const b = actionChange(afterA, null, actionB);
          const afterB = applyModelAction(afterA, null, actionB);
          const actionC = normalizeAction(afterB, null, rawC);
          const c = actionChange(afterB, null, actionC);
          const expected = applyModelAction(afterB, null, actionC);
          const left = a.compose(b).compose(c);
          const right = a.compose(b.compose(c));

          assert.deepEqual(left.apply(jsonValue(before)), expected);
          assert.deepEqual(right.apply(jsonValue(before)), expected);
        }
      ),
      5
    );
  });
});
