/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { useBoldPlugin } from '../../../../marks/bold/useBoldPlugin';
import { withDeserializeHTML } from '../../useDeserializeHTMLPlugin';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

// noinspection CheckTagEmptyBody
const data = {
  getData: () => '<html></html>',
};

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

describe('when inserting empty html', () => {
  it('should do nothing', () => {
    const editor = withDeserializeHTML({ plugins: [useBoldPlugin()] })(
      withReact(input)
    );

    editor.insertData(data as any);

    expect(input.children).toEqual(output.children);
  });
});
