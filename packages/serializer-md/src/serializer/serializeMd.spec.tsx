/** @jsx jsx */

import {
  createBoldPlugin,
  createItalicPlugin,
  MARK_BOLD,
  MARK_ITALIC,
} from '@udecode/plate-basic-marks';
import { createPlateEditor } from '@udecode/plate-common';
import {
  createHeadingPlugin,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { createLinkPlugin, ELEMENT_LINK } from '@udecode/plate-link';
import {
  createListPlugin,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '@udecode/plate-list';
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { editorValueMock } from './data';
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
          [ELEMENT_UL]: {
            type: 'unordered-list',
          },
          [ELEMENT_OL]: {
            type: 'ordered-list',
          },
          [ELEMENT_LI]: {
            type: 'list-item',
          },
          [ELEMENT_LIC]: {
            type: 'list-item-child',
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
