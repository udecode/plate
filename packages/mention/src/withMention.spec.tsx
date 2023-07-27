/** @jsx jsx */

import {
  comboboxActions,
  comboboxSelectors,
  ComboboxState,
} from '@udecode/plate-combobox';
import {
  moveSelection,
  PlateEditor,
  select,
  Value,
} from '@udecode/plate-common';
import {
  createDataTransfer,
  DataTransferDataMap,
  jsx,
} from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { createEditorWithMentions } from './__tests__/createEditorWithMentions';
import { getMentionOnSelectItem } from './getMentionOnSelectItem';

jsx;

describe('withMention', () => {
  const trigger = '@';
  const key = 'mention';

  type CreateEditorOptions = {
    multipleMentionPlugins?: boolean;
    triggerPreviousCharPattern?: RegExp;
  };

  const createEditor = <V extends Value>(
    state: JSX.Element,
    options: CreateEditorOptions = {}
  ): PlateEditor<V> =>
    createEditorWithMentions(state, {
      ...options,
      pluginOptions: {
        ...options,
        key,
        trigger,
      },
    });

  const createEditorWithMentionInput = <V extends Value>(
    at: JSX.Element = (
      <hp>
        <htext />
        <cursor />
      </hp>
    ),
    options?: CreateEditorOptions
  ): PlateEditor<V> => {
    const editor = createEditor(at, options) as PlateEditor<V>;

    editor.insertText(trigger);

    return editor;
  };

  beforeEach(() => {
    comboboxActions.byId({});
  });

  describe('creating a mention input', () => {
    it('should insert a mention input when the trigger is inserted between words', () => {
      const editor = createEditorWithMentionInput(
        <hp>
          hello <cursor /> world
        </hp>
      );

      expect(editor.children).toEqual([
        <hp>
          <htext>hello </htext>
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
          <htext> world</htext>
        </hp>,
      ]);
    });

    it('should insert a mention input when the trigger is inserted at line beginning followed by a whitespace', () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <cursor /> hello world
        </hp>
      );

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
          <htext> hello world</htext>
        </hp>,
      ]);
    });

    it('should insert a mention input when the trigger is inserted at line end preceded by a whitespace', () => {
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

    it('should insert the trigger as text when the trigger is appended to a word', () => {
      const editor = createEditor(
        <hp>
          hello
          <cursor />
        </hp>
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          hello@
          <cursor />
        </hp>,
      ]);
    });

    it('should insert the trigger as text when the trigger is prepended to a word', () => {
      const editor = createEditor(
        <hp>
          <cursor />
          hello
        </hp>
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
          hello
        </hp>,
      ]);
    });

    it('should insert the trigger as text when the trigger is inserted into a word', () => {
      const editor = createEditor(
        <hp>
          hel
          <cursor />
          lo
        </hp>
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          hel@
          <cursor />
          lo
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

    it('should insert a mention input when the trigger is inserted after the specified pattern', () => {
      const emptyOrSpaceOrQuotePattern = /^$|^[\s"']$/;
      const editor = createEditor(
        <hp>
          hello "<cursor />"
        </hp>,
        {
          triggerPreviousCharPattern: emptyOrSpaceOrQuotePattern,
        }
      );

      editor.insertText(trigger);

      expect(editor.children).toEqual([
        <hp>
          <htext>hello "</htext>
          <hmentioninput trigger={trigger}>
            <htext />
            <cursor />
          </hmentioninput>
          <htext>"</htext>
        </hp>,
      ]);
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

      select(editor, {
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

      select(editor, {
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

      select(editor, {
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

    it('should block insert break', () => {
      const editor = createEditor(
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            n
            <cursor />
          </hmentioninput>
          <htext />
        </hp>
      );

      editor.insertBreak();

      expect(editor.children).toEqual([
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>
            n
            <cursor />
          </hmentioninput>
          <htext />
        </hp>,
      ]);

      expect(editor.selection).toEqual<Range>({
        anchor: { path: [0, 1, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 1 },
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
    it('should undo inserting a mention by showing mention input', async () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <htext>
            hello <cursor /> world
          </htext>
        </hp>
      );

      // flush previous ops to get a new undo batch going for mention input
      await Promise.resolve();

      getMentionOnSelectItem()(editor, { key: 'test', text: 'test' });

      editor.undo();

      expect(editor.children).toEqual([
        <hp>
          <htext>hello </htext>
          <hmentioninput trigger={trigger}>
            <htext />
          </hmentioninput>
          <htext> world</htext>
        </hp>,
      ]);

      editor.undo();

      expect(editor.children).toEqual([
        <hp>
          <htext>
            hello <cursor /> world
          </htext>
        </hp>,
      ]);
    });

    it('should undo inserting a mention after input by showing mention input with the text', async () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <htext>
            hello <cursor /> world
          </htext>
        </hp>
      );

      // flush previous ops to get a new undo batch going for mention input
      await Promise.resolve();

      editor.insertText('t');
      editor.insertText('e');

      // flush previous ops to get a new undo batch going for mention input
      await Promise.resolve();

      getMentionOnSelectItem()(editor, { key: 'test', text: 'test' });

      editor.undo();

      expect(editor.children).toEqual([
        <hp>
          <htext>hello </htext>
          <hmentioninput trigger={trigger}>
            <htext>te</htext>
          </hmentioninput>
          <htext> world</htext>
        </hp>,
      ]);

      editor.undo();

      expect(editor.children).toEqual([
        <hp>
          <htext>hello </htext>
          <hmentioninput trigger={trigger}>
            <htext />
          </hmentioninput>
          <htext> world</htext>
        </hp>,
      ]);

      editor.undo();

      expect(editor.children).toEqual([
        <hp>
          <htext>
            hello <cursor /> world
          </htext>
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

      expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
        activeId: key,
      });
    });

    it('should close the combobox when a mention input is removed', () => {
      const editor = createEditorWithMentionInput(
        <hp>
          <htext />
          <cursor />
        </hp>
      );

      select(editor, {
        path: [0, 2],
        offset: 0,
      });

      expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
        activeId: null,
      });
    });

    it('should update the text in the combobox when typing', () => {
      const editor = createEditorWithMentionInput();

      editor.insertText('abc');
      expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
        text: 'abc',
      });

      editor.deleteBackward('character');
      expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
        text: 'ab',
      });

      moveSelection(editor, { distance: 1, reverse: true });
      editor.deleteForward('character');
      expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
        text: 'a',
      });
    });
  });

  describe('paste', () => {
    const testPaste: (
      data: DataTransferDataMap,
      input: JSX.Element,
      expected: JSX.Element
    ) => void = (data, input, expected) => {
      const editor = createEditorWithMentionInput(input);

      editor.insertData(createDataTransfer(data));

      expect(editor.children).toEqual([expected]);
    };

    const testPasteBasic: (
      data: DataTransferDataMap,
      expected: string
    ) => void = (data, expected) => {
      testPaste(
        data,
        <hp>
          <cursor />
        </hp>,
        <hp>
          <htext />
          <hmentioninput trigger={trigger}>{expected}</hmentioninput>
          <htext />
        </hp>
      );
    };

    type PasteTestCase = {
      data: DataTransferDataMap;
      expected: string;
    };

    const basePasteTestSuite = ({
      simple,
      whitespace,
      newLine,
      newLineAndWhitespace,
    }: {
      simple: PasteTestCase;
      whitespace: PasteTestCase;
      newLine: PasteTestCase;
      newLineAndWhitespace: PasteTestCase;
    }): void => {
      it('should paste the clipboard contents into mention as text', () =>
        testPasteBasic(simple.data, simple.expected));

      it('should merge lines', () =>
        testPasteBasic(newLine.data, newLine.expected));

      it('should trim the text', () =>
        testPasteBasic(whitespace.data, whitespace.expected));

      it('should trim every line before merging', () =>
        testPasteBasic(
          newLineAndWhitespace.data,
          newLineAndWhitespace.expected
        ));
    };

    describe('html', () => {
      basePasteTestSuite({
        simple: {
          data: new Map([['text/html', '<html><body>hello</body></html>']]),
          expected: 'hello',
        },
        whitespace: {
          data: new Map([['text/html', '<html><body> hello </body></html>']]),
          expected: 'hello',
        },
        newLine: {
          data: new Map([
            ['text/html', '<html><body>hello<br>world</body></html>'],
          ]),
          expected: 'helloworld',
        },
        newLineAndWhitespace: {
          data: new Map([
            ['text/html', '<html><body> hello <br> world </body></html>'],
          ]),
          expected: 'helloworld',
        },
      });
    });

    describe('plain text', () => {
      basePasteTestSuite({
        simple: {
          data: new Map([['text/plain', 'hello']]),
          expected: 'hello',
        },
        whitespace: {
          data: new Map([['text/plain', ' hello ']]),
          expected: 'hello',
        },
        newLine: {
          data: new Map([['text/plain', 'hello\r\nworld\n!\r!']]),
          expected: 'helloworld!!',
        },
        newLineAndWhitespace: {
          data: new Map([['text/plain', ' hello \r\n world \n ! \r ! ']]),
          expected: 'helloworld!!',
        },
      });
    });
  });
});
