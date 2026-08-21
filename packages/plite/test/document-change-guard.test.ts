import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import type { Element } from '@platejs/plite';

import type { DocumentChangeRootClassification } from '../src/core/change/classification';
import { DocumentChange } from '../src/core/change/document-change';
import type { JsonNode } from '../src/core/change/tokens';
import {
  createTestDocumentChange,
  getTestDocumentChangeEntries,
  getTestDocumentRootChange,
} from './support/document-change';

const paragraph = (text: string) =>
  ({
    children: [{ text }],
    type: 'paragraph',
  }) satisfies Element;

const asJsonNodes = (nodes: readonly Element[]) =>
  nodes as unknown as readonly JsonNode[];

const asStructuralDocumentChange = (
  change: DocumentChange,
  overrides: Readonly<Record<string, unknown>> = {}
) =>
  Object.assign(Object.create(null) as object, {
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
    const primary = getTestDocumentRootChange(change);

    assert.ok(primary);
    assert.throws(
      () => createTestDocumentChange({ createRoots: [root] }),
      /Omit root to target the primary document/
    );
    assert.throws(
      () => change.mapPosition(0, { root }),
      /Omit root to target the primary document/
    );
  });

  it('accepts constructor-neutral values backed by foreign-realm collections', () => {
    const change = createChange();
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
        toJSON: methods.toJSON,
      })`,
      {
        createRoots: [...change.createRoots],
        deleteRoots: [...change.deleteRoots],
        empty: change.empty,
        methods: {
          apply: () => {},
          compose: () => {},
          correct: () => {},
          invert: () => {},
          iterChangedRanges: () => {},
          mapPosition: () => {},
          toJSON: () => change.toJSON(),
        },
        primaryClassification: change.primaryClassification,
        rootClassifications: [...change.rootClassifications],
      }
    ) as DocumentChange;

    assert.equal(foreign instanceof DocumentChange, false);
    assert.equal(DocumentChange.isDocumentChange(foreign), true);
  });

  it('rejects collection lookalikes with inconsistent iteration APIs', () => {
    const change = createChange();
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
        asStructuralDocumentChange(change, { createRoots: inconsistentSet })
      ),
      false
    );
  });

  it('rejects root, lifecycle, advertised JSON, and classification mismatches', () => {
    const change = createChange();
    const [root] = getTestDocumentChangeEntries(change).find(
      ([entryRoot]) => entryRoot !== 'main'
    )!;
    const classification = change.rootClassifications.get(root)!;
    const invalidClassification: DocumentChangeRootClassification = {
      ...classification,
      paths: [[-1]],
    };
    const invalid = [
      asStructuralDocumentChange(change, {
        rootClassifications: new Map([['absent', classification]]),
      }),
      asStructuralDocumentChange(change, {
        rootClassifications: new Map([[root, invalidClassification]]),
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
