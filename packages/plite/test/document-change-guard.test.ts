import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';
import type { Element } from '@platejs/plite';

import {
  ChangeSet,
  DocumentChange,
  type DocumentChangeRootClassification,
  type JsonNode,
} from '../src/core/document-change';

const paragraph = (text: string) =>
  ({
    children: [{ text }],
    type: 'paragraph',
  }) satisfies Element;

const asJsonNodes = (nodes: readonly Element[]) =>
  nodes as unknown as readonly JsonNode[];

const asStructuralChangeSet = (
  change: ChangeSet,
  overrides: Readonly<Record<string, unknown>> = {}
) =>
  Object.assign(Object.create(null) as object, {
    apply: change.apply,
    compose: change.compose,
    data: change.data,
    empty: change.empty,
    invert: change.invert,
    iterChangedRanges: change.iterChangedRanges,
    length: change.length,
    mapPos: change.mapPos,
    movedNode: change.movedNode,
    newLength: change.newLength,
    sections: change.sections,
    toJSON: change.toJSON,
    ...overrides,
  }) as ChangeSet;

const asStructuralDocumentChange = (
  change: DocumentChange,
  overrides: Readonly<Record<string, unknown>> = {}
) =>
  Object.assign(Object.create(null) as object, {
    apply: change.apply,
    compose: change.compose,
    correct: change.correct,
    createRoots: change.createRoots,
    deleteRoots: change.deleteRoots,
    empty: change.empty,
    invert: change.invert,
    iterChangedRanges: change.iterChangedRanges,
    mapPosition: change.mapPosition,
    primary: change.primary,
    primaryClassification: change.primaryClassification,
    rootClassifications: change.rootClassifications,
    roots: change.roots,
    toJSON: change.toJSON,
    ...overrides,
  }) as DocumentChange;

const createChange = () =>
  DocumentChange.between(
    {
      children: asJsonNodes([paragraph('before')]),
      roots: { removed: asJsonNodes([paragraph('removed')]) },
    },
    {
      children: asJsonNodes([paragraph('after')]),
      roots: { created: asJsonNodes([paragraph('created')]) },
    }
  );

describe('DocumentChange structural guard', () => {
  it('rejects widened primary sentinels at named-root boundaries', () => {
    const change = createChange();
    const root: string = 'main';

    assert.ok(change.primary);
    assert.throws(
      () => new DocumentChange({ roots: new Map([[root, change.primary!]]) }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () => new DocumentChange({ createRoots: [root] }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () => change.mapPosition(0, { root }),
      /Omit root to target the primary document/
    );
  });

  it('accepts constructor-neutral values backed by foreign-realm collections', () => {
    const change = createChange();
    assert.ok(change.primary);
    const structuralPrimary = asStructuralChangeSet(change.primary);
    const structuralRoots = [...change.roots].map(
      ([root, rootChange]) => [root, asStructuralChangeSet(rootChange)] as const
    );
    const foreign = runInNewContext(
      `({
        apply: methods.apply,
        compose: methods.compose,
        correct: methods.correct,
        createRoots: new Set(createRoots),
        deleteRoots: new Set(deleteRoots),
        empty,
        invert: methods.invert,
        iterChangedRanges: methods.iterChangedRanges,
        mapPosition: methods.mapPosition,
        primary,
        primaryClassification: {
          paths: primaryClassification.paths.map((path) => [...path]),
          properties: primaryClassification.properties,
          structure: primaryClassification.structure,
          text: primaryClassification.text,
        },
        rootClassifications: new Map(
          rootClassifications.map(([root, classification]) => [
            root,
            {
              paths: classification.paths.map((path) => [...path]),
              properties: classification.properties,
              structure: classification.structure,
              text: classification.text,
            },
          ])
        ),
        roots: new Map(roots),
        toJSON: methods.toJSON,
      })`,
      {
        createRoots: [...change.createRoots],
        deleteRoots: [...change.deleteRoots],
        empty: change.empty,
        methods: DocumentChange.prototype,
        primary: structuralPrimary,
        primaryClassification: change.primaryClassification,
        rootClassifications: [...change.rootClassifications],
        roots: structuralRoots,
      }
    ) as DocumentChange;

    assert.equal(foreign instanceof DocumentChange, false);
    assert.equal(foreign.primary instanceof ChangeSet, false);
    assert.equal([...foreign.roots.values()][0] instanceof ChangeSet, false);
    assert.equal(DocumentChange.isDocumentChange(foreign), true);
  });

  it('rejects ChangeSet lookalikes whose structure and canonical JSON disagree', () => {
    const change = createChange();
    assert.ok(change.primary);
    const rootChange = change.primary;
    const invalidChangeSets = [
      asStructuralChangeSet(rootChange, {
        sections: [...rootChange.sections, 0, -1],
      }),
      asStructuralChangeSet(rootChange, {
        data: [...rootChange.data, null],
      }),
      asStructuralChangeSet(rootChange, {
        newLength: rootChange.newLength + 1,
      }),
      asStructuralChangeSet(rootChange, {
        toJSON: () => [{ length: 0 }, ...rootChange.toJSON()],
      }),
    ];

    for (const invalidChangeSet of invalidChangeSets) {
      assert.equal(
        DocumentChange.isDocumentChange(
          asStructuralDocumentChange(change, {
            primary: invalidChangeSet,
          })
        ),
        false
      );
    }
  });

  it('rejects collection lookalikes with inconsistent iteration APIs', () => {
    const change = createChange();
    const [root, rootChange] = [...change.roots][0]!;
    const inconsistentMap = {
      get: () => rootChange,
      has: () => true,
      keys: () => ['other'].values(),
      size: 1,
      *[Symbol.iterator]() {
        yield [root, rootChange];
      },
    };
    const inconsistentSet = {
      has: () => true,
      size: 1,
      values: () => ['created'].values(),
      *[Symbol.iterator]() {
        yield 'created';
      },
    };

    assert.equal(
      DocumentChange.isDocumentChange(
        asStructuralDocumentChange(change, { roots: inconsistentMap })
      ),
      false
    );
    assert.equal(
      DocumentChange.isDocumentChange(
        asStructuralDocumentChange(change, { createRoots: inconsistentSet })
      ),
      false
    );
  });

  it('rejects root, lifecycle, advertised JSON, and classification mismatches', () => {
    const change = createChange();
    const [root, rootChange] = [...change.roots][0]!;
    const classification = change.rootClassifications.get(root)!;
    const invalidClassification: DocumentChangeRootClassification = {
      ...classification,
      paths: [[-1]],
    };
    const invalid = [
      asStructuralDocumentChange(change, {
        roots: new Map([['__proto__', rootChange]]),
      }),
      asStructuralDocumentChange(change, {
        rootClassifications: new Map([['absent', classification]]),
      }),
      asStructuralDocumentChange(change, {
        rootClassifications: new Map([[root, invalidClassification]]),
      }),
      asStructuralDocumentChange(change, {
        roots: new Map([['main', rootChange]]),
      }),
      asStructuralDocumentChange(change, {
        createRoots: new Set(['main']),
      }),
      asStructuralDocumentChange(change, {
        createRoots: new Set(['same']),
        deleteRoots: new Set(['same']),
      }),
      asStructuralDocumentChange(change, {
        empty: !change.empty,
      }),
      asStructuralDocumentChange(change, {
        toJSON: () => ({ roots: { main: [] }, version: 3 }),
      }),
      asStructuralDocumentChange(change, {
        toJSON: () =>
          Object.assign(Object.create({}) as object, change.toJSON()),
      }),
    ];

    for (const candidate of invalid) {
      assert.equal(DocumentChange.isDocumentChange(candidate), false);
    }
  });
});
