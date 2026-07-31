/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { property, schema, target } from '@platejs/plite';

jsxt;

import { createBaseEditor } from '../../editor';
import { createBasePlugin } from '../../plugin';
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
        type: 'p',
      })
    ).toBe(true);
    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        blockId: 'a',
        children: [{ text: '' }],
        type: 'p',
      })
    ).toBe(true);
    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        id: 'a',
        type: 'p',
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
        type: 'p',
      })
    ).toBe(false);
  });

  it('uses compiled metadata roles for element state', () => {
    const StatePropertiesPlugin = createBasePlugin({
      name: 'stateProperties',
      schema: {
        properties: [
          schema.elementProperty('ephemeral', property.string(), {
            role: 'metadata',
            target: target.type('p'),
          }),
          schema.elementProperty('visible', property.string(), {
            target: target.type('p'),
          }),
        ],
      },
    });
    const editor = createBaseEditor({
      plugins: [ElementStatePlugin, StatePropertiesPlugin],
    });

    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        ephemeral: 'runtime-only',
        type: 'p',
      })
    ).toBe(true);
    expect(
      editor.plugin(ElementStatePlugin).api.isEmpty({
        children: [{ text: '' }],
        type: 'p',
        visible: 'document-state',
      })
    ).toBe(false);
  });
});
