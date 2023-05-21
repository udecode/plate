/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { createBoldPlugin } from '@udecode/plate-basic-marks/src/createBoldPlugin';
import { createItalicPlugin } from '@udecode/plate-basic-marks/src/createItalicPlugin';
import { createListPlugin } from '@udecode/plate-list/src/createListPlugin';
import { createParagraphPlugin } from '@udecode/plate-paragraph/src/createParagraphPlugin';
import { jsx } from '@udecode/plate-test-utils';
import { htmlElementToLeaf } from './htmlElementToLeaf';
import { parseHtmlElement } from './parseHtmlElement';

import { createPlateUIEditor } from '@/lib/createPlateUIEditor';

jsx;

describe('when children is a text', () => {
  const output = (
    <fragment>
      <htext bold>test</htext>
    </fragment>
  );

  it('should set the mark on the text', () => {
    expect(
      htmlElementToLeaf(
        createPlateUIEditor({
          plugins: [createBoldPlugin()],
        }),
        parseHtmlElement(`<strong>test</strong>`)
      )
    ).toEqual(output);
  });
});

describe('when there is no plugins', () => {
  const output = [{ text: 'test' }];

  it('should do nothing', () => {
    expect(
      htmlElementToLeaf(
        createPlateUIEditor({
          plugins: [{ key: 'a' }],
        }),
        parseHtmlElement(`<strong>test</strong>`)
      )
    ).toEqual(output);
  });
});

describe('when there is a mark above multiple elements', () => {
  const output = (
    <fragment>
      <hli>
        <hp>
          <htext bold>test</htext>
        </hp>
        <htext bold>test</htext>
      </hli>
    </fragment>
  );

  it('should set the mark to all children leaves', () => {
    expect(
      htmlElementToLeaf(
        createPlateUIEditor({
          plugins: [
            createParagraphPlugin(),
            createListPlugin(),
            createBoldPlugin(),
            createItalicPlugin(),
          ],
        }),
        parseHtmlElement(`<strong><li><p>test</p>test</li></strong>`)
      )
    ).toEqual(output);
  });
});
