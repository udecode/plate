// TODO add toggle
import React from 'react';
import { render } from '@testing-library/react';
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createAutoformatPlugin } from '@udecode/plate-autoformat';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import { createPlugins, Plate, PlateContent } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import { createMentionPlugin } from '@udecode/plate-mention';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createNormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { createResetNodePlugin } from '@udecode/plate-reset-node';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { createTablePlugin } from '@udecode/plate-table';
import { createTrailingBlockPlugin } from '@udecode/plate-trailing-block';

function PlateContainer() {
  const plugins = createPlugins([
    createBlockquotePlugin(),
    createTodoListPlugin(),
    createHeadingPlugin({ options: { levels: 5 } }),
    createBasicElementsPlugin(),
    createBasicMarksPlugin(),
    createTodoListPlugin(),
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createMediaEmbedPlugin(),
    createAlignPlugin(),
    createHighlightPlugin(),
    createMentionPlugin(),
    createNodeIdPlugin(),
    createAutoformatPlugin(),
    createResetNodePlugin(),
    createSoftBreakPlugin(),
    createExitBreakPlugin(),
    createNormalizeTypesPlugin(),
    createTrailingBlockPlugin(),
    createSelectOnBackspacePlugin(),
  ]);

  return (
    <Plate plugins={plugins}>
      <PlateContent />
    </Plate>
  );
}

describe('when all plugins', () => {
  it('should render', () => {
    render(<PlateContainer />);

    expect(1).toBe(1);
  });
});
