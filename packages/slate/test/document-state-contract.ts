import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant, defineStateField } from '../src';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('document state contract', () => {
  it('initializes persisted state fields and reads them by descriptor', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: true,
    });

    const explicit = createEditor({
      extensions: [documentTitle],
      initialValue: {
        children: [paragraph('body')],
        state: {
          [documentTitle.key]: 'Q2 Plan',
        },
      },
    });
    const defaulted = createEditor({
      extensions: [documentTitle],
      initialValue: [paragraph('body')],
    });

    assert.equal(
      explicit.read((state) => state.getField(documentTitle)),
      'Q2 Plan'
    );
    assert.deepEqual(
      explicit.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      }
    );
    assert.equal(
      defaulted.read((state) => state.getField(documentTitle)),
      'Untitled'
    );
    assert.deepEqual(
      defaulted.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Untitled' },
      }
    );
  });

  it('omits non-persistent state fields from document values', () => {
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
      extensions: [documentTitle, localPanel],
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
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      }
    );
  });
});
