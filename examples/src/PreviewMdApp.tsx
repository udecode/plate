import React from 'react';
import { createPlateUI, Plate } from '@udecode/plate';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createPreviewPlugin } from './preview-markdown/createPreviewPlugin';
import { PreviewLeaf } from './preview-markdown/PreviewLeaf/PreviewLeaf';
import { previewMdValue } from './preview-markdown/previewMdValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins([...basicNodesPlugins, createPreviewPlugin()], {
  components: createPlateUI(),
});

export default () => (
  <Plate<MyValue>
    editableProps={{
      ...editableProps,
      renderLeaf: PreviewLeaf as any,
    }}
    plugins={plugins}
    initialValue={previewMdValue}
  />
);
