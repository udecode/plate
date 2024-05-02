/** @jsx jsx */

import {
  MARK_BOLD,
  MARK_ITALIC,
  createBoldPlugin,
  createItalicPlugin,
} from '@udecode/plate-basic-marks';
import { createPlateEditor } from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  createHeadingPlugin,
} from '@udecode/plate-heading';
import { ELEMENT_LINK, createLinkPlugin } from '@udecode/plate-link';
import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
  createListPlugin,
} from '@udecode/plate-list';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { editorValueMock } from './__tests__/data';
import { serializeMd } from './serializeMd';

jsx;

describe('deserializeMd', () => {
  const editor = createPlateEditor({
    plugins: [
      createHeadingPlugin({
        overrideByKey: {
          [ELEMENT_H1]: {
            type: 'uui-richTextEditor-header-1',
          },
          [ELEMENT_H2]: {
            type: 'uui-richTextEditor-header-2',
          },
          [ELEMENT_H3]: {
            type: 'uui-richTextEditor-header-3',
          },
          [ELEMENT_H4]: {
            type: 'uui-richTextEditor-header-4',
          },
          [ELEMENT_H5]: {
            type: 'uui-richTextEditor-header-5',
          },
          [ELEMENT_H6]: {
            type: 'uui-richTextEditor-header-6',
          },
        },
      }),
      createBoldPlugin({
        overrideByKey: {
          [MARK_BOLD]: {
            type: 'uui-richTextEditor-bold',
          },
        },
      }),
      createItalicPlugin({
        overrideByKey: {
          [MARK_ITALIC]: {
            type: 'uui-richTextEditor-italic',
          },
        },
      }),
      createParagraphPlugin({
        overrideByKey: {
          [ELEMENT_PARAGRAPH]: {
            type: 'paragraph',
          },
        },
      }),
      createLinkPlugin({
        overrideByKey: {
          [ELEMENT_LINK]: {
            type: 'link',
          },
        },
      }),
      createListPlugin({
        overrideByKey: {
          [ELEMENT_LI]: {
            type: 'list-item',
          },
          [ELEMENT_LIC]: {
            type: 'list-item-child',
          },
          [ELEMENT_OL]: {
            type: 'ordered-list',
          },
          [ELEMENT_UL]: {
            type: 'unordered-list',
          },
        },
      }),
    ],
  });

  it('should serialize editor value', () => {
    const serializedMd = serializeMd(editor, { nodes: editorValueMock });
    expect(serializedMd).toMatchSnapshot();
  });
});
