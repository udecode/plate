/** @jsx jsxt */

import type { PlateEditor } from '@udecode/plate/react';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
} from '@udecode/plate-basic-nodes';
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
  describe('applyClearOnEdge', () => {
    describe('Early returns', () => {
      it('should return early when no clearOnEdge marks are configured', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bold1</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            // Note: BaseBoldPlugin without clearOnEdge configuration
            BaseBoldPlugin,
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should return early when selection is expanded', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bo
                <anchor />
                l
                <focus />d
              </htext>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bo1d</htext>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should return early when cursor is not at end of text node', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bo
                <cursor />
                ld
              </htext>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bo1ld</htext>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should return early when current text node has no clearOnEdge marks', async () => {
        const input = (
          <editor>
            <hp>
              <htext>
                text
                <cursor />
              </htext>
              <htext bold>bold</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>text1</htext>
              <htext bold>bold</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });

    describe('Mark clearing behavior', () => {
      it('should clear marks when next text node does not have the same mark', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
              </htext>
              <htext>normal</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bold</htext>
              <htext>1normal</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should not clear marks when next text node has the same mark', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold1
                <cursor />
              </htext>
              <htext bold>bold2</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold>bold11bold2</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should clear marks when at end of document', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
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
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should clear marks when at end of block', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
              </htext>
            </hp>
            <hp>
              <htext>next block</htext>
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
              <htext>next block</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should handle multiple marks correctly', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold italic>
                bold-italic
                <cursor />
              </htext>
              <htext bold>only-bold</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold italic>
                bold-italic1
              </htext>
              <htext bold>only-bold</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
            BaseItalicPlugin.configure({
              node: { selectionRules: {} } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });

      it('should preserve marks that exist on both current and next text node', async () => {
        const input = (
          <editor>
            <hp>
              <htext bold italic>
                bold-italic
                <cursor />
              </htext>
              <htext bold>only-bold</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext bold italic>
                bold-italic
              </htext>
              <htext bold>1only-bold</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor] = await createPlateTestEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
            BaseItalicPlugin.configure({
              node: { selectionRules: { affinity: 'outward' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        editor.tf.insertText('1');

        expect(editor.children).toEqual(output.children);
      });
    });
  });

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
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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
            BaseBoldPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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
            BaseLinkPlugin.configure({
              node: { selectionRules: { affinity: 'directional' } } as any,
            }),
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

  describe('Hard edge movement', () => {
    describe('when moving around hard edge marks (isHardEdge: true)', () => {
      it('should use offset movement when moving right at hard edge boundary', async () => {
        const input = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                cod
                <cursor />e
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                codex
                <cursor />
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');
        editor.tf.insertText('x');

        expect(editor.children).toEqual(output.children);
        expect(editor.selection).toEqual(output.selection);
      });

      it('should use offset movement when moving left at hard edge boundary', async () => {
        const input = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>code</htext>
              <htext>
                <cursor />
                after
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                codex
                <cursor />
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowLeft');
        editor.tf.insertText('x');

        expect(editor.children).toEqual(output.children);
        expect(editor.selection).toEqual(output.selection);
      });

      it('should move block start', async () => {
        const input = (
          <editor>
            <hp>1</hp>
            <hp>
              <htext code>
                <cursor />
                code
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>1</hp>
            <hp>
              <htext>
                x
                <cursor />
              </htext>
              <htext code>
                <cursor />
                code
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        // Move left at the start should just change affinity
        await triggerKeyboardEvent('ArrowLeft');

        // Insert text should now go outside the code mark
        editor.tf.insertText('x');

        expect(editor.children).toEqual(output.children);
      });

      it('should move block end', async () => {
        const input = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                code
                <cursor />
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>code</htext>
              <htext>
                x<cursor />
              </htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        // Move right at the end should just change affinity
        await triggerKeyboardEvent('ArrowRight');

        // expect(editor.selection).toEqual(output.selection);

        // Insert text should now go outside the code mark
        editor.tf.insertText('x');

        expect(editor.children).toEqual(output.children);
      });

      it('should handle multiple hard edge marks correctly', async () => {
        const input = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>first</htext>
              <cursor />
              <htext code>second</htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>first</htext>
              <htext code>
                <cursor />
                second
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');

        expect(editor.selection).toEqual(output.selection);
      });

      it('should handle hard edge with regular marks correctly', async () => {
        const input = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>code</htext>
              <cursor />
              <htext bold>bold</htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>code</htext>
              <htext bold>
                <cursor />
                bold
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
            BaseBoldPlugin,
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');

        expect(editor.selection).toEqual(output.selection);
      });

      it('should not interfere with normal character movement inside hard edge marks', async () => {
        const input = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                co
                <cursor />
                de
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                cod
                <cursor />e
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any as PlateEditor;

        const [editor, { triggerKeyboardEvent }] = await createPlateTestEditor({
          plugins: [
            BaseCodePlugin.configure({
              node: { selectionRules: { affinity: 'hard' } } as any,
            }),
          ],
          selection: input.selection,
          value: input.children,
        });

        await triggerKeyboardEvent('ArrowRight');

        expect(editor.selection).toEqual(output.selection);
      });
    });
  });
});
