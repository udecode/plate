/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from './__tests__/createTestEditor';

jsxt;

const editor = createTestEditor();

describe('roundTrip', () => {
  it('round trip basic marks', () => {
    const input = (
      <fragment>
        <htoc>
          <htext />
        </htoc>
        <hp>
          Make text <htext bold>bold</htext>, <htext italic>italic</htext>,{' '}
          <htext underline>underlined</htext>, or apply a{' '}
          <htext bold highlight italic underline>
            combination
          </htext>{' '}
          of these styles for a visually striking effect.
          <htext strikethrough>del</htext>
        </hp>
      </fragment>
    );

    const md = editor.api.markdown.serialize({ value: { children: input } });
    const slate = editor.api.markdown.deserialize(md);
    expect(slate.children).toEqual(input);
  });

  it('serialize callout correctly', () => {
    const input = (
      <fragment>
        <hcallout>Callout</hcallout>
      </fragment>
    );

    const md = editor.api.markdown.serialize({ value: { children: input } });
    expect(md).toMatchSnapshot();
  });

  it('serialize callout with icon attribute', () => {
    const input = (
      <fragment>
        <hcallout icon="⚠️">Callout</hcallout>
      </fragment>
    );

    const md = editor.api.markdown.serialize({ value: { children: input } });
    const slate = editor.api.markdown.deserialize(md);
    expect(slate.children).toEqual(input);
  });
});
