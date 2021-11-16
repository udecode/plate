/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createBoldPlugin } from '../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createItalicPlugin } from '../../../../../marks/basic-marks/src/italic/createItalicPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
import {
  htmlElementToLeaf,
  HtmlElementToLeafOptions,
} from './htmlElementToLeaf';

jsx;

describe('when children is a text', () => {
  const input: HtmlElementToLeafOptions = {
    element: document.createElement('strong'),
    children: <fragment>test</fragment>,
  } as any;

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
        input as any
      )
    ).toEqual(output);
  });
});

describe('when there is no plugins', () => {
  const input = {
    element: document.createElement('strong'),
    children: [{ text: 'test' }],
  };

  const output = [{ text: 'test' }];

  it('should do nothing', () => {
    expect(
      htmlElementToLeaf(
        createPlateUIEditor({
          plugins: [{ key: 'a' }],
        }),
        input
      )
    ).toEqual(output);
  });
});

describe('when there is a mark above multiple elements', () => {
  const input = {
    element: document.createElement('strong'),
    children: [
      <hli>
        <hp>test</hp>test
      </hli>,
      null,
    ],
  };

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
            createBoldPlugin(),
            createItalicPlugin(),
          ],
        }),
        input as any
      )
    ).toEqual(output);
  });
});
