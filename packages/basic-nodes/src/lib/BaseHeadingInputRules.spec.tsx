/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';

import { BaseH1Plugin, BaseH2Plugin, BaseH3Plugin } from './BaseHeadingPlugin';
import { HeadingRules } from './BasicBlockRules';

jsxt;

describe('heading input rules', () => {
  it('registers only the configured heading shorthand rules', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseH1Plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
        BaseH3Plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
      ],
    });

    expect(
      editor.runtime.inputRules.plugins.h1.rules.map((rule) => rule.id)
    ).toEqual(['h1.0']);
    expect(
      editor.runtime.inputRules.plugins.h3.rules.map((rule) => rule.id)
    ).toEqual(['h3.0']);
    expect(
      editor.runtime.inputRules.insertText.byTrigger[' '].map((rule) => rule.id)
    ).toEqual(['h1.0', 'h3.0']);
  });

  it.each([
    {
      input: (
        <editor>
          <hp>
            #
            <cursor />
            hello
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hh1>hello</hh1>
        </editor>
      ),
      title: 'promotes # into h1 on space',
      plugin: BaseH1Plugin.configure({
        inputRules: [HeadingRules.markdown()],
      }),
    },
    {
      input: (
        <editor>
          <hp>
            ##
            <cursor />
            hello
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hh2>hello</hh2>
        </editor>
      ),
      title: 'promotes ## into h2 on space',
      plugin: BaseH2Plugin.configure({
        inputRules: [HeadingRules.markdown()],
      }),
    },
  ])('$title', ({ input, output, plugin }) => {
    const editor = createBaseEditor({
      plugins: [plugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual(output.children);
  });
});
