/** @jsx jsx */

import { createEditorPlugins } from '@udecode/plate';
import { ComboboxState, comboboxStore } from '@udecode/plate-combobox';
import { SPEditor } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { Range, Transforms } from 'slate';
import { createMentionPlugin } from './createMentionPlugin';
import { getMentionOnSelectItem } from './getMentionOnSelectItem';
import { withMention } from './withMention';

jsx;

describe('withMention', () => {
  const trigger = '@';

  const createEditor = (state: JSX.Element): SPEditor =>
    createEditorPlugins({
      editor: (<editor>{state}</editor>) as any,
      plugins: [createParagraphPlugin(), createMentionPlugin()],
    });

  const createEditorWithMentionProposal = (
    at: JSX.Element = (
      <hp>
        <htext />
        <cursor />
      </hp>
    )
  ): SPEditor => {
    const editor = createEditor(at);

    editor.insertText(trigger);

    return editor;
  };

  beforeEach(() => {
    comboboxStore.set.byId({});
  });

  describe('creating a mention proposal', () => {
    it('should insert a mention proposal when the trigger is inserted after line beginning', () => {
      const editor = createEditorWithMentionProposal();

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentionproposal>
            <htext />
            <cursor />
          </hmentionproposal>
          <htext />
        </hp>,
      ]);
    });

    it('should insert a mention proposal when the trigger is inserted after whitespace', () => {
      const editor = createEditorWithMentionProposal(
        <hp>
          hello world <cursor />
        </hp>
      );

      expect(editor.children).toEqual([
        <hp>
          <htext>hello world </htext>
          <hmentionproposal>
            <htext />
            <cursor />
          </hmentionproposal>
          <htext />
        </hp>,
      ]);
    });

    it('should insert the trigger as text when trigger follows non-whitespace character', () => {
      const editor = createEditor(
        <hp>
          a
          <cursor />
        </hp>
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          a@
          <cursor />
        </hp>,
      ]);
    });

    it('should insert text when not trigger', () => {
      const editor = createEditor(
        <hp>
          <cursor />
        </hp>
      );

      editor.insertText('a');

      expect(editor.children).toEqual([<hp>a</hp>]);
    });
  });

  describe('removing a mention proposal', () => {
    it('should remove the mention proposal when the selection is removed from it', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentionproposal>
            <htext />
            <cursor />
          </hmentionproposal>
          <htext />
        </hp>
      );

      Transforms.select(editor, {
        path: [0, 2],
        offset: 0,
      });

      expect(editor.children).toEqual([<hp>@</hp>]);
    });

    it('should preserve the text that was typed into the mention proposal after removing', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentionproposal>
            hello
            <cursor />
          </hmentionproposal>
          <htext />
        </hp>
      );

      Transforms.select(editor, {
        path: [0, 2],
        offset: 0,
      });

      expect(editor.children).toEqual([<hp>@hello</hp>]);
    });

    it('should change the selection to the requested location', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentionproposal>
            hello
            <cursor />
          </hmentionproposal>
          <htext />
        </hp>
      );

      Transforms.select(editor, {
        path: [0, 2],
        offset: 0,
      });

      expect(editor.selection).toEqual<Range>({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
    });
  });

  describe('typing in a mention proposal', () => {
    // TODO: remove if slate upgrade handles
    it('should type into a mention proposal if the selection is in it', () => {
      const editor = createEditorWithMentionProposal(
        <hp>
          <htext />
          <cursor />
        </hp>
      );

      editor.insertText('a');

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentionproposal>a</hmentionproposal>
          <htext />
        </hp>,
      ]);
    });

    it('should type the trigger as text when inside a mention proposal', () => {
      const editor = createEditorWithMentionProposal(
        <hp>
          <cursor />
        </hp>
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentionproposal>{trigger}</hmentionproposal>
          <htext />
        </hp>,
      ]);
    });
  });

  describe('history', () => {
    it('should not capture transformations inside a mention proposal', async () => {
      const editor = createEditorWithMentionProposal(
        <hp>
          <cursor />
        </hp>
      );

      // flush previous ops to get a new undo batch going for mention proposal
      await Promise.resolve();

      editor.insertText('test');
      getMentionOnSelectItem()(editor, { key: 'test', text: 'test' });

      // flush previous ops to get a new undo batch going for mention proposal
      await Promise.resolve();

      editor.undo();

      expect(editor.children).toEqual([
        <hp>
          <htext />
        </hp>,
      ]);
    });
  });

  describe('combobox', () => {
    it('should show the combobox when a mention proposal is created', () => {
      createEditorWithMentionProposal(
        <hp>
          <cursor />
        </hp>
      );

      expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
        activeId: expect.anything(),
      });
    });

    it('should close the combobox when a mention proposal is removed', () => {
      const editor = createEditorWithMentionProposal(
        <hp>
          <htext />
          <cursor />
        </hp>
      );

      Transforms.select(editor, {
        path: [0, 2],
        offset: 0,
      });

      expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
        activeId: null,
      });
    });

    it('should update the text in the combobox when typing', () => {
      const editor = createEditorWithMentionProposal();

      editor.insertText('abc');
      expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
        text: 'abc',
      });

      editor.deleteBackward('character');
      expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
        text: 'ab',
      });

      Transforms.move(editor, { distance: 1, reverse: true });
      editor.deleteForward('character');
      expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
        text: 'a',
      });
    });
  });
});
