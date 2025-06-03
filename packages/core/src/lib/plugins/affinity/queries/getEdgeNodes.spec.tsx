/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { BaseLinkPlugin } from '@udecode/plate-link';
import { jsxt } from '@udecode/plate-test-utils';

import { createPlateTestEditor } from '../../../../react/__tests__/createPlateTestEditor';
import { getEdgeNodes } from './getEdgeNodes';

jsxt;

describe('getEdgeNodes', () => {
  describe('Text node edges', () => {
    it('should return edge nodes when cursor is at start of text', async () => {
      const input = (
        <editor>
          <hp>
            <htext>first</htext>
            <htext bold>
              <cursor />
              second
            </htext>
          </hp>
        </editor>
      ) as any as PlateEditor;

      const [editor] = await createPlateTestEditor({
        selection: input.selection,
        value: input.children,
      });

      const [before, after] = getEdgeNodes(editor)!;

      expect(before).toEqual([{ text: 'first' }, [0, 0]]);
      expect(after).toEqual([{ bold: true, text: 'second' }, [0, 1]]);
    });

    it('should return edge nodes when cursor is at end of text', async () => {
      const input = (
        <editor>
          <hp>
            <htext>
              first
              <cursor />
            </htext>
            <htext bold>second</htext>
          </hp>
        </editor>
      ) as any as PlateEditor;

      const [editor] = await createPlateTestEditor({
        selection: input.selection,
        value: input.children,
      });

      const [before, after] = getEdgeNodes(editor)!;

      expect(before).toEqual([{ text: 'first' }, [0, 0]]);
      expect(after).toEqual([{ bold: true, text: 'second' }, [0, 1]]);
    });

    it('should return null for second element when no next sibling exists', async () => {
      const input = (
        <editor>
          <hp>
            <htext>
              test
              <cursor />
            </htext>
          </hp>
        </editor>
      ) as any as PlateEditor;

      const [editor] = await createPlateTestEditor({
        selection: input.selection,
        value: input.children,
      });

      const [before, after] = getEdgeNodes(editor)!;

      expect(before).toEqual([{ text: 'test' }, [0, 0]]);
      expect(after).toEqual(null);
    });

    it('should return [null, textEntry] when cursor is at start of first text node', async () => {
      const input = (
        <editor>
          <hp>
            <htext>
              <cursor />
              test
            </htext>
          </hp>
        </editor>
      ) as any as PlateEditor;

      const [editor] = await createPlateTestEditor({
        selection: input.selection,
        value: input.children,
      });

      const [before, after] = getEdgeNodes(editor)!;

      expect(before).toEqual(null);
      expect(after).toEqual([{ text: 'test' }, [0, 0]]);
    });
  });

  describe('Link element edges', () => {
    it('should handle cursor at start of link element', async () => {
      const input = (
        <editor>
          <hp>
            <htext>before</htext>
            <ha target="_blank" url="https://example.com">
              <cursor />
              link text
            </ha>
            <htext>after</htext>
          </hp>
        </editor>
      ) as any as PlateEditor;

      const [editor] = await createPlateTestEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        value: input.children,
      });

      const [before, after] = getEdgeNodes(editor)!;

      expect(before).toEqual([{ text: 'before' }, [0, 0]]);
      expect(after).toEqual([
        {
          children: [{ text: 'link text' }],
          target: '_blank',
          type: 'a',
          url: 'https://example.com',
        },
        [0, 1],
      ]);
    });

    it('should handle cursor at end of link element', async () => {
      const input = (
        <editor>
          <hp>
            <htext>before</htext>
            <ha target="_blank" url="https://example.com">
              link text
              <cursor />
            </ha>
            <htext>after</htext>
          </hp>
        </editor>
      ) as any as PlateEditor;

      const [editor] = await createPlateTestEditor({
        plugins: [BaseLinkPlugin],
        selection: input.selection,
        value: input.children,
      });

      const [before, after] = getEdgeNodes(editor)!;

      expect(before).toEqual([
        {
          children: [{ text: 'link text' }],
          target: '_blank',
          type: 'a',
          url: 'https://example.com',
        },
        [0, 1],
      ]);
      expect(after).toEqual([{ text: 'after' }, [0, 2]]);
    });
  });
});
