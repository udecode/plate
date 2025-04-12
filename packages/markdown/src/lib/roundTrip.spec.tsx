/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

jsxt;

const editor = createTestEditor();

describe('roundTrip', () => {
  it('should round trip basic marks', () => {
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

    const md = serializeMd(editor, { value: input });
    const slate = deserializeMd(editor, md);
    expect(slate).toEqual(input);
  });
});
