/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { property, schema, target } from '@platejs/plite';

jsxt;

import { createBaseEditor } from '../../editor';
import { defineBasePlugin } from '../../plugin';
import { ElementStatePlugin } from './ElementStatePlugin';

describe('ElementStatePlugin', () => {
  it('treats type and the configured node id key as empty element state', () => {
    const editor = createBaseEditor({
      nodeId: { idKey: 'blockId' },
      plugins: [ElementStatePlugin],
    });

    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        type: 'paragraph',
      })
    ).toBe(true);
    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        blockId: 'a',
        children: [{ text: '' }],
        type: 'paragraph',
      })
    ).toBe(true);
    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        id: 'a',
        type: 'paragraph',
      })
    ).toBe(false);
  });

  it('treats any other element prop as non-empty state', () => {
    const editor = createBaseEditor({
      plugins: [ElementStatePlugin],
    });

    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        listStyleType: 'disc',
        type: 'paragraph',
      })
    ).toBe(false);
  });

  it('uses compiled metadata roles for element state', () => {
    const StatePropertiesPlugin = defineBasePlugin('stateProperties', {
      schema: {
        properties: {
          ephemeral: schema.elementProperty(property.string(), {
            role: 'metadata',
            target: target.type('paragraph'),
          }),
          visible: schema.elementProperty(property.string(), {
            target: target.type('paragraph'),
          }),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [ElementStatePlugin, StatePropertiesPlugin],
    });

    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        ephemeral: 'runtime-only',
        type: 'paragraph',
      })
    ).toBe(true);
    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        type: 'paragraph',
        visible: 'document-state',
      })
    ).toBe(false);
  });
});
