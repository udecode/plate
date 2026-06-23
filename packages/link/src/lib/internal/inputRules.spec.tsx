/** @jsx jsxt */

import { BaseParagraphPlugin, KEYS, createEditorPlugin } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { getCurrentRuntimeTransforms } from '../../../../core/src/internal/currentRuntimeBridge';
import { InputRulesPlugin } from '../../../../core/src/lib/plugins/input-rules/internal/InputRulesPlugin';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { LinkRules } from '../LinkRules';

jsxt;

const CodeBlockPlugin = createEditorPlugin({
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
    createPlateRuntimeEditor({
      initialSelection: value.selection,
      initialValue: value.children ?? value,
      plugins: [
        BaseParagraphPlugin,
        config ? BaseLinkPlugin.configure(config) : BaseLinkPlugin,
        InputRulesPlugin,
        ...plugins,
      ],
    } as any);
  const createPlainEditor = (
    text: string,
    config?: {
      inputRules?: any[];
      options?: Record<string, any>;
    }
  ) =>
    createPlateRuntimeEditor({
      initialSelection: {
        anchor: { offset: text.length, path: [0, 0] },
        focus: { offset: text.length, path: [0, 0] },
      },
      initialValue: [{ children: [{ text }], type: 'p' }],
      plugins: [
        BaseParagraphPlugin,
        config ? BaseLinkPlugin.configure(config) : BaseLinkPlugin,
        InputRulesPlugin,
      ],
    } as any);

  const root = (editor: ReturnType<typeof createPlainEditor>) =>
    editor.read((state) => state.value.root());

  const selection = (editor: ReturnType<typeof createPlainEditor>) =>
    editor.read((state) => state.selection.get());

  it('converts [text](url on ) into a structured link span', () => {
    const editor = createPlainEditor('[Example site](https://example.com', {
      inputRules: [LinkRules.markdown()],
    });

    getCurrentRuntimeTransforms(editor).insertText(')');

    expect(root(editor)[0]).toMatchObject({
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
    expect(selection(editor)).toEqual({
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

    getCurrentRuntimeTransforms(editor).insertText(')');

    expect(root(editor)).toEqual(
      <fragment>
        <hp>[Example](https://example.com)</hp>
      </fragment>
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

    getCurrentRuntimeTransforms(editor).insertText(')');

    expect(root(editor)).toEqual(
      <fragment>
        <hp>[Bad](javascript:alert(1)</hp>
      </fragment>
    );
  });

  it('applies transformInput before validating and inserting the link', () => {
    const transformInput = (url: string) => `https://${url}`;

    const editor = createPlainEditor('[Example](example.com', {
      inputRules: [LinkRules.markdown()],
      options: {
        transformInput,
      },
    });

    getCurrentRuntimeTransforms(editor).insertText(')');

    expect(root(editor)).toEqual([
      {
        children: [
          { text: '' },
          {
            children: [{ text: 'Example' }],
            type: 'a',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
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

    getCurrentRuntimeTransforms(editor).insertText(')');

    expect(root(editor)).toEqual(
      <fragment>
        <hcodeblock>
          <hcodeline>[Example](https://example.com)</hcodeline>
        </hcodeblock>
      </fragment>
    );
  });
});
