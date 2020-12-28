/** @jsx jsx */
import { act, renderHook } from '@testing-library/react-hooks';
import {
  ELEMENT_MENTION,
  pipe,
  withInlineVoid,
} from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { useMention } from '../../../../useMention';
import { mentionables } from '../mentionables.fixture';

const input = ((
  <editor>
    <hp>
      t1 @t2
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hp>
      t1{' '}
      <hmention value="t2">
        <htext />
      </hmention>
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({
    inlineTypes: [ELEMENT_MENTION],
    voidTypes: [ELEMENT_MENTION],
  }),
] as const;

it('should go down', () => {
  const editor = pipe(input, ...withPlugins);

  const { result } = renderHook(() => useMention(mentionables));

  act(() => {
    result.current.onChangeMention(editor);
  });

  act(() => {
    result.current.onKeyDownMention(
      new KeyboardEvent('keydown', { key: 'Enter' }),
      editor
    );
  });

  expect(input.children).toEqual(output.children);
  expect(result.current.target).toEqual(null);
});
