import React from 'react';

import { render } from '@testing-library/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  Plate,
  PlateContent,
  usePlateEditor,
} from '@udecode/plate-common/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ListPlugin, TodoListPlugin } from '@udecode/plate-list/react';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { SelectOnBackspacePlugin } from '@udecode/plate-select';
import { TablePlugin } from '@udecode/plate-table/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import Prism from 'prismjs';

function PlateContainer() {
  const editor = usePlateEditor({
    plugins: [
      BlockquotePlugin,
      TodoListPlugin,
      HeadingPlugin.configure({ options: { levels: 5 } }),
      CodeBlockPlugin.configure({ options: { prism: Prism } }),
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
    ],
  });

  return (
    <Plate editor={editor}>
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
