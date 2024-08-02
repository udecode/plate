import React from 'react';

import { render } from '@testing-library/react';
import { AlignPlugin } from '@udecode/plate-alignment';
import { AutoformatPlugin } from '@udecode/plate-autoformat';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break';
import { Plate, PlateContent, createPlugins } from '@udecode/plate-common';
import { HeadingPlugin } from '@udecode/plate-heading';
import { HighlightPlugin } from '@udecode/plate-highlight';
import { LinkPlugin } from '@udecode/plate-link';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media';
import { MentionPlugin } from '@udecode/plate-mention';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';
import { TablePlugin } from '@udecode/plate-table';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

function PlateContainer() {
  const plugins = createPlugins([
    BlockquotePlugin,
    TodoListPlugin,
    HeadingPlugin.configure({ levels: 5 }),
    BasicElementsPlugin,
    BasicMarksPlugin,
    TodoListPlugin,
    ImagePlugin,
    LinkPlugin,
    ListPlugin,
    TablePlugin,
    MediaEmbedPlugin,
    AlignPlugin,
    HighlightPlugin,
    MentionPlugin,
    NodeIdPlugin,
    AutoformatPlugin,
    ResetNodePlugin,
    SoftBreakPlugin,
    ExitBreakPlugin,
    NormalizeTypesPlugin,
    TrailingBlockPlugin,
    SelectOnBackspacePlugin,
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
