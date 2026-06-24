/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

jsxt;

import { createBasePlateEditor } from '../../editor';
import { createEditorPlugin } from '../../plugin';
import { PliteExtensionPlugin } from './PliteExtensionPlugin';

describe('PliteExtensionPlugin', () => {
  describe('isElementStateEmpty', () => {
    it('treats type and the configured node id key as empty element state', () => {
      const editor = createBasePlateEditor({
        nodeId: { idKey: 'blockId' },
        plugins: [PliteExtensionPlugin],
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
      const editor = createBasePlateEditor({
        plugins: [PliteExtensionPlugin],
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
      const CustomMetadataPlugin = createEditorPlugin({
        key: 'customMetadata',
      }).extend({
        node: {
          isMetadataProp: ({ key }) => key === 'customId',
        },
      });

      const editor = createBasePlateEditor({
        plugins: [PliteExtensionPlugin, CustomMetadataPlugin],
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

  describe('redecorate', () => {
    it('exposes a no-op redecorate method by default', () => {
      const editor = createBasePlateEditor({
        plugins: [PliteExtensionPlugin],
      });

      expect(typeof editor.api.redecorate).toBe('function');
      expect(() => editor.api.redecorate()).not.toThrow();
    });
  });
});
