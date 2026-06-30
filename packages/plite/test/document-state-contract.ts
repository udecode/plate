import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  type Descendant,
  defineStateField,
} from '@platejs/plite';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('document meta contract', () => {
  it('initializes persisted state fields and reads them by descriptor', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: true,
    });

    const explicit = createEditor({
      extensions: [documentTitle] as const,
      initialValue: {
        children: [paragraph('body')],
        meta: {
          [documentTitle.key]: 'Q2 Plan',
        },
      },
    });
    const defaulted = createEditor({
      extensions: [documentTitle] as const,
      initialValue: [paragraph('body')],
    });

    assert.equal(
      explicit.read((state) => state.getField(documentTitle)),
      'Q2 Plan'
    );
    assert.deepEqual(
      explicit.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: { [documentTitle.key]: 'Q2 Plan' },
      }
    );
    assert.equal(
      defaulted.read((state) => state.getField(documentTitle)),
      'Untitled'
    );
    assert.deepEqual(
      defaulted.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: { [documentTitle.key]: 'Untitled' },
      }
    );
  });

  it('omits non-persistent fields from document meta', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      initial: () => 'Untitled',
      persist: true,
    });
    const localPanel = defineStateField({
      key: 'local.panel',
      initial: () => 'closed',
      persist: false,
    });
    const editor = createEditor({
      extensions: [documentTitle, localPanel] as const,
      initialValue: [paragraph('body')],
    });

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q2 Plan');
      tx.setField(localPanel, 'open');
    });

    assert.equal(
      editor.read((state) => state.getField(localPanel)),
      'open'
    );
    assert.deepEqual(
      editor.read((state) => state.value()),
      {
        children: [paragraph('body')],
        meta: { [documentTitle.key]: 'Q2 Plan' },
      }
    );
  });
});
