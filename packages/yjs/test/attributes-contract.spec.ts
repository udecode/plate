import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Descendant } from '@platejs/slate';
import * as Y from 'yjs';

import {
  getYjsAttributes,
  setSlateYjsAttribute,
  setYjsAttribute,
} from '../src/core/attributes';
import { createYjsNodes, readSlateValueFromYjs } from '../src/core/document';
import {
  createSplitElement,
  setYjsNodeAttributes,
} from '../src/core/replacement';

const internalYjsAttributeKeys = [
  'slate:yjs-hidden',
  'slate:yjs-id',
  'slate:type',
  'slate:yjs-split-undo-text',
  'slate:yjs-virtual-child-id',
  'slate:yjs-virtual-placeholder',
] as const;

describe('@platejs/yjs attribute contract', () => {
  it('writes non-string Yjs attributes through the interop boundary', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);
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
    const root = doc.get('@platejs/slate', Y.XmlElement);
    const paragraph = new Y.XmlElement('paragraph');
    const text = new Y.XmlText();

    setSlateYjsAttribute(paragraph, 'type', 'paragraph');
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);
    text.applyDelta(
      [
        { attributes: { style: { color: 'red' } }, insert: 'a' },
        { attributes: { style: { color: 'red' } }, insert: 'b' },
      ],
      { sanitize: false }
    );

    assert.deepEqual(readSlateValueFromYjs(root), [
      {
        children: [{ style: { color: 'red' }, text: 'ab' }],
        type: 'paragraph',
      },
    ]);
  });

  it('preserves attributes on empty Yjs text nodes', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);
    const paragraph = new Y.XmlElement('paragraph');
    const text = new Y.XmlText();

    setSlateYjsAttribute(paragraph, 'type', 'paragraph');
    setYjsAttribute(text, 'bold', true);
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);

    assert.deepEqual(readSlateValueFromYjs(root), [
      {
        children: [{ bold: true, text: '' }],
        type: 'paragraph',
      },
    ]);
  });

  it('preserves null-valued text attributes through readback', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);
    const paragraph = new Y.XmlElement('paragraph');
    const [text] = createYjsNodes([{ color: null, text: 'alpha' }]);

    setSlateYjsAttribute(paragraph, 'type', 'paragraph');
    root.insert(0, [paragraph]);
    paragraph.insert(0, [text]);

    assert.deepEqual(readSlateValueFromYjs(root), [
      { children: [{ color: null, text: 'alpha' }], type: 'paragraph' },
    ]);
  });

  it('does not rewrite semantically unchanged object attributes', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);
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

  it('rejects Slate-authored attributes reserved for internal Yjs state', () => {
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
          { 'slate:yjs-hidden': true, type: 'paragraph' },
          []
        ),
      /Cannot set internal Yjs attribute "slate:yjs-hidden"/
    );
  });
});
