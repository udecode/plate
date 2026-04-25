/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  KEYS,
  createSlateEditor,
  createSlatePlugin,
} from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { LinkRules } from '../LinkRules';

jsxt;

const CodeBlockPlugin = createSlatePlugin({
  key: KEYS.codeBlock,
  node: { isElement: true },
});

describe('link automd input rule', () => {
  const createEditor = (
    value: any,
    config?: {
      inputRules?: any[];
      options?: Record<string, any>;
    },
    plugins: any[] = []
  ) =>
    createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        config ? BaseLinkPlugin.configure(config) : BaseLinkPlugin,
        ...plugins,
      ],
      value,
    } as any);
  const createPlainEditor = (
    text: string,
    config?: {
      inputRules?: any[];
      options?: Record<string, any>;
    }
  ) =>
    createSlateEditor({
      plugins: [
        BaseParagraphPlugin,
        config ? BaseLinkPlugin.configure(config) : BaseLinkPlugin,
      ],
      selection: {
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      value: [{ children: [{ text }], type: 'p' }],
    } as any);

  it('converts [text](url on ) into a structured link span', () => {
    const editor = createPlainEditor('[Example site](https://example.com', {
      inputRules: [LinkRules.markdown()],
    });

    editor.tf.insertText(')');

    expect(editor.children[0]).toMatchObject({
      children: [
        { text: '' },
        {
          children: [{ text: 'Example site' }],
          type: 'a',
          url: 'https://example.com',
        },
        { text: '' },
      ],
      type: 'p',
    });
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
  });

  it('keeps automd literal until markdown input is enabled', () => {
    const input = (
      <fragment>
        <hp>
          [Example](https://example.com
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input);

    editor.tf.insertText(')');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>[Example](https://example.com)</hp>
        </fragment>
      ).children
    );
  });

  it('keeps invalid automd literal when the url fails validation', () => {
    const input = (
      <fragment>
        <hp>
          [Bad](javascript:alert(1
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createEditor(input, {
      inputRules: [LinkRules.markdown()],
    });

    editor.tf.insertText(')');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>[Bad](javascript:alert(1)</hp>
        </fragment>
      ).children
    );
  });

  it('applies transformInput before validating and inserting the link', () => {
    const input = (
      <fragment>
        <hp>
          [Example](example.com
          <cursor />
        </hp>
      </fragment>
    ) as any;
    const transformInput = (url: string) => `https://${url}`;

    const editor = createEditor(input, {
      inputRules: [LinkRules.markdown()],
      options: {
        transformInput,
      },
    });

    editor.tf.insertText(')');

    expect(input.children).toEqual(
      (
        <fragment>
          <hp>
            <ha url="https://example.com">Example</ha>
          </hp>
        </fragment>
      ).children
    );
  });

  it('keeps automd literal inside code blocks', () => {
    const input = (
      <fragment>
        <hcodeblock>
          <hcodeline>
            [Example](https://example.com
            <cursor />
          </hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const editor = createEditor(
      input,
      {
        inputRules: [LinkRules.markdown()],
      },
      [CodeBlockPlugin]
    );

    editor.tf.insertText(')');

    expect(input.children).toEqual(
      (
        <fragment>
          <hcodeblock>
            <hcodeline>[Example](https://example.com)</hcodeline>
          </hcodeblock>
        </fragment>
      ).children
    );
  });
});
