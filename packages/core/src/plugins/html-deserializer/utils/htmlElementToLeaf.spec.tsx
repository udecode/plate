/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createBoldPlugin } from '../../../../../nodes/basic-marks/src/createBoldPlugin';
import { createItalicPlugin } from '../../../../../nodes/basic-marks/src/createItalicPlugin';
import { createListPlugin } from '../../../../../nodes/list/src/createListPlugin';
import { createParagraphPlugin } from '../../../../../nodes/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '../../../../../ui/plate/src/utils/createPlateUIEditor';
import { htmlElementToLeaf } from './htmlElementToLeaf';
import { parseHtmlElement } from './parseHtmlElement';

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
