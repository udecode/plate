import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBaseEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import * as Y from 'yjs';

import { YjsPlugin } from '../react/YjsPlugin';
import { BaseYjsPlugin } from './BaseYjsPlugin';

describe('BaseYjsPlugin', () => {
  it('installs the configured Plite Yjs extension', () => {
    const doc = new Y.Doc();
    const provider = { doc };
    const editor = createBaseEditor({
      plugins: [
        BaseYjsPlugin.configure({
          options: {
            clientId: 'base-user',
            doc,
            provider,
            rootName: 'base-room',
          },
        }),
      ],
    });

    assert.equal(
      editor.read((state) => state.yjs.doc()),
      doc
    );
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'base-user'
    );
    assert.equal(
      editor.read((state) => state.yjs.root()),
      doc.get('base-room', Y.XmlElement)
    );
  });

  it('preserves the extension through the React Plate plugin', () => {
    const doc = new Y.Doc();
    const editor = createPlateEditor({
      plugins: [
        YjsPlugin.configure({
          options: {
            clientId: 'react-user',
            doc,
            rootName: 'react-room',
          },
        }),
      ],
    });

    assert.equal(
      editor.read((state) => state.yjs.doc()),
      doc
    );
    assert.equal(
      editor.read((state) => state.yjs.clientId()),
      'react-user'
    );
  });
});
