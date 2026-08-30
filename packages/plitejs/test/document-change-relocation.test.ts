import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DocumentChange } from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import {
  getDocumentChangeRelocations,
  getExactDocumentChangeRelocations,
} from '../src/core/change/mapping';
import { moveNodeChange } from '../src/core/change/root-change';
import type { JsonEditorValue } from '../src/core/change/tokens';
import { createTestDocumentChange } from './support/document-change';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('DocumentChange relocations', () => {
  it('reads an exact move without reconstructing the after document', () => {
    const alpha = paragraph('alpha');
    const beta = paragraph('beta');
    const gamma = paragraph('gamma');
    const before: JsonEditorValue = { children: [alpha, beta, gamma] };
    const document = DocumentIndex.fromValue(before.children);
    const change = createTestDocumentChange({
      primary: moveNodeChange(document, [0], [2]),
    });

    assert.deepEqual(getExactDocumentChangeRelocations(change, before), [
      { path: [0], root: null, targetPath: [2] },
    ]);
  });

  it('rebases an exact move destination through source removal', () => {
    const alpha = paragraph('alpha');
    const before: JsonEditorValue = {
      children: [alpha, { children: [paragraph('beta')], type: 'quote' }],
    };
    const document = DocumentIndex.fromValue(before.children);
    const change = createTestDocumentChange({
      primary: moveNodeChange(document, [0], [1, 1]),
    });

    assert.deepEqual(getExactDocumentChangeRelocations(change, before), [
      { path: [0], root: null, targetPath: [0, 1] },
    ]);
  });

  it('derives multiple unique unchanged subtree relocations in one root', () => {
    const alpha = paragraph('alpha');
    const beta = paragraph('beta');
    const stable = paragraph('stable');
    const before: JsonEditorValue = {
      children: [alpha, beta, stable],
    };
    const after: JsonEditorValue = {
      children: [
        { children: [alpha], type: 'quote' },
        { children: [beta], type: 'quote' },
        stable,
      ],
    };
    const change = DocumentChange.between(before, after);

    assert.deepEqual(getDocumentChangeRelocations(change, before), [
      { path: [0], root: null, targetPath: [0, 0] },
      { path: [1], root: null, targetPath: [1, 0] },
    ]);
  });

  it('returns only the maximal relocation when descendants move together', () => {
    const section = {
      children: [paragraph('alpha'), paragraph('beta')],
      type: 'section',
    };
    const before: JsonEditorValue = { children: [section] };
    const after: JsonEditorValue = {
      children: [{ children: [section], type: 'quote' }],
    };
    const change = DocumentChange.between(before, after);

    assert.deepEqual(getDocumentChangeRelocations(change, before), [
      { path: [0], root: null, targetPath: [0, 0] },
    ]);
  });

  it('does not report ambiguous duplicate subtrees as relocations', () => {
    const duplicate = paragraph('duplicate');
    const before: JsonEditorValue = {
      children: [duplicate, duplicate],
    };
    const after: JsonEditorValue = {
      children: [
        { children: [duplicate], type: 'quote' },
        { children: [duplicate], type: 'quote' },
      ],
    };
    const change = DocumentChange.between(before, after);

    assert.deepEqual(getDocumentChangeRelocations(change, before), []);
  });
});
