/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseH1Plugin, BaseH2Plugin, BaseH3Plugin } from './BaseHeadingPlugin';
import { HeadingRules } from './BasicBlockRules';

jsxt;

describe('heading input rules', () => {
  it('registers only the configured heading shorthand rules', () => {
    const editor = createSlateEditor({
      plugins: [
        BaseH1Plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
        BaseH3Plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
      ],
    } as any);

    expect(
      editor.meta.inputRules.plugins.h1.rules.map((rule) => rule.id)
    ).toEqual(['h1.0']);
    expect(
      editor.meta.inputRules.plugins.h3.rules.map((rule) => rule.id)
    ).toEqual(['h3.0']);
    expect(
      editor.meta.inputRules.insertText.byTrigger[' '].map((rule) => rule.id)
    ).toEqual(['h1.0', 'h3.0']);
  });

  it.each([
    {
      input: (
        <fragment>
          <hp>
            #
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hh1>hello</hh1>
        </fragment>
      ) as any,
      title: 'promotes # into h1 on space',
      plugin: BaseH1Plugin,
    },
    {
      input: (
        <fragment>
          <hp>
            ##
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hh2>hello</hh2>
        </fragment>
      ) as any,
      title: 'promotes ## into h2 on space',
      plugin: BaseH2Plugin,
    },
  ])('$title', ({ input, output, plugin }) => {
    const editor = createSlateEditor({
      plugins: [
        plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
      ],
      value: input,
    } as any);

    editor.tf.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
