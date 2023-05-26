import React from 'react';
import { Plate } from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { createPreviewPlugin } from '@/plate/preview-markdown/createPreviewPlugin';
import { PreviewLeaf } from '@/plate/preview-markdown/PreviewLeaf';
import { previewMdValue } from '@/plate/preview-markdown/previewMdValue';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins([...basicNodesPlugins, createPreviewPlugin()], {
  components: plateUI,
});

const _editableProps = {
  ...editableProps,
  renderLeaf: PreviewLeaf,
};

export default function PreviewMdApp() {
  return (
    <Plate<MyValue>
      editableProps={_editableProps}
      plugins={plugins}
      initialValue={previewMdValue}
    />
  );
}
