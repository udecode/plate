import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/plite';
import * as Y from 'yjs';

import {
  getYjsAttributes,
  setPliteYjsAttribute,
  setYjsAttribute,
} from '../src/core/attributes';
import { createYjsNodes, readPliteValueFromYjs } from '../src/core/document';
import {
  createSplitElement,
  setYjsNodeAttributes,
} from '../src/core/replacement';

const internalYjsAttributeKeys = [
  'plite:yjs-hidden',
  'plite:yjs-id',
  'plite:type',
  'plite:yjs-split-undo-text',
  'plite:yjs-virtual-child-id',
  'plite:yjs-virtual-placeholder',
] as const;

describe('@platejs/yjs attribute contract', () => {
  it('writes non-string Yjs attributes through the interop boundary', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const text = new Y.XmlText();

    root.insert(0, [text]);
    setYjsAttribute(text, 'bold', true);
    setYjsAttribute(text, 'level', 2);

    assert.deepEqual(getYjsAttributes(text), {
      bold: true,
      level: 2,
    });
  });

  it('preserves uniform object text attributes across separate Yjs delta parts', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const paragraph = new Y.XmlElement('paragraph');
    const text = new Y.XmlText();

    setPliteYjsAttribute(paragraph, 'type', 'paragraph');
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);
    text.applyDelta(
      [
        { attributes: { style: { color: 'red' } }, insert: 'a' },
        { attributes: { style: { color: 'red' } }, insert: 'b' },
      ],
      { sanitize: false }
    );

    assert.deepEqual(readPliteValueFromYjs(root), [
      {
        children: [{ style: { color: 'red' }, text: 'ab' }],
        type: 'paragraph',
      },
    ]);
  });

  it('preserves attributes on empty Yjs text nodes', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const paragraph = new Y.XmlElement('paragraph');
    const text = new Y.XmlText();

    setPliteYjsAttribute(paragraph, 'type', 'paragraph');
    setYjsAttribute(text, 'bold', true);
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
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const paragraph = new Y.XmlElement('paragraph');
    const [text] = createYjsNodes([{ color: null, text: 'alpha' }]);

    setPliteYjsAttribute(paragraph, 'type', 'paragraph');
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);

    assert.deepEqual(readPliteValueFromYjs(root), [
      { children: [{ color: null, text: 'alpha' }], type: 'paragraph' },
    ]);
  });

  it('does not rewrite semantically unchanged object attributes', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const [text] = createYjsNodes([{ style: { color: 'red' }, text: 'alpha' }]);
    let updates = 0;

    assert.ok(text instanceof Y.XmlText);
    root.insert(0, [text]);
    doc.on('update', () => {
      updates++;
    });

    setYjsNodeAttributes(
      text,
      { style: { color: 'red' } },
      { style: { color: 'red' } }
    );

    assert.equal(updates, 0);
  });

  it('rejects Plite-authored attributes reserved for internal Yjs state', () => {
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

  it('rejects split-created element properties reserved for internal Yjs state', () => {
    const original = new Y.XmlElement('paragraph');

    assert.throws(
      () =>
        createSplitElement(
          original,
          { 'plite:yjs-hidden': true, type: 'paragraph' },
          []
        ),
      /Cannot set internal Yjs attribute "plite:yjs-hidden"/
    );
  });
});
