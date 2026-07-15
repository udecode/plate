/** @jsx jsxt */

import { BoldPlugin, ItalicPlugin } from '@platejs/basic-nodes/react';
import { ListPlugin } from '@platejs/list-classic/react';
import { jsxt } from '@platejs/test-utils';

import {
  createBaseEditor,
  type BasePluginInput,
} from '../../../../../../packages/core/src/lib/editor';
import { createBasePlugin } from '../../../../../../packages/core/src/lib/plugin';
import { BaseParagraphPlugin } from '../../../../../../packages/core/src/lib/plugins/paragraph';
import { htmlElementToLeaf } from '../../../../../../packages/core/src/lib/plugins/html/utils/htmlElementToLeaf';
import { parseHtmlElement } from '../../../../../../packages/core/src/lib/plugins/html/utils/parseHtmlElement';

jsxt;

describe('when children is a text', () => {
  const output = (
    <fragment>
      <htext bold>test</htext>
    </fragment>
  );

  it('set the mark on the text', () => {
    expect(
      htmlElementToLeaf(
        createBaseEditor({
          plugins: [BoldPlugin as BasePluginInput],
        }),
        parseHtmlElement('<strong>test</strong>')
      )
    ).toEqual(output);
  });
});

describe('when there is no plugins', () => {
  const output = [{ text: 'test' }];

  it('keeps the text leaf unchanged', () => {
    expect(
      htmlElementToLeaf(
        createBaseEditor({
          plugins: [createBasePlugin({ key: 'a' })],
        }),
        parseHtmlElement('<strong>test</strong>')
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

  it('set the mark to all children leaves', () => {
    expect(
      htmlElementToLeaf(
        createBaseEditor({
          plugins: [
            BaseParagraphPlugin,
            ListPlugin as BasePluginInput,
            BoldPlugin as BasePluginInput,
            ItalicPlugin as BasePluginInput,
          ],
        }),
        parseHtmlElement('<strong><li><p>test</p>test</li></strong>')
      )
    ).toEqual(output);
  });
});
