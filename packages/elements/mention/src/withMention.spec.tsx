/** @jsx jsx */

import { createPlateUIEditor } from '@udecode/plate';
import { ComboboxState, comboboxStore } from '@udecode/plate-combobox';
import { PlateEditor } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { Range, Transforms } from 'slate';
import { createMentionPlugin } from './createMentionPlugin';
import { getMentionOnSelectItem } from './getMentionOnSelectItem';
import { withMention } from './withMention';

jsx;

describe('withMention', () => {
  const trigger = '@';
  const pluginKey = 'mention';

  type CreateEditorOptions = { multipleMentionPlugins?: boolean };

  const createEditor = (
    state: JSX.Element,
    { multipleMentionPlugins }: CreateEditorOptions = {}
  ): PlateEditor => {
    const plugins = [
      createParagraphPlugin(),
      createMentionPlugin({ pluginKey, trigger }),
    ];
    if (multipleMentionPlugins) {
      plugins.push(
        createMentionPlugin({ pluginKey: 'mention2', trigger: '#' })
      );
    }

    return createPlateUIEditor({
      editor: (<editor>{state}</editor>) as any,
      plugins,
    });
  };

  const createEditorWithMentionInput = (
    at: JSX.Element = (
      <hp>
        <htext />
        <cursor />
      </hp>
    ),
    options?: CreateEditorOptions
  ): PlateEditor => {
    const editor = createEditor(at, options);

    editor.insertText(trigger);

    return editor;
  };

  beforeEach(() => {
    comboboxStore.set.byId({});
  });

  describe('creating a mention input', () => {
    it('should insert a mention input when the trigger is inserted after line beginning', () => {
      const editor = createEditorWithMentionInput();

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
          <htext />
        </hp>,
      ]);
    });

    it('should insert a mention input when the trigger is inserted after whitespace', () => {
      const editor = createEditorWithMentionInput(
        <hp>
          hello world <cursor />
        </hp>
      );

      expect(editor.children).toEqual([
        <hp>
          <htext>hello world </htext>
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
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

  describe('removing a mention input', () => {
    it('should remove the mention input when the selection is removed from it', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
          <htext />
        </hp>
      );

      Transforms.select(editor, {
        path: [0, 2],
        offset: 0,
      });

      expect(editor.children).toEqual([<hp>@</hp>]);
    });

    it('should preserve the text that was typed into the mention input after removing', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            hello
            <cursor />
          </hmentioninput>
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
          <hmentioninput trigger={trigger}>
            hello
            <cursor />
          </hmentioninput>
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

    it('should remove the input when deleting backward in empty input', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            <cursor />
          </hmentioninput>
          <htext />
        </hp>
      );

      editor.deleteBackward('character');

      expect(editor.children).toEqual([<hp>@</hp>]);

      expect(editor.selection).toEqual<Range>({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    });
  });

  describe('typing in a mention input', () => {
    // TODO: remove if slate upgrade handles
    it('should type into a mention input if the selection is in it', () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <htext />
          <cursor />
        </hp>
      );

      editor.insertText('a');

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>a</hmentioninput>
          <htext />
        </hp>,
      ]);
    });

    it('should type the trigger as text when inside a mention input', () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <cursor />
        </hp>
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>{trigger}</hmentioninput>
          <htext />
        </hp>,
      ]);
    });
  });

  describe('history', () => {
    it('should not capture transformations inside a mention input', async () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <cursor />
        </hp>
      );

      // flush previous ops to get a new undo batch going for mention input
      await Promise.resolve();

      editor.insertText('test');
      getMentionOnSelectItem()(editor, { key: 'test', text: 'test' });

      // flush previous ops to get a new undo batch going for mention input
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
    it('should show the combobox when a mention input is created', () => {
      createEditorWithMentionInput(
        <hp>
          <cursor />
        </hp>,
        { multipleMentionPlugins: true }
      );

      expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
        activeId: pluginKey,
      });
    });

    it('should close the combobox when a mention input is removed', () => {
      const editor = createEditorWithMentionInput(
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
      const editor = createEditorWithMentionInput();

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
