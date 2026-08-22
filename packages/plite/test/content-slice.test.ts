import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  ContentSlice,
  createEditor,
  type Descendant,
  type Element,
  ElementApi,
  type Value,
} from '@platejs/plite';

import { DocumentIndex } from '../src/core/change/document-index';
import { RootChange } from '../src/core/change/root-change';
import { PreparedTokenSlice } from '../src/core/change/tokens';
import {
  encodeContentSlice,
  prepareContentSliceVariant,
} from '../src/core/content-slice';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const section = (text: string) => ({
  children: [paragraph(text)],
  type: 'section',
});

describe('ContentSlice', () => {
  it('reuses one frozen empty value', () => {
    assert.equal(ContentSlice.empty, ContentSlice.empty);
    assert.equal(Object.isFrozen(ContentSlice.empty), true);
    assert.equal(Object.isFrozen(ContentSlice.empty.content), true);
    assert.deepEqual(ContentSlice.empty, {
      content: [],
      openEnd: 0,
      openStart: 0,
    });
  });

  it('snapshots and freezes closed content without source aliases', () => {
    const content = [paragraph('before')];
    const slice = ContentSlice.closed(content);

    content[0].children[0] = { text: 'after' };

    assert.deepEqual(slice.content, [paragraph('before')]);
    assert.equal(Object.isFrozen(slice), true);
    assert.equal(Object.isFrozen(slice.content), true);
    assert.equal(Object.isFrozen(slice.content[0]), true);
    assert.equal(Object.isFrozen(slice.content[0].children[0]), true);
    assert.equal(slice.openEnd, 0);
    assert.equal(slice.openStart, 0);
  });

  it('validates and snapshots JSON once, then reuses trusted identity', () => {
    const input = {
      content: [section('one')],
      openEnd: 2,
      openStart: 2,
    };
    const slice = ContentSlice.fromJSON(input);

    assert.notEqual(slice, input);
    assert.equal(ContentSlice.fromJSON(slice), slice);

    const inputParagraph = input.content[0].children[0];

    assert.equal(ElementApi.isElement(inputParagraph), true);
    inputParagraph.children[0] = { text: 'changed' };

    assert.deepEqual(slice.content, [section('one')]);
  });

  it('snapshots detached secondary roots with the slice', () => {
    const input = {
      content: [
        {
          childRoots: { caption: 'caption:1' },
          children: [{ text: '' }],
          type: 'image',
        },
      ],
      openEnd: 0,
      openStart: 0,
      roots: {
        'caption:1': [paragraph('caption')],
      },
    };
    const slice = ContentSlice.fromJSON(input);

    input.roots['caption:1'][0].children[0] = { text: 'mutated' };

    assert.deepEqual(slice.roots, {
      'caption:1': [paragraph('caption')],
    });
    assert.equal(Object.isFrozen(slice.roots), true);
    assert.equal(Object.isFrozen(slice.roots['caption:1']), true);
    assert.throws(
      () =>
        ContentSlice.fromJSON({
          ...input,
          roots: { main: [paragraph('invalid')] },
        }),
      /named root keys/i
    );
  });

  it('reuses one prepared encoding for a trusted slice', () => {
    const slice = ContentSlice.fromJSON({
      content: [section('one')],
      openEnd: 2,
      openStart: 2,
    });
    const encoded = encodeContentSlice(slice);

    assert.equal(encodeContentSlice(slice), encoded);
    assert.equal(ContentSlice.fromJSON(slice), slice);
  });

  it('shares whole editor fragments but detaches them before insertion', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two')],
    });
    const source = editor.read.children();
    const slice = editor.read.slice.get({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    assert.equal(slice.content[0], source[0]);
    assert.equal(slice.content[1], source[1]);
    assert.equal(ContentSlice.fromJSON(slice), slice);
    assert.equal(Object.isFrozen(slice), true);
    assert.equal(Object.isFrozen(slice.content), true);

    const closed = prepareContentSliceVariant(slice, 0, 0);
    const document = DocumentIndex.fromValue([]);
    const inserted = RootChange.create(document, {
      from: 0,
      insert: encodeContentSlice(closed),
    }).apply(document).value;

    assert.deepEqual(inserted, source);
    assert.notEqual(inserted[0], source[0]);
    assert.notEqual(inserted[1], source[1]);
  });

  it('snapshots partial editor fragments instead of trusting new nodes', () => {
    const editor = createEditor({ initialValue: [paragraph('before')] });
    const source = editor.read.children();
    const slice = editor.read.slice.get({
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
    });

    assert.deepEqual(slice.content, [paragraph('efor')]);
    assert.notEqual(slice.content[0], source[0]);
    assert.equal(Object.isFrozen(slice.content[0]), true);
    assert.equal(Object.isFrozen(slice.content[0].children[0]), true);
  });

  it('retains detached prepared node identity only for an exact insertion', () => {
    const slice = ContentSlice.closed([paragraph('prepared')]);
    const document = DocumentIndex.fromValue([]);
    const prepared = encodeContentSlice(slice);
    const inserted = RootChange.create(document, {
      from: 0,
      insert: prepared,
    }).apply(document).value;

    assert.ok(ElementApi.isElement(inserted[0]));
    assert.ok(ElementApi.isElement(slice.content[0]));
    assert.equal(inserted[0], slice.content[0]);
    assert.equal(inserted[0].children[0], slice.content[0].children[0]);

    const serialized = PreparedTokenSlice.fromJSON(prepared.toJSON());
    const unbranded = RootChange.create(document, {
      from: 0,
      insert: serialized,
    }).apply(document).value;

    assert.notEqual(unbranded[0], slice.content[0]);
  });

  it('rebuilds repeated prepared nodes instead of duplicating live identity', () => {
    const slice = ContentSlice.closed([paragraph('prepared')]);
    const document = DocumentIndex.fromValue([]);
    const prepared = encodeContentSlice(slice);
    const inserted = RootChange.create(document, [
      { from: 0, insert: prepared },
      { from: 0, insert: prepared },
    ]).apply(document).value;
    const first = inserted[0] as unknown as Element;
    const second = inserted[1] as unknown as Element;

    assert.equal(first, slice.content[0]);
    assert.notEqual(second, slice.content[0]);
    assert.notEqual(second, first);
    assert.notEqual(second.children[0], first.children[0]);
  });

  it('publishes prepared identity only once across committed insertions', () => {
    const slice = ContentSlice.closed([paragraph('prepared')]);
    const editor = createEditor<Value>({
      initialValue: [paragraph('first'), paragraph('second')],
    });
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);

    assert.equal(editor.update.slice.replace(slice, { at: [0] }), true);

    const first = editor.read.children()[0];
    const firstNodeKey = editor.key([0]);

    assert.ok(firstNodeKey);
    assert.equal(editor.update.slice.replace(slice, { at: [1] }), true);

    const second = editor.read.children()[1];
    const secondNodeKey = editor.key([1]);

    assert.equal(commits, 2);
    assert.notEqual(second, first);
    assert.notEqual(second.children[0], first.children[0]);
    assert.ok(secondNodeKey);
    assert.notEqual(secondNodeKey, firstNodeKey);
  });

  it('shares one frozen content snapshot and full encoding across open variants', () => {
    const source = ContentSlice.closed([section('one')]);
    const variants = [
      prepareContentSliceVariant(source, 0, 0),
      prepareContentSliceVariant(source, 1, 0),
      prepareContentSliceVariant(source, 0, 1),
      prepareContentSliceVariant(source, 2, 2),
    ];

    for (const variant of variants) {
      assert.equal(variant.content, source.content);
      assert.equal(variant.content[0], source.content[0]);
      assert.equal(ContentSlice.fromJSON(variant), variant);
    }

    assert.equal(variants[0], source);
    assert.equal(prepareContentSliceVariant(source, 2, 2), variants.at(-1));
    assert.equal(
      encodeContentSlice(variants.at(-1)!),
      encodeContentSlice(prepareContentSliceVariant(source, 2, 2))
    );
    assert.throws(
      () => prepareContentSliceVariant(source, 3, 2),
      /open start exceeds/i
    );
  });

  it('rejects malformed, cyclic, repeated, non-JSON, and impossible slices', () => {
    const repeated = paragraph('same');
    const cyclic = section('cycle') as Record<string, unknown>;

    cyclic.children = [cyclic];

    const invalid: unknown[] = [
      null,
      [],
      { content: [], openEnd: 0 },
      { content: [], extra: true, openEnd: 0, openStart: 0 },
      { content: [{}], openEnd: 0, openStart: 0 },
      { content: [{ text: 1 }], openEnd: 0, openStart: 0 },
      { content: [paragraph('x')], openEnd: -1, openStart: 0 },
      { content: [paragraph('x')], openEnd: 0.5, openStart: 0 },
      { content: [paragraph('x')], openEnd: 0, openStart: 2 },
      { content: [repeated, repeated], openEnd: 0, openStart: 0 },
      { content: [cyclic], openEnd: 0, openStart: 0 },
      {
        content: [{ ...paragraph('x'), payload: new Date(0) }],
        openEnd: 0,
        openStart: 0,
      },
    ];

    invalid.forEach((value) => {
      assert.throws(() => ContentSlice.fromJSON(value));
    });
  });

  it('closes rewritten content or preserves valid open edge topology', () => {
    const source = ContentSlice.fromJSON({
      content: [section('before')],
      openEnd: 2,
      openStart: 2,
      roots: { caption: [paragraph('root')] },
    });
    const replacement = [section('after')];
    const preserved = ContentSlice.withContent(source, replacement, {
      open: 'preserve',
    });
    const closed = ContentSlice.withContent(source, replacement, {
      open: 'closed',
    });

    const replacementParagraph = replacement[0].children[0];

    assert.equal(ElementApi.isElement(replacementParagraph), true);
    replacementParagraph.children[0] = { text: 'mutated' };

    assert.deepEqual(preserved, {
      content: [section('after')],
      openEnd: 2,
      openStart: 2,
      roots: { caption: [paragraph('root')] },
    });
    assert.deepEqual(closed, {
      content: [section('after')],
      openEnd: 0,
      openStart: 0,
    });
    assert.throws(
      () =>
        ContentSlice.withContent(source, [paragraph('too shallow')], {
          open: 'preserve',
        }),
      /open start exceeds/i
    );
  });

  it('rejects repeated nodes in closed content', () => {
    const node = paragraph('same');
    const content: Descendant[] = [node, node];

    assert.throws(
      () => ContentSlice.closed(content),
      /cannot be repeated or cyclic/i
    );
  });

  it('keeps strict JSON validation while snapshotting in one pass', () => {
    const sparse = Array.from({ length: 1 }) as Descendant[];
    const accessor = paragraph('accessor') as Record<string, unknown>;

    delete sparse[0];
    Object.defineProperty(accessor, 'type', {
      enumerable: true,
      get: () => 'paragraph',
    });

    for (const value of [
      { content: sparse, openEnd: 0, openStart: 0 },
      { content: [accessor], openEnd: 0, openStart: 0 },
      { content: [paragraph('x')], openEnd: 0, openStart: -0 },
    ]) {
      assert.throws(
        () => ContentSlice.fromJSON(value),
        /JSON-compatible data|non-negative integers/
      );
    }
  });

  it('normalizes valid cross-realm input into frozen local values', () => {
    const foreign = runInNewContext(
      '({ content: [{ children: [{ text: "foreign" }], type: "paragraph" }], openEnd: 0, openStart: 0 })'
    ) as unknown;
    const slice = ContentSlice.fromJSON(foreign);

    assert.deepEqual(slice.content, [paragraph('foreign')]);
    assert.equal(Object.getPrototypeOf(slice), Object.prototype);
    assert.equal(Object.getPrototypeOf(slice.content), Array.prototype);
    assert.equal(Object.isFrozen(slice.content[0].children[0]), true);
  });
});
