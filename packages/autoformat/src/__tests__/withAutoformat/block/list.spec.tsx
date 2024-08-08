/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { autoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import type { AutoformatBlockRule } from '../../../common/types';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

describe('when -space', () => {
  it('should format to ul', () => {
    const input = (
      <editor>
        <hp>
          -
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hul>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(autoformatOptions),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when 1.space', () => {
  it('should format to ol', () => {
    const input = (
      <editor>
        <hp>
          1.
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hol>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hol>
      </editor>
    ) as any;

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(autoformatOptions),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when [].space', () => {
  it('should format to todo list', () => {
    const input = (
      <editor>
        <hp>
          []
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <htodoli>hello</htodoli>
      </editor>
    ) as any;

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(autoformatOptions),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when [x].space', () => {
  it('should format to todo list', () => {
    const input = (
      <editor>
        <hp>
          [x]
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <htodoli checked>hello</htodoli>
      </editor>
    ) as any;

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(autoformatOptions),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when +space', () => {
  it('should format to a toggle', () => {
    const input = (
      <editor>
        <hp>
          +
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <htoggle>hello</htoggle>
      </editor>
    ) as any;

    // See useHooksToggle.ts, we overload the plugin with a `setOpenIds` function until there's a JOTAI layer in plate-core,
    //   so here we need to remove the `preformat` property of the autoformat rule that uses this overload.

    const autoformatPluginRulesWitoutTogglePreformat =
      autoformatOptions!.rules!.map((rule) => {
        const { preFormat, ...rest } = rule as AutoformatBlockRule;

        if (rule.match === '+ ') return rest;

        return rule;
      });

    const autoformatPluginWitoutTogglePreformat: typeof autoformatOptions = {
      ...autoformatOptions,
      rules: autoformatPluginRulesWitoutTogglePreformat as any,
    };

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(autoformatPluginWitoutTogglePreformat),
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
