import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import type { Descendant } from '../../src/index';
import {
  getYjsAttributes,
  setYjsAttribute,
} from '../../src/yjs/core/attributes';
import {
  createYjsNodes,
  readPliteValueFromYjs,
} from '../../src/yjs/core/document';
import {
  createYjsRunEncoder,
  writeTextRuns,
} from '../../src/yjs/core/text-runs';

const internalYjsAttributeKeys = [
  'yjs:hidden',
  'yjs:id',
  'yjs:virtual-child-id',
  'yjs:virtual-placeholder',
  'yjs:set:spoof',
  'yjs:x',
] as const;

describe('plitejs/yjs attribute contract', () => {
  it('writes non-string Yjs attributes through the interop boundary', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const text = new Y.XmlText();

    root.insert(0, [text]);
    setYjsAttribute(text, 'bold', true);
    setYjsAttribute(text, 'level', 2);

    assert.deepEqual(getYjsAttributes(text), {
      bold: true,
      level: 2,
    });
  });

  it('preserves uniform object text attributes across adjacent runs', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const paragraph = new Y.XmlElement('element');
    const texts = createYjsNodes([
      { style: { color: 'red' }, text: 'a' },
      { style: { color: 'red' }, text: 'b' },
    ]);

    setYjsAttribute(paragraph, 'type', 'paragraph');
    root.insert(0, [paragraph]);
    paragraph.insert(0, texts);

    assert.deepEqual(readPliteValueFromYjs(root), [
      {
        children: [{ style: { color: 'red' }, text: 'ab' }],
        type: 'paragraph',
      },
    ]);
  });

  it('preserves attributes on empty Yjs text nodes', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const paragraph = new Y.XmlElement('element');
    const text = new Y.XmlText();

    setYjsAttribute(paragraph, 'type', 'paragraph');
    setYjsAttribute(text, 'bold', [true]);
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);

    assert.deepEqual(readPliteValueFromYjs(root), [
      {
        children: [{ bold: true, text: '' }],
        type: 'paragraph',
      },
    ]);
  });

  it('preserves null-valued text attributes through readback', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const paragraph = new Y.XmlElement('element');
    const [text] = createYjsNodes([{ color: null, text: 'alpha' }]);

    setYjsAttribute(paragraph, 'type', 'paragraph');
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);

    assert.deepEqual(readPliteValueFromYjs(root), [
      { children: [{ color: null, text: 'alpha' }], type: 'paragraph' },
    ]);
  });

  it('does not rewrite semantically unchanged object attributes', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const [text] = createYjsNodes([{ style: { color: 'red' }, text: 'alpha' }]);
    let updates = 0;

    assert.ok(text instanceof Y.XmlText);
    root.insert(0, [text]);
    doc.on('update', () => {
      updates += 1;
    });

    writeTextRuns(
      [text],
      [{ style: { color: 'red' }, text: 'alpha' }],
      [{ style: { color: 'red' }, text: 'alpha' }],
      createYjsRunEncoder(() => false, { ancestors: [], path: [], root: null })
    );

    assert.equal(updates, 0);
  });

  it('encodes schema set properties as canonical per-value Yjs attributes', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const [text] = createYjsNodes(
      [
        {
          commentIds: ['z', 1, true, { b: 2, a: 1 }, 'a'],
          text: 'alpha',
        },
      ],
      (_node, key) => key === 'commentIds'
    );

    assert.ok(text instanceof Y.XmlText);
    root.insert(0, [text]);

    const records = Object.entries(getYjsAttributes(text))
      .filter(([key]) => key.startsWith('yjs:mark:'))
      .map(([, record]) => record as { k: string });

    assert.equal(
      records.some((record) => record.k === 'commentIds'),
      false
    );
    assert.equal(
      records.filter((record) => record.k.startsWith('yjs:set:')).length,
      5
    );
    assert.deepEqual(readPliteValueFromYjs(root), [
      {
        commentIds: [true, 1, 'a', 'z', { a: 1, b: 2 }],
        text: 'alpha',
      },
    ]);
  });

  it('stores app fields outside the reserved yjs: family', () => {
    const doc = new Y.Doc();
    const root = doc.get('document', Y.XmlElement);
    const value = [
      {
        children: [{ 'my:yjs:note': 'b', text: 'alpha' }],
        'plite:yjs-set:tag': 'a',
        type: 'paragraph',
      },
    ] as unknown as Descendant[];

    root.insert(0, createYjsNodes(value));

    assert.deepEqual(readPliteValueFromYjs(root), value);
  });

  it('rejects editor-authored attributes reserved for internal Yjs state', () => {
    for (const key of internalYjsAttributeKeys) {
      const element = {
        children: [{ text: 'alpha' }],
        [key]: true,
        type: 'paragraph',
      } as unknown as Descendant;
      const text = { [key]: true, text: 'alpha' } as unknown as Descendant;

      assert.throws(
        () => createYjsNodes([element]),
        new RegExp(`Cannot set internal Yjs attribute "${key}"`)
      );
      assert.throws(
        () => createYjsNodes([text]),
        new RegExp(`Cannot set internal Yjs attribute "${key}"`)
      );
    }
  });
});
