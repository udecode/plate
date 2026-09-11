import assert from 'node:assert/strict';

import { createEditorView, DocumentChange } from 'plitejs';
import { authored } from 'plitejs/authored';
import { createEditor } from 'plitejs/react';

import { createAuthoredFragmentView } from '../../src/core/authored-fragment-view';
import { readAuthoredViewFragments } from '../../src/core/authored-runtime';
import { resolveDOMPointInRoot } from '../../src/dom/plugin/dom-editor';
import {
  bindDOMFragmentElement,
  getMountedDOMFragmentEditor,
  readDOMFragmentParent,
} from '../../src/dom/plugin/dom-fragment-view';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
} from '../../src/dom/utils/weak-maps';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';

const point = (offset: number) => ({ path: [0, 0], offset });
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const textLeaf = (text: string) => {
  const leaf = document.createElement('span');
  leaf.setAttribute('data-plite-leaf', 'true');
  const string = document.createElement('span');
  string.setAttribute('data-plite-string', 'true');
  string.textContent = text;
  leaf.append(string);
  return { leaf, text: string.firstChild as Text };
};

it('resolves inline retained text in its own coordinates and excludes it from parent offsets', () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, {
      authored: { intent: 'propose', projection: 'markup' },
    })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
  const { id } = source.read.authored.changes().items[0];
  const retained = createReactRuntimeViewEditor(
    createAuthoredFragmentView(parent, readAuthoredViewFragments(parent, id)[0])
  );
  const root = document.createElement('div');
  root.setAttribute('data-plite-editor', 'true');
  root.contentEditable = 'true';
  const parentText = document.createElement('span');
  parentText.setAttribute('data-plite-node', 'text');
  parentText.setAttribute('data-plite-path', '0,0');
  const parentKey = parent.key([0, 0]);
  assert.ok(parentKey);
  parentText.setAttribute('data-plite-node-key', parentKey);
  const retainedText = document.createElement('span');
  retainedText.setAttribute('data-plite-node', 'text');
  retainedText.setAttribute('data-plite-path', '0,0');
  const retainedKey = retained.key([0, 0]);
  assert.ok(retainedKey);
  retainedText.setAttribute('data-plite-node-key', retainedKey);
  const before = textLeaf('A');
  const deleted = textLeaf('X');
  const after = textLeaf('B');
  retainedText.append(deleted.leaf);
  parentText.append(before.leaf, retainedText, after.leaf);
  root.append(parentText);
  document.body.append(root);
  EDITOR_TO_ELEMENT.set(parent, root);
  EDITOR_TO_WINDOW.set(parent, window);
  const detach = bindDOMFragmentElement(retained, retainedText);
  const detachAgain = bindDOMFragmentElement(retained, retainedText);
  detachAgain();
  detachAgain();
  try {
    assert.equal(
      getMountedDOMFragmentEditor(
        parent,
        readAuthoredViewFragments(parent, id)[0].id
      ),
      retained
    );
    assert.deepEqual(
      resolveDOMPointInRoot(parent, point(1), undefined, 'backward'),
      [before.text, 1]
    );
    assert.deepEqual(
      resolveDOMPointInRoot(parent, point(1), undefined, 'forward'),
      [after.text, 0]
    );
    assert.equal(retained.api.dom.editable(), root);
    assert.deepEqual(retained.api.dom.resolveDOMPoint(point(1)), [
      deleted.text,
      1,
    ]);
    assert.deepEqual(parent.api.dom.resolveDOMPoint(point(2)), [after.text, 1]);
    assert.deepEqual(
      retained.api.dom.resolvePlitePoint([deleted.text, 1], {
        exactMatch: true,
      }),
      point(1)
    );
    assert.deepEqual(
      parent.api.dom.resolvePlitePoint([after.text, 1], { exactMatch: true }),
      point(2)
    );
    assert.equal(
      parent.api.dom.resolvePlitePoint([deleted.text, 1], { exactMatch: true }),
      null
    );
    assert.equal(
      retained.api.dom.resolvePlitePoint([before.text, 1], {
        exactMatch: true,
      }),
      null
    );
    assert.equal(parent.api.dom.resolvePliteNode(deleted.text), null);
    assert.deepEqual(retained.api.dom.resolvePliteNode(deleted.text), {
      text: 'X',
    });
    assert.equal(retained.api.dom.hasDOMNode(deleted.text), true);
    assert.equal(
      retained.api.dom.hasDOMNode(deleted.text, { editable: true }),
      false
    );
    assert.equal(parent.api.dom.hasDOMNode(deleted.text), false);
  } finally {
    detach();
    assert.equal(readDOMFragmentParent(retained), null);
    assert.equal(retained.api.dom.resolveDOMPoint(point(0)), null);
    EDITOR_TO_ELEMENT.delete(parent);
    EDITOR_TO_WINDOW.delete(parent);
    root.remove();
  }
});

it('binds sibling retained table rows without inserting a DOM wrapper', () => {
  const row = (text: string) => ({
    type: 'tr',
    children: [{ type: 'td', children: [paragraph(text)] }],
  });
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [
      { type: 'table', children: [row('One'), row('Two'), row('Three')] },
    ],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, {
      authored: { intent: 'propose', projection: 'markup' },
    })
  );
  parent.update.changes.apply(
    DocumentChange.between(source.read.value(), {
      children: [{ type: 'table', children: [row('Three')] }],
    })
  );
  const { id } = source.read.authored.changes().items[0];
  const retained = createReactRuntimeViewEditor(
    createAuthoredFragmentView(parent, readAuthoredViewFragments(parent, id)[0])
  );
  assert.equal(retained.read.children()[0].children.length, 2);
  const root = document.createElement('div');
  root.setAttribute('data-plite-editor', 'true');
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  table.append(tbody);
  root.append(table);
  document.body.append(root);
  EDITOR_TO_ELEMENT.set(parent, root);
  EDITOR_TO_WINDOW.set(parent, window);
  const rows = ['One', 'Two'].map((text, index) => {
    const path = [0, index, 0, 0, 0];
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const p = document.createElement('p');
    const textElement = document.createElement('span');
    const content = textLeaf(text);
    textElement.setAttribute('data-plite-node', 'text');
    textElement.setAttribute('data-plite-path', path.join(','));
    const nodeKey = retained.key(path);
    assert.ok(nodeKey);
    textElement.setAttribute('data-plite-node-key', nodeKey);
    textElement.append(content.leaf);
    p.append(textElement);
    td.append(p);
    tr.append(td);
    tbody.append(tr);
    return {
      tr,
      path,
      text: content.text,
      detach: bindDOMFragmentElement(retained, tr),
    };
  });
  try {
    for (const entry of rows) {
      assert.equal(entry.tr.parentElement, tbody);
      assert.deepEqual(
        retained.api.dom.resolveDOMPoint({ path: entry.path, offset: 2 }),
        [entry.text, 2]
      );
      assert.deepEqual(
        retained.api.dom.resolvePlitePoint([entry.text, 2], {
          exactMatch: true,
        }),
        { path: entry.path, offset: 2 }
      );
      assert.equal(
        parent.api.dom.resolvePlitePoint([entry.text, 2], { exactMatch: true }),
        null
      );
    }
    rows[0].detach();
    rows[0].tr.remove();
    assert.equal(
      retained.api.dom.resolveDOMPoint({ path: rows[0].path, offset: 1 }),
      null
    );
    assert.deepEqual(
      retained.api.dom.resolveDOMPoint({ path: rows[1].path, offset: 1 }),
      [rows[1].text, 1]
    );
  } finally {
    rows.forEach((entry) => entry.detach());
    root.remove();
    EDITOR_TO_ELEMENT.delete(parent);
    EDITOR_TO_WINDOW.delete(parent);
  }
});
