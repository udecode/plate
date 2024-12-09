/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { ParagraphPlugin, createPlateEditor } from '../../../../react';
import { htmlBodyToFragment } from './htmlBodyToFragment';
import { parseHtmlElement } from './parseHtmlElement';

jsxt;

describe('when element is a body', () => {
  it('should be a fragment with the children', () => {
    const output = (
      <fragment>
        <hp>
          <htext>test</htext>
        </hp>
      </fragment>
    );

    const body = document.createElement('body');
    body.append(parseHtmlElement(`<p>test</p>`));

    expect(
      htmlBodyToFragment(
        createPlateEditor({ plugins: [ParagraphPlugin] }),
        body
      )
    ).toEqual(output);
  });
});

describe('when element is not a body', () => {
  const output = undefined;

  it('should be undefined', () => {
    expect(
      htmlBodyToFragment(
        createPlateEditor(),
        parseHtmlElement(`<div>test</div>`)
      )
    ).toEqual(output);
  });
});
