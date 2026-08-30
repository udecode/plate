import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  type Descendant,
  DocumentChange,
  type Element,
  ElementApi,
  schema,
  TextApi,
} from 'plitejs';

import { canonicalizeRootChildren } from '../src/core/representation';

const lawSeed = Number.parseInt(
  process.env.PLITE_SLICE_FIT_LAW_SEED ?? '20260721',
  10
);
const lawRuns = Number.parseInt(
  process.env.PLITE_SLICE_FIT_LAW_RUNS ?? '80',
  10
);

const assertLaw = (
  law: Parameters<typeof fc.assert>[0],
  offset: number,
  runs = lawRuns
) => {
  const seed = lawSeed + offset;

  try {
    void fc.assert(law, { numRuns: runs, seed, verbose: true });
  } catch (error) {
    throw new Error(
      `Slice-fit law failed. Replay with PLITE_SLICE_FIT_LAW_SEED=${lawSeed} PLITE_SLICE_FIT_LAW_RUNS=${runs} (law seed ${seed}).`,
      { cause: error }
    );
  }
};

const paragraph = (
  text: string,
  children: Descendant[] = [{ text }]
): Element => ({
  children,
  type: 'paragraph',
});

const heading = (text: string): Element => ({
  children: [{ text }],
  type: 'heading',
});

const section = (children: Descendant[]): Element => ({
  children,
  type: 'section',
});

const policyMatrix = [
  { preserveContext: false, replaceWhenCovered: false },
  { preserveContext: false, replaceWhenCovered: true },
  { preserveContext: true, replaceWhenCovered: false },
  { preserveContext: true, replaceWhenCovered: true },
];

const createLawSchema = (grammar: number, policyIndex: number) => {
  const policy = policyMatrix[policyIndex];

  assert.ok(policy);

  const content =
    grammar === 0
      ? schema.content.group('block', {
          default: { type: 'paragraph' },
          max: 3,
          min: 1,
        })
      : grammar === 1
        ? schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            max: 3,
            min: 1,
          })
        : schema.content.group('textBlock', {
            default: { type: 'paragraph' },
            max: 2,
            min: 2,
          });

  return defineEditorSchema(`schema:slice-fit-laws-${grammar}-${policyIndex}`, {
    elements: {
      caption: {
        content: schema.content.text({ default: 'text', min: 1 }),
      } as const,
      heading: {
        content: schema.content.text({ default: 'text', min: 1 }),
      } as const,
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
        groups: ['textBlock'],
      } as const,
      section: {
        content,
        slice: policy,
      } as const,
    },
    id: `slice-fit-laws-${grammar}-${policyIndex}`,
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    roots: {
      header: schema.content.type('heading', {
        default: { type: 'heading' },
        min: 1,
      }),
    },
    unknown: 'reject',
    version: 1,
  });
};

const lawSchemas = Array.from({ length: 3 }, (_unused, grammar) =>
  Array.from({ length: policyMatrix.length }, (_value, policy) =>
    createLawSchema(grammar, policy)
  )
);

const createLawEditor = (grammar: number, policy: number) => {
  const extension = lawSchemas[grammar]?.[policy];

  assert.ok(extension);

  return createEditor({
    extensions: [extension],
    initialValue: {
      children: [
        section([paragraph('main-alpha'), paragraph('main-bravo')]),
        paragraph('main-tail'),
      ],
      roots: { header: [heading('header-title')] },
    },
  });
};

const schemaVariantArbitrary = fc.record({
  grammar: fc.integer({ max: 2, min: 0 }),
  policy: fc.integer({ max: policyMatrix.length - 1, min: 0 }),
});

const rootArbitrary = fc.constantFrom<'header' | 'main'>('main', 'header');

const validSliceArbitrary = fc
  .record({
    family: fc.integer({ max: 4, min: 0 }),
    left: fc.string({ maxLength: 12 }),
    openEndSeed: fc.nat({ max: 100 }),
    openStartSeed: fc.nat({ max: 100 }),
    right: fc.string({ maxLength: 12 }),
  })
  .map(({ family, left, openEndSeed, openStartSeed, right }) => {
    let content: Descendant[];
    let maxOpenEnd: number;
    let maxOpenStart: number;

    switch (family) {
      case 0: {
        content = [{ text: left }];
        maxOpenEnd = 0;
        maxOpenStart = 0;
        break;
      }
      case 1: {
        content = [paragraph(left)];
        maxOpenEnd = 1;
        maxOpenStart = 1;
        break;
      }
      case 2: {
        content = [section([paragraph(left)])];
        maxOpenEnd = 2;
        maxOpenStart = 2;
        break;
      }
      case 3: {
        content = [section([paragraph(left)]), paragraph(right)];
        maxOpenEnd = 1;
        maxOpenStart = 2;
        break;
      }
      default: {
        content = [paragraph(left), section([paragraph(right)])];
        maxOpenEnd = 2;
        maxOpenStart = 1;
        break;
      }
    }

    return {
      input: {
        content,
        openEnd: openEndSeed % (maxOpenEnd + 1),
        openStart: openStartSeed % (maxOpenStart + 1),
      },
      maxOpenEnd,
      maxOpenStart,
    };
  });

const point = (root: 'header' | 'main', path: number[], offset: number) =>
  root === 'main' ? { offset, path } : { offset, path, root };

const targetRange = (
  root: 'header' | 'main',
  firstSeed: number,
  secondSeed: number,
  targetSeed: number,
  crossBlock: boolean
) => {
  if (root === 'header') {
    const first = firstSeed % ('header-title'.length + 1);
    const second = secondSeed % ('header-title'.length + 1);

    return {
      at: {
        anchor: point(root, [0, 0], Math.min(first, second)),
        focus: point(root, [0, 0], Math.max(first, second)),
      },
      protectedTopIndex: null,
    };
  }

  if (crossBlock) {
    return {
      at: {
        anchor: point(root, [0, 0, 0], firstSeed % 11),
        focus: point(root, [0, 1, 0], secondSeed % 11),
      },
      protectedTopIndex: 1,
    };
  }

  const targets = [
    { length: 'main-alpha'.length, path: [0, 0, 0], protected: 1 },
    { length: 'main-bravo'.length, path: [0, 1, 0], protected: 1 },
    { length: 'main-tail'.length, path: [1, 0], protected: 0 },
  ];
  const target = targets[targetSeed % targets.length];
  const first = firstSeed % (target.length + 1);
  const second = secondSeed % (target.length + 1);

  return {
    at: {
      anchor: point(root, target.path, Math.min(first, second)),
      focus: point(root, target.path, Math.max(first, second)),
    },
    protectedTopIndex: target.protected,
  };
};

type LawEditor = ReturnType<typeof createLawEditor>;
type LawFitSpec = Exclude<ReturnType<LawEditor['read']['slice']['fit']>, false>;
type LawValue = ReturnType<LawEditor['read']['value']>;

const specShape = (spec: LawFitSpec) => ({
  changes: spec.changes.toJSON(),
  selection: spec.selection,
});

const rootChildren = (value: LawValue, root: 'header' | 'main') =>
  root === 'main' ? value.children : (value.roots?.header ?? []);

const textAt = (children: readonly Descendant[], path: readonly number[]) => {
  let current = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = current[index];
    current = ElementApi.isElement(node) ? node.children : [];
  }

  assert.ok(TextApi.isText(node));

  return node;
};

void describe('slice fitter generated model laws', () => {
  void it('fits valid open slices deterministically without publishing preview state', () => {
    assertLaw(
      fc.property(
        schemaVariantArbitrary,
        rootArbitrary,
        validSliceArbitrary,
        fc.nat({ max: 10_000 }),
        fc.nat({ max: 10_000 }),
        fc.nat({ max: 10_000 }),
        fc.boolean(),
        (
          variant,
          root,
          generated,
          firstSeed,
          secondSeed,
          targetSeed,
          crossBlock
        ) => {
          const editor = createLawEditor(variant.grammar, variant.policy);
          const range = targetRange(
            root,
            firstSeed,
            secondSeed,
            targetSeed,
            crossBlock
          );
          const slice = ContentSlice.fromJSON(generated.input);
          const roundTrip = ContentSlice.fromJSON(
            JSON.parse(JSON.stringify(slice))
          );
          const before = editor.read.value();
          const beforeCommit = editor.read.lastCommit();
          const first = editor.read.slice.fit(slice, { at: range.at });
          const second = editor.read.slice.fit(roundTrip, { at: range.at });

          assert.deepEqual(roundTrip, slice);
          assert.equal(editor.read.children(), before.children);
          assert.equal(editor.read.root('header'), before.roots?.header);
          assert.equal(editor.read.lastCommit(), beforeCommit);
          assert.equal(Boolean(first), Boolean(second));

          if (!first || !second) return;

          assert.deepEqual(specShape(first), specShape(second));

          const serialized = DocumentChange.fromJSON(first.changes.toJSON());
          const after = serialized.apply(before);

          assert.deepEqual(after, first.changes.apply(before));
          assert.deepEqual(
            serialized.invert(before).apply(after),
            before,
            'a fitted replacement must remain invertible'
          );
          assert.doesNotThrow(() => editor.read.schema.assertDocument(after));

          for (const candidateRoot of ['main', 'header'] as const) {
            const children = rootChildren(after, candidateRoot);

            assert.deepEqual(
              children,
              canonicalizeRootChildren(editor, children, null, candidateRoot)
            );
          }

          if (root === 'main') {
            assert.equal(after.roots?.header, before.roots?.header);
            assert.ok(
              after.children.includes(
                before.children[range.protectedTopIndex!]
              ),
              'an untouched top-level subtree must retain identity'
            );
          } else {
            assert.equal(after.children, before.children);
          }
        }
      ),
      0
    );
  });

  void it('matches full-root canonicalization for generated open text replacements', () => {
    assertLaw(
      fc.property(
        schemaVariantArbitrary,
        rootArbitrary,
        fc.integer({ max: 2, min: 0 }),
        fc.string({ maxLength: 16 }),
        fc.nat({ max: 10_000 }),
        fc.nat({ max: 10_000 }),
        (variant, root, depth, replacement, firstSeed, secondSeed) => {
          const editor = createLawEditor(variant.grammar, variant.policy);
          const target =
            root === 'main'
              ? { path: [0, 0, 0], text: 'main-alpha' }
              : { path: [0, 0], text: 'header-title' };
          const first = firstSeed % (target.text.length + 1);
          const second = secondSeed % (target.text.length + 1);
          const start = Math.min(first, second);
          const end = Math.max(first, second);
          let content: Descendant = { text: replacement };

          if (depth >= 1) content = paragraph('', [content]);
          if (depth >= 2) content = section([content]);

          const slice = ContentSlice.fromJSON({
            content: [content],
            openEnd: depth,
            openStart: depth,
          });
          const at = {
            anchor: point(root, target.path, start),
            focus: point(root, target.path, end),
          };
          const before = editor.read.value();
          const fitted = editor.read.slice.fit(slice, { at });

          if (policyMatrix[variant.policy]?.preserveContext && depth > 1) {
            assert.equal(fitted, false);

            return;
          }

          assert.ok(fitted);

          const after = fitted.changes.apply(before);
          const raw = structuredClone(before);
          const rawChildren = rootChildren(raw, root);
          const rawText = textAt(rawChildren, target.path);

          assert.equal(
            Reflect.set(
              rawText,
              'text',
              `${rawText.text.slice(0, start)}${replacement}${rawText.text.slice(end)}`
            ),
            true
          );

          const canonical = canonicalizeRootChildren(
            editor,
            rawChildren,
            null,
            root
          );
          const expected =
            root === 'main'
              ? { ...raw, children: canonical }
              : {
                  ...raw,
                  roots: { ...raw.roots, header: canonical },
                };

          assert.deepEqual(after, expected);
        }
      ),
      1
    );
  });

  void it('rejects generated malformed open depths before fitting', () => {
    assertLaw(
      fc.property(
        validSliceArbitrary,
        fc.constantFrom(
          'end-fraction',
          'end-overflow',
          'extra-field',
          'negative-start',
          'start-overflow'
        ),
        (generated, kind) => {
          const malformed = (() => {
            switch (kind) {
              case 'end-fraction': {
                return { ...generated.input, openEnd: 0.5 };
              }
              case 'end-overflow': {
                return {
                  ...generated.input,
                  openEnd: generated.maxOpenEnd + 1,
                };
              }
              case 'extra-field': {
                return { ...generated.input, unexpected: true };
              }
              case 'negative-start': {
                return { ...generated.input, openStart: -1 };
              }
              case 'start-overflow': {
                return {
                  ...generated.input,
                  openStart: generated.maxOpenStart + 1,
                };
              }
            }

            return undefined;
          })();

          assert.throws(() => ContentSlice.fromJSON(malformed));
        }
      ),
      2
    );
  });

  void it('publishes nothing when a well-formed generated slice cannot fit', () => {
    assertLaw(
      fc.property(
        schemaVariantArbitrary,
        rootArbitrary,
        fc.boolean(),
        fc.nat({ max: 10_000 }),
        (variant, root, badProperty, offsetSeed) => {
          const editor = createLawEditor(variant.grammar, variant.policy);
          const target =
            root === 'main'
              ? { path: [0, 0, 0], text: 'main-alpha' }
              : { path: [0, 0], text: 'header-title' };
          const offset = offsetSeed % (target.text.length + 1);
          const at = {
            anchor: point(root, target.path, offset),
            focus: point(root, target.path, offset),
          };
          const slice = ContentSlice.closed(
            badProperty
              ? [{ bold: 'not-a-boolean', text: 'invalid' }]
              : [
                  {
                    children: [{ text: 'invalid' }],
                    type: 'unknown-generated',
                  },
                ]
          );
          const before = editor.read.value();
          const beforeCommit = editor.read.lastCommit();
          const beforeSelection = editor.read.selection();
          let commits = 0;
          let applied = true;
          const unsubscribe = editor.subscribeCommit(() => (commits += 1) - 1);

          assert.equal(editor.read.slice.fit(slice, { at }), false);
          editor.update((tx) => {
            applied = tx.slice.replace(slice, { at });
          });
          unsubscribe();

          assert.equal(applied, false);
          assert.equal(commits, 0);
          assert.deepEqual(editor.read.value(), before);
          assert.equal(editor.read.children(), before.children);
          assert.equal(editor.read.root('header'), before.roots?.header);
          assert.equal(editor.read.lastCommit(), beforeCommit);
          assert.equal(editor.read.selection(), beforeSelection);
        }
      ),
      3,
      Math.max(40, Math.floor(lawRuns / 2))
    );
  });

  void it('converges generated slice-originated changes through transforms', () => {
    assertLaw(
      fc.property(
        schemaVariantArbitrary,
        rootArbitrary,
        rootArbitrary,
        fc.string({ maxLength: 8, minLength: 1 }),
        fc.string({ maxLength: 8, minLength: 1 }),
        fc.nat({ max: 10_000 }),
        fc.nat({ max: 10_000 }),
        (variant, rootA, rootB, textA, textB, offsetA, offsetB) => {
          const editor = createLawEditor(variant.grammar, variant.policy);
          const target = (root: 'header' | 'main', alternate: boolean) =>
            root === 'header'
              ? { length: 'header-title'.length, path: [0, 0] }
              : alternate
                ? { length: 'main-bravo'.length, path: [0, 1, 0] }
                : { length: 'main-alpha'.length, path: [0, 0, 0] };
          const targetA = target(rootA, false);
          const targetB = target(rootB, rootA === rootB);
          const pointA = point(
            rootA,
            targetA.path,
            offsetA % (targetA.length + 1)
          );
          const pointB = point(
            rootB,
            targetB.path,
            offsetB % (targetB.length + 1)
          );
          const a = editor.read.slice.fit(
            ContentSlice.closed([{ text: textA }]),
            { at: { anchor: pointA, focus: pointA } }
          );
          const b = editor.read.slice.fit(
            ContentSlice.closed([{ text: textB }]),
            { at: { anchor: pointB, focus: pointB } }
          );

          assert.ok(a);
          assert.ok(b);

          const before = editor.read.value();
          const serializedA = DocumentChange.fromJSON(a.changes.toJSON());
          const serializedB = DocumentChange.fromJSON(b.changes.toJSON());
          const transformed = DocumentChange.transform(
            serializedA,
            serializedB,
            before
          );
          const viaA = transformed.b.apply(serializedA.apply(before));
          const viaB = transformed.a.apply(serializedB.apply(before));

          assert.deepEqual(viaA, viaB);
          assert.deepEqual(
            serializedA.invert(before).apply(serializedA.apply(before)),
            before
          );
          assert.deepEqual(
            serializedB.invert(before).apply(serializedB.apply(before)),
            before
          );
          assert.doesNotThrow(() => editor.read.schema.assertDocument(viaA));
        }
      ),
      4
    );
  });
});
