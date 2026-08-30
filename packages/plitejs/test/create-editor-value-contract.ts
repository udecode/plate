import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import { createEditor, type Descendant, type InitialValue } from 'plitejs';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('createEditor value contract', () => {
  it('normalizes every supported initialValue shape to canonical document value', () => {
    const children = [paragraph('body')];
    const meta = { 'document.title': 'Q2 Plan' };
    const header = [paragraph('header')];

    const fromChildren = createEditor({ initialValue: children });
    const fromDocument = createEditor({
      initialValue: { children, meta },
    });
    const fromRoots = createEditor({
      initialValue: { children, roots: { header }, meta },
    });

    assert.deepEqual(
      fromChildren.read((state) => state.value()),
      {
        children,
      }
    );
    assert.deepEqual(
      fromChildren.read((state) => state.nodes.children()),
      children
    );
    assert.deepEqual(
      fromDocument.read((state) => state.value()),
      {
        children,
        meta,
      }
    );
    assert.deepEqual(
      fromRoots.read((state) => state.value()),
      {
        children,
        roots: { header },
        meta,
      }
    );
  });

  it('normalizes document values created in another realm', () => {
    const initialValue = runInNewContext(`({
      children: [{
        children: [{ payload: { source: ["iframe"] }, text: "body" }],
        type: "paragraph"
      }],
      meta: { document: { title: "Cross realm" } },
      roots: {
        header: [{
          children: [{ text: "header" }],
          type: "paragraph"
        }]
      }
    })`) as InitialValue;
    const editor = createEditor({ initialValue });
    const value = editor.read.value();

    assert.deepEqual(value, {
      children: [
        {
          children: [{ payload: { source: ['iframe'] }, text: 'body' }],
          type: 'paragraph',
        },
      ],
      meta: { document: { title: 'Cross realm' } },
      roots: {
        header: [
          {
            children: [{ text: 'header' }],
            type: 'paragraph',
          },
        ],
      },
    });
    assert.equal(Object.getPrototypeOf(value.children), Array.prototype);
    assert.equal(
      Object.getPrototypeOf(value.children[0]?.children),
      Array.prototype
    );
    assert.equal(
      Object.getPrototypeOf(value.children[0]?.children[0]?.payload as object),
      Object.prototype
    );
    assert.equal(Object.getPrototypeOf(value.meta), Object.prototype);
    assert.equal(Object.getPrototypeOf(value.roots), Object.prototype);
    assert.equal(Object.getPrototypeOf(value.roots?.header), Array.prototype);
  });

  it('rejects noncanonical document containers from another realm', () => {
    const values = runInNewContext(`(() => {
      class DocumentValue {
        constructor() {
          this.children = [];
        }
      }
      class Children extends Array {}
      const accessor = {};
      Object.defineProperty(accessor, "children", {
        enumerable: true,
        get: () => []
      });
      const cyclic = { children: [] };
      cyclic.self = cyclic;

      return [
        new DocumentValue(),
        new Children(),
        accessor,
        cyclic
      ];
    })()`) as unknown[];

    for (const initialValue of values) {
      assert.throws(
        () => createEditor({ initialValue: initialValue as InitialValue }),
        /JSON-compatible data/
      );
    }
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
