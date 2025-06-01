/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import { BaseBoldPlugin } from '@udecode/plate-basic-nodes';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { jsxt } from '@udecode/plate-test-utils';

import { createPlateTestEditor } from '../../../react/__tests__/createPlateTestEditor';
import { AffinityPlugin } from './AffinityPlugin';

jsxt;

/**
 * Tests for AffinityPlugin which handles cursor movement and text insertion at
 * mark and element boundaries.
 *
 * Mark affinity determines which mark/element to apply at boundaries between
 * different marks, based on cursor movement using the left/right arrow keys.
 *
 * Example for marks: <text bold>Bold</text><cursor><text italic>Italic</text>
 *
 * - If the cursor moved here from the left (via → key), typing applies bold
 * - If the cursor moved here from the right (via ← key), typing applies italic
 *
 * Example for elements: <link>Link</link><cursor>text
 *
 * - If the cursor moved here from the left (via → key), typing extends the link
 * - If the cursor moved here from the right (via ← key), typing creates new text
 *
 * Without affinity, the preceding mark/element is always applied regardless of
 * direction.
 */
describe('AffinityPlugin', () => {
  describe('Mark affinity', () => {
    describe('Cursor movement from left to right', () => {
      it('should apply forward affinity when moving right at mark boundary', async () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>
                bol
                <cursor />d
              </htext>
              <htext>test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold1</htext>
              <htext>test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should apply forward affinity when moving right at mark boundary and insert text when cross block', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
              </htext>
            </hp>
            <hp>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bold</htext>
            </hp>
            <hp>
              <htext>1text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should apply forward affinity when moving left at mark boundary and insert text when cross block', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>bold</htext>
            </hp>
            <hp>
              <htext>
                <cursor />
                text
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bold</htext>
              <htext>1</htext>
            </hp>
            <hp>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowLeft');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('Cursor movement from right to left', () => {
      it('should apply backward affinity when moving left at mark boundary', async () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <htext>
                t
                <cursor />
                est
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <htext>1test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowLeft');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('deleteBackward', () => {
      it('should set backward affinity when deleting to mark', async () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <cursor />
              <htext>test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bol1</htext>
              <htext>test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward('character');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should set forward affinity when deleting to mark boundary', async () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <htext>
                t
                <cursor />
                est
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <htext>1est</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward('character');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });
  });

  describe('Element affinity', () => {
    describe('Cursor movement from left to right', () => {
      it('should apply forward affinity when moving right at element boundary', async () => {
        const input = (
          <editor>
            <hp>
              Add{' '}
              <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
                hyperlink
                <cursor />s
              </ha>{' '}
              within your text to reference external sources or provide
              additional information using the Link plugin.
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              Add{' '}
              <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
                hyperlinks1
              </ha>{' '}
              within your text to reference external sources or provide
              additional information using the Link plugin.
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [AffinityPlugin, BaseLinkPlugin],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('Cursor movement from right to left', () => {
      it('should apply backward affinity when moving left at element boundary', async () => {
        const input = (
          <editor>
            <hp>
              Add{' '}
              <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
                hyperlink
              </ha>
              w
              <cursor />
              ithin your text to reference external sources or provide
              additional information using the Link plugin.
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              Add{' '}
              <ha target="_blank" url="https://en.wikipedia.org/wiki/Hypertext">
                hyperlink
              </ha>
              1within your text to reference external sources or provide
              additional information using the Link plugin.
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [AffinityPlugin, BaseLinkPlugin],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowLeft');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('deleteBackward', () => {
      it('should set backward affinity when deleting to mark', async () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <ha target="_blank" url="https://example.com">
                link
              </ha>
              <cursor />
              <htext>test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <ha target="_blank" url="https://example.com">
                lin1
              </ha>
              <htext>test</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseLinkPlugin.configure({ node: { isAffinity: true } }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward('character');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should set forward affinity when deleting to mark boundary', async () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <ha target="_blank" url="https://example.com">
                link
              </ha>
              <htext>
                t
                <cursor />
                est
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <ha target="_blank" url="https://example.com">
                link
              </ha>
              <htext>1est</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [AffinityPlugin, BaseLinkPlugin],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteBackward('character');

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });
  });
});
