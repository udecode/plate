import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Operation } from '@platejs/slate';
import * as Y from 'yjs';
import {
  createYjsNodes,
  createYjsVisibleChildrenReader,
  getYjsTextContentFrom,
  readSlateValueFromYjs,
  resolveYjsTextPoint,
} from '../src/core/document';
import {
  applySlateOperationToYjs,
  isNoopSlateOperationForYjs,
} from '../src/core/operations';

// The encoder still needs a runtime guard for operation types newer than this package.
const futureSlateOperation = (type: string): Operation =>
  ({ type }) as unknown as Operation;

describe('@platejs/yjs operation encoder exhaustiveness contract', () => {
  it('treats replace operations with equivalent object attributes as no-ops', () => {
    const operation: Operation = {
      children: [
        {
          role: 'note',
          children: [{ text: 'alpha' }],
          type: 'paragraph',
        },
      ],
      newChildren: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
          role: 'note',
        },
      ],
      newSelection: null,
      path: [],
      selection: null,
      type: 'replace_fragment',
    };

    assert.equal(isNoopSlateOperationForYjs(operation), true);
  });

  it('treats replace_children with equivalent object attributes as a no-op', () => {
    const operation: Operation = {
      children: [{ role: 'note', text: 'alpha' }],
      index: 0,
      newChildren: [{ text: 'alpha', role: 'note' }],
      newSelection: null,
      path: [0],
      selection: null,
      type: 'replace_children',
    };

    assert.equal(isNoopSlateOperationForYjs(operation), true);
  });

  it('treats selection operations as document-content no-ops', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);
    const operation: Operation = {
      newProperties: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
      properties: null,
      type: 'set_selection',
    };

    assert.equal(applySlateOperationToYjs(root, operation), null);
  });

  it('routes insert_text offsets across adjacent Yjs text containers', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }, { text: 'beta' }],
          type: 'paragraph',
        },
      ]),
    ]);

    applySlateOperationToYjs(root, {
      offset: 'alphabe'.length,
      path: [0, 0],
      text: '!',
      type: 'insert_text',
    });

    assert.deepEqual(readSlateValueFromYjs(root), [
      {
        children: [{ text: 'alpha' }, { text: 'be!ta' }],
        type: 'paragraph',
      },
    ]);
  });

  it('routes remove_text ranges across adjacent Yjs text containers', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }, { text: 'beta' }],
          type: 'paragraph',
        },
      ]),
    ]);

    applySlateOperationToYjs(root, {
      offset: 'alph'.length,
      path: [0, 0],
      text: 'abe',
      type: 'remove_text',
    });

    assert.deepEqual(readSlateValueFromYjs(root), [
      {
        children: [{ text: 'alph' }, { text: 'ta' }],
        type: 'paragraph',
      },
    ]);
  });

  it('routes split_node offsets across adjacent Yjs text containers', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }, { text: 'beta' }],
          type: 'paragraph',
        },
      ]),
    ]);

    applySlateOperationToYjs(root, {
      path: [0, 0],
      position: 'alphabe'.length,
      properties: {},
      type: 'split_node',
    });

    assert.deepEqual(readSlateValueFromYjs(root), [
      {
        children: [{ text: 'alpha' }, { text: 'be' }, { text: 'ta' }],
        type: 'paragraph',
      },
    ]);
  });

  it('does not materialize empty text when split_node lands on an adjacent Yjs text boundary', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }, { text: 'beta' }],
          type: 'paragraph',
        },
      ]),
    ]);

    applySlateOperationToYjs(root, {
      path: [0, 0],
      position: 'alpha'.length,
      properties: {},
      type: 'split_node',
    });

    assert.deepEqual(readSlateValueFromYjs(root), [
      {
        children: [{ text: 'alpha' }, { text: 'beta' }],
        type: 'paragraph',
      },
    ]);
  });

  it('resolves shared text points across adjacent Yjs text containers', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }, { text: 'beta' }],
          type: 'paragraph',
        },
      ]),
    ]);

    const point = resolveYjsTextPoint(
      root,
      [0, 0],
      'alphabe'.length,
      createYjsVisibleChildrenReader(root)
    );

    assert.notEqual(point, null);
    assert.equal(point?.offset, 2);
    assert.equal(
      point === null ? '' : getYjsTextContentFrom(point.text, point.offset),
      'ta'
    );
  });

  it('returns null for shared text points beyond adjacent Yjs text containers', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }, { text: 'beta' }],
          type: 'paragraph',
        },
      ]),
    ]);

    assert.equal(
      resolveYjsTextPoint(
        root,
        [0, 0],
        'alphabeta!'.length,
        createYjsVisibleChildrenReader(root)
      ),
      null
    );
  });

  it('elides move_node operations when the source path is stale', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }],
          type: 'paragraph',
        },
      ]),
    ]);

    assert.deepEqual(
      applySlateOperationToYjs(root, {
        newPath: [0],
        path: [9],
        type: 'move_node',
      }),
      {
        fallback: 'missing-move-source-elided',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      }
    );
  });

  it('elides move_node operations when the destination path is stale', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }],
          type: 'paragraph',
        },
      ]),
    ]);

    assert.deepEqual(
      applySlateOperationToYjs(root, {
        newPath: [9, 0],
        path: [0],
        type: 'move_node',
      }),
      {
        fallback: 'missing-move-destination-elided',
        mode: 'traceable-fallback',
        operationType: 'move_node',
      }
    );
  });

  it('elides merge_node operations when the right text target is already absent', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);

    root.insert(0, [
      ...createYjsNodes([
        {
          children: [{ text: 'alpha' }],
          type: 'paragraph',
        },
      ]),
    ]);

    assert.deepEqual(
      applySlateOperationToYjs(root, {
        path: [0, 1],
        position: 'alpha'.length,
        properties: {},
        type: 'merge_node',
      }),
      {
        fallback: 'empty-text-merge-elided',
        mode: 'traceable-fallback',
        operationType: 'merge_node',
      }
    );
  });

  it('rejects a future Slate operation instead of silently skipping it', () => {
    const doc = new Y.Doc();
    const root = doc.get('@platejs/slate', Y.XmlElement);
    const operation = futureSlateOperation('future_operation');

    assert.throws(
      () => applySlateOperationToYjs(root, operation),
      /Unsupported Yjs operation: future_operation/
    );
  });
});
