/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createPlateEditor } from '../../../react';
import { createSlatePlugin } from '../../plugin';

jsxt;

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

  //   const editor = createPlateEditor({
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

    const editor = createPlateEditor({
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

    const editor = createPlateEditor({
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

    const editor = createPlateEditor({
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

    const editor = createPlateEditor({
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

    const editor = createPlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.setValue();

    expect(editor.children).toEqual(output.children);
  });
});

describe('breakMode behavior', () => {
  it('should insert soft break when cursor is in a plugin with breakMode: "lineBreak"', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>
            test
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hblockquote>
          <hp>
            test{'\n'}
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'blockquote',
          node: {
            breakMode: 'lineBreak',
            isElement: true,
            type: 'blockquote',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should insert regular break when cursor is not in a plugin with breakMode', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>test</hp>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should insert soft break when cursor is in nested element with breakMode: "lineBreak"', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>
            first line
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hblockquote>
          <hp>
            first line{'\n'}
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'blockquote',
          node: {
            breakMode: 'lineBreak',
            isElement: true,
            type: 'blockquote',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should insert soft break when using breakMode: "splitOnEmptyLine" and previous char is not newline', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hp>
            line1
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hcodeblock>
          <hp>line1</hp>
          <hp>
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'codeblock',
          node: {
            breakMode: 'splitOnEmptyLine',
            isElement: true,
            type: 'codeblock',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should insert regular break when using breakMode: "splitOnEmptyLine" and previous char is newline', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hp>
            line1{'\n'}
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hcodeblock>
          <hp>line1{'\n'}</hp>
          <hp>
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'codeblock',
          node: {
            breakMode: 'splitOnEmptyLine',
            isElement: true,
            type: 'codeblock',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should insert regular break when using breakMode: "splitOnEmptyLine" and cursor is in empty block', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hp>
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hcodeblock>
          <hp>
            <htext />
          </hp>
          <hp>
            <cursor />
          </hp>
        </hcodeblock>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'codeblock',
          node: {
            breakMode: 'splitOnEmptyLine',
            isElement: true,
            type: 'codeblock',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });

  it('should handle multiple plugins with different breakMode settings', () => {
    const input = (
      <editor>
        <hblockquote>
          <hp>
            test
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hblockquote>
          <hp>
            test{'\n'}
            <cursor />
          </hp>
        </hblockquote>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'blockquote',
          node: {
            breakMode: 'lineBreak',
            isElement: true,
            type: 'blockquote',
          },
        }),
        createSlatePlugin({
          key: 'callout',
          node: {
            breakMode: 'lineBreak',
            isElement: true,
            type: 'callout',
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.insertBreak();

    expect(editor.children).toEqual(output.children);
  });
});
