/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

jsxt;

import { createSlateEditor } from '../../editor';
import { NodeIdPlugin } from '../node-id/NodeIdPlugin';
import { SlateExtensionPlugin } from './SlateExtensionPlugin';

describe('SlateExtensionPlugin', () => {
  describe('redecorate', () => {
    it('exposes a no-op redecorate method by default', () => {
      const editor = createSlateEditor({
        plugins: [SlateExtensionPlugin],
      });

      expect(typeof editor.api.redecorate).toBe('function');
      expect(() => editor.api.redecorate()).not.toThrow();
    });
  });

  describe('onNodeChange', () => {
    it('call onNodeChange callback when a node operation occurs', () => {
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

    it('does not call onNodeChange for text operations', () => {
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

    it('call onNodeChange for different node operations', () => {
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

    it('provide different node and prevNode for set_node operations', () => {
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
    it('call onTextChange callback when a text operation occurs', () => {
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

    it('does not call onTextChange for node operations', () => {
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

    it('handle remove_text operations', () => {
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

    it('provide the parent node for text operations', () => {
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
    it('skips change pipelines when no handlers are registered', async () => {
      const pipeOnNodeChange = mock(() => false);
      const pipeOnTextChange = mock(() => false);

      mock.module('../../utils/pipeOnNodeChange', () => ({
        pipeOnNodeChange,
      }));
      mock.module('../../utils/pipeOnTextChange', () => ({
        pipeOnTextChange,
      }));

      const { SlateExtensionPlugin: DynamicSlateExtensionPlugin } =
        await import(
          `./SlateExtensionPlugin?test=${Math.random().toString(36).slice(2)}`
        );
      const editor = createSlateEditor({
        plugins: [DynamicSlateExtensionPlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        value: [
          {
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
        ],
      });
      editor.tf.insertText('hello');

      expect(pipeOnNodeChange).not.toHaveBeenCalled();
      expect(pipeOnTextChange).not.toHaveBeenCalled();

      mock.restore();
    });

    it('runs change pipelines when handlers are registered', async () => {
      const pipeOnNodeChange = mock(() => false);
      const pipeOnTextChange = mock(() => false);
      const onTextChange = mock();

      mock.module('../../utils/pipeOnNodeChange', () => ({
        pipeOnNodeChange,
      }));
      mock.module('../../utils/pipeOnTextChange', () => ({
        pipeOnTextChange,
      }));

      const { SlateExtensionPlugin: DynamicSlateExtensionPlugin } =
        await import(
          `./SlateExtensionPlugin?test=${Math.random().toString(36).slice(2)}`
        );
      const editor = createSlateEditor({
        autoSelect: 'end',
        plugins: [
          DynamicSlateExtensionPlugin.configure({
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
      editor.tf.insertText('hello');

      expect(pipeOnTextChange).toHaveBeenCalled();
      expect(onTextChange).toHaveBeenCalled();

      mock.restore();
    });
  });
});

// https://github.com/udecode/editor-protocol/issues/81
describe('delete marked text at block start', () => {
  it('removes the mark after deleting backward in marked text at offset 1', () => {
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

  it('removes the mark when deleting forward at the start of a marked block', () => {
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

  it('removes the mark when deleting a fragment at the start of a marked block', () => {
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
  it('set the editor value correctly', () => {
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

  it('set empty value when no argument is provided', () => {
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

describe('editor.tf.resetBlock', () => {
  it('preserves the configured node id key', () => {
    const editor = createSlateEditor({
      plugins: [
        NodeIdPlugin.configure({
          options: {
            idKey: 'key',
          },
        }),
      ],
      value: [
        {
          children: [{ text: 'test' }],
          foo: 'bar',
          key: 'keep-me',
          type: 'h1',
        },
      ],
    });

    editor.tf.resetBlock({ at: [0] });

    expect(editor.children[0]).toMatchObject({
      children: [{ text: 'test' }],
      key: 'keep-me',
      type: 'p',
    });
    expect((editor.children[0] as any).foo).toBeUndefined();
  });
});

describe('editor.tf.liftBlock', () => {
  it('is available on the editor transform surface', () => {
    const editor = createSlateEditor();

    expect(typeof editor.tf.liftBlock).toBe('function');
  });
});
