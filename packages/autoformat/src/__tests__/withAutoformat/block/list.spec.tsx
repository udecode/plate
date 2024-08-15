/** @jsx jsx */

import { createPlateEditor } from "@udecode/plate-common/react";
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import type {
  AutoformatBlockRule,
  AutoformatPluginOptions,
} from '../../../types';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

describe('when -space', () => {
  it('should format to ul', () => {
    const input = (
      <fragment>
        <hp>
          -
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hul>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hul>
      </fragment>
    ) as any;

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when 1.space', () => {
  it('should format to ol', () => {
    const input = (
      <fragment>
        <hp>
          1.
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hol>
          <hli>
            <hlic>hello</hlic>
          </hli>
        </hol>
      </fragment>
    ) as any;

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when [].space', () => {
  it('should format to todo list', () => {
    const input = (
      <fragment>
        <hp>
          []
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <htodoli>hello</htodoli>
      </fragment>
    ) as any;

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when [x].space', () => {
  it('should format to todo list', () => {
    const input = (
      <fragment>
        <hp>
          [x]
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <htodoli checked>hello</htodoli>
      </fragment>
    ) as any;

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when +space', () => {
  it('should format to a toggle', () => {
    const input = (
      <fragment>
        <hp>
          +
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <htoggle>hello</htoggle>
      </fragment>
    ) as any;

    // See useHooksToggle.ts, we overload the plugin with a `setOpenIds` function until there's a JOTAI layer in plate-core,
    //   so here we need to remove the `preformat` property of the autoformat rule that uses this overload.

    const autoformatPluginRulesWitoutTogglePreformat =
      getAutoformatOptions()!.rules!.map((rule) => {
        const { preFormat, ...rest } = rule as AutoformatBlockRule;

        if (rule.match === '+ ') return rest;

        return rule;
      });

    const autoformatPluginWitoutTogglePreformat: AutoformatPluginOptions = {
      ...getAutoformatOptions(),
      rules: autoformatPluginRulesWitoutTogglePreformat as any,
    };

    const editor = createPlateEditor({ value: input,
      plugins: [AutoformatPlugin.configure({
        options: autoformatPluginWitoutTogglePreformat,
      }),]
    });

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
