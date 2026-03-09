/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import {
  autoformatLegal,
  autoformatLegalHtml,
} from '../../rules/autoformatLegal';
import { autoformatPunctuation } from '../../rules/autoformatPunctuation';
import { autoformatSmartQuotes } from '../../rules/autoformatSmartQuotes';
import { autoformatOperation } from '../../rules/math/autoformatOperation';
import { createAutoformatEditor } from './createAutoformatEditor';

jsxt;

describe('AutoformatPlugin text rules', () => {
  it.each([
    {
      expected: (
        <fragment>
          <hp>
            —
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            -
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      rules: autoformatPunctuation,
      text: '-',
      title: 'formats -- into an em dash',
    },
    {
      expected: (
        <fragment>
          <hp>
            -O-
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            -O
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      rules: autoformatPunctuation,
      text: '-',
      title: 'leaves a single intervening character alone',
    },
    {
      expected: (
        <fragment>
          <hp>
            -OO-
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            -OO
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      rules: autoformatPunctuation,
      text: '-',
      title: 'leaves multiple intervening characters alone',
    },
    {
      expected: (
        <fragment>
          <hp>
            ™
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            (tm
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      rules: autoformatLegal,
      text: ')',
      title: 'formats (tm) into the trademark symbol',
    },
    {
      expected: (
        <fragment>
          <hp>
            §
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            &sect
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      rules: autoformatLegalHtml,
      text: ';',
      title: 'formats &sect; into the section symbol',
    },
    {
      expected: (
        <fragment>
          <hp>
            ÷
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            /
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      rules: autoformatOperation,
      text: '/',
      title: 'formats // into the division symbol',
    },
    {
      expected: (
        <fragment>
          <hp>“hello” .</hp>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            "hello
            <cursor /> .
          </hp>
        </fragment>
      ) as any,
      rules: autoformatSmartQuotes,
      text: '"',
      title: 'formats straight quotes into smart quotes',
    },
  ])('$title', ({ expected, input, rules, text }) => {
    const editor = createAutoformatEditor({
      rules,
      value: input,
    });

    editor.tf.insertText(text);

    expect(input.children).toEqual(expected.children);
  });

  it('formats %% and %%% into per-mille then per-ten-thousand', () => {
    const input = (
      <fragment>
        <hp>
          %
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const perMille = (
      <fragment>
        <hp>
          ‰
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const perTenThousand = (
      <fragment>
        <hp>
          ‱
          <cursor />
          hello
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: autoformatOperation,
      value: input,
    });

    editor.tf.insertText('%');
    expect(input.children).toEqual(perMille.children);

    editor.tf.insertText('%');
    expect(input.children).toEqual(perTenThousand.children);
  });
});
