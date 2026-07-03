/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

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
      editor.api.isElementStateEmpty({
        children: [{ text: '' }],
        type: 'p',
      })
    ).toBe(true);
    expect(
      editor.api.isElementStateEmpty({
        blockId: 'a',
        children: [{ text: '' }],
        type: 'p',
      })
    ).toBe(true);
    expect(
      editor.api.isElementStateEmpty({
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
      editor.api.isElementStateEmpty({
        children: [{ text: '' }],
        listStyleType: 'disc',
        type: 'p',
      })
    ).toBe(false);
  });

  it('uses plugin node metadata prop rules', () => {
    const CustomMetadataPlugin = createBasePlugin({
      key: 'customMetadata',
    }).extend({
      node: {
        isMetadataProp: ({ key }) => key === 'customId',
      },
    });

    const editor = createBaseEditor({
      plugins: [ElementStatePlugin, CustomMetadataPlugin],
    });

    expect(
      editor.api.isElementStateEmpty({
        children: [{ text: '' }],
        customId: 'a',
        type: 'p',
      })
    ).toBe(true);
    expect(
      editor.api.isElementStateEmpty({
        children: [{ text: '' }],
        customId: 'a',
        listStyleType: 'disc',
        type: 'p',
      })
    ).toBe(false);
  });
});
