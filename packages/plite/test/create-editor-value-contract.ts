import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant } from '../src';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('createEditor value contract', () => {
  it('normalizes every supported initialValue shape to canonical document value', () => {
    const children = [paragraph('body')];
    const state = { 'document.title': 'Q2 Plan' };
    const header = [paragraph('header')];

    const fromChildren = createEditor({ initialValue: children });
    const fromDocument = createEditor({
      initialValue: { children, state },
    });
    const fromRoots = createEditor({
      initialValue: { children, roots: { header }, state },
    });

    assert.deepEqual(
      fromChildren.read((state) => state.value.get()),
      {
        children,
      }
    );
    assert.deepEqual(
      fromChildren.read((state) => state.nodes.children()),
      children
    );
    assert.deepEqual(
      fromDocument.read((state) => state.value.get()),
      {
        children,
        state,
      }
    );
    assert.deepEqual(
      fromRoots.read((state) => state.value.get()),
      {
        children,
        roots: { header },
        state,
      }
    );
  });

  it('rejects public main roots in document values', () => {
    const children = [paragraph('body')];

    assert.throws(
      () =>
        createEditor({
          initialValue: { children, roots: { main: children } },
        }),
      /initialValue\.roots\.main is invalid/
    );
    assert.throws(
      () =>
        createEditor({
          initialValue: { roots: { main: children } } as never,
        }),
      /document value with children/
    );
  });
});
