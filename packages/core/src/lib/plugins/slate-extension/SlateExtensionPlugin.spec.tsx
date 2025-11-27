/** @jsx jsxt */

import { NodeApi } from '@platejs/slate';
import { jsxt } from '@platejs/test-utils';

jsxt;

import { createSlateEditor } from '../../editor';
import { SlateExtensionPlugin } from './SlateExtensionPlugin';

describe('SlateExtensionPlugin', () => {
  describe('onNodeChange', () => {
    it('should call onNodeChange callback when a node operation occurs', () => {
      const onNodeChange = mock();

      const editor = createSlateEditor({
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onNodeChange,
            },
          }) as any,
        ],
      });

      // Insert a node
      editor.tf.insertNode({
        children: [{ text: 'test' }],
        type: 'paragraph',
      });

      expect(onNodeChange).toHaveBeenCalled();
      expect(onNodeChange).toHaveBeenCalledWith({
        editor,
        node: expect.objectContaining({
          children: [{ text: 'test' }],
          type: 'paragraph',
        }),
        operation: expect.objectContaining({
          type: 'insert_node',
        }),
        prevNode: expect.objectContaining({
          children: [{ text: 'test' }],
          type: 'paragraph',
        }),
      });
    });

    it('should not call onNodeChange for text operations', () => {
      const onNodeChange = mock();

      const editor = createSlateEditor({
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onNodeChange,
            },
          }) as any,
        ],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });

      // Insert text
      editor.tf.insertText('hello');

      expect(onNodeChange).not.toHaveBeenCalled();
    });

    it('should call onNodeChange for different node operations', () => {
      const onNodeChange = mock();

      const editor = createSlateEditor({
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onNodeChange,
            },
          }),
        ],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });

      // Remove node
      editor.tf.removeNodes({ at: [0] });

      expect(onNodeChange).toHaveBeenCalledWith({
        editor,
        node: expect.objectContaining({
          children: [{ text: 'test' }],
          type: 'paragraph',
        }),
        operation: expect.objectContaining({
          type: 'remove_node',
        }),
        prevNode: expect.objectContaining({
          children: [{ text: 'test' }],
          type: 'paragraph',
        }),
      });
    });

    it('should provide different node and prevNode for set_node operations', () => {
      const onNodeChange = mock();

      const editor = createSlateEditor({
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onNodeChange,
            },
          }),
        ],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });

      // Set node properties
      editor.tf.setNodes({ type: 'heading' }, { at: [0] });

      expect(onNodeChange).toHaveBeenCalledWith({
        editor,
        node: expect.objectContaining({
          type: 'heading',
        }),
        operation: expect.objectContaining({
          type: 'set_node',
        }),
        prevNode: expect.objectContaining({
          type: 'paragraph',
        }),
      });
    });
  });

  describe('onTextChange', () => {
    it('should call onTextChange callback when a text operation occurs', () => {
      const onTextChange = mock();

      const editor = createSlateEditor({
        autoSelect: 'end',
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onTextChange,
            },
          }) as any,
        ],
        value: [
          {
            children: [{ text: 'hello' }],
            type: 'paragraph',
          },
        ],
      });

      // Insert text
      editor.tf.insertText(' world');

      expect(onTextChange).toHaveBeenCalled();
      expect(onTextChange).toHaveBeenCalledWith({
        editor,
        node: expect.objectContaining({
          children: expect.arrayContaining([
            expect.objectContaining({ text: expect.any(String) }),
          ]),
          type: 'paragraph',
        }),
        operation: expect.objectContaining({
          type: 'insert_text',
        }),
        prevText: 'hello',
        text: 'hello world',
      });
    });

    it('should not call onTextChange for node operations', () => {
      const onTextChange = mock();

      const editor = createSlateEditor({
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onTextChange,
            },
          }) as any,
        ],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });

      // Insert node
      editor.tf.insertNode({
        children: [{ text: 'new' }],
        type: 'paragraph',
      });

      expect(onTextChange).not.toHaveBeenCalled();
    });

    it('should handle remove_text operations', () => {
      const onTextChange = mock();

      const editor = createSlateEditor({
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onTextChange,
            },
          }),
        ],
        selection: {
          anchor: {
            offset: 11,
            path: [0, 0],
          },
          focus: {
            offset: 11,
            path: [0, 0],
          },
        },
        value: [
          {
            children: [{ text: 'hello world' }],
            type: 'paragraph',
          },
        ],
      });

      editor.tf.deleteBackward();

      expect(onTextChange).toHaveBeenCalledWith({
        editor,
        node: expect.objectContaining({
          type: 'paragraph',
        }),
        operation: expect.objectContaining({
          text: 'd',
          type: 'remove_text',
        }),
        prevText: 'hello world',
        text: 'hello worl',
      });
    });

    it('should provide the parent node for text operations', () => {
      const onTextChange = mock();

      const editor = createSlateEditor({
        autoSelect: 'end',
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onTextChange,
            },
          }),
        ],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'heading',
          },
        ],
      });

      // Insert text
      editor.tf.insertText('ing');

      expect(onTextChange).toHaveBeenCalledWith({
        editor,
        node: expect.objectContaining({
          type: 'heading',
        }),
        operation: expect.objectContaining({
          type: 'insert_text',
        }),
        prevText: 'test',
        text: 'testing',
      });
    });
  });

  describe('performance optimization', () => {
    it('should not capture state when no handlers are registered', () => {
      const editor = createSlateEditor({
        plugins: [SlateExtensionPlugin],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });

      // Spy on NodeApi.get to ensure it's not called
      const getSpy = spyOn(NodeApi, 'get');

      // Insert text (no handlers registered)
      editor.tf.insertText('hello');

      // NodeApi.get should not be called for state capture
      expect(getSpy).not.toHaveBeenCalled();

      getSpy.mockRestore();
    });

    it('should capture state when handlers are registered', () => {
      const onTextChange = mock();

      const editor = createSlateEditor({
        autoSelect: 'end',
        plugins: [
          SlateExtensionPlugin.configure({
            options: {
              onTextChange,
            },
          }),
        ],
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });

      // Spy on NodeApi.get to ensure it IS called
      const getSpy = spyOn(NodeApi, 'get');

      // Insert text (handler is registered)
      editor.tf.insertText('hello');

      // NodeApi.get should be called for state capture
      expect(getSpy).toHaveBeenCalled();
      expect(onTextChange).toHaveBeenCalled();

      getSpy.mockRestore();
    });
  });
});

// https://github.com/udecode/editor-protocol/issues/81
describe('delete marked text at block start', () => {
  // it('delete backward in a marked text at offset 1, it should remove the mark (legacy)', () => {
  //   const input = (
  //     <editor>
  //       <hp>
  //         <htext bold>
  //           a<cursor />
  //           bc
  //         </htext>
  //       </hp>
  //     </editor>
  //   ) as any;

  //   const output = (
  //     <editor>
  //       <hp>
  //         a<htext bold>bc</htext>
  //       </hp>
  //     </editor>
  //   ) as any;

  //   const editor = createSlateEditor({
  //     selection: input.selection,
  //     value: input.children,
  //   });

  //   (editor as typeof editor & LegacyEditorMethods).deleteBackward('character');
  //   (editor as typeof editor & LegacyEditorMethods).insertText('a');

  //   expect(editor.children).toEqual(output.children);
  // });

  it('delete backward in a marked text at offset 1, it should remove the mark', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            a<cursor />
            bc
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          a<htext bold>bc</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward();
    editor.tf.insertText('a');

    expect(editor.children).toEqual(output.children);
  });

  it('when delete forward at start of a marked block, it should remove the mark', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            <cursor />
            abc
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          a<htext bold>bc</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteForward();
    editor.tf.insertText('a');

    expect(editor.children).toEqual(output.children);
  });

  it('when delete fragment with anchor or focus at start of a marked block, should remove the mark', () => {
    const input = (
      <editor>
        <hp>
          <htext bold>
            <anchor />b<focus />c
          </htext>
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          b<cursor />
          <htext bold>c</htext>
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.deleteBackward();
    editor.tf.insertText('b');

    expect(editor.children).toEqual(output.children);
  });
});

describe('editor.tf.setValue', () => {
  it('should set the editor value correctly', () => {
    const input = (
      <editor>
        <hp>existing content</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>new content</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.setValue('<p>new content</p>');

    expect(editor.children).toEqual(output.children);
  });

  it('should set empty value when no argument is provided', () => {
    const input = (
      <editor>
        <hp>existing content</hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.setValue();

    expect(editor.children).toEqual(output.children);
  });
});
