/** @jsx jsxt */

import { schema, property } from '@platejs/plite';
import { deleteBackward, insertText, move } from '@platejs/plite/internal';
import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '@platejs/test-utils';

import type { BaseEditor } from '../../editor';
import { createBaseEditor } from '../../editor';
import { defineBasePlugin } from '../../plugin';
import { AffinityPlugin } from './AffinityPlugin';

jsxt;

const BaseBoldPlugin = defineBasePlugin('bold', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const BaseItalicPlugin = defineBasePlugin('italic', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const BaseCodePlugin = defineBasePlugin('code', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

const BaseLinkPlugin = defineBasePlugin('a', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: {
        target: property.string(),
        url: property.string(),
      },
      type: 'link',
    },
  },
});

const expectChildren = (editor: BaseEditor, output: TestEditor) => {
  expect(editor.read.children()).toEqual(output.children);
};

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
      it('returns early when no clearOnEdge marks are configured', () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
              </htext>
            </hp>
          </editor>
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bold1</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            // Note: BaseBoldPlugin without clearOnEdge configuration
            BaseBoldPlugin,
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('returns early when selection is expanded', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bo1d</htext>
              <htext>text</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('returns early when cursor is not at end of text node', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bo1ld</htext>
              <htext>text</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('returns early when current text node has no clearOnEdge marks', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext>text1</htext>
              <htext bold>bold</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });

    describe('Mark clearing behavior', () => {
      it('clear marks when next text node does not have the same mark', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bold</htext>
              <htext>1normal</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('does not clear marks when next text node has the same mark', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bold11bold2</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('clear marks when at end of document', () => {
        const input = (
          <editor>
            <hp>
              <htext bold>
                bold
                <cursor />
              </htext>
            </hp>
          </editor>
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bold</htext>
              <htext>1</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('clear marks when at end of block', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('handle multiple marks correctly', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold italic>
                bold-italic1
              </htext>
              <htext bold>only-bold</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
            BaseItalicPlugin.configure({
              rules: { selection: {} },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('preserve marks that exist on both current and next text node', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold italic>
                bold-italic
              </htext>
              <htext bold>1only-bold</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
            BaseItalicPlugin.configure({
              rules: { selection: { affinity: 'outward' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });
  });

  describe('Mark affinity', () => {
    describe('Cursor movement from left to right', () => {
      it('apply forward affinity when moving right at mark boundary', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold1</htext>
              <htext>test</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });
        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('apply forward affinity when moving right at mark boundary and insert text when cross block', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext bold>bold</htext>
            </hp>
            <hp>
              <htext>1text</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });
        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('apply forward affinity when moving left at mark boundary and insert text when cross block', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, {
          distance: 1,
          reverse: true,
          unit: 'character',
        });
        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });

    describe('Cursor movement from right to left', () => {
      it('apply backward affinity when moving left at mark boundary', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <htext>1test</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, {
          distance: 1,
          reverse: true,
          unit: 'character',
        });
        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });

    describe('deleteBackward', () => {
      it('set backward affinity when deleting to mark', () => {
        const input = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <cursor />
              <htext>test</htext>
            </hp>
          </editor>
        );

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bol1</htext>
              <htext>test</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        deleteBackward(editor, { unit: 'character' });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('set forward affinity when deleting to mark boundary', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext>test</htext>
              <htext bold>bold</htext>
              <htext>1est</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseBoldPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        deleteBackward(editor, { unit: 'character' });

        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });
  });

  describe('Element affinity', () => {
    describe('Cursor movement from left to right', () => {
      it('apply forward affinity when moving right at element boundary', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [AffinityPlugin, BaseLinkPlugin],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });
        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });

    describe('Cursor movement from right to left', () => {
      it('apply backward affinity when moving left at element boundary', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [AffinityPlugin, BaseLinkPlugin],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, {
          distance: 1,
          reverse: true,
          unit: 'character',
        });
        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });

    describe('deleteBackward', () => {
      it('set backward affinity when deleting to mark', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            AffinityPlugin,
            BaseLinkPlugin.configure({
              rules: { selection: { affinity: 'directional' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        deleteBackward(editor, { unit: 'character' });

        insertText(editor, '1');

        expectChildren(editor, output);
      });

      it('set forward affinity when deleting to mark boundary', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [AffinityPlugin, BaseLinkPlugin],
          selection: input.selection,
          initialValue: input.children,
        });

        deleteBackward(editor, { unit: 'character' });

        insertText(editor, '1');

        expectChildren(editor, output);
      });
    });
  });

  describe('Hard edge movement', () => {
    describe('when moving around hard edge marks', () => {
      it('use offset movement when moving right at hard edge boundary', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });
        insertText(editor, 'x');

        expectChildren(editor, output);
        expect(editor.read.selection()).toEqual(projectTestSelectionRange(output.selection));
      });

      it('use offset movement when moving left at hard edge boundary', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, {
          distance: 1,
          reverse: true,
          unit: 'character',
        });
        insertText(editor, 'x');

        expectChildren(editor, output);
        expect(editor.read.selection()).toEqual(projectTestSelectionRange(output.selection));
      });

      it('move block start', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        // Move left at the start should just change affinity
        move(editor, {
          distance: 1,
          reverse: true,
          unit: 'character',
        });

        // Insert text should now go outside the code mark
        insertText(editor, 'x');

        expectChildren(editor, output);
      });

      it('move block end', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        // Move right at the end should just change affinity
        move(editor, { distance: 1, unit: 'character' });

        // expect(editor.read.selection()).toEqual(output.selection);

        // Insert text should now go outside the code mark
        insertText(editor, 'x');

        expectChildren(editor, output);
      });

      it('handle multiple hard edge marks correctly', () => {
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
        );

        const output = (
          <editor>
            <hp>
              <htext>before</htext>
              <htext code>
                firsts
                <cursor />
                econd
              </htext>
              <htext>after</htext>
            </hp>
          </editor>
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });

        expect(editor.read.selection()).toEqual(projectTestSelectionRange(output.selection));
      });

      it('handle hard edge with regular marks correctly', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
            BaseBoldPlugin,
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });

        expect(editor.read.selection()).toEqual(projectTestSelectionRange(output.selection));
      });

      it('does not interfere with normal character movement inside hard edge marks', () => {
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
        );

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
        );

        const editor = createBaseEditor({
          plugins: [
            BaseCodePlugin.configure({
              rules: { selection: { affinity: 'hard' } },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        move(editor, { distance: 1, unit: 'character' });

        expect(editor.read.selection()).toEqual(projectTestSelectionRange(output.selection));
      });
    });
  });
});
