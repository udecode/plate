import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as Y from 'yjs';

import {
  createYjsNode,
  getYjsNode,
  getYjsParent,
  readPliteValueFromYjs,
} from '../src/core/document';

describe('@platejs/yjs document id contract', () => {
  it('resolves empty paths to the Yjs root', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const node = createYjsNode({ children: [{ text: 'plain' }] });

    root.insert(0, [node]);

    assert.equal(getYjsNode(root, []), root);

    const { index, parent } = getYjsParent(root, [0]);

    assert.equal(index, 0);
    assert.equal(parent, root);
    assert.throws(() => getYjsParent(root, []), /Yjs root/);
  });

  it('uses the fallback element type consistently for typeless elements', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/plite', Y.XmlElement);
    const node = createYjsNode({ children: [{ text: 'plain' }] });

    root.insert(0, [node]);

    assert.equal(node.getAttribute('plite:type'), 'element');

    assert.deepEqual(readPliteValueFromYjs(root), [
      { children: [{ text: 'plain' }], type: 'element' },
    ]);
  });

  it('keeps generated virtual node ids unique across isolated browser bundles', async () => {
    const nonce = Date.now();
    const first = await import(`../src/core/document.ts?first=${nonce}`);
    const second = await import(`../src/core/document.ts?second=${nonce}`);

    const firstDoc = new Y.Doc();
    firstDoc.clientID = 101;
    const firstRoot = firstDoc.get('@platejs/plite', Y.XmlElement);
    const firstText = new Y.XmlText();

    firstRoot.insert(0, [firstText]);
    first.createVirtualYjsMovePlaceholder(firstText);

    const secondDoc = new Y.Doc();
    secondDoc.clientID = 202;
    const secondRoot = secondDoc.get('@platejs/plite', Y.XmlElement);
    const secondParagraph = new Y.XmlElement('paragraph');
    const secondWrapper = new Y.XmlElement('block-quote');

    secondRoot.insert(0, [secondWrapper, secondParagraph]);
    second.setVirtualYjsMove(secondRoot, secondParagraph, secondWrapper);

    assert.notEqual(
      firstText.getAttribute('plite:yjs-id'),
      secondParagraph.getAttribute('plite:yjs-id')
    );
  });
});
